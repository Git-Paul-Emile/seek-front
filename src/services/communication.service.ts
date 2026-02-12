// Service de communication pour l'agence
// Gère les messages directs, la messagerie interne et le support client

import { agencyAuth } from './agency-auth.service';

// Types pour les messages
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'agency' | 'tenant' | 'owner' | 'support';
  senderPhoto?: string;
  recipientId: string;
  recipientName: string;
  recipientRole: 'agency' | 'tenant' | 'owner' | 'support';
  content: string;
  attachments?: Attachment[];
  timestamp: string;
  read: boolean;
  type: 'text' | 'system' | 'support_request' | 'support_response';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface Conversation {
  id: string;
  type: 'tenant' | 'owner' | 'internal' | 'support';
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  subject?: string;
  status?: 'open' | 'closed' | 'pending' | 'resolved';
}

export interface Participant {
  id: string;
  name: string;
  role: 'agency' | 'tenant' | 'owner' | 'support';
  photo?: string;
  online?: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  assignedTo?: string;
}

// Mock data pour le développement
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    type: 'tenant',
    participants: [
      { id: 'agency-1', name: 'Seek Agence', role: 'agency', online: true },
      { id: 'tenant-1', name: 'Marie Dupont', role: 'tenant', online: true },
    ],
    lastMessage: {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'tenant-1',
      senderName: 'Marie Dupont',
      senderRole: 'tenant',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'Bonjour, j\'ai une question concernant mon bail.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      type: 'text',
    },
    unreadCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    subject: 'Question bail appartement T2',
  },
  {
    id: 'conv-2',
    type: 'owner',
    participants: [
      { id: 'agency-1', name: 'Seek Agence', role: 'agency', online: true },
      { id: 'owner-1', name: 'Jean Martin', role: 'owner', online: false },
    ],
    lastMessage: {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: 'agency-1',
      senderName: 'Seek Agence',
      senderRole: 'agency',
      recipientId: 'owner-1',
      recipientName: 'Jean Martin',
      recipientRole: 'owner',
      content: 'Le paiement du loyer de janvier a été effectué.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
      type: 'text',
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    subject: 'Paiement loyer',
  },
  {
    id: 'conv-3',
    type: 'internal',
    participants: [
      { id: 'agency-1', name: 'Seek Agence', role: 'agency', online: true },
      { id: 'agency-2', name: 'Sophie Bernard', role: 'agency', online: true },
    ],
    lastMessage: {
      id: 'msg-3',
      conversationId: 'conv-3',
      senderId: 'agency-2',
      senderName: 'Sophie Bernard',
      senderRole: 'agency',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'J\'ai traité la demande de visite pour demain.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: false,
      type: 'text',
    },
    unreadCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    subject: 'Demandes de visite',
  },
  {
    id: 'conv-4',
    type: 'support',
    participants: [
      { id: 'agency-1', name: 'Seek Agence', role: 'agency', online: true },
      { id: 'support-1', name: 'Support Seek', role: 'support', online: true },
    ],
    lastMessage: {
      id: 'msg-4',
      conversationId: 'conv-4',
      senderId: 'support-1',
      senderName: 'Support Seek',
      senderRole: 'support',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'Votre demande a été traitée avec succès.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: true,
      type: 'support_response',
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    subject: 'Ticket #12345 - Problème technique',
    status: 'resolved',
  },
];

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1-1',
      conversationId: 'conv-1',
      senderId: 'agency-1',
      senderName: 'Seek Agence',
      senderRole: 'agency',
      recipientId: 'tenant-1',
      recipientName: 'Marie Dupont',
      recipientRole: 'tenant',
      content: 'Bonjour Marie, comment puis-je vous aider ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: true,
      type: 'text',
    },
    {
      id: 'msg-1-2',
      conversationId: 'conv-1',
      senderId: 'tenant-1',
      senderName: 'Marie Dupont',
      senderRole: 'tenant',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'Je souhaiterais savoir si je peux résilier mon bail anticipativement.',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      read: true,
      type: 'text',
    },
    {
      id: 'msg-1-3',
      conversationId: 'conv-1',
      senderId: 'agency-1',
      senderName: 'Seek Agence',
      senderRole: 'agency',
      recipientId: 'tenant-1',
      recipientName: 'Marie Dupont',
      recipientRole: 'tenant',
      content: 'Bien sûr, je vais vous envoyer les conditions de résiliation anticipée.',
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      read: true,
      type: 'text',
    },
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'tenant-1',
      senderName: 'Marie Dupont',
      senderRole: 'tenant',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'Bonjour, j\'ai une question concernant mon bail.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      read: false,
      type: 'text',
    },
  ],
  'conv-2': [
    {
      id: 'msg-2-1',
      conversationId: 'conv-2',
      senderId: 'owner-1',
      senderName: 'Jean Martin',
      senderRole: 'owner',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'Bonjour, pouvez-vous me confirmer le paiement du loyer de janvier ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      read: true,
      type: 'text',
    },
    {
      id: 'msg-2',
      conversationId: 'conv-2',
      senderId: 'agency-1',
      senderName: 'Seek Agence',
      senderRole: 'agency',
      recipientId: 'owner-1',
      recipientName: 'Jean Martin',
      recipientRole: 'owner',
      content: 'Le paiement du loyer de janvier a été effectué.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
      type: 'text',
    },
  ],
  'conv-3': [
    {
      id: 'msg-3-1',
      conversationId: 'conv-3',
      senderId: 'agency-1',
      senderName: 'Seek Agence',
      senderRole: 'agency',
      recipientId: 'agency-2',
      recipientName: 'Sophie Bernard',
      recipientRole: 'agency',
      content: 'Sophie, as-tu eu le temps de traiter les demandes de visite ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      read: true,
      type: 'text',
    },
    {
      id: 'msg-3',
      conversationId: 'conv-3',
      senderId: 'agency-2',
      senderName: 'Sophie Bernard',
      senderRole: 'agency',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'J\'ai traité la demande de visite pour demain.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      read: false,
      type: 'text',
    },
  ],
  'conv-4': [
    {
      id: 'msg-4-1',
      conversationId: 'conv-4',
      senderId: 'agency-1',
      senderName: 'Seek Agence',
      senderRole: 'agency',
      recipientId: 'support-1',
      recipientName: 'Support Seek',
      recipientRole: 'support',
      content: 'Bonjour, j\'ai un problème avec le module de paiement.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      read: true,
      type: 'support_request',
      priority: 'high',
    },
    {
      id: 'msg-4-2',
      conversationId: 'conv-4',
      senderId: 'support-1',
      senderName: 'Support Seek',
      senderRole: 'support',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'Bonjour, merci pour votre signalement. Pouvez-vous nous donner plus de détails sur le problème ?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      read: true,
      type: 'support_response',
    },
    {
      id: 'msg-4-3',
      conversationId: 'conv-4',
      senderId: 'agency-1',
      senderName: 'Seek Agence',
      senderRole: 'agency',
      recipientId: 'support-1',
      recipientName: 'Support Seek',
      recipientRole: 'support',
      content: 'Quando je tente de générer une quittance, j\'obtiens une erreur 500.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      read: true,
      type: 'support_request',
    },
    {
      id: 'msg-4',
      conversationId: 'conv-4',
      senderId: 'support-1',
      senderName: 'Support Seek',
      senderRole: 'support',
      recipientId: 'agency-1',
      recipientName: 'Seek Agence',
      recipientRole: 'agency',
      content: 'Votre demande a été traitée avec succès.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      read: true,
      type: 'support_response',
    },
  ],
};

