"use client";

import { useSearch } from "../_hooks";
import { SearchForm } from "./search-form";
import { ResultCard } from "./result-card";

export const MainClient = () => {
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
      <SearchForm
        word={word}
        onWordChange={(word) => setWord(word)}
        onSearch={() => handleSearch()}
        isLoading={loading}
      />

      {error && <div className="p-4 text-center text-red-500">{error}</div>}

      {result && (
        <ResultCard word={result} onSynonymClick={handleSynonymSearch} />
      )}
    </div>
  );
};
