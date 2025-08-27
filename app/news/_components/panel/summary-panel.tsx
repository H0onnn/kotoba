"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import { useWordSearch, useNewsAnalysis } from "@/app/news/_contexts";
import { type SummarizedContent } from "@/app/news/_types";
import { Button } from "@heroui/button";

interface SummaryPanelProps {
  result: SummarizedContent;
  onSectionClick?: (paragraphIds: number[]) => void;
}

const FILTER_WORDS = ["NHK", "NHK NEWS WEB", "ニュース"]; // 불필요한 키워드 단어

export const SummaryPanel = ({ result, onSectionClick }: SummaryPanelProps) => {
  const { searchKeyword } = useWordSearch();
  const { clearResult, clearError } = useNewsAnalysis();

  const handleKeywordClick = (keyword: string) => {
    searchKeyword(keyword);
  };

  if (!result) {
    return (
      <div className="flex justify-center items-center p-4 h-full text-gray-500">
        요약된 내용이 없어요
      </div>
    );
  }

  return (
    <Card className="h-full rounded-none">
      <CardHeader className="justify-between">
        <h4 className="text-lg font-semibold">AI 요약</h4>

        <Button
          size="sm"
          onClick={() => {
            clearError();
            clearResult();
          }}
        >
          다른 기사 보기
        </Button>
      </CardHeader>
      <CardBody className="overflow-auto flex-1 space-y-4">
        <div>
          <h5 className="mb-2 text-sm font-medium text-gray-600">제목</h5>
          <p className="text-lg font-semibold">{result.title}</p>
        </div>

        <Divider />

        {result.metadata.description && (
          <>
            <h5 className="mb-2 text-sm font-medium text-gray-600">요약</h5>
            <p className="text-sm">{result.metadata.description}</p>
          </>
        )}

        {result.metadata.keywords && result.metadata.keywords.length > 0 && (
          <>
            <Divider />
            <div>
              <h5 className="mb-2 text-sm font-medium text-gray-600">
                키워드 단어
              </h5>
              <div className="flex flex-wrap gap-2">
                {result.metadata.keywords
                  .filter((w) => !FILTER_WORDS.includes(w))
                  .map((keyword, index) => (
                    <Chip
                      key={index}
                      size="sm"
                      variant="flat"
                      className="transition-colors duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => handleKeywordClick(keyword)}
                    >
                      {keyword}
                    </Chip>
                  ))}
              </div>
            </div>
          </>
        )}

        {result.summary && result.summary.title && (
          <>
            <Divider />

            <h5 className="mb-2 text-sm font-medium text-gray-600">AI 요약</h5>

            <div className="p-4 mb-4">
              <h6 className="mb-2 font-medium">{result.summary.title}</h6>
              <p className="text-sm leading-relaxed">
                {result.summary.coreSummary}
              </p>
            </div>

            {result.summary.sections.map((section, index) => (
              <div
                key={index}
                className={`p-4 mb-4 rounded-lg border transition-all duration-200 ${
                  section.relatedParagraphs &&
                  section.relatedParagraphs.length > 0
                    ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-blue-300 border-gray-200"
                    : "border-gray-200"
                }`}
                onClick={() => {
                  if (section.relatedParagraphs && onSectionClick) {
                    const paragraphIds = section.relatedParagraphs.map(
                      (p) => p.id
                    );
                    onSectionClick(paragraphIds);
                  }
                }}
              >
                <h6 className="mb-2 font-medium">{section.title}</h6>
                {section.items && section.items.length > 0 && (
                  <ul className="ml-4 space-y-1 text-sm list-disc">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                )}
                {section.relatedParagraphs &&
                  section.relatedParagraphs.length > 0 && (
                    <div className="mt-2 text-xs text-blue-500">
                      클릭하여 원문에서 관련 부분 확인
                    </div>
                  )}
              </div>
            ))}
          </>
        )}
      </CardBody>
    </Card>
  );
};