class CommunicationService {
  private conversations: Conversation[] = [];
  private messages: Record<string, Message[]> = {};

  constructor() {
    // Charger les données mock
    this.conversations = [...mockConversations];
    this.messages = { ...mockMessages };
  }

  // Récupérer toutes les conversations
  async getConversations(): Promise<Conversation[]> {
    // Simuler un appel API
    await this.delay(300);
    return this.conversations;
  }

  // Récupérer les conversations par type
  async getConversationsByType(type: 'tenant' | 'owner' | 'internal' | 'support'): Promise<Conversation[]> {
    await this.delay(200);
    return this.conversations.filter(conv => conv.type === type);
  }

  // Récupérer une conversation par ID
  async getConversation(id: string): Promise<Conversation | undefined> {
    await this.delay(200);
    return this.conversations.find(conv => conv.id === id);
  }

  // Récupérer les messages d'une conversation
  async getMessages(conversationId: string): Promise<Message[]> {
    await this.delay(200);
    return this.messages[conversationId] || [];
  }

  // Envoyer un message
  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'support_request' = 'text',
    priority?: 'low' | 'normal' | 'high' | 'urgent'
  ): Promise<Message> {
    await this.delay(300);
    
    const conversation = this.conversations.find(c => c.id === conversationId);
    if (!conversation) {
      throw new Error('Conversation non trouvée');
    }

    const user = agencyAuth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const recipient = conversation.participants.find(p => p.id !== user.id);

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: 'agency',
      senderPhoto: user.profilePhoto,
      recipientId: recipient?.id || '',
      recipientName: recipient?.name || '',
      recipientRole: recipient?.role || 'agency',
      content,
      timestamp: new Date().toISOString(),
      read: true,
      type,
      priority,
    };

    // Ajouter le message à la conversation
    if (!this.messages[conversationId]) {
      this.messages[conversationId] = [];
    }
    this.messages[conversationId].push(newMessage);

    // Mettre à jour la conversation
    const convIndex = this.conversations.findIndex(c => c.id === conversationId);
    this.conversations[convIndex] = {
      ...this.conversations[convIndex],
      lastMessage: newMessage,
      updatedAt: new Date().toISOString(),
    };

    return newMessage;
  }

  // Créer une nouvelle conversation
  async createConversation(
    type: 'tenant' | 'owner' | 'internal' | 'support',
    participantId: string,
    participantName: string,
    participantRole: 'tenant' | 'owner' | 'agency' | 'support',
    initialMessage: string,
    subject?: string
  ): Promise<Conversation> {
    await this.delay(400);

    const user = agencyAuth.currentUser;
    if (!user) {
      throw new Error('Utilisateur non connecté');
    }

    const conversationId = `conv-${Date.now()}`;
    const participants: Participant[] = [
      {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        role: 'agency',
        photo: user.profilePhoto,
        online: true,
      },
      {
        id: participantId,
        name: participantName,
        role: participantRole,
        online: participantRole !== 'owner',
      },
    ];

    const firstMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: 'agency',
      senderPhoto: user.profilePhoto,
      recipientId: participantId,
      recipientName: participantName,
      recipientRole: participantRole,
      content: initialMessage,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text',
    };

    const newConversation: Conversation = {
      id: conversationId,
      type,
      participants,
      lastMessage: firstMessage,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subject,
      status: 'open',
    };

    this.conversations.unshift(newConversation);
    this.messages[conversationId] = [firstMessage];

    return newConversation;
  }

  // Marquer une conversation comme lue
  async markAsRead(conversationId: string): Promise<void> {
    await this.delay(100);
    
    const convIndex = this.conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
      this.conversations[convIndex] = {
        ...this.conversations[convIndex],
        unreadCount: 0,
      };
    }

    // Marquer tous les messages comme lus
    if (this.messages[conversationId]) {
      this.messages[conversationId] = this.messages[conversationId].map(msg => ({
        ...msg,
        read: true,
      }));
    }
  }

  // Marquer un message comme lu
  async markMessageAsRead(messageId: string, conversationId: string): Promise<void> {
    await this.delay(100);
    
    if (this.messages[conversationId]) {
      const msgIndex = this.messages[conversationId].findIndex(m => m.id === messageId);
      if (msgIndex !== -1) {
        this.messages[conversationId][msgIndex] = {
          ...this.messages[conversationId][msgIndex],
          read: true,
        };
      }
    }
  }

  // Récupérer le nombre de messages non lus
  async getUnreadCount(): Promise<number> {
    await this.delay(100);
    return this.conversations.reduce((total, conv) => total + conv.unreadCount, 0);
  }

  // Récupérer les conversations non lues
  async getUnreadConversations(): Promise<Conversation[]> {
    await this.delay(200);
    return this.conversations.filter(conv => conv.unreadCount > 0);
  }

  // Rechercher dans les conversations
  async searchConversations(query: string): Promise<Conversation[]> {
    await this.delay(200);
    const lowerQuery = query.toLowerCase();
    return this.conversations.filter(conv => 
      conv.participants.some(p => p.name.toLowerCase().includes(lowerQuery)) ||
      conv.lastMessage?.content.toLowerCase().includes(lowerQuery) ||
      conv.subject?.toLowerCase().includes(lowerQuery)
    );
  }

  // Support tickets
  async getSupportTickets(): Promise<SupportTicket[]> {
    await this.delay(300);
    // Convertir les conversations de type 'support' en tickets
    return this.conversations
      .filter(conv => conv.type === 'support')
      .map(conv => ({
        id: conv.id,
        subject: conv.subject || 'Ticket de support',
        description: conv.lastMessage?.content || '',
        status: (conv.status as SupportTicket['status']) || 'open',
        priority: 'normal' as const,
        category: 'Technique',
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messages: this.messages[conv.id] || [],
      }));
  }

  async createSupportTicket(
    subject: string,
    description: string,
    priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
    category: string = 'Général'
  ): Promise<SupportTicket> {
    await this.delay(400);
    
    const conversation = await this.createConversation(
      'support',
      'support-1',
      'Support Seek',
      'support',
      description,
      subject
    );

    // Marquer le premier message comme une demande de support
    if (this.messages[conversation.id] && this.messages[conversation.id][0]) {
      this.messages[conversation.id][0] = {
        ...this.messages[conversation.id][0],
        type: 'support_request',
        priority,
      };
    }

    return {
      id: conversation.id,
      subject,
      description,
      status: 'open',
      priority,
      category,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      messages: this.messages[conversation.id] || [],
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const communicationService = new CommunicationService();
export default communicationService;
