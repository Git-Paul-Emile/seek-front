import { useRef, useState, useEffect } from 'react';
import { SignatureType, SignatureInfo } from '@/types/lease-contract';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { PenTool, Eraser, Save, X } from 'lucide-react';

interface ElectronicSignatureProps {
  signerName: string;
  signerRole: string;
  onSign: (signatureData: string) => void;
  onCancel: () => void;
  disabled?: boolean;
}

export function ElectronicSignature({
  signerName,
  signerRole,
  onSign,
  onCancel,
  disabled = false,
}: ElectronicSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureType, setSignatureType] = useState<SignatureType>('electronique');
  const [typedName, setTypedName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    // Set drawing styles
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const getSignatureData = (): string => {
    if (signatureType === 'electronique') {
      // Return canvas data as base64
      const canvas = canvasRef.current;
      if (!canvas || !hasSignature) return '';
      return canvas.toDataURL('image/png');
    } else if (signatureType === 'physique') {
      // Return typed name as signature
      return typedName;
    }
    return '';
  };

  const handleSign = () => {
    if (signatureType === 'electronique' && !hasSignature) {
      toast({
        title: 'Signature requise',
        description: 'Veuillez signer dans la zone prévue à cet effet.',
        variant: 'destructive',
      });
      return;
    }

    if (signatureType === 'physique' && !typedName.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez saisir votre nom pour signer.',
        variant: 'destructive',
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: 'Conditions non acceptées',
        description: 'Vous devez accepter les conditions générales de signature.',
        variant: 'destructive',
      });
      return;
    }

    const signatureData = getSignatureData();
    onSign(signatureData);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          Signature Électronique
        </CardTitle>
        <CardDescription>
          {signerName} ({signerRole})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Signature Type Selection */}
        <div className="space-y-2">
          <Label>Type de signature</Label>
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="electronic"
                name="signatureType"
                checked={signatureType === 'electronique'}
                onChange={() => setSignatureType('electronique')}
                disabled={disabled}
              />
              <Label htmlFor="electronic" className="cursor-pointer">
                Signature manuscrite
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="typed"
                name="signatureType"
                checked={signatureType === 'physique'}
                onChange={() => setSignatureType('physique')}
                disabled={disabled}
              />
              <Label htmlFor="typed" className="cursor-pointer">
                Nom tapé
              </Label>
            </div>
          </div>
        </div>

        {/* Signature Canvas */}
        {signatureType === 'electronique' && (
          <div className="space-y-2">
            <Label>Zone de signature</Label>
            <div className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-40 bg-white touch-none cursor-crosshair"
                style={{ width: '100%', height: '160px' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousedown', {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                  startDrawing(mouseEvent as unknown as React.MouseEvent<HTMLCanvasElement>);
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0];
                  const mouseEvent = new MouseEvent('mousemove', {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                  });
                  draw(mouseEvent as unknown as React.MouseEvent<HTMLCanvasElement>);
                }}
                onTouchEnd={stopDrawing}
              />
              {!hasSignature && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="text-muted-foreground text-sm">
                    Signez ici
                  </p>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={disabled || !hasSignature}
            >
              <Eraser className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          </div>
        )}

        {/* Typed Signature */}
        {signatureType === 'physique' && (
          <div className="space-y-2">
            <Label htmlFor="typedSignature">Votre nom</Label>
            <Input
              id="typedSignature"
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              placeholder="Tapez votre nom"
              disabled={disabled}
            />
            <div className="border rounded-md p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground">Aperçu:</p>
              <p className="font-serif text-lg italic">{typedName || '...'}</p>
            </div>
          </div>
        )}

        {/* Terms Agreement */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="terms"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
            disabled={disabled}
          />
          <Label htmlFor="terms" className="text-sm">
            J'accepte que ma signature électronique a la même valeur juridique qu'une
            signature manuscrite conformément à la législation en vigueur.
          </Label>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-muted-foreground">
          <p>Date: {new Date().toLocaleString('fr-FR')}</p>
          <p>IP: {typeof window !== 'undefined' ? 'Collectée pour traçabilité' : 'N/A'}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={disabled}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSign}
            disabled={disabled || !agreedToTerms}
            className="flex-1"
          >
            <Save className="h-4 w-4 mr-2" />
            Signer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
