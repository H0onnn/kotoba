"use client";

import { ResizablePanels } from "./resizable-panels";
import { ArticleTextPanel } from "./article-text-panel";
import { SummaryPanel } from "./summary-panel";
import { WordSearchPanel } from "./word-search-panel";
import { usePanelHighlight } from "@/app/news/_contexts";
import { type SummarizedContent } from "@/app/news/_types";

interface ResultPanelProps {
  result: SummarizedContent;
}

export const ResultPanel = ({ result }: ResultPanelProps) => {
  const { highlightParagraphs } = usePanelHighlight();

  return (
    <div className="flex flex-col w-full h-[calc(100dvh-theme(spacing.16))]">
      <div className="flex-1 min-h-0">
        <ResizablePanels>
          <ArticleTextPanel content={result} />
          <SummaryPanel result={result} onSectionClick={highlightParagraphs} />
          <WordSearchPanel />
        </ResizablePanels>
      </div>
    </div>
  );
};
