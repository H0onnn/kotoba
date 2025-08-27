"use client";

import { useState } from "react";
import { type SummarizedContent } from "@/app/news/_types";
import { translationService } from "../_utils";

export const useDeeplTranslate = () => {
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedContent, setTranslatedContent] =
    useState<Partial<SummarizedContent> | null>(null);

  const translate = async (content: SummarizedContent | null) => {
    if (!content || isLoading) return;

    setIsLoading(true);
    try {
      const translated: Partial<SummarizedContent> = {};

      if (content.title) {
        translated.translatedTitle = await translationService.translateText(
          content.title
        );
      }

      if (content.structuredText && content.structuredText.length > 0) {
        translated.translatedStructuredText =
          await translationService.translateStructuredText(
            content.structuredText
          );
      } else if (content.text) {
        translated.translatedText = await translationService.translateText(
          content.text
        );
      }

      setTranslatedContent(translated);
    } catch (error) {
      console.error("Translation error:", error);
      setIsTranslationEnabled(false);
    } finally {
      setIsLoading(false);
    }
  };

  const onTranslationToggle = async (
    content: SummarizedContent | null
  ) => {
    const newEnabled = !isTranslationEnabled;
    setIsTranslationEnabled(newEnabled);
    if (newEnabled && !translatedContent && !isLoading) {
      await translate(content);
    }
  };

  return {
    isTranslationEnabled,
    setIsTranslationEnabled,
    isTranslating: isLoading,
    translate,
    translatedContent,
    onTranslationToggle,
  };
};
