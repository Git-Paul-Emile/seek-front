/**
 * Configuration SEEK - Application de gestion immobilière au Sénégal
 * 
 * Ce fichier contient tous les paramètres et configurations de l'application:
 * - Devise (XOF - Franc CFA Ouest Africain)
 * - Zones géographiques du Sénégal
 * - Modèles d'emails/SMS
 * - Règles de colocation
 * - Modèles de contrats sénégalais
 */

// ==================== DEVISE ====================
export const CURRENCY = {
  code: 'XOF',
  name: 'Franc CFA (BCEAO)',
  symbol: 'FCFA',
  locale: 'fr-SN',
  decimals: 0,
  format: (amount: number): string => {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF',
      maximumFractionDigits: 0,
    }).format(amount);
  },
};

// ==================== ZONES GÉOGRAPHIQUES DU SÉNÉGAL ====================
export const GEOGRAPHIC_ZONES = {
  regions: [
    {
      id: 'dakar',
      name: 'Dakar',
      departments: [
        { id: 'dakar', name: 'Dakar' },
        { id: 'guédiawaye', name: 'Guédiawaye' },
        { id: 'pikine', name: 'Pikine' },
        { id: 'rufisque', name: 'Rufisque' },
        { id: 'keur-massar', name: 'Keur Massar' },
      ],
    },
    {
      id: 'thies',
      name: 'Thiès',
      departments: [
        { id: 'thies', name: 'Thiès' },
        { id: 'mbour', name: 'Mbour' },
        { id: 'tivaouane', name: 'Tivaouane' },
      ],
    },
    {
      id: 'saint-louis',
      name: 'Saint-Louis',
      departments: [
        { id: 'saint-louis', name: 'Saint-Louis' },
        { id: 'dagana', name: 'Dagana' },
        { id: 'podor', name: 'Podor' },
      ],
    },
    {
      id: 'kaolack',
      name: 'Kaolack',
      departments: [
        { id: 'kaolack', name: 'Kaolack' },
        { id: 'bambey', name: 'Bambey' },
        { id: 'guinguineo', name: 'Guinguinéo' },
      ],
    },
    {
      id: 'fatick',
      name: 'Fatick',
      departments: [
        { id: 'fatick', name: 'Fatick' },
        { id: 'foundiougne', name: 'Foundiougne' },
        { id: 'goswirie', name: 'Gossswirie' },
      ],
    },
    {
      id: 'louga',
      name: 'Louga',
      departments: [
        { id: 'louga', name: 'Louga' },
        { id: 'kébémer', name: 'Kébémer' },
        { id: 'linguere', name: 'Linguère' },
      ],
    },
    {
      id: 'tambacounda',
      name: 'Tambacounda',
      departments: [
        { id: 'tambacounda', name: 'Tambacounda' },
        { id: 'bakel', name: 'Bakel' },
        { id: 'goudiry', name: 'Goudiry' },
        { id: 'koumpentoum', name: 'Koumpentoum' },
      ],
    },
    {
      id: 'kolda',
      name: 'Kolda',
      departments: [
        { id: 'kolda', name: 'Kolda' },
        { id: 'medina-yoro-foulah', name: 'Médina Yoro Foulah' },
        { id: ' Vélingara', name: 'Vélingara' },
      ],
    },
    {
      id: 'ziguinchor',
      name: 'Ziguinchor',
      departments: [
        { id: 'ziguinchor', name: 'Ziguinchor' },
        { id: 'bignona', name: 'Bignona' },
        { id: 'oussouye', name: 'Oussouye' },
      ],
    },
    {
      id: 'sédhiou',
      name: 'Sédhiou',
      departments: [
        { id: 'sédhiou', name: 'Sédhiou' },
        { id: 'bounkiling', name: 'Bounkiling' },
        { id: 'goudomp', name: 'Goudomp' },
      ],
    },
    {
      id: 'matam',
      name: 'Matam',
      departments: [
        { id: 'matam', name: 'Matam' },
        { id: 'kanel', name: 'Kanel' },
        { id: 'ranérou-ferlo', name: 'Ranérou Ferlo' },
      ],
    },
    {
      id: 'kédougou',
      name: 'Kédougou',
      departments: [
        { id: 'kédougou', name: 'Kédougou' },
        { id: 'salémata', name: 'Salémata' },
        { id: 'saraya', name: 'Saraya' },
      ],
    },
  ],

  // Principales localités/quartiers par ville
  localities: {
    dakar: [
      'Plateau',
      'Fann',
      'Point E',
      'Amitié',
      'Biscuiterie',
      'Hann',
      'Mermoz',
      'Sacre Coeur',
      'Dakar Plateau',
      'Cite Sipres',
      'Parcelles Assainies',
      'Grand Dakar',
      'Dieuppeul',
      'Derklé',
      'N Gor',
      'Yoff',
      'Ouakam',
      'Niary Tally',
      'Camberène',
    ],
    guédiawaye: [
      'Sam Sam',
      'Wakhinane',
      'Golf',
      'Médina Gounass',
      'Cheikh Anta Diop',
    ],
    pikine: [
      'Pikine Nord',
      'Pikine Sud',
      'Pikine Est',
      'Pikine Ouest',
      'Dalifort',
      'Guédiawaye 2',
      'Tsicade',
      'Patte d\'Oie',
    ],
    thies: [
      'Thiès Ville',
      'Thiès Nord',
      'Thiès Sud',
      'Thiès Est',
      'Thiès Ouest',
      'Mbour',
      'Saly',
      'Sokone',
    ],
  },

  // Codes postaux par ville
  postalCodes: {
    dakar: '11000',
    thies: '12000',
    'saint-louis': '13000',
    kaolack: '14000',
    ziguinchor: '15000',
    tambacounda: '16000',
    louga: '17000',
    fatick: '18000',
    kolda: '19000',
    matam: '20000',
    'sédhiou': '21000',
    kédougou: '22000',
  },
};

