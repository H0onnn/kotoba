import ky from 'ky';

import { type StructuredParagraph } from '../_types';

interface TranslationResponse {
  translatedTexts: string[];
  error?: string;
}

class TranslationService {
  private async callTranslationAPI(texts: string[]): Promise<string[]> {
    try {
      const response = await ky
        .post('/api/translate', {
          json: { texts, targetLang: 'ko' },
          timeout: 30000,
        })
        .json<TranslationResponse>();

      return response.translatedTexts;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`번역 실패: ${error.message}`);
      }
      throw new Error('번역에 실패했습니다.');
    }
  }

  async translateText(text: string): Promise<string> {
    try {
      const results = await this.callTranslationAPI([text]);

      return results[0];
    } catch (error) {
      console.error('Translation failed:', error);
      throw new Error('번역에 실패했습니다.');
    }
  }

  async translateMultipleTexts(texts: string[]): Promise<string[]> {
    try {
      return await this.callTranslationAPI(texts);
    } catch (error) {
      console.error('Multiple translation failed:', error);
      throw new Error('번역에 실패했습니다.');
    }
  }

  async translateStructuredText(structuredText: StructuredParagraph[]): Promise<StructuredParagraph[]> {
    try {
      const texts = structuredText.map((paragraph) => paragraph.text);
      const translatedTexts = await this.translateMultipleTexts(texts);

      return structuredText.map((paragraph, index) => ({
        ...paragraph,
        text: translatedTexts[index],
        preview: translatedTexts[index].slice(0, 50),
      }));
    } catch (error) {
      console.error('Structured text translation failed:', error);
      throw error;
    }
  }
}

export const translationService = new TranslationService();
