"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Chip } from "@heroui/chip";
import {
  useWordSearch,
  useNewsAnalysis,
  usePanelHighlight,
} from "@/app/news/_contexts";
import { Button } from "@heroui/button";
import { motion, AnimatePresence } from "framer-motion";
import { LoadingOverlay } from "@/components/fallback";
import { Spinner } from "@heroui/spinner";

const FILTER_WORDS = ["NHK", "NHK NEWS WEB", "ニュース"]; // 불필요한 키워드 단어

export const SummaryPanel = () => {
  const { highlightParagraphs } = usePanelHighlight();
  const { searchKeyword } = useWordSearch();
  const {
    result,
    clearResult,
    clearSummaryError,
    isStreaming,
    streamingSections,
    streamingCoreSummary,
    summaryError,
  } = useNewsAnalysis();

  const allSections = isStreaming
    ? streamingSections
    : result?.summary?.sections || [];

  const coreSummary = isStreaming
    ? streamingCoreSummary
    : result?.summary?.coreSummary || "";

  const handleKeywordClick = (keyword: string) => {
    searchKeyword(keyword);
  };

  if (!result && !isStreaming) {
    if (summaryError) {
      return (
        <div className="flex flex-col justify-center items-center p-4 h-full text-red-500">
          <p className="mb-2">요약을 생성하는 중 오류가 발생했습니다</p>
          <p className="text-sm text-gray-600">{summaryError}</p>
        </div>
      );
    }
    return (
      <div className="flex justify-center items-center p-4 h-full text-gray-500">
        요약된 내용이 없어요
      </div>
    );
  }

  return (
    <LoadingOverlay
      isLoading={streamingSections.length === 0}
      loadingText="AI가 기사를 요약 중이에요..."
    >
      <Card className="h-full rounded-none">
        <CardHeader className="justify-between">
          <h4 className="text-lg font-semibold">AI 요약</h4>

          <Button
            size="sm"
            onClick={() => {
              clearSummaryError();
              clearResult();
            }}
          >
            다른 기사 보기
          </Button>
        </CardHeader>

        <CardBody className="overflow-auto flex-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h5 className="mb-2 text-sm font-medium text-gray-600">제목</h5>
            <p className="text-lg font-semibold">
              {isStreaming && !result?.title ? (
                <span className="text-gray-400 animate-pulse">
                  제목을 불러오는 중...
                </span>
              ) : (
                result?.title || "제목 없음"
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Divider />
            <h5 className="my-2 text-sm font-medium text-gray-600">요약</h5>
            <p className="text-sm">
              {isStreaming && !result?.metadata.description ? (
                <span className="text-gray-400 animate-pulse">
                  요약 정보 불러오는 중...
                </span>
              ) : (
                result?.metadata.description || "요약 내용 없음"
              )}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Divider />
            <div>
              <h5 className="my-2 text-sm font-medium text-gray-600">
                키워드 단어
              </h5>
              {isStreaming && !result?.metadata.keywords ? (
                <span className="text-gray-400 animate-pulse">
                  키워드 불러오는 중...
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {result?.metadata.keywords
                    ?.filter((w) => !FILTER_WORDS.includes(w))
                    .map((keyword, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <Chip
                          size="sm"
                          variant="flat"
                          className="transition-colors duration-200 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                          onClick={() => handleKeywordClick(keyword)}
                        >
                          {keyword}
                        </Chip>
                      </motion.div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>

          {((result?.summary && result.summary.title) || isStreaming) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Divider />

              <h5 className="mt-2 text-sm font-medium text-gray-600">
                AI 요약
              </h5>

              {(result?.summary?.title || coreSummary) && (
                <motion.div
                  className="p-4 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                >
                  <h6 className="mb-2 font-medium">
                    {result?.summary?.title || "핵심 요약"}
                  </h6>
                  <p className="text-sm leading-relaxed">{coreSummary}</p>
                </motion.div>
              )}

              <AnimatePresence>
                {allSections.map((section, index) => (
                  <motion.div
                    key={`section-${index}`}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      ease: "easeOut",
                    }}
                    className={`p-4 mb-4 rounded-lg border transition-all duration-200 ${
                      section.relatedParagraphs &&
                      section.relatedParagraphs.length > 0
                        ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 hover:border-blue-300 border-gray-200"
                        : "border-gray-200"
                    }`}
                    onClick={() => {
                      if (section.relatedParagraphs) {
                        const paragraphIds = section.relatedParagraphs.map(
                          (p) => p.id
                        );
                        highlightParagraphs(paragraphIds);
                      }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <motion.h6
                      className="mb-2 font-medium"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    >
                      {section.title}
                    </motion.h6>
                    {section.items && section.items.length > 0 && (
                      <motion.ul
                        className="ml-4 space-y-1 text-sm list-disc"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                      >
                        {section.items.map((item, itemIndex) => (
                          <motion.li
                            key={itemIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: index * 0.1 + 0.4 + itemIndex * 0.05,
                            }}
                          >
                            {item}
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                    {section.relatedParagraphs &&
                      section.relatedParagraphs.length > 0 && (
                        <motion.div
                          className="mt-2 text-xs text-blue-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.5 }}
                        >
                          클릭하여 원문에서 관련 부분 확인
                        </motion.div>
                      )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {isStreaming && (
            <div className="flex justify-center items-center space-x-2">
              <Spinner size="sm" />
              <span className="text-gray-400 animate-pulse">
                남은 부분 요약 중 ...
              </span>
            </div>
          )}
        </CardBody>
      </Card>
    </LoadingOverlay>
  );
};