// ==================== MODÈLES D'EMAILS/SMS ====================
export const EMAIL_TEMPLATES = {
  // Modèle de rappel de paiement
  paymentReminder: {
    subject: 'Rappel de paiement - Loyer {month} {year}',
    body: `Bonjour {tenant_name},

Nous vous rappelons que votre loyer du mois de {month} {year} d'un montant de {amount} arrive à échéance le {due_date}.

Nous vous prions de bien vouloir effectuer le paiement avant la date d'échéance pour éviter tout retard.

Détails du paiement:
- Montant: {amount}
- Date d'échéance: {due_date}
- Période: {period_start} au {period_end}

Pour effectuer votre paiement, vous pouvez:
- Effectuer un virement bancaire sur notre compte
- Payer en espèces à notre agence
- Utiliser notre plateforme de paiement en ligne

Si vous avez déjà effectué ce paiement, nous vous remercions de ne pas tenir compte de ce rappel.

Cordialement,
{agency_name}
{agency_phone}
{agency_email}`,
  },

  // Modèle de confirmation de paiement
  paymentConfirmation: {
    subject: 'Confirmation de paiement - Reçu #{receipt_number}',
    body: `Bonjour {tenant_name},

Nous avons bien reçu votre paiement de {amount} pour le loyer du mois de {month} {year}.

Détails du paiement:
- Numéro de reçu: {receipt_number}
- Montant: {amount}
- Date de paiement: {payment_date}
- Période: {period_start} au {period_end}
- Mode de paiement: {payment_method}

Votre reçu est disponible dans votre espace client.

Merci de votre confiance.

Cordialement,
{agency_name}
{agency_phone}
{agency_email}`,
  },

  // Modèle d'envoi de quittance
  receiptAvailable: {
    subject: 'Quittance de loyer disponible - {month} {year}',
    body: `Bonjour {tenant_name},

Votre quittance de loyer pour le mois de {month} {year} est désormais disponible.

Vous pouvez la télécharger depuis votre espace client sur notre plateforme.

Détails:
- Numéro de quittance: {receipt_number}
- Montant: {amount}
- Période: {period_start} au {period_end}

Nous restons à votre disposition pour toute question.

Cordialement,
{agency_name}
{agency_phone}
{agency_email}`,
  },

  // Modèle de relance pour retard de paiement
  paymentOverdue: {
    subject: 'Relance - Loyer en retard',
    body: `Bonjour {tenant_name},

Nous constatons que votre loyer d'un montant de {amount} pour la période du {period_start} au {period_end} n'a pas encore été réglé.

La date d'échéance était le {due_date} et nous sommes maintenant à {days_late} jour(s) de retard.

Nous vous prions de bien vouloir régulariser votre situation dans les plus brefs délais afin d'éviter toutes conséquences.

Pour effectuer votre paiement:
- Virement bancaire
- Paiement en espèces
- Paiement en ligne

Si vous rencontrez des difficultés financières, nous vous invitons à nous contacter pour trouver ensemble une solution.

Cordialement,
{agency_name}
{agency_phone}
{agency_email}`,
  },

  // Modèle d'accueil nouveau locataire
  welcomeTenant: {
    subject: 'Bienvenue chez {agency_name} - Vos informations de location',
    body: `Bonjour {tenant_name},

Nous sommes ravis de vous compter parmi nos locataires.

Vous trouverez ci-dessous les informations relatives à votre location:

Bien immobilier: {property_address}
Type de bail: {lease_type}
Date de début: {start_date}
Date de fin: {end_date}
Loyer mensuel: {rent_amount}
Dépôt de garantie: {deposit_amount}
Jour de paiement: {payment_due_day}

 Vos identifiants de connexion à l'espace client:
- Email: {tenant_email}
- Mot de passe: {temporary_password}

Nous vous encourageons à changer votre mot de passe lors de votre première connexion.

Cordialement,
{agency_name}
{agency_phone}
{agency_email}`,
  },

  // Modèle de notification de départ
  departureNotice: {
    subject: 'Notification de départ - {property_address}',
    body: `Bonjour {tenant_name},

Nous avons bien reçu votre demande de départ.

Voici les informations relatives à votre départ:

Date de départ prévue: {departure_date}
Logement: {property_address}
État des lieux: {move_out_date}

Procédure à suivre:
1. Préparer l'état des lieux de sortie
2. Restituer les clés
3. Procéder à la vérification des lieux
4. Récupérer votre dépôt de garantie (sous réserve de l'état des lieux)

Nous vous remercions de votre confiance et restons à votre disposition.

Cordialement,
{agency_name}
{agency_phone}
{agency_email}`,
  },
};

