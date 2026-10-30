import { useState } from 'react';
import { getQrCode } from '../services/urlService';
import { toast } from 'react-hot-toast';

export interface UseQrCodeReturn {
  activeQrUrl: string | null;
  activeQrCode: string;
  loadingQrId: string | null;
  handleViewQr: (id: string, code: string) => Promise<void>;
  closeQr: () => void;
}

export const useQrCode = (): UseQrCodeReturn => {
  const [activeQrUrl, setActiveQrUrl] = useState<string | null>(null);
  const [activeQrCode, setActiveQrCode] = useState<string>('');
  const [loadingQrId, setLoadingQrId] = useState<string | null>(null);

  const handleViewQr = async (id: string, _code: string): Promise<void> => {
    setLoadingQrId(id);
    try {
      const responseData = await getQrCode(id);
      if (responseData.status === 'success') {
        setActiveQrUrl(responseData.data.qrCodeDataUrl);
        setActiveQrCode(responseData.data.shortUrl);
      }
    } catch (error) {
      console.error('QR Code Generation Error:', error);
      toast.error('Failed to generate QR Code');
    } finally {
      setLoadingQrId(null);
    }
  };

  const closeQr = (): void => {
    setActiveQrUrl(null);
    setActiveQrCode('');
  };

  return {
    activeQrUrl,
    activeQrCode,
    loadingQrId,
    handleViewQr,
    closeQr
  };
};
