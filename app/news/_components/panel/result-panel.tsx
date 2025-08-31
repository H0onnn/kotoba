import { ResizablePanels } from "./resizable-panels";
import { ArticleTextPanel } from "./article-text-panel";
import { SummaryPanel } from "./summary-panel";
import { WordSearchPanel } from "./word-search-panel";

export const ResultPanel = () => {
  return (
    <div className="flex flex-col w-full h-[calc(100dvh-theme(spacing.16))]">
      <div className="flex-1 min-h-0">
        <ResizablePanels>
          <ArticleTextPanel />
          <SummaryPanel />
          <WordSearchPanel />
        </ResizablePanels>
      </div>
    </div>
  );
};
