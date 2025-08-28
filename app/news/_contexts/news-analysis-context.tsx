"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { URLParserClient } from "../_utils";
import { type SummarizedContent } from "../_types";

interface NewsAnalysisState {
  url: string;
  result: SummarizedContent | null;
  loading: boolean;
  error: string | null;
  loadingStartTime: number | null;
}

interface NewsAnalysisActions {
  setUrl: (url: string) => void;
  analyzeUrl: () => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

interface NewsAnalysisContextType
  extends NewsAnalysisState,
    NewsAnalysisActions {}

const NewsAnalysisContext = createContext<NewsAnalysisContextType | undefined>(
  undefined
);

interface NewsAnalysisProviderProps {
  children: React.ReactNode;
}

export const NewsAnalysisProvider = ({
  children,
}: NewsAnalysisProviderProps) => {
  const [state, setState] = useState<NewsAnalysisState>({
    url: "",
    result: null,
    loading: false,
    error: null,
    loadingStartTime: null,
  });

  const setUrl = useCallback((url: string) => {
    setState((prev) => ({ ...prev, url }));
  }, []);

  const analyzeUrl = useCallback(async () => {
    if (!state.url.trim()) return;

    setState((prev) => ({ 
      ...prev, 
      loading: true, 
      error: null,
      loadingStartTime: Date.now()
    }));

    try {
      const parsed = await URLParserClient.parseUrlWithSummary(state.url);
      setState((prev) => ({
        ...prev,
        result: parsed,
        url: "",
        loading: false,
        loadingStartTime: null,
      }));
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error:
          err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.",
        loading: false,
        loadingStartTime: null,
      }));
    }
  }, [state.url]);

  const clearResult = useCallback(() => {
    setState((prev) => ({ ...prev, result: null }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const contextValue: NewsAnalysisContextType = {
    ...state,
    setUrl,
    analyzeUrl,
    clearResult,
    clearError,
  };

  return (
    <NewsAnalysisContext.Provider value={contextValue}>
      {children}
    </NewsAnalysisContext.Provider>
  );
};

export const useNewsAnalysis = () => {
  const context = useContext(NewsAnalysisContext);
  if (context === undefined) {
    throw new Error(
      "useNewsAnalysis must be used within a NewsAnalysisProvider"
    );
  }
  return context;
};
