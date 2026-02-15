import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Interface pour l'objet address retourné par Nominatim
 */
interface NominatimAddress {
  house_number?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

/**
 * Interface pour un item retourné par l'API Nominatim
 */
interface NominatimResult {
  place_id: number | string;
  display_name: string;
  address?: NominatimAddress;
  lat: number | string;
  lon: number | string;
}

/**
 * Interface pour une suggestion d'adresse retournée par Nominatim
 */
export interface AddressSuggestion {
  placeId: string;
  displayName: string;
  address: {
    houseNumber?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
  lat: string;
  lon: string;
}

/**
 * Interface pour les coordonnées GPS
 */
export interface Coordinates {
  lat: string;
  lng: string;
}

/**
 * Interface pour les données d'adresse formatées
 */
export interface FormattedAddress {
  address: string;
  city: string;
  lat: string;
  lng: string;
}

/**
 * État du hook d'autocomplétion
 */
interface AddressAutocompleteState {
  suggestions: AddressSuggestion[];
  isLoading: boolean;
  error: string | null;
  showDropdown: boolean;
}

/**
 * Options du hook
 */
interface UseAddressAutocompleteOptions {
  debounceMs?: number;
  minChars?: number;
  countryCode?: string;
  limit?: number;
}

// En-tête User-Agent personnalisé pour respecter la politique Nominatim
const NOMINATIM_USER_AGENT = 'SeekApp/1.0 (https://github.com/seek-app)';
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * Hook personnalisé pour l'autocomplétion d'adresse avec l'API Nominatim
 * 
 * Fonctionnalités:
 * - Debounce des appels API (300ms par défaut)
 * - Déclenchement uniquement après 2+ caractères
 * - Gestion des états de chargement
 * - Gestion des erreurs réseau
 * - En-tête User-Agent personnalisé
 * 
 * @param options Options de configuration
 * @returns Objet contenant l'état et les fonctions d'autocomplétion
 */
export function useAddressAutocomplete(options: UseAddressAutocompleteOptions = {}) {
  const {
    debounceMs = 300,
    minChars = 2,
    countryCode = 'sn', // Sénégal par défaut
    limit = 5
  } = options;

  const [state, setState] = useState<AddressAutocompleteState>({
    suggestions: [],
    isLoading: false,
    error: null,
    showDropdown: false
  });

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Recherche des suggestions d'adresse via l'API Nominatim
   */
  const searchAddress = useCallback(async (query: string) => {
    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Vérifier le nombre minimum de caractères
    if (query.length < minChars) {
      setState(prev => ({
        ...prev,
        suggestions: [],
        isLoading: false,
        showDropdown: false,
        error: null
      }));
      return;
    }

    // Créer un nouveau contrôleur d'annulation
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      showDropdown: true
    }));

    try {
      // Construire l'URL de recherche
      const searchParams = new URLSearchParams({
        format: 'json',
        addressdetails: '1',
        limit: limit.toString(),
        q: query,
        ...(countryCode && { countrycodes: countryCode })
      });

      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?${searchParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'User-Agent': NOMINATIM_USER_AGENT,
            'Accept': 'application/json',
            'Accept-Language': 'fr'
          },
          signal: abortControllerRef.current.signal
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Formater les suggestions
      const suggestions: AddressSuggestion[] = data.map((item: NominatimResult) => ({
        placeId: String(item.place_id),
        displayName: String(item.display_name),
        address: {
          houseNumber: item.address?.house_number,
          road: item.address?.road,
          neighbourhood: item.address?.neighbourhood,
          suburb: item.address?.suburb,
          city: item.address?.city,
          town: item.address?.town,
          village: item.address?.village,
          municipality: item.address?.municipality,
          county: item.address?.county,
          state: item.address?.state,
          postcode: item.address?.postcode,
          country: item.address?.country,
          country_code: item.address?.country_code
        },
        lat: String(item.lat),
        lon: String(item.lon)
      }));

      setState(prev => ({
        ...prev,
        suggestions,
        isLoading: false,
        showDropdown: suggestions.length > 0
      }));

    } catch (error) {
      // Ignorer les erreurs d'annulation
      if (error instanceof Error && error.name === 'AbortError') {
        return;
      }

      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Une erreur est survenue lors de la recherche';

      setState(prev => ({
        ...prev,
        suggestions: [],
        isLoading: false,
        error: errorMessage,
        showDropdown: true
      }));
    }
  }, [minChars, countryCode, limit]);

  /**
   * Fonction à appeler lors de la saisie utilisateur (avec debounce)
   */
  const handleInputChange = useCallback((value: string) => {
    // Annuler le timer précédent
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Si la valeur est vide ou trop courte, masquer le dropdown
    if (value.length < minChars) {
      setState(prev => ({
        ...prev,
        suggestions: [],
        showDropdown: false,
        error: null
      }));
      return;
    }

    // Définir un nouveau timer avec debounce
    debounceTimerRef.current = setTimeout(() => {
      searchAddress(value);
    }, debounceMs);
  }, [debounceMs, minChars, searchAddress]);

  /**
   * Sélectionne une suggestion et retourne les données formatées
   */
  const selectSuggestion = useCallback((suggestion: AddressSuggestion): FormattedAddress => {
    // Construire l'adresse formatée
    const addressParts: string[] = [];
    
    if (suggestion.address.houseNumber) {
      addressParts.push(suggestion.address.houseNumber);
    }
    if (suggestion.address.road) {
      addressParts.push(suggestion.address.road);
    }
    if (suggestion.address.neighbourhood || suggestion.address.suburb) {
      addressParts.push(suggestion.address.neighbourhood || suggestion.address.suburb || '');
    }

    const formattedAddress = addressParts.join(', ');

    // Déterminer la ville (city, town, village ou municipality)
    const city = suggestion.address.city 
      || suggestion.address.town 
      || suggestion.address.village 
      || suggestion.address.municipality 
      || '';

    // Masquer le dropdown après sélection
    setState(prev => ({
      ...prev,
      suggestions: [],
      showDropdown: false,
      error: null
    }));

    return {
      address: formattedAddress,
      city,
      lat: suggestion.lat,
      lng: suggestion.lon
    };
  }, []);

  /**
   * Ferme le dropdown manuellement
   */
  const closeDropdown = useCallback(() => {
    setState(prev => ({
      ...prev,
      showDropdown: false
    }));
  }, []);

  /**
   * Réinitialise l'état du hook
   */
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      suggestions: [],
      isLoading: false,
      error: null,
      showDropdown: false
    });
  }, []);

  return {
    ...state,
    handleInputChange,
    selectSuggestion,
    closeDropdown,
    reset
  };
}

export default useAddressAutocomplete;