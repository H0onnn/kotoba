"use client";

import { useState } from "react";
import ky from "ky";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { SearchIcon } from "@/components/icons";
import { sanitizeAndValidate } from "@/app/(main)/_utils/valid";
import { WordDetailCard } from "@/app/(main)/_components/word-detail-card";
import { useWordSave } from "@/app/(main)/_hooks";
import type { Word } from "@/lib/wordbook";

export const WordSearchPanel = () => {
  const [word, setWord] = useState("");
  const [result, setResult] = useState<Word>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>("");

  const { handleSaveWord, isAlreadySaved } = useWordSave(result!);

  const handleSearch = async () => {
    if (!word.trim()) return;

    const validation = sanitizeAndValidate(word);

    if (!validation.isValid) {
      setValidationError(validation.error || "입력값이 유효하지 않습니다.");
      return;
    }

    setValidationError("");
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
    setValidationError("");

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

  const handleWordChange = (newWord: string) => {
    setValidationError("");
    setWord(newWord);
  };

  return (
    <Card className="h-full rounded-none">
      <CardHeader>
        <h3 className="text-lg font-semibold">단어 검색</h3>
      </CardHeader>

      <CardBody className="overflow-auto flex-1 space-y-4">
        <Form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Input
            aria-label="Search word"
            size="sm"
            placeholder="단어를 검색해보세요..."
            startContent={
              <SearchIcon className="flex-shrink-0 text-base pointer-events-none text-default-400" />
            }
            type="search"
            value={word}
            onChange={(e) => handleWordChange(e.target.value)}
            isInvalid={!!validationError}
            errorMessage={validationError}
          />
          <Button
            type="submit"
            color="primary"
            size="sm"
            className="w-full"
            isLoading={loading}
          >
            {!loading ? "검색" : "검색 중.."}
          </Button>
        </Form>

        {error && (
          <div className="p-3 text-sm text-center text-red-500 bg-red-50 rounded-lg">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-4">
            <WordDetailCard
              word={result}
              onToggleSave={handleSaveWord}
              isSaved={isAlreadySaved}
              onSynonymClick={handleSynonymSearch}
            />
          </div>
        )}
      </CardBody>
    </Card>
  );
};
