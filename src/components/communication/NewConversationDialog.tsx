// Composant de dialogue pour nouvelle conversation
import React, { useState } from 'react';
import { Conversation } from '@/services/communication.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Building2, Users, Headphones } from 'lucide-react';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    type: 'tenant' | 'owner' | 'internal' | 'support',
    participantId: string,
    participantName: string,
    participantRole: string,
    message: string,
    subject?: string
  ) => Promise<void>;
}

const NewConversationDialog: React.FC<NewConversationDialogProps> = ({
  open,
  onOpenChange,
  onCreate,
}) => {
  const [type, setType] = useState<'tenant' | 'owner' | 'internal' | 'support'>('tenant');
  const [participantName, setParticipantName] = useState('');
  const [participantId, setParticipantId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantName.trim() || !message.trim()) return;

    setIsLoading(true);
    try {
      await onCreate(
        type,
        participantId || `temp-${Date.now()}`,
        participantName,
        type === 'tenant' ? 'tenant' : type === 'owner' ? 'owner' : type === 'internal' ? 'agency' : 'support',
        message,
        subject || undefined
      );
      // Reset form
      setParticipantName('');
      setParticipantId('');
      setSubject('');
      setMessage('');
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (t: string) => {
    switch (t) {
      case 'tenant':
        return <User className="h-4 w-4" />;
      case 'owner':
        return <Building2 className="h-4 w-4" />;
      case 'internal':
        return <Users className="h-4 w-4" />;
      case 'support':
        return <Headphones className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeLabel = (t: string) => {
    switch (t) {
      case 'tenant':
        return 'Locataire';
      case 'owner':
        return 'Propriétaire';
      case 'internal':
        return 'Équipe interne';
      case 'support':
        return 'Support Seek';
      default:
        return t;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Nouvelle conversation</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type de conversation</Label>
              <Select
                value={type}
                onValueChange={(value: 'tenant' | 'owner' | 'internal' | 'support') => setType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Locataire
                    </div>
                  </SelectItem>
                  <SelectItem value="owner">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Propriétaire
                    </div>
                  </SelectItem>
                  <SelectItem value="internal">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Équipe interne
                    </div>
                  </SelectItem>
                  <SelectItem value="support">
                    <div className="flex items-center gap-2">
                      <Headphones className="h-4 w-4" />
                      Support Seek
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {type !== 'support' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="participantName">
                    {type === 'tenant' ? 'Nom du locataire' : 'Nom du propriétaire'}
                  </Label>
                  <Input
                    id="participantName"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder={
                      type === 'tenant'
                        ? 'Ex: Marie Dupont'
                        : 'Ex: Jean Martin'
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participantId">ID du participant (optionnel)</Label>
                  <Input
                    id="participantId"
                    value={participantId}
                    onChange={(e) => setParticipantId(e.target.value)}
                    placeholder="ID dans le système"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="subject">Sujet (optionnel)</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Sujet de la conversation"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message initial</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tapez votre message..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={!participantName.trim() || !message.trim() || isLoading}>
              {isLoading ? 'Création...' : 'Créer la conversation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewConversationDialog;
