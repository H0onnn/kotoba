"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { URLParserClient } from "../_utils";
import {
  type SummarizedContent,
  SummarySection,
  StructuredParagraph,
} from "../_types";

interface CommonState {
  url: string;
  error: string | null;
}

interface UrlParseState {
  isParsing: boolean;
  parsingProgress: number;
  parsingMessage: string;
  streamingTitle: string;
  streamingMetadata: any;
  streamingParagraphs: StructuredParagraph[];
  parseError: string | null;
}

interface SummaryState {
  result: SummarizedContent | null;
  isStreaming: boolean;
  streamingSections: SummarySection[];
  streamingCoreSummary: string;
  summaryError: string | null;
}

interface NewsAnalysisActions {
  setUrl: (url: string) => void;
  startUrlParsing: () => Promise<void>;
  startNewsSummary: () => Promise<void>;
  analyzeWithParsing: () => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
  clearParseError: () => void;
  clearSummaryError: () => void;
}

interface NewsAnalysisContextType
  extends CommonState,
    UrlParseState,
    SummaryState,
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
  const [commonState, setCommonState] = useState<CommonState>({
    url: "",
    error: null,
  });

  const [parseState, setParseState] = useState<UrlParseState>({
    isParsing: false,
    parsingProgress: 0,
    parsingMessage: "",
    streamingTitle: "",
    streamingMetadata: null,
    streamingParagraphs: [],
    parseError: null,
  });

  const [summaryState, setSummaryState] = useState<SummaryState>({
    result: null,
    isStreaming: false,
    streamingSections: [],
    streamingCoreSummary: "",
    summaryError: null,
  });

  const setUrl = (url: string) => {
    setCommonState((prev) => ({ ...prev, url }));
  };

  const startUrlParsing = useCallback(async () => {
    if (!commonState.url.trim()) return;

    setParseState((prev) => ({
      ...prev,
      isParsing: true,
      parseError: null,
      parsingProgress: 0,
      parsingMessage: "파싱 시작...",
      streamingTitle: "",
      streamingMetadata: null,
      streamingParagraphs: [],
    }));

    try {
      for await (const chunk of URLParserClient.parseUrlStream(
        commonState.url
      )) {
        if (chunk.type === "error") {
          setParseState((prev) => ({
            ...prev,
            parseError: chunk.error || "알 수 없는 오류가 발생했습니다.",
            isParsing: false,
          }));
          return;
        }

        if (chunk.type === "html") {
          setParseState((prev) => ({
            ...prev,
            parsingMessage: chunk.data?.message || "파싱 중...",
            parsingProgress: chunk.progress || prev.parsingProgress,
          }));
        } else if (chunk.type === "metadata") {
          setParseState((prev) => ({
            ...prev,
            streamingTitle: chunk.data?.title || "",
            streamingMetadata: chunk.data?.metadata || null,
            parsingProgress: chunk.progress || prev.parsingProgress,
          }));
        } else if (chunk.type === "paragraphs") {
          setParseState((prev) => ({
            ...prev,
            streamingParagraphs: [...prev.streamingParagraphs, ...chunk.data],
            parsingProgress: chunk.progress || prev.parsingProgress,
          }));
        } else if (chunk.type === "complete") {
          setParseState((prev) => ({
            ...prev,
            isParsing: false,
            parsingProgress: 100,
            parsingMessage: "파싱 완료",
          }));
          return;
        }
      }

      // 스트림이 complete 없이 끝났을 경우 강제 완료
      setParseState((prev) => ({
        ...prev,
        isParsing: false,
        parsingProgress: 100,
        parsingMessage: "파싱 완료",
      }));
    } catch (err) {
      setParseState((prev) => ({
        ...prev,
        parseError:
          err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.",
        isParsing: false,
      }));
    }
  }, [commonState.url]);

  const startNewsSummary = useCallback(async () => {
    if (!commonState.url.trim()) return;

    setSummaryState((prev) => ({
      ...prev,
      isStreaming: true,
      summaryError: null,
      streamingSections: [],
      streamingCoreSummary: "",
    }));

    try {
      for await (const chunk of URLParserClient.parseUrlWithSummaryStream(
        commonState.url
      )) {
        if (chunk.type === "error") {
          setSummaryState((prev) => ({
            ...prev,
            summaryError: chunk.error || "알 수 없는 오류가 발생했습니다.",
            isStreaming: false,
          }));
          return;
        }

        if (chunk.type === "sections") {
          setSummaryState((prev) => ({
            ...prev,
            streamingSections: [...prev.streamingSections, ...chunk.data],
          }));
        } else if (chunk.type === "coreSummary") {
          setSummaryState((prev) => ({
            ...prev,
            streamingCoreSummary: prev.streamingCoreSummary + chunk.data,
          }));
        } else if (chunk.type === "complete") {
          setSummaryState((prev) => ({
            ...prev,
            result: chunk.data,
            isStreaming: false,
          }));
          setCommonState((prev) => ({ ...prev, url: "" }));
        }
      }
    } catch (err) {
      setSummaryState((prev) => ({
        ...prev,
        summaryError:
          err instanceof Error ? err.message : "네트워크 오류가 발생했습니다.",
        isStreaming: false,
      }));
    }
  }, [commonState.url]);

  const analyzeWithParsing = async () => {
    if (!commonState.url.trim()) return;

    const urlParsePromise = startUrlParsing();
    const newsAnalyzePromise = startNewsSummary();

    Promise.allSettled([urlParsePromise, newsAnalyzePromise]);
  };

  const clearResult = () => {
    setSummaryState({
      result: null,
      isStreaming: false,
      streamingSections: [],
      streamingCoreSummary: "",
      summaryError: null,
    });

    setParseState({
      isParsing: false,
      parsingProgress: 0,
      parsingMessage: "",
      streamingTitle: "",
      streamingMetadata: null,
      streamingParagraphs: [],
      parseError: null,
    });
  };

  const clearError = () => {
    setCommonState((prev) => ({ ...prev, error: null }));
  };

  const clearParseError = () => {
    setParseState((prev) => ({ ...prev, parseError: null }));
  };

  const clearSummaryError = () => {
    setSummaryState((prev) => ({ ...prev, summaryError: null }));
  };

  const contextValue: NewsAnalysisContextType = {
    ...commonState,
    ...parseState,
    ...summaryState,
    setUrl,
    startUrlParsing,
    startNewsSummary,
    analyzeWithParsing,
    clearResult,
    clearError,
    clearParseError,
    clearSummaryError,
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
