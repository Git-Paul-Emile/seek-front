// Page de messagerie pour l'agence
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Conversation, Message } from '@/services/communication.service';
import communicationService from '@/services/communication.service';
import { ConversationList, ChatWindow, NewConversationDialog } from '@/components/communication';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, MessageSquare, Mail, Users, Headphones, Building2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const AgencyMessages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [newConversationOpen, setNewConversationOpen] = useState(false);

  // Initialiser l'onglet à partir du query parameter
  useEffect(() => {
    const type = searchParams.get('type');
    if (type && ['tenant', 'owner', 'internal', 'support'].includes(type)) {
      setActiveTab(type);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ type: value });
    }
  };

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await communicationService.getConversations();
      setConversations(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les conversations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Charger les conversations
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Filtrer les conversations
  useEffect(() => {
    let filtered = conversations;

    // Filtrer par onglet
    if (activeTab !== 'all') {
      filtered = filtered.filter((c) => c.type === activeTab);
    }

    // Filtrer par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.participants.some((p) => p.name.toLowerCase().includes(query)) ||
          c.subject?.toLowerCase().includes(query) ||
          c.lastMessage?.content.toLowerCase().includes(query)
      );
    }

    setFilteredConversations(filtered);
  }, [conversations, activeTab, searchQuery]);

  const handleSelectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    try {
      const msgs = await communicationService.getMessages(conversation.id);
      setMessages(msgs);
      await communicationService.markAsRead(conversation.id);
      // Mettre à jour le compteur local
      setConversations((prev) =>
        prev.map((c) => (c.id === conversation.id ? { ...c, unreadCount: 0 } : c))
      );
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les messages',
        variant: 'destructive',
      });
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation) return;

    try {
      const newMessage = await communicationService.sendMessage(selectedConversation.id, content);
      setMessages((prev) => [...prev, newMessage]);
      // Mettre à jour la conversation
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer le message',
        variant: 'destructive',
      });
    }
  };

  const handleSendSupportRequest = async (content: string, priority: string) => {
    if (!selectedConversation) return;

    try {
      const newMessage = await communicationService.sendMessage(
        selectedConversation.id,
        content,
        'support_request',
        priority as 'low' | 'normal' | 'high' | 'urgent'
      );
      setMessages((prev) => [...prev, newMessage]);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConversation.id
            ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'envoyer la demande de support',
        variant: 'destructive',
      });
    }
  };

  const handleCreateConversation = async (
    type: 'tenant' | 'owner' | 'internal' | 'support',
    participantId: string,
    participantName: string,
    participantRole: string,
    message: string,
    subject?: string
  ) => {
    try {
      const newConversation = await communicationService.createConversation(
        type,
        participantId,
        participantName,
        participantRole as 'tenant' | 'owner' | 'agency' | 'support',
        message,
        subject
      );
      setConversations((prev) => [newConversation, ...prev]);
      toast({
        title: 'Conversation créée',
        description: `Nouvelle conversation avec ${participantName}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la conversation',
        variant: 'destructive',
      });
    }
  };

  // Calculer les statistiques
  const unreadCount = conversations.reduce((total, c) => total + c.unreadCount, 0);
  const tenantCount = conversations.filter((c) => c.type === 'tenant' && c.unreadCount > 0).length;
  const ownerCount = conversations.filter((c) => c.type === 'owner' && c.unreadCount > 0).length;
  const internalCount = conversations.filter((c) => c.type === 'internal' && c.unreadCount > 0).length;
  const supportCount = conversations.filter((c) => c.type === 'support' && c.unreadCount > 0).length;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Messagerie</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}`
              : 'Aucune conversation non lue'}
          </p>
        </div>
        <Button onClick={() => setNewConversationOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle conversation
        </Button>
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Liste des conversations */}
        <div className="w-80 flex flex-col border rounded-lg bg-card shrink-0">
          {/* Recherche */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Onglets */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-3 pt-2 bg-transparent border-b rounded-none h-auto">
              <TabsTrigger
                value="all"
                className="gap-1.5 data-[state=active]:bg-muted"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Tous
              </TabsTrigger>
              <TabsTrigger
                value="tenant"
                className="gap-1.5 data-[state=active]:bg-muted"
              >
                <Mail className="h-3.5 w-3.5" />
                Locataires
                {tenantCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {tenantCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="owner"
                className="gap-1.5 data-[state=active]:bg-muted"
              >
                <Building2 className="h-3.5 w-3.5" />
                Propriétaires
                {ownerCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {ownerCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="internal"
                className="gap-1.5 data-[state=active]:bg-muted"
              >
                <Users className="h-3.5 w-3.5" />
                Équipe
                {internalCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {internalCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="support"
                className="gap-1.5 data-[state=active]:bg-muted"
              >
                <Headphones className="h-3.5 w-3.5" />
                Support
                {supportCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    {supportCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="flex-1 mt-0 p-0">
              <ScrollArea className="h-full">
                {isLoading ? (
                  <div className="flex items-center justify-center h-40">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : (
                  <ConversationList
                    conversations={filteredConversations}
                    selectedId={selectedConversation?.id}
                    onSelect={handleSelectConversation}
                  />
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Fenêtre de chat */}
        <div className="flex-1 border rounded-lg bg-card overflow-hidden">
          {selectedConversation ? (
            <ChatWindow
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onSendSupportRequest={handleSendSupportRequest}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Sélectionnez une conversation</p>
              <p className="text-sm">
                Choisissez une conversation dans la liste pour visualiser les messages
              </p>
            </div>
          )}
        </div>
      </div>

      <NewConversationDialog
        open={newConversationOpen}
        onOpenChange={setNewConversationOpen}
        onCreate={handleCreateConversation}
      />
    </div>
  );
}

export default AgencyMessages;
