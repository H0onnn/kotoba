'use client';

import type { Word } from '@/lib/wordbook';

import { createContext, useContext, useState, useCallback } from 'react';
import ky from 'ky';

import { sanitizeAndValidate } from '@/app/(main)/_utils/valid';

interface WordSearchState {
  word: string;
  result: Word | undefined;
  loading: boolean;
  error: string | null;
  validationError: string;
}

interface WordSearchActions {
  setWord: (word: string) => void;
  searchWord: (word?: string) => Promise<void>;
  searchKeyword: (keyword: string) => Promise<void>;
  clearResult: () => void;
  clearError: () => void;
}

interface WordSearchContextType extends WordSearchState, WordSearchActions {}

const WordSearchContext = createContext<WordSearchContextType | undefined>(undefined);

interface WordSearchProviderProps {
  children: React.ReactNode;
}

export const WordSearchProvider = ({ children }: WordSearchProviderProps) => {
  const [state, setState] = useState<WordSearchState>({
    word: '',
    result: undefined,
    loading: false,
    error: null,
    validationError: '',
  });

  const setWord = useCallback((word: string) => {
    setState((prev) => ({ ...prev, word, validationError: '' }));
  }, []);

  const searchWord = useCallback(
    async (wordToSearch?: string) => {
      const searchTerm = wordToSearch || state.word;

      if (!searchTerm.trim()) return;

      const validation = sanitizeAndValidate(searchTerm);

      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          validationError: validation.error || '입력값이 유효하지 않습니다.',
        }));

        return;
      }

      setState((prev) => ({
        ...prev,
        validationError: '',
        loading: true,
        error: null,
      }));

      try {
        const res = await ky
          .post('/api/word', {
            json: { word: searchTerm },
          })
          .json<Word>();

        if (!res) {
          setState((prev) => ({
            ...prev,
            error: '단어 데이터 요청에 실패했습니다.',
            loading: false,
          }));

          return;
        }

        setState((prev) => ({
          ...prev,
          result: res,
          word: '',
          loading: false,
        }));
      } catch {
        setState((prev) => ({
          ...prev,
          error: '네트워크 오류가 발생했습니다.',
          loading: false,
        }));
      }
    },
    [state.word],
  );

  const searchKeyword = useCallback(async (keyword: string) => {
    setState((prev) => ({
      ...prev,
      word: keyword,
      loading: true,
      error: null,
      validationError: '',
    }));

    try {
      const res = await ky
        .post('/api/word', {
          json: { word: keyword },
        })
        .json<Word>();

      setState((prev) => ({
        ...prev,
        result: res,
        word: '',
        loading: false,
      }));
    } catch {
      setState((prev) => ({
        ...prev,
        error: '네트워크 오류가 발생했습니다.',
        loading: false,
      }));
    }
  }, []);

  const clearResult = useCallback(() => {
    setState((prev) => ({ ...prev, result: undefined }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, validationError: '' }));
  }, []);

  const contextValue: WordSearchContextType = {
    ...state,
    setWord,
    searchWord,
    searchKeyword,
    clearResult,
    clearError,
  };

  return <WordSearchContext.Provider value={contextValue}>{children}</WordSearchContext.Provider>;
};

export const useWordSearch = () => {
  const context = useContext(WordSearchContext);

  if (context === undefined) {
    throw new Error('useWordSearch must be used within a WordSearchProvider');
  }

  return context;
};
