"use client";

import { SearchIcon } from "@/components/icons";
import { Form } from "@heroui/form";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";

interface URLParserFormProps {
  url: string;
  onUrlChange: (url: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  error: string | null;
}

export const URLParserForm = ({
  url,
  onUrlChange,
  onAnalyze,
  isLoading,
  error,
}: URLParserFormProps) => {
  return (
    <div className="space-y-2 w-full">
      <Form
        className="flex flex-row items-center space-x-2"
        onSubmit={(e) => {
          e.preventDefault();
          onAnalyze();
        }}
      >
        <Input
          aria-label="Search"
          classNames={{
            inputWrapper: "bg-default-100 flex-1",
            input: "text-base w-full",
          }}
          size="lg"
          placeholder="https://www3.nhk.or.jp/news/html/20250827/k10014904091000.html"
          startContent={
            <SearchIcon className="flex-shrink-0 text-base pointer-events-none text-default-400" />
          }
          type="search"
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          isInvalid={!!error}
        />
        <Button type="submit" variant="bordered" isLoading={isLoading}>
          AI 요약
        </Button>
      </Form>
    </div>
  );
};
