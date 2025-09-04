'use client';

import { Spinner } from '@heroui/spinner';
import { useState, useEffect } from 'react';

import { useBodyScrollLock } from '@/hooks';

interface FullPageLoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  loadingStartTime?: number | null;
}

const ProgressBar = ({ progress }: { progress: number }) => {
  return (
    <div className='overflow-hidden w-64 h-2 bg-gray-200 rounded-full dark:bg-gray-700'>
      <div
        className='h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out'
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
};

export const FullPageLoadingOverlay = ({
  isLoading,
  children,
  loadingText = '로딩 중...',
  loadingStartTime,
}: FullPageLoadingOverlayProps) => {
  useBodyScrollLock(isLoading);
  const [dynamicMessage, setDynamicMessage] = useState(loadingText);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isLoading || !loadingStartTime) {
      setDynamicMessage(loadingText);
      setProgress(0);
      setElapsedTime(0);

      return;
    }

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - loadingStartTime) / 1000);

      setElapsedTime(elapsed);

      // 70초 기준
      const progressPercentage = Math.min((elapsed / 70) * 100, 95);

      setProgress(progressPercentage);

      if (elapsed < 10) {
        setDynamicMessage('AI가 기사를 분석하고 있어요...');
      } else if (elapsed < 30) {
        setDynamicMessage('기사 내용을 요약하고 있어요...');
      } else if (elapsed < 50) {
        setDynamicMessage('거의 완료되었어요...');
      } else {
        setDynamicMessage('조금만 더 기다려주세요...');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoading, loadingStartTime, loadingText]);

  return (
    <>
      {children}

      {isLoading && (
        <div className='flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-white/70 dark:bg-black/70'>
          <div className='flex flex-col gap-4 items-center'>
            <Spinner size='lg' />
            <div className='flex flex-col gap-2 items-center'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>{dynamicMessage}</span>

              {loadingStartTime && (
                <>
                  <ProgressBar progress={progress} />
                  <div className='text-xs text-gray-500 dark:text-gray-400'>
                    {/* TODO: 파싱된 문서의 길이에 따라 동적으로 예상 소요시간을 추측할 수 없을까 ? */}
                    <span>예상 소요시간: 30-60초</span>
                    {elapsedTime > 0 && <span className='ml-2'>• 경과시간: {elapsedTime}초</span>}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
