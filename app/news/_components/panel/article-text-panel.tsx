'use client';

import { Card, CardBody, CardHeader } from '@heroui/card';
import { Switch } from '@heroui/switch';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from '@heroui/progress';

import { usePanelHighlight, useNewsAnalysis } from '@/app/news/_contexts';
import { useDeeplTranslate } from '@/app/news/_hooks';
import { LoadingOverlay } from '@/components/fallback';

export const ArticleTextPanel = () => {
  const { highlightedParagraphs, registerParagraphRef, registerContainerRef, scrollToHighlighted } =
    usePanelHighlight();

  const { translatedContent, isTranslating, isTranslationEnabled, onTranslationToggle } = useDeeplTranslate();

  const {
    result: content,
    isParsing,
    parsingProgress,
    parsingMessage,
    streamingTitle,
    streamingParagraphs,
    parseError,
  } = useNewsAnalysis();

  const hasStreamingData = isParsing || (streamingTitle && streamingParagraphs.length > 0);

  useEffect(() => {
    if (highlightedParagraphs.length > 0) {
      scrollToHighlighted();
    }
  }, [highlightedParagraphs, scrollToHighlighted]);

  if (!content && !isParsing && !hasStreamingData) {
    if (parseError) {
      return (
        <div className='flex flex-col justify-center items-center p-4 h-full text-red-500'>
          <p className='mb-2'>원문을 불러오는 중 오류가 발생했습니다</p>
          <p className='text-sm text-gray-600'>{parseError}</p>
        </div>
      );
    }

    return (
      <div className='flex justify-center items-center p-4 h-full text-gray-500'>
        뉴스 기사를 요약하고 원문을 확인하세요
      </div>
    );
  }

  return (
    <LoadingOverlay isLoading={isTranslating} loadingText='번역 중...'>
      <Card className='h-full rounded-none dark:bg-black'>
        <CardHeader className='flex-row justify-between items-center'>
          <div className='flex flex-col flex-1 gap-2'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-semibold'>원문</h3>
              <div className='flex gap-2 items-center'>
                <Switch
                  isDisabled={isTranslating || isParsing}
                  isSelected={isTranslationEnabled}
                  size='sm'
                  onValueChange={() => content && onTranslationToggle(content)}
                />
                <span className='text-sm'>{isTranslating ? '번역 중...' : '번역'}</span>
              </div>
            </div>
            {isParsing && (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className='flex flex-col gap-2'
                initial={{ opacity: 0, y: -10 }}
              >
                <div className='flex justify-between items-center text-sm'>
                  <span className='text-gray-600'>{parsingMessage}</span>
                  <span className='text-gray-500'>{parsingProgress}%</span>
                </div>
                <Progress className='w-full' value={parsingProgress} />
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardBody className='overflow-auto flex-1 space-y-4'>
          <motion.div
            key='title-section'
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, delay: 0 }}
          >
            <h4 className='mb-2 text-sm font-medium text-gray-600'>제목</h4>
            <h5 className='text-lg font-semibold leading-relaxed'>
              {streamingTitle || content?.title ? (
                isTranslationEnabled && translatedContent?.translatedTitle ? (
                  translatedContent.translatedTitle
                ) : (
                  streamingTitle || content?.title
                )
              ) : isParsing ? (
                <span className='text-gray-400 animate-pulse'>제목을 불러오는 중...</span>
              ) : (
                '제목 없음'
              )}
            </h5>
          </motion.div>

          <div ref={registerContainerRef}>
            <motion.div
              key='content-header'
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, delay: 0.3 }}
            >
              <h4 className='mb-2 text-sm font-medium text-gray-600'>
                원문 내용
                {isParsing && streamingParagraphs.length > 0 && (
                  <span className='ml-2 text-xs text-blue-500'>({streamingParagraphs.length}개 단락 파싱됨)</span>
                )}
              </h4>
            </motion.div>
            <div className='max-w-none prose prose-sm'>
              {(content?.structuredText && content.structuredText.length > 0) || streamingParagraphs.length > 0 ? (
                <div className='space-y-3'>
                  <AnimatePresence>
                    {(isTranslationEnabled && translatedContent?.translatedStructuredText
                      ? translatedContent.translatedStructuredText
                      : content?.structuredText || streamingParagraphs
                    ).map((paragraph, index) => {
                      const isHighlighted = highlightedParagraphs.includes(paragraph.id);
                      const baseClasses =
                        'text-sm leading-relaxed transition-all duration-200 m-2 py-2 whitespace-pre-line';
                      const highlightClasses = isHighlighted ? 'bg-yellow-100 py-2 dark:bg-yellow-600' : '';

                      const MotionComponent = motion.div;
                      const animationProps = {
                        initial: { opacity: 0, y: 20, scale: 0.95 },
                        animate: { opacity: 1, y: 0, scale: 1 },
                        exit: { opacity: 0, y: -10, scale: 0.95 },
                        transition: {
                          duration: 0.3,
                          delay: 0.5 + (isParsing ? index * 0.03 : 0),
                          ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                        },
                        layout: true,
                      };

                      if (paragraph.type === 'heading') {
                        return (
                          <MotionComponent key={paragraph.id} {...animationProps}>
                            <h5
                              ref={(el) => registerParagraphRef(paragraph.id, el)}
                              className={`text-base font-semibold ${baseClasses} ${highlightClasses}`}
                            >
                              {paragraph.text}
                            </h5>
                          </MotionComponent>
                        );
                      } else if (paragraph.type === 'list-item') {
                        return (
                          <MotionComponent key={paragraph.id} {...animationProps}>
                            <li
                              ref={(el) => registerParagraphRef(paragraph.id, el)}
                              className={`ml-4 ${baseClasses} ${highlightClasses}`}
                            >
                              {paragraph.text}
                            </li>
                          </MotionComponent>
                        );
                      } else {
                        return (
                          <MotionComponent key={paragraph.id} {...animationProps}>
                            <p
                              ref={(el) => registerParagraphRef(paragraph.id, el)}
                              className={`${baseClasses} ${highlightClasses}`}
                            >
                              {paragraph.text}
                            </p>
                          </MotionComponent>
                        );
                      }
                    })}
                  </AnimatePresence>
                </div>
              ) : content?.text ? (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className='text-sm leading-relaxed whitespace-pre-wrap'
                  initial={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  {isTranslationEnabled && translatedContent?.translatedText
                    ? translatedContent.translatedText
                    : content.text}
                </motion.div>
              ) : (
                <motion.p animate={{ opacity: 1 }} className='italic text-gray-500' initial={{ opacity: 0 }}>
                  {isParsing ? '원문을 파싱하고 있습니다...' : '원문 텍스트를 불러올 수 없습니다.'}
                </motion.p>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </LoadingOverlay>
  );
};
