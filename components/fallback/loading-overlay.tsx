'use client';

import { Spinner } from '@heroui/spinner';

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const LoadingOverlay = ({ isLoading, children, loadingText = '로딩 중...' }: LoadingOverlayProps) => {
  return (
    <div className='relative h-full'>
      {children}

      {isLoading && (
        <div className='flex absolute inset-0 z-10 justify-center items-center rounded-lg backdrop-blur-sm bg-white/70 dark:bg-black/70'>
          <div className='flex flex-col gap-3 items-center'>
            <Spinner size='lg' />
            <span className='text-sm text-gray-600 dark:text-gray-400'>{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  );
};
