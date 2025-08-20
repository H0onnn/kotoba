"use client";

import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { BookmarkFilledIcon, BookmarkIcon } from "@/components/icons";
import { createHighlightedElements } from "@/utils/highlight";
import type { Word } from "@/lib/wordbook";

type ChipColor = "warning" | "secondary" | "success";

interface WordSectionProps {
  title: string;
  words: Array<{ word_jp: string; yomigana?: string; meaning_kr: string }>;
  color: ChipColor;
  onWordClick: (word: string) => void;
}

const WordSection = ({
  title,
  words,
  color,
  onWordClick,
}: WordSectionProps) => {
  if (!words || words.length === 0) return null;

  const getHoverClass = (color: ChipColor) => {
    switch (color) {
      case "warning":
        return "hover:bg-warning-200";
      case "secondary":
        return "hover:bg-secondary-200";
      case "success":
        return "hover:bg-success-200";
    }
  };

  return (
    <div>
      <h3 className="mb-3 text-lg font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {words.map((word, index) => (
          <Chip
            key={index}
            color={color}
            variant="flat"
            className={`transition-colors cursor-pointer ${getHoverClass(color)}`}
            onClick={() => onWordClick(word.word_jp)}
          >
            <span className="font-medium">{word.word_jp}</span>
            <span className="ml-1 text-xs text-gray-600">
              {word.yomigana ? `(${word.yomigana})` : word.meaning_kr}
            </span>
          </Chip>
        ))}
      </div>
    </div>
  );
};

interface WordDetailCardProps {
  word: Word;
  onToggleSave: () => void;
  isSaved: boolean;
  onSynonymClick: (synonym: string) => void;
}

export const WordDetailCard = ({
  word,
  onToggleSave,
  isSaved,
  onSynonymClick,
}: WordDetailCardProps) => {
  return (
    <Card className="p-4 w-full">
      <CardHeader className="flex flex-col gap-2 items-start p-0 pb-4">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-2">
            <div className="flex gap-1 items-center">
              <Chip>{word.part_of_speech}</Chip>
              <h2 className="text-2xl font-bold">{word.word_jp}</h2>
              <p className="text-lg text-gray-600">({word.yomigana})</p>
            </div>

            <div className="flex gap-2 items-center">
              {word.meaning_kr.split(",").map((word, index) => (
                <Chip
                  key={index}
                  color="primary"
                  variant="flat"
                  size="md"
                  className="p-0 max-h-6 rounded-md"
                >
                  {word}
                </Chip>
              ))}
            </div>
          </div>
          <Button
            isIconOnly
            variant="light"
            onPress={onToggleSave}
            className="text-yellow-500 hover:text-yellow-600"
          >
            {isSaved ? (
              <BookmarkFilledIcon size={24} />
            ) : (
              <BookmarkIcon size={24} />
            )}
          </Button>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="p-0 pt-2">
        <h3 className="mb-3 text-lg font-semibold">예문</h3>
        <div className="space-y-3">
          {word.examples.map((example, index) => (
            <div
              key={index}
              className="p-3 bg-gray-50 rounded-lg dark:bg-gray-500"
            >
              <p className="text-base font-medium">
                {createHighlightedElements(
                  example.sentence_jp,
                  example.highlight_word,
                  "bg-yellow-200 dark:bg-yellow-600 font-semibold"
                )}
              </p>
              <p className="mt-1 text-sm text-blue-600 dark:text-primary-100">
                {example.meaning_kr}
              </p>

              {example.example_words && example.example_words.length > 0 && (
                <div className="mt-2">
                  <p className="mb-1 text-xs text-gray-500 dark:text-gray-950">
                    포함된 단어:
                  </p>
                  <div className="flex flex-wrap gap-1 items-center">
                    {example.example_words.map((exampleWord, wordIndex) => (
                      <Chip
                        key={wordIndex}
                        size="sm"
                        variant="bordered"
                        className="text-xs cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-400 min-w-6 min-h-6"
                        onClick={() => onSynonymClick(exampleWord.word_jp)}
                      >
                        {exampleWord.word_jp}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardBody>

      <CardFooter className="p-0 pt-4">
        <div className="space-y-6 w-full">
          <WordSection
            title="요미가나 유사 단어"
            words={
              word.homonyms.filter((h) => h.word_jp !== word.word_jp) || []
            }
            color="warning"
            onWordClick={onSynonymClick}
          />
          <WordSection
            title="유의어"
            words={word.synonyms || []}
            color="secondary"
            onWordClick={onSynonymClick}
          />
          <WordSection
            title="관련 복합어"
            words={word.compounds || []}
            color="success"
            onWordClick={onSynonymClick}
          />
        </div>
      </CardFooter>
    </Card>
  );
};
