import { SearchFiltersState } from "@/components/properties/SearchFilters";

// Types pour les canaux de notification
export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

// Type de bien pour l'alerte
export type PropertyCategory = 'logement_entier' | 'chambre' | 'all';

// Interface des critères d'alerte
export interface PropertyAlertCriteria {
  // Localisation
  city: string;
  neighborhood: string;
  // Budget
  minPrice: number;
  maxPrice: number;
  // Type de bien
  category: PropertyCategory;
  bedrooms: string;
  // État
  furnished: string;
  // Disponibilité
  availability: string;
  availableFrom: string;
}

// Interface d'une alerte immobilière
export interface PropertyAlert {
  id: string;
  userId: string;
  name: string;
  criteria: PropertyAlertCriteria;
  channels: NotificationChannel[];
  enabled: boolean;
  createdAt: Date;
  lastTriggeredAt: Date | null;
  triggerCount: number;
  matchedPropertyIds: string[];
}

// Paramètres de notification
export interface AlertNotificationSettings {
  enableEmail: boolean;
  enableSms: boolean;
  enableWhatsapp: boolean;
  email: string;
  phone: string;
}

// Stats d'alerte
export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  triggeredToday: number;
  totalMatches: number;
}

// Clé de stockage local
const STORAGE_KEY = 'seek_property_alerts';
const SETTINGS_KEY = 'seek_alert_settings';

// Générer un ID unique
const generateId = (): string => {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Service d'alertes immobilières
class PropertyAlertService {
  // Récupérer toutes les alertes
  getAll(): PropertyAlert[] {
    if (typeof window === 'undefined') return [];
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    try {
      const alerts = JSON.parse(data);
      return alerts.map((alert: any) => ({
        ...alert,
        createdAt: new Date(alert.createdAt),
        lastTriggeredAt: alert.lastTriggeredAt ? new Date(alert.lastTriggeredAt) : null,
      }));
    } catch {
      return [];
    }
  }

  // Récupérer les alertes d'un utilisateur
  getByUserId(userId: string): PropertyAlert[] {
    return this.getAll().filter(alert => alert.userId === userId);
  }

  // Récupérer une alerte par ID
  getById(id: string): PropertyAlert | undefined {
    return this.getAll().find(alert => alert.id === id);
  }

  // Créer une nouvelle alerte
  create(alert: Omit<PropertyAlert, 'id' | 'createdAt' | 'lastTriggeredAt' | 'triggerCount' | 'matchedPropertyIds'>): PropertyAlert {
    const newAlert: PropertyAlert = {
      ...alert,
      id: generateId(),
      createdAt: new Date(),
      lastTriggeredAt: null,
      triggerCount: 0,
      matchedPropertyIds: [],
    };
    
    const alerts = this.getAll();
    alerts.push(newAlert);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    
    return newAlert;
  }

  // Mettre à jour une alerte
  update(id: string, updates: Partial<PropertyAlert>): PropertyAlert | null {
    const alerts = this.getAll();
    const index = alerts.findIndex(alert => alert.id === id);
    
    if (index === -1) return null;
    
    alerts[index] = { ...alerts[index], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    
    return alerts[index];
  }

  // Supprimer une alerte
  delete(id: string): boolean {
    const alerts = this.getAll();
    const filtered = alerts.filter(alert => alert.id !== id);
    
    if (filtered.length === alerts.length) return false;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  }

  // Activer/désactiver une alerte
  toggleEnabled(id: string): boolean {
    const alert = this.getById(id);
    if (!alert) return false;
    
    this.update(id, { enabled: !alert.enabled });
    return true;
  }

  // Vérifier si un bien correspond aux critères d'une alerte
  matchesCriteria(property: any, criteria: PropertyAlertCriteria): boolean {
    // Ville
    if (criteria.city && criteria.city !== 'all' && property.city !== criteria.city) {
      return false;
    }

    // Quartier
    if (criteria.neighborhood && criteria.neighborhood !== 'all' && property.neighborhood !== criteria.neighborhood) {
      return false;
    }

    // Prix min
    if (criteria.minPrice > 0 && property.price < criteria.minPrice) {
      return false;
    }

    // Prix max
    if (criteria.maxPrice > 0 && property.price > criteria.maxPrice) {
      return false;
    }

    // Type de bien
    if (criteria.category && criteria.category !== 'all' && property.category !== criteria.category) {
      return false;
    }

    // Chambres
    if (criteria.bedrooms && criteria.bedrooms !== 'all') {
      const bedrooms = parseInt(property.bedrooms) || 0;
      const filterBedrooms = parseInt(criteria.bedrooms);
      
      if (criteria.bedrooms === '4+') {
        if (bedrooms < 4) return false;
      } else if (bedrooms !== filterBedrooms) {
        return false;
      }
    }

    // Meublé
    if (criteria.furnished && criteria.furnished !== 'tous' && property.furnished !== criteria.furnished) {
      return false;
    }

    // Disponibilité
    if (criteria.availability && criteria.availability !== 'tous') {
      if (criteria.availability === 'immediate' && property.availability !== 'immediate') {
        return false;
      }
      if (criteria.availability === 'future' && property.availability !== 'future') {
        return false;
      }
    }

    return true;
  }

  // Trouver les alertes correspondantes pour un bien
  findMatchingAlerts(property: any): PropertyAlert[] {
    return this.getAll().filter(alert => 
      alert.enabled && this.matchesCriteria(property, alert.criteria)
    );
  }

  // Déclencher une alerte (enregistrer la correspondance)
  triggerAlert(alertId: string, propertyId: string): void {
    const alert = this.getById(alertId);
    if (!alert) return;
    
    const matchedIds = [...alert.matchedPropertyIds];
    if (!matchedIds.includes(propertyId)) {
      matchedIds.push(propertyId);
    }
    
    this.update(alertId, {
      lastTriggeredAt: new Date(),
      triggerCount: alert.triggerCount + 1,
      matchedPropertyIds: matchedIds,
    });
  }

  // Convertir SearchFiltersState en PropertyAlertCriteria
  filtersToCriteria(filters: SearchFiltersState): PropertyAlertCriteria {
    return {
      city: filters.city || 'all',
      neighborhood: filters.neighborhood || 'all',
      minPrice: parseInt(filters.minPrice) || 0,
      maxPrice: parseInt(filters.maxPrice) || 0,
      category: filters.category as PropertyCategory || 'all',
      bedrooms: filters.bedrooms || 'all',
      furnished: filters.furnished || 'tous',
      availability: filters.availability || 'tous',
      availableFrom: filters.availableFrom || '',
    };
  }

  // Obtenir les paramètres de notification
  getNotificationSettings(): AlertNotificationSettings {
    if (typeof window === 'undefined') {
      return {
        enableEmail: false,
        enableSms: false,
        enableWhatsapp: false,
        email: '',
        phone: '',
      };
    }
    
    const data = localStorage.getItem(SETTINGS_KEY);
    if (!data) {
      return {
        enableEmail: false,
        enableSms: false,
        enableWhatsapp: false,
        email: '',
        phone: '',
      };
    }
    
    return JSON.parse(data);
  }

  // Sauvegarder les paramètres de notification
  saveNotificationSettings(settings: AlertNotificationSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }

  // Obtenir les statistiques d'alertes
  getStats(): AlertStats {
    const alerts = this.getAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.enabled).length,
      triggeredToday: alerts.filter(a => 
        a.lastTriggeredAt && new Date(a.lastTriggeredAt) >= today
      ).length,
      totalMatches: alerts.reduce((sum, a) => sum + a.triggerCount, 0),
    };
  }

  // Supprimer toutes les alertes d'un utilisateur
  deleteByUserId(userId: string): number {
    const alerts = this.getAll();
    const filtered = alerts.filter(alert => alert.userId !== userId);
    const deleted = alerts.length - filtered.length;
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return deleted;
  }
}

