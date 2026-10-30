import { useState } from 'react';
import { getAiAliases, getAiInsights } from '../services/aiService';
import { toast } from 'react-hot-toast';

export interface UseAiFeaturesReturn {
  aiSuggestions: string[];
  generatingAliases: boolean;
  activeInsightsText: string;
  activeInsightsCode: string;
  loadingInsightsId: string | null;
  handleGenerateAiAliases: (originalUrl: string) => Promise<void>;
  handleViewInsights: (id: string, code: string) => Promise<void>;
  closeInsights: () => void;
  clearSuggestions: () => void;
}

export const useAiFeatures = (): UseAiFeaturesReturn => {
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [generatingAliases, setGeneratingAliases] = useState<boolean>(false);
  const [activeInsightsText, setActiveInsightsText] = useState<string>('');
  const [activeInsightsCode, setActiveInsightsCode] = useState<string>('');
  const [loadingInsightsId, setLoadingInsightsId] = useState<string | null>(null);

  const handleGenerateAiAliases = async (originalUrl: string): Promise<void> => {
    if (!originalUrl) {
      toast.error('Please enter a destination URL first');
      return;
    }
    setGeneratingAliases(true);
    setAiSuggestions([]);
    try {
      const responseData = await getAiAliases(originalUrl);
      if (responseData.status === 'success') {
        setAiSuggestions(responseData.data);
        toast.success('AI suggestions loaded!');
      }
    } catch (error: unknown) {
      console.error('AI alias error:', error);
      toast.error('Failed to generate AI alias suggestions');
    } finally {
      setGeneratingAliases(false);
    }
  };

  const handleViewInsights = async (id: string, code: string): Promise<void> => {
    setLoadingInsightsId(id);
    setActiveInsightsText('');
    try {
      const responseData = await getAiInsights(id);
      if (responseData.status === 'success') {
        setActiveInsightsText(responseData.data);
        setActiveInsightsCode(code);
        toast.success('AI insights generated!');
      }
    } catch (error: any) {
      console.error('Insights generation error:', error);
      const errMsg = error.response?.data?.message || 'Failed to generate AI analytics insights';
      toast.error(errMsg);
    } finally {
      setLoadingInsightsId(null);
    }
  };

  const closeInsights = (): void => {
    setActiveInsightsText('');
    setActiveInsightsCode('');
  };

  const clearSuggestions = (): void => {
    setAiSuggestions([]);
  };

  return {
    aiSuggestions,
    generatingAliases,
    activeInsightsText,
    activeInsightsCode,
    loadingInsightsId,
    handleGenerateAiAliases,
    handleViewInsights,
    closeInsights,
    clearSuggestions
  };
};
