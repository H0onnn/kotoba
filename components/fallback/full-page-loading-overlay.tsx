"use client";

import { Spinner } from "@heroui/spinner";
import { useBodyScrollLock } from "@/hooks";

interface FullPageLoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const FullPageLoadingOverlay = ({
  isLoading,
  children,
  loadingText = "로딩 중...",
}: FullPageLoadingOverlayProps) => {
  useBodyScrollLock(isLoading);

  return (
    <>
      {children}

      {isLoading && (
        <div className="flex fixed inset-0 z-50 justify-center items-center backdrop-blur-sm bg-white/70 dark:bg-black/70">
          <div className="flex flex-col gap-3 items-center">
            <Spinner size="lg" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {loadingText}
            </span>
          </div>
        </div>
      )}
    </>
  );
};
