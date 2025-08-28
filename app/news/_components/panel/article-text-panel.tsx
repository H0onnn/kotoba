"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { useEffect } from "react";
import { usePanelHighlight } from "@/app/news/_contexts";
import { type SummarizedContent } from "@/app/news/_types";
import { useDeeplTranslate } from "@/app/news/_hooks";
import { LoadingOverlay } from "@/components/fallback";

interface ArticleTextPanelProps {
  content: SummarizedContent | null;
}

export const ArticleTextPanel = ({ content }: ArticleTextPanelProps) => {
  const {
    highlightedParagraphs,
    registerParagraphRef,
    registerContainerRef,
    scrollToHighlighted,
  } = usePanelHighlight();

  const {
    translatedContent,
    isTranslating,
    isTranslationEnabled,
    onTranslationToggle,
  } = useDeeplTranslate();

  useEffect(() => {
    if (highlightedParagraphs.length > 0) {
      scrollToHighlighted();
    }
  }, [highlightedParagraphs, scrollToHighlighted]);

  if (!content) {
    return (
      <div className="flex justify-center items-center p-4 h-full text-gray-500">
        뉴스 기사를 요약하고 원문을 확인하세요
      </div>
    );
  }

  return (
    <LoadingOverlay isLoading={isTranslating} loadingText="번역 중...">
      <Card className="h-full rounded-none">
        <CardHeader className="flex-row justify-between items-center">
          <h3 className="text-lg font-semibold">원문</h3>
          <div className="flex gap-2 items-center">
            <Switch
              size="sm"
              isSelected={isTranslationEnabled}
              onValueChange={() => onTranslationToggle(content)}
              isDisabled={isTranslating}
            />
            <span className="text-sm">
              {isTranslating ? "번역 중..." : "번역"}
            </span>
          </div>
        </CardHeader>

        <CardBody className="overflow-auto flex-1 space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-600">제목</h4>
            <h5 className="text-lg font-semibold leading-relaxed">
              {isTranslationEnabled && translatedContent?.translatedTitle
                ? translatedContent.translatedTitle
                : content.title}
            </h5>
          </div>

          <div ref={registerContainerRef}>
            <h4 className="mb-2 text-sm font-medium text-gray-600">
              원문 내용
            </h4>
            <div className="max-w-none prose prose-sm">
              {content.structuredText && content.structuredText.length > 0 ? (
                <div className="space-y-3">
                  {(isTranslationEnabled &&
                  translatedContent?.translatedStructuredText
                    ? translatedContent.translatedStructuredText
                    : content.structuredText
                  ).map((paragraph) => {
                    const isHighlighted = highlightedParagraphs.includes(
                      paragraph.id
                    );
                    const baseClasses =
                      "text-sm leading-relaxed transition-all duration-200 m-2 py-2 whitespace-pre-line";
                    const highlightClasses = isHighlighted
                      ? "bg-yellow-100 py-2 dark:bg-yellow-600"
                      : "";

                    if (paragraph.type === "heading") {
                      return (
                        <h5
                          key={paragraph.id}
                          ref={(el) => registerParagraphRef(paragraph.id, el)}
                          className={`text-base font-semibold ${baseClasses} ${highlightClasses}`}
                        >
                          {paragraph.text}
                        </h5>
                      );
                    } else if (paragraph.type === "list-item") {
                      return (
                        <li
                          key={paragraph.id}
                          ref={(el) => registerParagraphRef(paragraph.id, el)}
                          className={`ml-4 ${baseClasses} ${highlightClasses}`}
                        >
                          {paragraph.text}
                        </li>
                      );
                    } else {
                      return (
                        <p
                          key={paragraph.id}
                          ref={(el) => registerParagraphRef(paragraph.id, el)}
                          className={`${baseClasses} ${highlightClasses}`}
                        >
                          {paragraph.text}
                        </p>
                      );
                    }
                  })}
                </div>
              ) : content.text ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {isTranslationEnabled && translatedContent?.translatedText
                    ? translatedContent.translatedText
                    : content.text}
                </div>
              ) : (
                <p className="italic text-gray-500">
                  원문 텍스트를 불러올 수 없습니다.
                </p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </LoadingOverlay>
  );
};
