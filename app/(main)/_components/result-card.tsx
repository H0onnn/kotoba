"use client";

import { WordDetailCard } from "./word-detail-card";
import { useWordSave } from "../_hooks";
import type { Word } from "@/lib/wordbook";

interface ResultCardProps {
  word: Word;
  onSynonymClick: (synonym: string) => void;
}

export const ResultCard = ({ word, onSynonymClick }: ResultCardProps) => {
  const { handleSaveWord, isAlreadySaved } = useWordSave(word);

  return (
    <WordDetailCard
      word={word}
      onToggleSave={handleSaveWord}
      isSaved={isAlreadySaved}
      onSynonymClick={onSynonymClick}
    />
  );
};
