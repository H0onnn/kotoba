"use client";

import { useState } from "react";
import {
  saveWordToBook,
  isWordSaved,
  removeWordFromBook,
  type Word,
} from "@/lib/wordbook";

export const useWordSave = (word: Word) => {
  const [isAlreadySaved, setIsAlreadySaved] = useState(() =>
    word ? isWordSaved(word.word_jp) : false
  );

  const handleSaveWord = () => {
    if (!word) return;

    if (isAlreadySaved) {
      removeWordFromBook(word.word_jp);
      setIsAlreadySaved(false);
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
      setIsAlreadySaved(true);
    }
  };

  return {
    handleSaveWord,
    isAlreadySaved,
  };
};
