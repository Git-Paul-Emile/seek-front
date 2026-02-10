import { Charge, CreateChargeData, UpdateChargeData, ChargeFilters, ChargeStats, DetailPaiement, RepartitionManuelle, StatutPaiement } from '../types/charge';

// Générer un ID unique
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Simulation de stockage local pour les charges
const STORAGE_KEY = 'seek_charges';

// Données de démonstration
const demoCharges: Charge[] = [
  {
    id: '1',
    bienId: 'bien-1',
    bienNom: 'Appartement Dakar Plateau',
    colocationId: 'coloc-1',
    type: 'eau',
    description: 'Facture d\'eau trimestre 2024',
    montantTotal: 45000,
    dateCreation: '2024-01-15T10:00:00Z',
    dateEcheance: '2024-02-15T23:59:59Z',
    periodeDebut: '2024-01-01',
    periodeFin: '2024-03-31',
    modeRepartition: 'egal',
    detailsPaiement: [
      { colocataireId: 'colocataire-1', colocataireNom: 'Jean Dupont', montant: 22500, statut: 'paye', modeRepartition: 'egal', datePaiement: '2024-02-10' },
      { colocataireId: 'colocataire-2', colocataireNom: 'Marie Martin', montant: 22500, statut: 'impaye', modeRepartition: 'egal' }
    ],
    statut: 'partiel',
    creePar: 'admin'
  },
  {
    id: '2',
    bienId: 'bien-1',
    bienNom: 'Appartement Dakar Plateau',
    colocationId: 'coloc-1',
    type: 'electricite',
    description: 'Facture d\'électricité mois de janvier',
    montantTotal: 75000,
    dateCreation: '2024-02-01T10:00:00Z',
    dateEcheance: '2024-03-01T23:59:59Z',
    periodeDebut: '2024-01-01',
    periodeFin: '2024-01-31',
    modeRepartition: 'prorata',
    detailsPaiement: [
      { colocataireId: 'colocataire-1', colocataireNom: 'Jean Dupont', montant: 30000, statut: 'paye', modeRepartition: 'prorata', datePaiement: '2024-02-25' },
      { colocataireId: 'colocataire-2', colocataireNom: 'Marie Martin', montant: 45000, statut: 'impaye', modeRepartition: 'prorata' }
    ],
    statut: 'partiel',
    creePar: 'admin'
  },
  {
    id: '3',
    bienId: 'bien-2',
    bienNom: 'Maison Sacré Cœur',
    type: 'internet',
    description: 'Abonnement internet mensuel',
    montantTotal: 25000,
    dateCreation: '2024-02-01T10:00:00Z',
    dateEcheance: '2024-03-01T23:59:59Z',
    periodeDebut: '2024-02-01',
    periodeFin: '2024-02-29',
    modeRepartition: 'manuel',
    repartitionManuelle: [
      { colocataireId: 'colocataire-3', montant: 10000 },
      { colocataireId: 'colocataire-4', montant: 15000 }
    ],
    detailsPaiement: [
      { colocataireId: 'colocataire-3', colocataireNom: 'Pierre Durand', montant: 10000, statut: 'paye', modeRepartition: 'manuel', datePaiement: '2024-02-28' },
      { colocataireId: 'colocataire-4', colocataireNom: 'Sophie Leblanc', montant: 15000, statut: 'impaye', modeRepartition: 'manuel' }
    ],
    statut: 'partiel',
    creePar: 'admin'
  }
];

// Récupérer les charges depuis le stockage local
const getStoredCharges = (): Charge[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Stocker les données de démonstration
  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoCharges));
  return demoCharges;
};

// Sauvegarder les charges dans le stockage local
const saveCharges = (charges: Charge[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(charges));
};

export class ChargesService {
  // Récupérer toutes les charges
  static async getAll(filters?: ChargeFilters): Promise<Charge[]> {
    await this.simulateDelay();
    let charges = getStoredCharges();

    if (filters) {
      if (filters.bienId) {
        charges = charges.filter(c => c.bienId === filters.bienId);
      }
      if (filters.colocationId) {
        charges = charges.filter(c => c.colocationId === filters.colocationId);
      }
      if (filters.type) {
        charges = charges.filter(c => c.type === filters.type);
      }
      if (filters.statut) {
        charges = charges.filter(c => c.statut === filters.statut);
      }
      if (filters.dateDebut) {
        charges = charges.filter(c => c.dateCreation >= filters.dateDebut!);
      }
      if (filters.dateFin) {
        charges = charges.filter(c => c.dateCreation <= filters.dateFin!);
      }
    }

    return charges.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
  }

  // Récupérer une charge par son ID
  static async getById(id: string): Promise<Charge | null> {
    await this.simulateDelay();
    const charges = getStoredCharges();
    return charges.find(c => c.id === id) || null;
  }

  // Récupérer les charges d'un bien
  static async getByBienId(bienId: string): Promise<Charge[]> {
    await this.simulateDelay();
    const charges = getStoredCharges();
    return charges.filter(c => c.bienId === bienId);
  }

  // Récupérer les charges d'une colocation
  static async getByColocationId(colocationId: string): Promise<Charge[]> {
    await this.simulateDelay();
    const charges = getStoredCharges();
    return charges.filter(c => c.colocationId === colocationId);
  }

