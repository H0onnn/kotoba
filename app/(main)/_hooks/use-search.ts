"use client";

import { useState } from "react";
import ky from "ky";
import type { Word } from "@/lib/wordbook";

export const useSearch = () => {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!word.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await ky
        .post("/api/word", {
          json: {
            word: word,
          },
        })
        .json<Word>();

      if (!res) {
        setError("단어 데이터 요청에 실패했습니다.");
      }

      setResult(res);
      setWord("");
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSynonymSearch = async (synonym: string) => {
    setWord(synonym);
    setLoading(true);
    setError(null);

    try {
      const res = await ky
        .post("/api/word", {
          json: { word: synonym },
        })
        .json<Word>();

      setResult(res);
      setWord("");
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return {
    word,
    setWord,
    result,
    loading,
    error,
    handleSearch,
    handleSynonymSearch,
  };
};