export const SMS_TEMPLATES = {
  // Rappel de paiement SMS
  paymentReminder: `SEEK: Bonjour {tenant_name}, rappel - loyer {amount} échoit le {due_date}. Paiement: virement/paiement en ligne. Agency: {agency_phone}`,

  // Confirmation de paiement SMS
  paymentConfirmation: `SEEK: Paiement reçu! Reçu #{receipt_number} pour {amount}. Merci!`,

  // Relance retard SMS
  paymentOverdue: `SEEK: URGENT - Loyer {amount} en retard de {days_late} jour(s). Veuillez régulariser rapidement. Contact: {agency_phone}`,

  // Quittance disponible SMS
  receiptAvailable: `SEEK: Votre quittance {month} {year} est disponible. Téléchargeable sur votre espace client.`,

  // Rappel état des lieux SMS
  moveOutReminder: `SEEK: Rappel état des lieux de sortie prévu le {date}. Merci de préparer le logement.`,
};

// ==================== RÈGLES DE COLOCATION ====================
export const COLOCATION_RULES = {
  // Nombre maximum de colocataires selon le type de bien
  maxRoommatesByPropertyType: {
    studio: 2,
    t1: 2,
    t2: 3,
    t3: 4,
    t4: 5,
    t5plus: 6,
    villa: 8,
  },

  // Ratio salle de bain/colocataire recommandé
  bathroomRatio: {
    minimum: 0.5, // 1 salle de bain pour 2 colocataires
    recommended: 1, // 1 salle de bain par colocataire
  },

  // Règles de partage des espaces communs
  commonSpaces: {
    required: ['cuisine', 'salon', 'salle de bain'],
    kitchenMinSurface: 8, // m² minimum
    livingRoomMinSurface: 15, // m² minimum
  },

  // Clause de solidarité
  solidarityClause: {
    enabled: true,
    description: 'Clause de solidarité entre colocataires',
    text: 'Les colocataires sont solidairement responsables du paiement integral du loyer et des charges envers le bailleur.',
  },

  // Règles de chambre
  bedroomRules: {
    minSurface: 9, // m² minimum par chambre (loi ALUR)
    coupleOccupancy: 2, // Maximum 2 personnes par chambre pour un couple
  },

  // Charges répartition par défaut
  defaultChargesSplit: {
    rent: 'by_room', // Par chambre
    utilities: 'per_person', // Par personne
    internet: 'per_person', // Par personne
    cleaning: 'shared', // Partagé
  },

  // Préavis pour départ d'un colocataire
  noticePeriodForRoommateDeparture: {
    minimum: 1, // mois
    recommended: 2, // mois
  },
};

