"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Switch } from "@heroui/switch";
import { useState, useEffect } from "react";
import { usePanelHighlight } from "@/app/news/_contexts";
import { type SummarizedContent } from "@/app/news/_types";

interface ArticleTextPanelProps {
  content: SummarizedContent | null;
}

export const ArticleTextPanel = ({ content }: ArticleTextPanelProps) => {
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const {
    highlightedParagraphs,
    registerParagraphRef,
    registerContainerRef,
    scrollToHighlighted,
  } = usePanelHighlight();

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
    <Card className="h-full rounded-none">
      <CardHeader className="flex-row justify-between items-center">
        <h3 className="text-lg font-semibold">원문</h3>
        <div className="flex gap-2 items-center">
          <Switch
            size="sm"
            isSelected={isTranslationEnabled}
            onValueChange={setIsTranslationEnabled}
          />
          <span className="text-sm">번역</span>
        </div>
      </CardHeader>

      <CardBody className="overflow-auto flex-1 space-y-4">
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-600">제목</h4>
          <h5 className="text-lg font-semibold leading-relaxed">
            {content.title}
          </h5>
        </div>

        <div ref={registerContainerRef}>
          <h4 className="mb-2 text-sm font-medium text-gray-600">원문 내용</h4>
          <div className="max-w-none prose prose-sm">
            {content.structuredText && content.structuredText.length > 0 ? (
              <div className="space-y-3">
                {isTranslationEnabled && (
                  <div className="mb-4 italic text-gray-500">
                    번역 기능은 추후 구현 예정입니다.
                  </div>
                )}
                {content.structuredText.map((paragraph) => {
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
                {isTranslationEnabled ? (
                  <div className="italic text-gray-500">
                    번역 기능은 추후 구현 예정입니다.
                    <br />
                    <br />
                    {content.text}
                  </div>
                ) : (
                  content.text
                )}
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
  );
};
