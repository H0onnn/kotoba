'use client';

import { useSearch } from '../_hooks';

import { SearchForm } from './search-form';
import { ResultCard } from './result-card';
import { Tips } from './tips';

import { FullPageLoadingOverlay } from '@/components/fallback';

export const MainForm = () => {
  const { word, setWord, handleSearch, handleSynonymSearch, loading, result, error, setError } = useSearch();

  return (
    <FullPageLoadingOverlay isLoading={loading} loadingText='검색 중...'>
      <div className='flex flex-col gap-8 items-center w-full'>
        <div className='flex gap-4 items-center w-full'>
          <Tips />

          <SearchForm
            error={error}
            isLoading={loading}
            word={word}
            onErrorChange={(error) => setError(error)}
            onSearch={handleSearch}
            onWordChange={(word) => setWord(word)}
          />
        </div>

        {result && <ResultCard key={result.word_jp} word={result} onSynonymClick={handleSynonymSearch} />}
      </div>
    </FullPageLoadingOverlay>
  );
};
