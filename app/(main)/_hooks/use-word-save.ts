'use client';

import { useSyncExternalStore } from 'react';

import { saveWordToBook, isWordSaved, removeWordFromBook, subscribeWordbook, type Word } from '@/lib/wordbook';

export const useWordSave = (word?: Word | null) => {
  const isAlreadySaved = useSyncExternalStore(
    subscribeWordbook,
    () => (word ? isWordSaved(word.word_jp) : false),
    () => false,
  );

  const handleSaveWord = () => {
    if (!word) return;

    if (isAlreadySaved) {
      removeWordFromBook(word.word_jp);
    } else {
      saveWordToBook({
        word_jp: word.word_jp,
        yomigana: word.yomigana,
        meaning_kr: word.meaning_kr,
        examples: word.examples,
        part_of_speech: word.part_of_speech,
        synonyms: word.synonyms,
        homonyms: word.homonyms,
        compounds: word.compounds,
      });
    }
  };

  return {
    handleSaveWord,
    isAlreadySaved,
  };
};
