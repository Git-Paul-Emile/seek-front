// Composant de liste des conversations
import React from 'react';
import { Conversation } from '@/services/communication.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { User, Building2, Users, Headphones } from 'lucide-react';

interface ConversationListProps {
  conversations: Conversation[];
  selectedId?: string;
  onSelect: (conversation: Conversation) => void;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedId,
  onSelect,
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tenant':
        return <User className="h-3 w-3" />;
      case 'owner':
        return <Building2 className="h-3 w-3" />;
      case 'internal':
        return <Users className="h-3 w-3" />;
      case 'support':
        return <Headphones className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'tenant':
        return 'Locataire';
      case 'owner':
        return 'Propriétaire';
      case 'internal':
        return 'Interne';
      case 'support':
        return 'Support';
      default:
        return type;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {conversations.map((conversation) => {
        const otherParticipant = conversation.participants.find(
          (p) => p.role !== 'agency'
        );
        const isSelected = selectedId === conversation.id;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation)}
            className={`flex items-start gap-3 p-3 text-left transition-colors hover:bg-muted/50 ${
              isSelected ? 'bg-muted' : ''
            } ${conversation.unreadCount > 0 ? 'bg-blue-50/50' : ''}`}
          >
            <div className="relative">
              {otherParticipant?.photo ? (
                <Avatar className="h-10 w-10">
                  <AvatarImage src={otherParticipant.photo} alt={otherParticipant.name} />
                  <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {getTypeIcon(conversation.type)}
                </div>
              )}
              {otherParticipant?.online && (
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium truncate">
                  {otherParticipant?.name || conversation.subject}
                </span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {conversation.lastMessage &&
                    formatDistanceToNow(new Date(conversation.lastMessage.timestamp), {
                      locale: fr,
                      addSuffix: true,
                    })}
                </span>
              </div>

              {conversation.subject && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conversation.subject}
                </p>
              )}

              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs gap-1">
                  {getTypeIcon(conversation.type)}
                  {getTypeLabel(conversation.type)}
                </Badge>
                {conversation.status && (
                  <Badge className={`text-xs ${getStatusColor(conversation.status)}`}>
                    {conversation.status}
                  </Badge>
                )}
              </div>

              {conversation.lastMessage && (
                <p className={`text-sm truncate mt-1 ${
                  conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}>
                  {conversation.lastMessage.senderId !== 'agency-1' && conversation.unreadCount > 0 && (
                    <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mr-1.5" />
                  )}
                  {conversation.lastMessage.content}
                </p>
              )}
            </div>

            {conversation.unreadCount > 0 && (
              <Badge variant="default" className="shrink-0">
                {conversation.unreadCount}
              </Badge>
            )}
          </button>
        );
      })}

      {conversations.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
          <p>Aucune conversation</p>
        </div>
      )}
    </div>
  );
};

export default ConversationList;
