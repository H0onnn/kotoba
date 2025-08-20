"use client";

import { BookmarkFilledIcon, DeleteIcon } from "@/components/icons";
import { type Word } from "@/lib/wordbook";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

interface WordCardProps {
  word: Word;
  onDelete: () => void;
  onClick?: () => void;
}

export const WordCard = ({ word, onDelete, onClick }: WordCardProps) => {
  return (
    <Card
      className="p-3 w-full cursor-pointer min-h-[120px] max-h-[120px]"
      isPressable
      isHoverable
      onPress={onClick}
    >
      <CardHeader className="flex flex-col gap-2 items-start p-0">
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-1 items-center">
            <Chip size="sm">{word.part_of_speech}</Chip>
            <h2 className="text-2xl font-bold line-clamp-1">{word.word_jp}</h2>
            <p className="text-lg text-gray-600 line-clamp-1">
              ({word.yomigana})
            </p>
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-red-500 cursor-pointer hover:text-red-600"
          >
            <DeleteIcon size={20} />
          </div>
        </div>
      </CardHeader>

      <CardBody className="justify-end p-0">
        <div className="flex flex-wrap gap-2 items-center">
          {word.meaning_kr
            .split(",")
            .slice(0, 2)
            .map((word, index) => (
              <Chip
                key={index}
                color="primary"
                variant="flat"
                size="md"
                className="p-0 max-h-6 rounded-md line-clamp-1"
              >
                {word}
              </Chip>
            ))}
        </div>
      </CardBody>
    </Card>
  );
};
