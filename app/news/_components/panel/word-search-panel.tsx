"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Form } from "@heroui/form";
import { SearchIcon } from "@/components/icons";
import { WordDetailCard } from "@/app/(main)/_components/word-detail-card";
import { useWordSave } from "@/app/(main)/_hooks";
import { useWordSearch } from "@/app/news/_contexts";
import { LoadingOverlay } from "@/components/fallback";

export const WordSearchPanel = () => {
  const { word, result, loading, error, validationError, setWord, searchWord } =
    useWordSearch();

  const { handleSaveWord, isAlreadySaved } = useWordSave(result!);

  const handleSearch = async () => {
    await searchWord();
  };

  const handleSynonymSearch = async (synonym: string) => {
    await searchWord(synonym);
  };

  const handleWordChange = (newWord: string) => {
    setWord(newWord);
  };

  return (
    <LoadingOverlay isLoading={loading} loadingText="검색 중...">
      <Card className="h-full rounded-none dark:bg-black">
        <CardHeader>
          <h3 className="text-lg font-semibold">단어 검색</h3>
        </CardHeader>

        <CardBody className="overflow-auto flex-1 space-y-4">
          <Form
            className="flex flex-row items-center"
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
            <Button type="submit" color="primary" size="sm" isLoading={loading}>
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
                key={result.word_jp}
                word={result}
                onToggleSave={handleSaveWord}
                isSaved={isAlreadySaved}
                onSynonymClick={handleSynonymSearch}
                isAnalysis={true}
              />
            </div>
          )}
        </CardBody>
      </Card>
    </LoadingOverlay>
  );
};
