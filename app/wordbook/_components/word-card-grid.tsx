"use client";

import { type Word, getWordbook, removeWordFromBook } from "@/lib/wordbook";
import { useState, useEffect } from "react";
import { WordCard } from "./word-card";
import { WordDetailModal } from "./word-detail-modal";
import { subtitle } from "@/components/primitives";

export const WordCardGrid = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setWords(getWordbook());
  }, []);

  const handleWordClick = (word: Word) => {
    setSelectedWord(word);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWord(null);
  };

  const handleDeleteWord = (wordJp: string) => {
    removeWordFromBook(wordJp);
    setWords(getWordbook());
  };

  if (!words.length) {
    return <h2 className={subtitle()}>저장된 단어가 없어요</h2>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {words.map((word) => (
          <WordCard
            key={word.id}
            word={word}
            onDelete={() => handleDeleteWord(word.word_jp)}
            onClick={() => handleWordClick(word)}
          />
        ))}
      </div>

      <WordDetailModal
        word={selectedWord}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};