// ==================== MODÈLES DE CONTRATS SÉNÉGALAIS ====================
export const LEASE_CONTRACT_TEMPLATES = {
  // Types de contrats disponibles
  types: [
    {
      id: 'bail-habitation',
      name: 'Bail d\'habitation',
      description: 'Contrat de location à usage d\'habitation principale',
      clauses: [
        'Objet du bail',
        'Durée',
        'Loyer et modalités de paiement',
        'Dépôt de garantie',
        'Charges',
        'Travaux et entretiens',
        'Assurance',
        'Sous-location',
        'Résiliation',
        'Élection de domicile',
      ],
    },
    {
      id: 'bail-meuble',
      name: 'Bail meublé',
      description: 'Contrat de location meublée à usage d\'habitation',
      clauses: [
        'Objet du bail (meublé)',
        'Durée',
        'Loyer et modalités de paiement',
        'Dépôt de garantie',
        'Inventaire du mobilier',
        'Charges',
        'Travaux et entretiens',
        'Assurance',
        'Sous-location',
        'Résiliation',
        'Élection de domicile',
      ],
    },
    {
      id: 'colocation',
      name: 'Contrat de colocation',
      description: 'Contrat de location multiple avec clause de solidarité',
      clauses: [
        'Objet du bail (colocation)',
        'Liste des colocataires',
        'Durée',
        'Loyer et répartition',
        'Dépôt de garantie',
        'Clause de solidarité',
        'Chambre de chaque colocataire',
        'Espaces communs',
        'Règlement intérieur',
        'Travaux et entretiens',
        'Assurance',
        'Départ d\'un colocataire',
        'Résiliation',
        'Élection de domicile',
      ],
    },
    {
      id: 'bail-commercial',
      name: 'Bail commercial',
      description: 'Contrat de location à usage commercial ou professionnel',
      clauses: [
        'Objet du bail (commercial)',
        'Destination des locaux',
        'Durée',
        'Loyer et modalités de paiement',
        'Dépôt de garantie',
        'Charges et travaux',
        'Travaux d\'aménagement',
        'Assurance',
        'Sous-location',
        'Renouvellement',
        'Résiliation',
        'Élection de domicile',
      ],
    },
  ],

  // Clauses par défaut pour chaque type de contrat
  defaultClauses: {
    'bail-habitation': [
      {
        title: 'OBJET DU BAIL',
        content: 'Le présent bail a pour objet la location d\'un bien immobilier à usage d\'habitation principale situé à l\'adresse indiquée dans le contrat.',
      },
      {
        title: 'DURÉE DU BAIL',
        content: 'Le bail est conclu pour une durée de [DURÉE] mois/ans à compter de la date de remise des clés. Il sera renouvelé tacitement pour la même durée sauf résiliation par l\'une des parties.',
      },
      {
        title: 'LOYER',
        content: 'Le loyer est fixé à [MONTANT] FCA par mois, payable au plus tard le [JOUR] de chaque mois. Le loyer sera révisé chaque année selon l\'indice de référence des loyer.',
      },
      {
        title: 'DÉPÔT DE GARANTIE',
        content: 'Un dépôt de garantie équivalent à [MONTANT] mois de loyer est versé par le Preneur lors de la signature. Ce dépôt sera restitué dans un délai maximum de deux mois après la restitution des clés.',
      },
      {
        title: 'CHARGES',
        content: 'Les charges locatives (eau, électricité, ordures ménagères, etc.) sont [INCLUSES DANS LE LOYER / À LA CHARGE DU PRENEUR / RÉPARTIES COMME SUIT: ...]',
      },
      {
        title: 'TRAVAUX ET ENTRETIENS',
        content: 'Le Bailleur prend en charge les gros travaux (toiture, fondations, etc.). Le Preneur assure l\'entretien courant et les petites réparations.',
      },
      {
        title: 'ASSURANCE',
        content: 'Le Preneur s\'engage à souscrire une assurance multirisques habitation couvrant les risques locatifs pendant toute la durée du bail.',
      },
      {
        title: 'SOUS-LOCATION',
        content: 'La sous-location est [AUTORISÉE / INTERDITE / SOUS RÉSERVE D\'ACCORD ÉCRIT DU BAILLEUR].',
      },
      {
        title: 'RÉSILIATION',
        content: 'Chaque partie peut résilier le bail en respectant un préavis de [DURÉE] mois. En cas de manquement grave, le bail peut être résilié de plein droit.',
      },
      {
        title: 'ÉLECTION DE DOMICILE',
        content: 'Pour l\'exécution du présent bail, les parties font election de domicile en leurs domiciles respectifs indiqués au contrat.',
      },
    ],
    'colocation': [
      {
        title: 'OBJET DU BAIL',
        content: 'Le présent contrat a pour objet la location en colocation d\'un bien immobilier à usage d\'habitation principale situé à l\'adresse indiquée au contrat.',
      },
      {
        title: 'LISTE DES COLOCATAIRES',
        content: 'Les parties suivantes sont reconnues comme colocataires du bien: [LISTE DES NOMS ET COORDONNÉES]. Toute ajout ou remplacement de colocataire nécessite l\'accord écrit du bailleur.',
      },
      {
        title: 'CLAUSE DE SOLIDARITÉ',
        content: 'Les colocataires sont solidairement et indivisiblement responsables envers le bailleur de l\'exécution de toutes les obligations résultant du présent bail. Cela signifie que le bailleur peut exiger le paiement integral du loyer et des charges de l\'un ou l\'autre des colocataires.',
      },
      {
        title: 'CHAMBRE DE CHAQUE COLOCATAIRE',
        content: 'Chaque colocataire dispose d\'une chambre individuelle dont il a l\'usage exclusif. Les chambres sont attribuées comme suit: [LISTE DES CHAMBRES].',
      },
      {
        title: 'ESPACES COMMUNS',
        content: 'Les espaces communs (salon, cuisine, salle de bain, etc.) sont partagés entre tous les colocataires. Un règlement intérieur peut définir les règles de vie commune.',
      },
      {
        title: 'RÈGLEMENT INTÉRIEUR',
        content: 'Les colocataires s\'engagent à respecter le règlement intérieur joint au présent contrat, notamment concernant le bruit, les visites, le ménage, etc.',
      },
      {
        title: 'DÉPART D\'UN COLOCATAIRE',
        content: 'En cas de départ d\'un colocataire, celui-ci doit respecter un préavis de [DURÉE] mois. Il reste solidairement responsable jusqu\'à la fin du préavis ou jusqu\'à la désignation d\'un remplaçant agréé par le bailleur.',
      },
      {
        title: 'REMPLACEMENT D\'UN COLOCATAIRE',
        content: 'Le colocataire partant peut proposer un remplaçant qui devra être agréé par le bailleur et les autres colocataires. Le bailleur se réserve le droit de refuser tout candidat.',
      },
    ],
  },

  // Mentions légales obligatoires (Sénégal)
  mandatoryMentions: [
    'Identification complète des parties (bailleur et preneur(s))',
    'Description précise du bien loué (adresse, surface, caractéristiques)',
    'Destination des locaux (habitation, commerce, etc.)',
    'Date de prise d\'effet et durée du bail',
    'Montant du loyer et modalités de paiement',
    'Montant du dépôt de garantie',
    'Date de paiement',
    'Clause de révision du loyer (le cas échéant)',
    'Élection de domicile des parties',
    'Signature des parties',
  ],

  // Informations requises pour la signature
  requiredInfo: {
    landlord: [
      'Nom et prénom ou raison sociale',
      'Adresse du domicile ou siège social',
      'Numéro de téléphone',
      'Adresse email',
      'Numéro CNI ou RCCM',
    ],
    tenant: [
      'Nom et prénom',
      'Adresse du domicile',
      'Numéro de téléphone',
      'Adresse email',
      'Numéro CNI/Passeport',
      'Profession',
      'Nom et adresse de l\'employeur (facultatif)',
    ],
    property: [
      'Adresse complète',
      'Superficie',
      'Nombre de pièces',
      'Étage',
      'Équipements',
      'Parking / Garage',
    ],
  },
};

