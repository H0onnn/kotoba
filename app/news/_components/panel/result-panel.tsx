"use client";

import { useState, useRef } from "react";
import { ResizablePanels } from "./resizable-panels";
import {
  ArticleTextPanel,
  type ArticleTextPanelRef,
} from "./article-text-panel";
import { SummaryPanel } from "./summary-panel";
import { WordSearchPanel } from "./word-search-panel";
import { type SummarizedContent } from "@/app/news/_types";

interface ResultPanelProps {
  result: SummarizedContent;
}

export const ResultPanel = ({ result }: ResultPanelProps) => {
  const [highlightedParagraphs, setHighlightedParagraphs] = useState<number[]>(
    []
  );
  const articleTextPanelRef = useRef<ArticleTextPanelRef>(null);

  const handleSectionClick = (paragraphIds: number[]) => {
    setHighlightedParagraphs(paragraphIds);
  };

  return (
    <div className="flex flex-col w-full h-[calc(100dvh-theme(spacing.16))]">
      <div className="flex-1 min-h-0">
        <ResizablePanels>
          <ArticleTextPanel
            ref={articleTextPanelRef}
            content={result}
            highlightedParagraphs={highlightedParagraphs}
          />
          <SummaryPanel result={result} onSectionClick={handleSectionClick} />
          <WordSearchPanel />
        </ResizablePanels>
      </div>
    </div>
  );
};
