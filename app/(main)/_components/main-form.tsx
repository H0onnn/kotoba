"use client";

import { useSearch } from "../_hooks";
import { SearchForm } from "./search-form";
import { ResultCard } from "./result-card";
import { Tips } from "./tips";
import { FullPageLoadingOverlay } from "@/components/fallback";

export const MainForm = () => {
  const {
    word,
    setWord,
    handleSearch,
    handleSynonymSearch,
    loading,
    result,
    error,
    setError,
  } = useSearch();

  return (
    <FullPageLoadingOverlay isLoading={loading} loadingText="검색 중...">
      <div className="flex flex-col gap-8 items-center w-full">
        <div className="flex gap-4 items-center w-full">
          <Tips />

          <SearchForm
            word={word}
            onWordChange={(word) => setWord(word)}
            onSearch={handleSearch}
            isLoading={loading}
            error={error}
            onErrorChange={(error) => setError(error)}
          />
        </div>

        {result && (
          <ResultCard word={result} onSynonymClick={handleSynonymSearch} />
        )}
      </div>
    </FullPageLoadingOverlay>
  );
};
