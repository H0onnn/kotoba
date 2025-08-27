"use client";

import { subtitle } from "@/components/primitives";
import {
  NewsAnalysisProvider,
  PanelHighlightProvider,
  WordSearchProvider,
  useNewsAnalysis,
} from "../_contexts";
import { URLParserForm } from "./parser-form";
import { ResultPanel } from "./panel";

const NewsContent = () => {
  const { url, setUrl, analyzeUrl, loading, result, error } = useNewsAnalysis();

  if (result) {
    return (
      <PanelHighlightProvider>
        <WordSearchProvider>
          <ResultPanel result={result} />
        </WordSearchProvider>
      </PanelHighlightProvider>
    );
  }

  return (
    <section className="container flex flex-col flex-grow gap-4 justify-center items-center px-6 py-8 mx-auto max-w-7xl md:pt-16 md:py-10">
      <div className="inline-block justify-center max-w-xl text-center">
        <span className={subtitle()}>
          NHK 뉴스 기사를 AI가 알기 쉽게 요약해드려요
        </span>
      </div>

      <div className="mt-8 w-full max-w-2xl">
        <div className="flex flex-col gap-8 items-center w-full">
          <URLParserForm
            url={url}
            onUrlChange={(url) => setUrl(url)}
            onAnalyze={analyzeUrl}
            isLoading={loading}
            error={error}
          />

          {error && <div className="p-4 text-center text-red-500">{error}</div>}
        </div>
      </div>
    </section>
  );
};

export const NewsAnalyzeSection = () => {
  return (
    <NewsAnalysisProvider>
      <NewsContent />
    </NewsAnalysisProvider>
  );
};
