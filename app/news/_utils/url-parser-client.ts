interface StreamChunk {
  type: "sections" | "coreSummary" | "complete" | "error";
  data?: any;
  error?: string;
}

interface ParseStreamChunk {
  type: "html" | "metadata" | "paragraphs" | "complete" | "error";
  data?: any;
  progress?: number;
  error?: string;
}

export class URLParserClient {
  private static baseUrl = "/api/parse-url";

  static async *parseUrlWithSummaryStream(
    url: string,
    timeout?: number
  ): AsyncGenerator<StreamChunk, void, unknown> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, timeout, summarize: true }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as StreamChunk;
                yield data;
              } catch (parseError) {
                console.error("Failed to parse stream chunk:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        yield {
          type: "error",
          error: `URL 파싱 및 요약 실패: ${error.message}`,
        };
      } else {
        yield {
          type: "error",
          error: "URL 파싱 및 요약 중 알 수 없는 오류가 발생했습니다.",
        };
      }
    }
  }

  static async *parseUrlStream(
    url: string,
    timeout?: number
  ): AsyncGenerator<ParseStreamChunk, void, unknown> {
    try {
      const response = await fetch(this.baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, timeout, summarize: false }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6)) as ParseStreamChunk;
                yield data;
              } catch (parseError) {
                console.error("Failed to parse stream chunk:", parseError);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error) {
        yield {
          type: "error",
          error: `URL 파싱 실패: ${error.message}`,
        };
      } else {
        yield {
          type: "error",
          error: "URL 파싱 중 알 수 없는 오류가 발생했습니다.",
        };
      }
    }
  }
}