// ==================== PARAMÈTRES DE NOTIFICATION ====================
export const NOTIFICATION_PREFERENCES = {
  // Canaux disponibles
  channels: [
    { id: 'email', name: 'Email', icon: 'Mail', enabled: true },
    { id: 'sms', name: 'SMS', icon: 'Smartphone', enabled: true },
    { id: 'whatsapp', name: 'WhatsApp', icon: 'MessageSquare', enabled: true },
    { id: 'push', name: 'Notification push', icon: 'Bell', enabled: false },
  ],

  // Types de notifications
  types: [
    {
      id: 'payment_reminder',
      name: 'Rappel de paiement',
      description: 'Rappels avant la date d\'échéance du loyer',
      defaultDaysBefore: [5, 3, 1],
      channels: ['email', 'sms', 'whatsapp'],
    },
    {
      id: 'payment_received',
      name: 'Paiement reçu',
      description: 'Confirmation de réception du paiement',
      channels: ['email'],
    },
    {
      id: 'receipt_available',
      name: 'Quittance disponible',
      description: '通知当付款收据可用时',
      channels: ['email'],
    },
    {
      id: 'overdue_notice',
      name: 'Avis de retard',
      description: 'Relance en cas de retard de paiement',
      channels: ['email', 'sms', 'whatsapp'],
    },
    {
      id: 'lease_expiry',
      name: 'Expiration du bail',
      description: 'Rappel avant l\'expiration du contrat de bail',
      defaultDaysBefore: [60, 30],
      channels: ['email'],
    },
    {
      id: 'maintenance',
      name: 'Travaux / Maintenance',
      description: '通知即将进行的维护工作',
      channels: ['email', 'sms'],
    },
    {
      id: 'general',
      name: 'Informations générales',
      description: 'Communications générales de l\'agence',
      channels: ['email', 'whatsapp'],
    },
  ],

  // Heures d\'envoi préférées
  preferredSendTimes: {
    paymentReminder: '09:00',
    overdueNotice: '10:00',
    general: '10:00',
  },
};