  // Créer une nouvelle charge
  static async create(data: CreateChargeData, detailsPaiement?: DetailPaiement[]): Promise<Charge> {
    await this.simulateDelay();
    const charges = getStoredCharges();

    const newCharge: Charge = {
      id: generateId(),
      ...data,
      bienNom: '', // Sera rempli lors de l'affichage
      dateCreation: new Date().toISOString(),
      statut: 'brouillon',
      detailsPaiement: detailsPaiement,
      creePar: 'current-user'
    };

    charges.push(newCharge);
    saveCharges(charges);

    return newCharge;
  }

  // Mettre à jour une charge
  static async update(id: string, data: UpdateChargeData): Promise<Charge | null> {
    await this.simulateDelay();
    const charges = getStoredCharges();
    const index = charges.findIndex(c => c.id === id);

    if (index === -1) {
      return null;
    }

    charges[index] = {
      ...charges[index],
      ...data,
      id: charges[index].id // Protéger l'ID
    };

    saveCharges(charges);
    return charges[index];
  }

  // Supprimer une charge
  static async delete(id: string): Promise<boolean> {
    await this.simulateDelay();
    const charges = getStoredCharges();
    const index = charges.findIndex(c => c.id === id);

    if (index === -1) {
      return false;
    }

    charges.splice(index, 1);
    saveCharges(charges);
    return true;
  }

  // Calculer la répartition des charges selon le mode choisi
  static calculateRepartition(
    montantTotal: number,
    colocataireIds: string[],
    modeRepartition: 'egal' | 'prorata' | 'manuel',
    repartitionManuelle?: RepartitionManuelle[]
  ): RepartitionManuelle[] {
    if (colocataireIds.length === 0) {
      return [];
    }

    switch (modeRepartition) {
      case 'egal': {
        const part = montantTotal / colocataireIds.length;
        return colocataireIds.map(id => ({
          colocataireId: id,
          montant: Math.round(part)
        }));
      }
      case 'prorata': {
        // Le prorata sera calculé en fonction des quotes-parts définies
        // Pour l'exemple, on suppose des quotes-parts égales
        const part = montantTotal / colocataireIds.length;
        return colocataireIds.map(id => ({
          colocataireId: id,
          montant: Math.round(part)
        }));
      }
      case 'manuel':
        return repartitionManuelle || [];
      default:
        return [];
    }
  }

  // Générer les détails de paiement pour une charge
  static generateDetailsPaiement(
    chargeId: string,
    colocataires: { id: string; nom: string }[],
    repartition: RepartitionManuelle[]
  ): DetailPaiement[] {
    return repartition.map((rep, index) => ({
      colocataireId: rep.colocataireId,
      colocataireNom: colocataires.find(c => c.id === rep.colocataireId)?.nom || 'Inconnu',
      montant: rep.montant,
      statut: 'impaye' as const,
      modeRepartition: 'manuel' as const
    }));
  }

  // Marquer un paiement comme effectué
  static async marquerPaiement(
    chargeId: string,
    colocataireId: string,
    montant: number
  ): Promise<Charge | null> {
    await this.simulateDelay();
    const charges = getStoredCharges();
    const charge = charges.find(c => c.id === chargeId);

    if (!charge || !charge.detailsPaiement) {
      return null;
    }

    const detailIndex = charge.detailsPaiement.findIndex(d => d.colocataireId === colocataireId);
    if (detailIndex === -1) {
      return null;
    }

    charge.detailsPaiement[detailIndex].statut = montant >= charge.detailsPaiement[detailIndex].montant ? 'paye' : 'partiel';
    charge.detailsPaiement[detailIndex].datePaiement = new Date().toISOString();

    // Mettre à jour le statut global de la charge
    const allPaye = charge.detailsPaiement.every(d => d.statut === 'paye');
    const hasPartiel = charge.detailsPaiement.some(d => d.statut === 'partiel');

    if (allPaye) {
      charge.statut = 'paye';
    } else if (hasPartiel) {
      charge.statut = 'partiel';
    } else {
      charge.statut = 'envoye';
    }

    saveCharges(charges);
    return charge;
  }

  // Obtenir les statistiques des charges
  static async getStats(bienId?: string): Promise<ChargeStats> {
    await this.simulateDelay();
    let charges = getStoredCharges();

    if (bienId) {
      charges = charges.filter(c => c.bienId === bienId);
    }

    const totalCharges = charges.length;
    const montantTotal = charges.reduce((sum, c) => sum + c.montantTotal, 0);
    const chargesPayees = charges.filter(c => c.statut === 'paye').length;
    const montantPaye = charges
      .filter(c => c.statut === 'paye')
      .reduce((sum, c) => sum + c.montantTotal, 0);
    const chargesImpayees = charges.filter(c => c.statut === 'partiel').length;
    const montantImpayes = charges
      .filter(c => c.statut === 'partiel')
      .reduce((sum, c) => sum + c.montantTotal, 0);

    return {
      totalCharges,
      montantTotal,
      chargesPayees,
      montantPaye,
      chargesImpayees,
      montantImpaye: montantImpayes
    };
  }

  // Simuler un délai pour les appels API
  private static simulateDelay(ms: number = 300): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ChargesService;
