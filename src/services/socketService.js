/**
 * Socket.io Client pour le Frontend SEEK
 * 
 * Ce fichier doit être utilisé côté frontend.
 * Installez d'abord: npm install socket.io-client
 * 
 * Usage:
 * import { socketService } from './socketService';
 * 
 * // Connexion
 * socketService.connect();
 * socketService.joinOwner(ownerId);
 * 
 * // Écouter les mises à jour de badges
 * socketService.onBadgeUpdate((data) => {
 *   console.log('Badge mis à jour:', data);
 *   // Mettre à jour le state React/Vue
 * });
 */

import { io } from "socket.io-client";

// URL du serveur (à configurer selon l'environnement)
const SOCKET_URL = import.meta?.env?.VITE_API_URL || "http://localhost:8000";

// Types d'événements (doivent correspondre au backend)
export const EVENTS = {
  NOTIFICATION_NEW: "notification:new",
  BADGE_UPDATE: "badge:update",
  TRANSACTION_STATUS: "transaction:status",
  PAYMENT_CONFIRMED: "payment:confirmed",
  PAYMENT_FAILED: "payment:failed",
  STATS_UPDATE: "stats:update",
  NEW_PROPERTY_ALERT: "property:new",
  VERIFICATION_SUBMITTED: "verification:submitted",
  VERIFICATION_COUNT_UPDATE: "verification:count",
};

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  /**
   * Connexion au serveur WebSocket
   */
  connect(url = SOCKET_URL) {
    if (this.socket?.connected) {
      console.log("WebSocket déjà connecté");
      return;
    }

    this.socket = io(url, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on("connect", () => {
      console.log("✅ WebSocket connecté");
      this.emit("connected", true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket déconnecté:", reason);
      this.emit("connected", false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("❌ Erreur WebSocket:", error.message);
    });

    // Mapper les événements
    this.setupEventMapping();
  }

  /**
   * Déconnexion
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Rejoindre une room de propriétaire
   */
  joinOwner(proprietaireId) {
    this.socket?.emit("join:owner", proprietaireId);
    console.log(`👤 Rejoint la room owner:${proprietaireId}`);
  }

  /**
   * Rejoindre une room de locataire
   */
  joinLocataire(locataireId) {
    this.socket?.emit("join:locataire", locataireId);
    console.log(`🏠 Rejoint la room locataire:${locataireId}`);
  }

  /**
   * Rejoindre une room d'admin
   */
  joinAdmin() {
    this.socket?.emit("join:admin");
    console.log("⚡ Rejoint la room admin");
  }

  /**
   * Rejoindre les alertes de nouveaux biens
   */
  joinAlerts(telephone) {
    this.socket?.emit("join:alerts", telephone);
    console.log(`🔔 Rejoint la room alerts:${telephone}`);
  }

  // ============= API d'abonnement aux événements =============

  /**
   * S'abonner aux nouvelles notifications
   */
  onNotification(callback) {
    return this.addListener(EVENTS.NOTIFICATION_NEW, callback);
  }

  /**
   * S'abonner aux mises à jour des badges
   */
  onBadgeUpdate(callback) {
    return this.addListener(EVENTS.BADGE_UPDATE, callback);
  }

  /**
   * S'abonner aux mises à jour de statut de transaction
   */
  onTransactionStatus(callback) {
    return this.addListener(EVENTS.TRANSACTION_STATUS, callback);
  }

  /**
   * S'abonner aux confirmations de paiement
   */
  onPaymentConfirmed(callback) {
    return this.addListener(EVENTS.PAYMENT_CONFIRMED, callback);
  }

  /**
   * S'abonner aux paiements échoués
   */
  onPaymentFailed(callback) {
    return this.addListener(EVENTS.PAYMENT_FAILED, callback);
  }

  /**
   * S'abonner aux mises à jour des statistiques (admin)
   */
  onStatsUpdate(callback) {
    return this.addListener(EVENTS.STATS_UPDATE, callback);
  }

  /**
   * S'abonner aux alertes de nouveaux biens
   */
  onPropertyAlert(callback) {
    return this.addListener(EVENTS.NEW_PROPERTY_ALERT, callback);
  }

  /**
   * S'abonner aux nouvelles vérifications soumises (admin)
   */
  onVerificationSubmitted(callback) {
    return this.addListener(EVENTS.VERIFICATION_SUBMITTED, callback);
  }

  /**
   * S'abonner aux mises à jour du compteur de vérifications (admin)
   */
  onVerificationCountUpdate(callback) {
    return this.addListener(EVENTS.VERIFICATION_COUNT_UPDATE, callback);
  }

  // ============= Méthodes privées =============

  /**
   * Ajouter un listener pour un événement
   */
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);

    // Retourner une fonction pour se désabonner
    return () => {
      this.listeners.get(event).delete(callback);
    };
  }

  /**
   * Émettre un événement interne (pour l'état de connexion)
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  /**
   * Mapper les événements du socket aux listeners internes
   */
  setupEventMapping() {
    if (!this.socket) return;

    const events = [
      EVENTS.NOTIFICATION_NEW,
      EVENTS.BADGE_UPDATE,
      EVENTS.TRANSACTION_STATUS,
      EVENTS.PAYMENT_CONFIRMED,
      EVENTS.PAYMENT_FAILED,
      EVENTS.STATS_UPDATE,
      EVENTS.NEW_PROPERTY_ALERT,
      EVENTS.VERIFICATION_SUBMITTED,
      EVENTS.VERIFICATION_COUNT_UPDATE,
    ];

    events.forEach(event => {
      this.socket.on(event, (data) => {
        if (this.listeners.has(event)) {
          this.listeners.get(event).forEach(callback => callback(data));
        }
      });
    });
  }

  /**
   * Vérifier si connecté
   */
  isConnected() {
    return this.socket?.connected || false;
  }
}

