import ky from "ky";
import { type ParsedContent } from "@/app/news/_utils/nhk-html-parser";
import { SummarizedContent } from "@/app/news/_types";

export interface ParseUrlResponse {
  success: boolean;
  data?: ParsedContent | SummarizedContent;
  error?: string;
}

export class URLParserClient {
  private static baseUrl = "/api/parse-url";

  static async parseUrlWithSummary(
    url: string,
    timeout?: number
  ): Promise<SummarizedContent> {
    try {
      const response = await ky
        .post(this.baseUrl, {
          json: { url, timeout, summarize: true },
          timeout: (timeout || 10000) + 30000,
        })
        .json<ParseUrlResponse>();

      if (!response.success || !response.data) {
        throw new Error(response.error || "Failed to parse URL");
      }

      return response.data as SummarizedContent;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`URL 파싱 및 요약 실패: ${error.message}`);
      }
      throw new Error("URL 파싱 및 요약 중 알 수 없는 오류가 발생했습니다.");
    }
  }
}
