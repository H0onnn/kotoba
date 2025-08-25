"use client";

import { useSearch } from "../_hooks";
import { SearchForm } from "./search-form";
import { ResultCard } from "./result-card";
import { Tips } from "./tips";

export const MainForm = () => {
  const {
    word,
    setWord,
    handleSearch,
    handleSynonymSearch,
    loading,
    result,
    error,
  } = useSearch();

  return (
    <div className="flex flex-col gap-8 items-center w-full">
      <div className="flex gap-4 items-center">
        <Tips />

        <SearchForm
          word={word}
          onWordChange={(word) => setWord(word)}
          onSearch={() => handleSearch()}
          isLoading={loading}
        />
      </div>

      {error && <div className="p-4 text-center text-red-500">{error}</div>}

      {result && (
        <ResultCard word={result} onSynonymClick={handleSynonymSearch} />
      )}
    </div>
  );
};
