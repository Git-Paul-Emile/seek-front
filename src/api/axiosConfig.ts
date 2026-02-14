import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
console.log('API URL:', API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Cookies cross-origin
});

// Intercepteur pour le refresh token automatique
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Routes d'authentification qui ne doivent pas déclencher le refresh automatique
// Ces routes renvoient normalement des erreurs 401 pour "identifiants incorrects"
const AUTH_ROUTES = [
  '/proprietaires/connexion',
  '/proprietaires/inscription',
  '/proprietaires/auth/mot-de-passe-oublie',
  '/proprietaires/auth/reset-mot-de-passe',
  '/proprietaires/auth/reset-mot-de-passe/email',
  '/proprietaires/auth/reset-mot-de-passe/sms',
];

// Fonction pour vérifier si l'URL correspond à une route d'authentification
const isAuthenticationRoute = (url: string | undefined): boolean => {
  if (!url) return false;
  
  // L'URL peut être relative (/proprietaires/connexion) ou absolue (http://...)
  // On extrait juste le chemin
  try {
    const urlObj = new URL(url, 'http://localhost');
    const pathname = urlObj.pathname;
    
    // Vérifier si le pathname correspond à une route d'authentification
    return AUTH_ROUTES.some(route => pathname.includes(route));
  } catch {
    // Si l'URL n'est pas valide, on fait une vérification simple
    return AUTH_ROUTES.some(route => url.includes(route));
  }
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Vérifier si c'est une route d'authentification
    const requestUrl = originalRequest?.url || '';
    const isAuthRoute = isAuthenticationRoute(requestUrl);
    
    // Si erreur 401, pas déjà en train de refresh, et ce n'est pas une route d'authentification
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      
      if (!isRefreshing) {
        isRefreshing = true;
        
        try {
          // Appeler l'endpoint refresh
          await axios.post(
            `${API_BASE_URL}/proprietaires/auth/refresh`,
            {},
            { withCredentials: true }
          );
          
          // Si成功, rejouer la requête originale
          processQueue(null, '');
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          // Refresh échoué - déconnexion
          processQueue(refreshError as Error, null);
          
          // Rediriger vers login
          if (typeof window !== 'undefined') {
            localStorage.removeItem('seek_proprietaire');
            window.location.href = '/login';
          }
          
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
      
      // Mettre en queue la requête originale
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      });
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;

// Fonctions utilitaires pour les cookies (debug)
export const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  // Les cookies httpOnly ne peuvent pas être lus par JS
  // Cette fonction retourne null pour montrer que c'est protégé
  return null;
};

export const clearAuthCookies = async (): Promise<void> => {
  try {
    await axios.post(
      `${API_BASE_URL}/proprietaires/auth/deconnexion`,
      {},
      { withCredentials: true }
    );
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
};
