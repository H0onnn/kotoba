'use client';

import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';

import { SearchIcon } from '@/components/icons';

interface SearchFormProps {
  word: string;
  onWordChange: (word: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  error: string | null;
  onErrorChange: (error: string | null) => void;
}

export const SearchForm = ({ word, onWordChange, onSearch, isLoading, error, onErrorChange }: SearchFormProps) => {
  const handleWordChange = (newWord: string) => {
    onErrorChange('');
    onWordChange(newWord);
  };

  return (
    <div className='space-y-2 w-full'>
      <Form
        className='flex flex-row items-center space-x-2'
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
      >
        <Input
          aria-label='Search'
          classNames={{
            inputWrapper: 'bg-default-100',
            input: 'text-base',
          }}
          errorMessage={error}
          isInvalid={!!error}
          placeholder='단어를 검색해보세요...'
          size='lg'
          startContent={<SearchIcon className='flex-shrink-0 text-base pointer-events-none text-default-400' />}
          type='search'
          value={word}
          onChange={(e) => handleWordChange(e.target.value)}
        />
        <Button isLoading={isLoading} type='submit' variant='bordered'>
          {!isLoading ? '검색' : '검색 중..'}
        </Button>
      </Form>
    </div>
  );
};
