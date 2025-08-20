"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/modal";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import type { Word } from "@/lib/wordbook";

interface WordDetailModalProps {
  word: Word | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WordDetailModal = ({
  word,
  isOpen,
  onClose,
}: WordDetailModalProps) => {
  if (!word) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
      <ModalContent className="pb-4">
        <ModalHeader className="flex flex-col gap-2 items-start">
          <div className="hidden gap-1 items-center sm:flex">
            <Chip>{word.part_of_speech}</Chip>
            <h2 className="text-2xl font-bold">{word.word_jp}</h2>
            <p className="text-lg text-gray-600">({word.yomigana})</p>
          </div>

          <div className="flex flex-col gap-1 sm:hidden">
            <div className="flex gap-1 items-center">
              <Chip>{word.part_of_speech}</Chip>
              <h2 className="text-2xl font-bold">{word.word_jp}</h2>
            </div>
            <p className="text-lg text-gray-600">({word.yomigana})</p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {word.meaning_kr.split(",").map((meaning, index) => (
              <Chip
                key={index}
                color="primary"
                variant="flat"
                size="md"
                className="p-0 max-h-6 rounded-md"
              >
                {meaning.trim()}
              </Chip>
            ))}
          </div>
        </ModalHeader>

        <Divider />

        <ModalBody>
          <h3 className="text-lg font-semibold">예문</h3>
          <div className="space-y-3">
            {word.examples.map((example, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg dark:bg-gray-500"
              >
                <p className="text-base font-medium">{example.sentence_jp}</p>
                <p className="mt-1 text-sm text-blue-600 dark:text-primary-50">
                  {example.meaning_kr}
                </p>
              </div>
            ))}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
