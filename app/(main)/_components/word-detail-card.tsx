"use client";

import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { BookmarkFilledIcon, BookmarkIcon } from "@/components/icons";
import type { Word } from "@/lib/wordbook";

interface WordDetailCardProps {
  word: Word;
  onToggleSave: () => void;
  isSaved: boolean;
}

export const WordDetailCard = ({
  word,
  onToggleSave,
  isSaved,
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
              <p className="text-base font-medium">{example.sentence_jp}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-900">
                {example.yomigana}
              </p>
              <p className="mt-1 text-sm text-blue-600 dark:text-primary-50">
                {example.meaning_kr}
              </p>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};
