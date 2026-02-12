import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ReceiptTemplate } from '@/types/receipt';
import { receiptTemplateService } from '@/services/receipt-template.service';
import { useToast } from '@/hooks/use-toast';
import { Save, Copy, Trash2, Eye, Settings } from 'lucide-react';

interface ReceiptTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateId?: string;
  onSave: (template: ReceiptTemplate) => void;
}

export function ReceiptTemplateDialog({ open, onOpenChange, templateId, onSave }: ReceiptTemplateDialogProps) {
  const { toast } = useToast();
  const [template, setTemplate] = useState<Partial<ReceiptTemplate>>({
    name: '',
    agencyName: '',
    agencyAddress: '',
    agencyPhone: '',
    agencyEmail: '',
    headerColor: '#2563eb',
    footerText: 'Cette quittance atteste la réception du montant indiqué ci-dessus.',
    showSignature: true,
    showWatermark: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadTemplate = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const existing = await receiptTemplateService.getTemplateById(id);
      if (existing) {
        setTemplate(existing);
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de charger le modèle', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const loadDefault = useCallback(async () => {
    setIsLoading(true);
    try {
      const defaultTpl = await receiptTemplateService.getDefaultTemplate();
      setTemplate(defaultTpl);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open && templateId) {
      loadTemplate(templateId);
    } else if (open && !templateId) {
      loadDefault();
    }
  }, [open, templateId, loadTemplate, loadDefault]);

  const handleSave = async () => {
    if (!template.name || !template.agencyName) {
      toast({ title: 'Erreur', description: 'Veuillez remplir les champs obligatoires', variant: 'destructive' });
      return;
    }

    try {
      let saved: ReceiptTemplate;
      if (templateId && templateId !== 'default') {
        saved = await receiptTemplateService.updateTemplate(templateId, template) as ReceiptTemplate;
      } else {
        saved = await receiptTemplateService.createTemplate(template as Omit<ReceiptTemplate, 'id' | 'createdAt' | 'updatedAt'>);
      }
      toast({ title: 'Succès', description: 'Modèle enregistré avec succès' });
      onSave(saved);
      onOpenChange(false);
    } catch {
      toast({ title: 'Erreur', description: 'Impossible d\'enregistrer le modèle', variant: 'destructive' });
    }
  };

  const handleDuplicate = async () => {
    if (!templateId) return;
    try {
      const duplicated = await receiptTemplateService.duplicateTemplate(templateId, `${template.name} (copie)`);
      if (duplicated) {
        toast({ title: 'Succès', description: 'Modèle dupliqué avec succès' });
        onSave(duplicated);
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de dupliquer le modèle', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!templateId || templateId === 'default') return;
    try {
      const success = await receiptTemplateService.deleteTemplate(templateId);
      if (success) {
        toast({ title: 'Succès', description: 'Modèle supprimé avec succès' });
        onOpenChange(false);
      }
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de supprimer le modèle', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {templateId === 'default' ? 'Modifier le modèle par défaut' : templateId ? 'Modifier le modèle' : 'Nouveau modèle de quittance'}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nom du modèle *</Label>
                <Input
                  value={template.name || ''}
                  onChange={(e) => setTemplate({ ...template, name: e.target.value })}
                  placeholder="Nom du modèle"
                />
              </div>
              <div>
                <Label>Nom de l'agence *</Label>
                <Input
                  value={template.agencyName || ''}
                  onChange={(e) => setTemplate({ ...template, agencyName: e.target.value })}
                  placeholder="Nom de l'agence"
                />
              </div>
              <div>
                <Label>Email de l'agence</Label>
                <Input
                  type="email"
                  value={template.agencyEmail || ''}
                  onChange={(e) => setTemplate({ ...template, agencyEmail: e.target.value })}
                  placeholder="email@agence.com"
                />
              </div>
              <div>
                <Label>Téléphone de l'agence</Label>
                <Input
                  value={template.agencyPhone || ''}
                  onChange={(e) => setTemplate({ ...template, agencyPhone: e.target.value })}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div className="col-span-2">
                <Label>Adresse de l'agence</Label>
                <Input
                  value={template.agencyAddress || ''}
                  onChange={(e) => setTemplate({ ...template, agencyAddress: e.target.value })}
                  placeholder="Adresse complète"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Couleur d'en-tête</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={template.headerColor || '#2563eb'}
                    onChange={(e) => setTemplate({ ...template, headerColor: e.target.value })}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={template.headerColor || '#2563eb'}
                    onChange={(e) => setTemplate({ ...template, headerColor: e.target.value })}
                    placeholder="#2563eb"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Afficher les signatures</Label>
                  <Switch
                    checked={template.showSignature || false}
                    onCheckedChange={(checked) => setTemplate({ ...template, showSignature: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Filigrane "QUITTANCE"</Label>
                  <Switch
                    checked={template.showWatermark || false}
                    onCheckedChange={(checked) => setTemplate({ ...template, showWatermark: checked })}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4 mt-4">
            <div>
              <Label>Texte de pied de page</Label>
              <Textarea
                value={template.footerText || ''}
                onChange={(e) => setTemplate({ ...template, footerText: e.target.value })}
                placeholder="Texte affiché en bas de chaque quittance"
                rows={3}
              />
            </div>
            <div>
              <Label>Conditions particulières</Label>
              <Textarea
                value={template.customTerms || ''}
                onChange={(e) => setTemplate({ ...template, customTerms: e.target.value })}
                placeholder="Conditions particulières à afficher (optionnel)"
                rows={4}
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center mt-6">
          <div className="flex gap-2">
            {templateId && templateId !== 'default' && (
              <>
                <Button variant="outline" onClick={handleDuplicate}>
                  <Copy className="mr-2 h-4 w-4" />
                  Dupliquer
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Preview component
export function ReceiptTemplatePreview({ template }: { template: Partial<ReceiptTemplate> }) {
  const previewReceipt = {
    receiptNumber: 'Q-202501-ABC123',
    propertyName: 'Villa Les Palmiers',
    roomName: 'Chambre 3',
    ownerName: 'M. Diop',
    tenantName: 'M. Sall',
    tenantEmail: 'sall@email.com',
    tenantPhone: '+221 77 123 45 67',
    amount: 150000,
    totalAmount: 150000,
    paymentDate: new Date(),
    paymentMethod: 'bank_transfer',
    periodStart: new Date(2025, 0, 1),
    periodEnd: new Date(2025, 0, 31),
    status: 'paid' as const,
    isColocation: false,
  };

  const html = receiptTemplateService.applyTemplateToHtml(previewReceipt, template as ReceiptTemplate);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm">Aperçu</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          className="border rounded p-4 bg-white overflow-auto"
          style={{ maxHeight: '500px' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </CardContent>
    </Card>
  );
}
