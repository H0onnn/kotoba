'use client';

import type { Word } from '@/lib/wordbook';

import { useState } from 'react';
import ky from 'ky';

import { sanitizeAndValidate } from '../_utils/valid';

export const useSearch = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<Word | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const validation = sanitizeAndValidate(word);

    if (!validation.isValid) {
      setError(validation.error || '입력값이 유효하지 않습니다.');

      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await ky
        .post('/api/word', {
          json: {
            word: word,
          },
        })
        .json<Word>();

      if (!res) {
        setError('단어 데이터 요청에 실패했습니다.');
      }

      setResult(res);
      setWord('');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
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
        .post('/api/word', {
          json: { word: synonym },
        })
        .json<Word>();

      setResult(res);
      setWord('');
    } catch {
      setError('네트워크 오류가 발생했습니다.');
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
    setError,
    handleSearch,
    handleSynonymSearch,
  };
};
