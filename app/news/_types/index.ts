import { type ParsedContent } from "../_utils/nhk-html-parser";

export interface StructuredParagraph {
  id: number;
  text: string;
  type: "paragraph" | "heading" | "list-item";
  preview: string; // 첫 50글자 (매칭 정확도 높이기 위함)
}

export interface Summary {
  title: string;
  coreSummary: string;
  sections: SummarySection[];
}

export interface SummarySection {
  title: string;
  items?: string[];
  relatedParagraphs?: Array<{
    id: number;
    preview: string;
  }>;
}

export interface SummarizedContent extends ParsedContent {
  summary?: Summary;
}
