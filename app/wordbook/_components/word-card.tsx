'use client';

import { BookmarkX } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Chip } from '@heroui/chip';

import { type Word } from '@/lib/wordbook';

interface WordCardProps {
  word: Word;
  onDelete: () => void;
  onClick?: () => void;
}

export const WordCard = ({ word, onDelete, onClick }: WordCardProps) => {
  return (
    <Card isHoverable isPressable className='p-3 w-full cursor-pointer min-h-[120px] max-h-[120px]' onPress={onClick}>
      <CardHeader className='flex flex-col gap-2 items-start p-0'>
        <div className='flex justify-between items-center w-full'>
          <div className='flex gap-1 items-center'>
            <Chip size='sm'>{word.part_of_speech}</Chip>
            <h2 className='text-2xl font-bold line-clamp-1'>{word.word_jp}</h2>
          </div>

          <div
            role='button'
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onDelete();
              }
            }}
          >
            <BookmarkX className='text-red-500 cursor-pointer hover:text-red-600' size={20} />
          </div>
        </div>
      </CardHeader>

      <CardBody className='overflow-hidden justify-end p-0'>
        <div className='flex overflow-hidden flex-wrap gap-2 items-center'>
          {word.meaning_kr
            .split(',')
            .slice(0, 2)
            .map((word, index) => (
              <Chip key={index} className='p-0 max-w-full max-h-6 rounded-md' color='primary' size='md' variant='flat'>
                <span className='truncate'>{word}</span>
              </Chip>
            ))}
        </div>
      </CardBody>
    </Card>
  );
};
