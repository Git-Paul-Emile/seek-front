// Composant de fenêtre de chat
import React, { useState, useRef, useEffect } from 'react';
import { Conversation, Message } from '@/services/communication.service';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Send, Paperclip, MoreVertical, Phone, Video, Search } from 'lucide-react';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (content: string) => Promise<void>;
  onSendSupportRequest: (content: string, priority: string) => Promise<void>;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  onSendMessage,
  onSendSupportRequest,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [priority, setPriority] = useState<string>('normal');
  const scrollRef = useRef<HTMLDivElement>(null);

  const otherParticipant = conversation.participants.find((p) => p.role !== 'agency');
  const agencyParticipant = conversation.participants.find((p) => p.role === 'agency');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    if (conversation.type === 'support') {
      await onSendSupportRequest(newMessage, priority);
    } else {
      await onSendMessage(newMessage);
    }
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getPriorityBadge = (msg: Message) => {
    if (msg.priority) {
      const colors: Record<string, string> = {
        low: 'bg-gray-100 text-gray-800',
        normal: 'bg-blue-100 text-blue-800',
        high: 'bg-orange-100 text-orange-800',
        urgent: 'bg-red-100 text-red-800',
      };
      return (
        <Badge className={`text-xs ml-2 ${colors[msg.priority]}`}>
          {msg.priority}
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          {otherParticipant?.photo ? (
            <Avatar>
              <AvatarImage src={otherParticipant.photo} alt={otherParticipant.name} />
              <AvatarFallback>{otherParticipant.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold">{otherParticipant?.name.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 className="font-medium">{otherParticipant?.name || conversation.subject}</h3>
            <p className="text-xs text-muted-foreground">
              {otherParticipant?.online !== undefined ? (
                otherParticipant.online ? (
                  <span className="text-green-600">En ligne</span>
                ) : (
                  <span>Hors ligne</span>
                )
              ) : (
                'Support Seek'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {conversation.status && (
            <Badge
              className={
                conversation.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : conversation.status === 'resolved'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }
            >
              {conversation.status}
            </Badge>
          )}
          <Button variant="ghost" size="icon">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        <div className="space-y-4">
          {conversation.subject && (
            <div className="flex justify-center">
              <Badge variant="outline" className="text-sm">
                {conversation.subject}
              </Badge>
            </div>
          )}

          {messages.map((msg, index) => {
            const isAgency = msg.senderRole === 'agency';
            const showAvatar =
              index === 0 || messages[index - 1]?.senderId !== msg.senderId;

            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isAgency ? 'flex-row-reverse' : ''}`}
              >
                {showAvatar ? (
                  <Avatar className="h-8 w-8 mt-1">
                    {msg.senderPhoto ? (
                      <AvatarImage src={msg.senderPhoto} alt={msg.senderName} />
                    ) : (
                      <AvatarFallback>{msg.senderName.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 mt-1" />
                )}

                <div className={`max-w-[70%] ${isAgency ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{msg.senderName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.timestamp), { locale: fr, addSuffix: true })}
                    </span>
                    {getPriorityBadge(msg)}
                  </div>

                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isAgency
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    } ${msg.type === 'support_request' ? 'border-l-4 border-orange-500' : ''} ${
                      msg.type === 'support_response' ? 'border-l-4 border-green-500' : ''
                    }`}
                  >
                    {msg.type === 'support_request' && (
                      <div className="text-xs text-orange-600 mb-1 font-medium">
                        Demande de support
                      </div>
                    )}
                    {msg.type === 'support_response' && (
                      <div className="text-xs text-green-600 mb-1 font-medium">
                        Réponse du support
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  </div>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.attachments.map((attachment) => (
                        <a
                          key={attachment.id}
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <Paperclip className="h-3 w-3" />
                          {attachment.name}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4 bg-background">
        {conversation.type === 'support' && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-muted-foreground">Priorité:</span>
            <div className="flex gap-1">
              {['low', 'normal', 'high', 'urgent'].map((p) => (
                <Button
                  key={p}
                  variant={priority === p ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setPriority(p)}
                  className="text-xs"
                >
                  {p}
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-end gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="min-h-[44px] max-h-32 resize-none"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