// ==================== PARAMÈTRES GÉNÉRAUX ====================
export const GENERAL_SETTINGS = {
  // Numéro WhatsApp par défaut de l\'agence
  defaultWhatsApp: '+221 77 123 45 67',

  // Email de contact
  defaultEmail: 'contact@seek.sn',

  // Heures d\'ouverture
  openingHours: {
    weekdays: '08:30 - 18:00',
    saturday: '09:00 - 13:00',
    sunday: 'Fermé',
  },

  // Délai de réponse SLA (Service Level Agreement)
  sla: {
    paymentConfirmation: '24h',
    generalInquiry: '48h',
    urgentIssues: '4h',
  },

  // Frais de dossier
  processingFees: {
    tenant: 10000, // XOF
    landlord: 0,
  },

  // Commission agence
  agencyCommission: {
    rental: 0.05, // 5% du loyer mensuel
    sale: 0.03, // 3% du prix de vente
  },
};

// ==================== EXPORT COMPLET ====================
export const SEEK_CONFIG = {
  currency: CURRENCY,
  geographicZones: GEOGRAPHIC_ZONES,
  emailTemplates: EMAIL_TEMPLATES,
  smsTemplates: SMS_TEMPLATES,
  colocationRules: COLOCATION_RULES,
  leaseContractTemplates: LEASE_CONTRACT_TEMPLATES,
  notificationPreferences: NOTIFICATION_PREFERENCES,
  generalSettings: GENERAL_SETTINGS,
};

export default SEEK_CONFIG;
