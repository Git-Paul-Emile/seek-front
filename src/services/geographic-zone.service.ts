/**
 * Service de gestion des zones géographiques du Sénégal
 * Gère les régions, départements et localités pour l'application Seek
 */

import { GEOGRAPHIC_ZONES } from '../config/seek-config';

export interface Region {
  id: string;
  name: string;
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  localities?: string[];
}

export interface Locality {
  name: string;
  postalCode?: string;
  region: string;
  department: string;
}

class GeographicZoneService {
  private storageKey = 'seek_geographic_zones';
  private activeZones: string[] = [];

  constructor() {
    this.loadActiveZones();
  }

  /**
   * Charger les zones actives depuis le localStorage
   */
  private loadActiveZones(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.activeZones = JSON.parse(stored);
      } else {
        // Par défaut, toutes les zones sont actives
        this.activeZones = GEOGRAPHIC_ZONES.regions.map((r) => r.id);
      }
    } catch {
      this.activeZones = GEOGRAPHIC_ZONES.regions.map((r) => r.id);
    }
  }

  /**
   * Sauvegarder les zones actives
   */
  private saveActiveZones(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.activeZones));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des zones:', error);
    }
  }

  /**
   * Récupérer toutes les régions
   */
  getRegions(): Region[] {
    return GEOGRAPHIC_ZONES.regions.filter((region) =>
      this.activeZones.includes(region.id)
    );
  }

  /**
   * Récupérer toutes les régions (incluant inactives)
   */
  getAllRegions(): Region[] {
    return GEOGRAPHIC_ZONES.regions;
  }

  /**
   * Récupérer une région par son ID
   */
  getRegionById(regionId: string): Region | undefined {
    return GEOGRAPHIC_ZONES.regions.find((r) => r.id === regionId);
  }

  /**
   * Récupérer les départements d'une région
   */
  getDepartmentsByRegion(regionId: string): Department[] {
    const region = this.getRegionById(regionId);
    return region?.departments || [];
  }

  /**
   * Récupérer les localités d'un département
   */
  getLocalitiesByDepartment(
    regionId: string,
    departmentId: string
  ): Locality[] {
    const localities = GEOGRAPHIC_ZONES.localities[regionId as keyof typeof GEOGRAPHIC_ZONES.localities] || [];
    const department = this.getDepartmentsByRegion(regionId).find(
      (d) => d.id === departmentId
    );

    if (!department) return [];

    const postalCode = this.getPostalCodeByCity(regionId);

    return localities.map((name) => ({
      name,
      postalCode,
      region: regionId,
      department: departmentId,
    }));
  }

  /**
   * Récupérer les localités populaires pour Dakar
   */
  getDakarLocalities(): Locality[] {
    return this.getLocalitiesByDepartment('dakar', 'dakar');
  }

  /**
   * Récupérer le code postal d'une ville
   */
  getPostalCodeByCity(city: string): string {
    return (
      GEOGRAPHIC_ZONES.postalCodes[city as keyof typeof GEOGRAPHIC_ZONES.postalCodes] || ''
    );
  }

  /**
   * Activer une zone géographique
   */
  activateZone(regionId: string): void {
    if (!this.activeZones.includes(regionId)) {
      this.activeZones.push(regionId);
      this.saveActiveZones();
    }
  }

  /**
   * Désactiver une zone géographique
   */
  deactivateZone(regionId: string): void {
    this.activeZones = this.activeZones.filter((id) => id !== regionId);
    this.saveActiveZones();
  }

  /**
   * Vérifier si une zone est active
   */
  isZoneActive(regionId: string): boolean {
    return this.activeZones.includes(regionId);
  }

  /**
   * Récupérer les zones actives
   */
  getActiveZones(): string[] {
    return [...this.activeZones];
  }

  /**
   * Définir les zones actives
   */
  setActiveZones(zones: string[]): void {
    this.activeZones = zones;
    this.saveActiveZones();
  }

  /**
   * Rechercher des localités par nom
   */
  searchLocalities(query: string): Locality[] {
    const lowerQuery = query.toLowerCase();
    const results: Locality[] = [];

    GEOGRAPHIC_ZONES.regions.forEach((region) => {
      const localities =
        GEOGRAPHIC_ZONES.localities[region.id as keyof typeof GEOGRAPHIC_ZONES.localities] || [];

      localities.forEach((locality) => {
        if (locality.toLowerCase().includes(lowerQuery)) {
          results.push({
            name: locality,
            postalCode: this.getPostalCodeByCity(region.id),
            region: region.id,
            department: region.departments[0]?.id || '',
          });
        }
      });
    });

    return results;
  }

  /**
   * Récupérer les suggestions d'autocomplétion pour les adresses
   */
  getAddressSuggestions(query: string): string[] {
    if (!query || query.length < 2) return [];

    const suggestions: string[] = [];

    GEOGRAPHIC_ZONES.regions.forEach((region) => {
      // Ajouter les noms de régions
      if (region.name.toLowerCase().includes(query.toLowerCase())) {
        suggestions.push(`${region.name}, Sénégal`);
      }

      // Ajouter les départements
      region.departments.forEach((dept) => {
        if (dept.name.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push(`${dept.name}, ${region.name}, Sénégal`);
        }
      });

      // Ajouter les localités
      const localities =
        GEOGRAPHIC_ZONES.localities[region.id as keyof typeof GEOGRAPHIC_ZONES.localities] || [];
      localities.forEach((locality) => {
        if (locality.toLowerCase().includes(query.toLowerCase())) {
          suggestions.push(`${locality}, ${region.name}, Sénégal`);
        }
      });
    });

    return suggestions.slice(0, 10);
  }

  /**
   * Valider une adresse complète
   */
  validateAddress(address: {
    region: string;
    department: string;
    locality: string;
    postalCode?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Valider la région
    if (!this.getRegionById(address.region)) {
      errors.push('Région invalide');
    }

    // Valider le département
    const departments = this.getDepartmentsByRegion(address.region);
    if (!departments.find((d) => d.id === address.department)) {
      errors.push('Département invalide');
    }

    // Valider la locality
    const localities = this.getLocalitiesByDepartment(
      address.region,
      address.department
    );
    if (
      address.locality &&
      !localities.find((l) => l.name === address.locality)
    ) {
      // Les localités ne sont pas toujours obligatoires
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Formater une adresse complète
   */
  formatAddress(address: {
    locality?: string;
    department?: string;
    region?: string;
    postalCode?: string;
  }): string {
    const parts: string[] = [];

    if (address.locality) parts.push(address.locality);
    if (address.department) parts.push(address.department);
    if (address.region) parts.push(address.region);
    parts.push('Sénégal');

    if (address.postalCode) {
      parts.push(address.postalCode);
    }

    return parts.join(', ');
  }

  /**
   * Récupérer les statistiques des zones
   */
  getStats(): {
    totalRegions: number;
    activeRegions: number;
    totalDepartments: number;
    totalLocalities: number;
  } {
    let totalLocalities = 0;
    Object.values(GEOGRAPHIC_ZONES.localities).forEach((localities) => {
      totalLocalities += localities.length;
    });

    return {
      totalRegions: GEOGRAPHIC_ZONES.regions.length,
      activeRegions: this.activeZones.length,
      totalDepartments: GEOGRAPHIC_ZONES.regions.reduce(
        (acc, region) => acc + region.departments.length,
        0
      ),
      totalLocalities,
    };
  }
}

export const geographicZoneService = new GeographicZoneService();
export default geographicZoneService;
