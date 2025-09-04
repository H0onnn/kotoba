'use client';

import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

import { NewsAnalysisProvider, PanelHighlightProvider, WordSearchProvider, useNewsAnalysis } from '../_contexts';

import { URLParserForm } from './parser-form';
import { ResultPanel } from './panel';
import { ImportantTips } from './important-tips';

import { subtitle } from '@/components/primitives';

export const NewsAnalyzeSection = () => {
  return (
    <NewsAnalysisProvider>
      <NewsContent />
    </NewsAnalysisProvider>
  );
};

const NewsContent = () => {
  const { url, setUrl, analyzeWithParsing, result, error, isStreaming, isParsing } = useNewsAnalysis();

  if (result || isStreaming || isParsing) {
    return (
      <PanelHighlightProvider>
        <WordSearchProvider>
          <ResultPanel />
        </WordSearchProvider>
      </PanelHighlightProvider>
    );
  }

  return (
    <section className='container flex flex-col flex-grow gap-4 justify-center items-center px-6 py-8 mx-auto max-w-7xl md:pt-16 md:py-10'>
      <div className='flex space-x-2 itmes-center'>
        <span
          className={subtitle({
            className: 'text-center',
          })}
        >
          NHK 뉴스 기사를 AI가 쉽게 요약해드려요
        </span>

        <Link
          className='inline-flex items-center text-sm font-medium text-blue-600 underline focus:outline-none'
          href='https://www3.nhk.or.jp/news/'
          rel='noopener noreferrer'
          target='_blank'
        >
          <ExternalLink className='w-4 h-4' />
          NHK
        </Link>
      </div>

      <div className='mt-8 w-full max-w-2xl'>
        <div className='flex flex-col gap-4 items-center w-full'>
          <URLParserForm error={error} url={url} onAnalyze={analyzeWithParsing} onUrlChange={(url) => setUrl(url)} />

          <ImportantTips />

          {error && <div className='p-4 text-center text-red-500'>{error}</div>}
        </div>
      </div>
    </section>
  );
};