// Instance du service
export const propertyAlertService = new PropertyAlertService();

// Fonctions utilitaires pour les notifications
export const sendNotification = async (
  alert: PropertyAlert,
  property: any,
  settings: AlertNotificationSettings
): Promise<{ success: boolean; channels: { channel: string; success: boolean }[] }> => {
  const results: { channel: string; success: boolean }[] = [];
  const message = `Nouveau bien trouvé correspondant à votre alerte: ${property.title || property.address}`;
  
  // Notification Email
  if (alert.channels.includes('email') && settings.enableEmail && settings.email) {
    const emailSuccess = await sendEmailNotification(settings.email, message, property);
    results.push({ channel: 'email', success: emailSuccess });
  }
  
  // Notification SMS
  if (alert.channels.includes('sms') && settings.enableSms && settings.phone) {
    const smsSuccess = await sendSmsNotification(settings.phone, message);
    results.push({ channel: 'sms', success: smsSuccess });
  }
  
  // Notification WhatsApp
  if (alert.channels.includes('whatsapp') && settings.enableWhatsapp && settings.phone) {
    const whatsappSuccess = await sendWhatsAppNotification(settings.phone, message, property);
    results.push({ channel: 'whatsapp', success: whatsappSuccess });
  }
  
  return {
    success: results.some(r => r.success),
    channels: results,
  };
};

// Simuler l'envoi d'email (à connecter avec un vrai service)
const sendEmailNotification = async (to: string, message: string, property: any): Promise<boolean> => {
  // Simulation - en production, utiliser un service comme SendGrid, AWS SES, etc.
  console.log(`[EMAIL] Notification sent to ${to}:`, message);
  return true;
};

// Simuler l'envoi de SMS
const sendSmsNotification = async (to: string, message: string): Promise<boolean> => {
  // Simulation - en production, utiliser un service comme Twilio, Africa's Talking, etc.
  console.log(`[SMS] Notification sent to ${to}:`, message);
  return true;
};

// Simuler l'envoi WhatsApp
const sendWhatsAppNotification = async (to: string, message: string, property: any): Promise<boolean> => {
  // Simulation - en production, utiliser l'API WhatsApp Business
  console.log(`[WHATSAPP] Notification sent to ${to}:`, message);
  return true;
};

export default propertyAlertService;
