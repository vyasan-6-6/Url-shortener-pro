import { useState } from 'react';
import { getUrlStats } from '../services/urlService';
import { toast } from 'react-hot-toast';
import type { UrlStatsResponseData } from '../types';

export interface UseAnalyticsReturn {
  activeStatsData: UrlStatsResponseData | null;
  activeStatsCode: string;
  loadingStatsId: string | null;
  handleViewStats: (id: string, code: string) => Promise<void>;
  closeStats: () => void;
}

export const useAnalytics = (): UseAnalyticsReturn => {
  const [activeStatsData, setActiveStatsData] = useState<UrlStatsResponseData | null>(null);
  const [activeStatsCode, setActiveStatsCode] = useState<string>('');
  const [loadingStatsId, setLoadingStatsId] = useState<string | null>(null);

  const handleViewStats = async (id: string, code: string): Promise<void> => {
    setLoadingStatsId(id);
    setActiveStatsData(null);
    try {
      const responseData = await getUrlStats(code);
      if (responseData.status === 'success') {
        setActiveStatsData(responseData.data);
        setActiveStatsCode(code);
      }
    } catch (error) {
      console.error('Stats loading error:', error);
      toast.error('Failed to load traffic analytics statistics');
    } finally {
      setLoadingStatsId(null);
    }
  };

  const closeStats = (): void => {
    setActiveStatsData(null);
    setActiveStatsCode('');
  };

  return {
    activeStatsData,
    activeStatsCode,
    loadingStatsId,
    handleViewStats,
    closeStats
  };
};