// Singleton instance
export const socketService = new SocketService();

/**
 * Exemple d'utilisation avec React:
 * 
 * import { socketService, EVENTS } from './socketService';
 * import { useEffect, useState } from 'react';
 * 
 * export function useSocket(ownerId) {
 *   const [badges, setBadges] = useState({ 
 *     notificationsCount: 0, 
 *     transactionsPending: 0, 
 *     total: 0 
 *   });
 *   const [notifications, setNotifications] = useState([]);
 *   const [isConnected, setIsConnected] = useState(false);
 * 
 *   useEffect(() => {
 *     // Connexion
 *     socketService.connect();
 *     socketService.joinOwner(ownerId);
 * 
 *     // Gestion de la connexion
 *     const unsubConnect = socketService.addListener('connected', setIsConnected);
 *     
 *     // Abonnement aux badges
 *     const unsubBadge = socketService.onBadgeUpdate((data) => {
 *       setBadges(data);
 *       // Vous pouvez déclencher une notification toast ici
 *     });
 *     
 *     // Abonnement aux notifications
 *     const unsubNotif = socketService.onNotification((data) => {
 *       setNotifications(prev => [data, ...prev]);
 *       // Afficher une notification push
 *     });
 *     
 *     // Abonnement aux paiements confirmés
 *     const unsubPayment = socketService.onPaymentConfirmed((data) => {
 *       console.log('Paiement confirmé:', data);
 *       // Rafraîchir les données
 *     });
 *     
 *     // Cleanup
 *     return () => {
 *       unsubConnect();
 *       unsubBadge();
 *       unsubNotif();
 *       unsubPayment();
 *       socketService.disconnect();
 *     };
 *   }, [ownerId]);
 * 
 *   return { badges, notifications, isConnected };
 * }
 * 
 * // Utilisation dans un composant:
 * function Dashboard() {
 *   const { badges, notifications, isConnected } = useSocket('owner-id-123');
 * 
 *   return (
 *     <div>
 *       <div className="connection-status">
 *         {isConnected ? '🟢 Connecté' : '🔴 Déconnecté'}
 *       </div>
 *       
 *       <div className="badges">
 *         <span>🔔 {badges.notificationsCount}</span>
 *         <span>💰 {badges.transactionsPending}</span>
 *         <span>Total: {badges.total}</span>
 *       </div>
 * 
 *       <div className="notifications">
 *         {notifications.map(n => (
 *           <div key={n.id}>{n.titre}</div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 */
