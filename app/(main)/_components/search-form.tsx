"use client";

import { SearchIcon } from "@/components/icons";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

interface SearchFormProps {
  word: string;
  onWordChange: (word: string) => void;
  onSearch: () => void;
  isLoading: boolean;
}

export const SearchForm = ({
  word,
  onWordChange,
  onSearch,
  isLoading,
}: SearchFormProps) => {
  return (
    <Form
      className="flex flex-row items-center space-x-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
    >
      <Input
        aria-label="Search"
        classNames={{
          inputWrapper: "bg-default-100",
          input: "text-sm",
        }}
        size="lg"
        placeholder="단어를 검색해보세요..."
        startContent={
          <SearchIcon className="flex-shrink-0 text-base pointer-events-none text-default-400" />
        }
        type="search"
        value={word}
        onChange={(e) => onWordChange(e.target.value)}
      />
      <Button type="submit" variant="bordered" isLoading={isLoading}>
        {!isLoading ? "검색" : "검색 중.."}
      </Button>
    </Form>
  );
};
