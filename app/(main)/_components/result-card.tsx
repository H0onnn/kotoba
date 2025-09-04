'use client';

import type { Word } from '@/lib/wordbook';

import { useWordSave } from '../_hooks';

import { WordDetailCard } from './word-detail-card';

interface ResultCardProps {
  word: Word;
  onSynonymClick: (synonym: string) => void;
}

export const ResultCard = ({ word, onSynonymClick }: ResultCardProps) => {
  const { handleSaveWord, isAlreadySaved } = useWordSave(word);

  return (
    <WordDetailCard
      isSaved={isAlreadySaved}
      word={word}
      onSynonymClick={onSynonymClick}
      onToggleSave={handleSaveWord}
    />
  );
};
