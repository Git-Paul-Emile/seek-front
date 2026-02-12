import { SignatureType, SignatureInfo } from '@/types/lease-contract';

export function generateSignatureInfo(signatureData: string, type: SignatureType): SignatureInfo {
  return {
    signedAt: new Date().toISOString(),
    signatureType: type,
    signatureData: signatureData,
    ipAddress: 'collected',
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
  };
}
