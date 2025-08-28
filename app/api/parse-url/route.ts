import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { NhkHTMLParser, type ParsedContent } from "@/app/news/_utils";
import { SummarizedContent } from "@/app/news/_types";
import { type Summary, SummarySection, StructuredParagraph } from "@/app/news/_types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function summarizeContentChunks(
  structuredChunks: StructuredParagraph[][],
  basicInfo: { title: string; url: string; description?: string }
): Promise<SummarySection[]> {
  const chunkPrompts = structuredChunks.map(
    (chunk, index) => `
You are a professional news summary expert.
Summarize this specific chunk of a news article **ONLY in Korean**.  
The source text may be in Japanese, but you MUST translate and summarize into Korean.  
Do NOT output Japanese in the summary. If you use Japanese, it is considered invalid.  
This is chunk ${index + 1} of ${structuredChunks.length}.

Key Instructions:
- Create a concise summary for this chunk only
- Maintain the original paragraph order and IDs
- Use natural Korean writing style
- Return JSON format with sections array

### Output Structure (must be JSON):
{
  "sections": [
    {
      "title": "Section Title",
      "items": ["Key Point 1", "Key Point 2"],
      "relatedParagraphs": [
        {
          "id": 0,
          "preview": "First 50 chars of paragraph"
        }
      ]
    }
  ]
}

### Chunk Data:
Title: ${basicInfo.title}
URL: ${basicInfo.url}
Description: ${basicInfo.description || "None"}

Content to summarize:
${chunk
  .map(
    (p: StructuredParagraph) =>
      `[ID:${p.id}] ${p.type.toUpperCase()}: "${p.preview}" | ${p.text}`
  )
  .join("\n")}
`
  );

  const chunkPromises = chunkPrompts.map(async (prompt) => {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [prompt],
        config: {
          temperature: 0.0,
          topP: 0.1,
          responseMimeType: "application/json",
        },
      });

      const result = JSON.parse(response.text || '{"sections": []}');
      return result.sections || [];
    } catch (error) {
      console.error("Chunk summarization error:", error);
      return [];
    }
  });

  const results = await Promise.all(chunkPromises);
  return results.flat();
}

async function generateCoreSummary(
  title: string,
  allSections: SummarySection[]
): Promise<string> {
  const prompt = `
You are a professional news editor.
Based on the section summaries below, write a concise core summary of the entire article.  
The summary MUST be written in natural Korean.
Output should contain ONLY Korean text.

Title: ${title}

Section summaries:
${allSections
  .map((section) => `${section.title}: ${section.items?.join(", ") || ""}`)
  .join("\n")}

Return only the core summary text (no JSON, no formatting).
**Important: It must be written in Korean.**
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
      config: {
        temperature: 0.1,
        topP: 0.2,
      },
    });

    return response.text || "요약을 생성할 수 없습니다.";
  } catch (error) {
    console.error("Core summary error:", error);
    return "핵심 요약을 생성하는 중 오류가 발생했습니다.";
  }
}

async function summarizeContent(
  content: ParsedContent
): Promise<SummarizedContent> {
  try {
    if (!content.structuredText || content.structuredText.length === 0) {
      return {
        ...content,
        summary: {
          title: content.title || "제목 없음",
          coreSummary: "구조화된 텍스트가 없어 요약을 생성할 수 없습니다.",
          sections: [],
        },
      };
    }

    const sortedStructuredText = content.structuredText.sort(
      (a, b) => a.id - b.id
    );

    // 청크 크기를 동적으로 조정 (너무 작으면 오버헤드, 너무 크면 병렬화 효과 없음)
    const CHUNK_SIZE = Math.max(3, Math.ceil(sortedStructuredText.length / 4));
    const chunks = [];

    for (let i = 0; i < sortedStructuredText.length; i += CHUNK_SIZE) {
      chunks.push(sortedStructuredText.slice(i, i + CHUNK_SIZE));
    }

    const basicInfo = {
      title: content.title,
      url: content.url,
      description: content.metadata.description,
    };

    // 청크들을 병렬로 요약 처리
    const allSections = await summarizeContentChunks(chunks, basicInfo);

    // 섹션들이 완료된 후 핵심 요약 생성
    const finalCoreSummary = await generateCoreSummary(
      content.title,
      allSections
    );

    const structuredSummary: Summary = {
      title: content.title || "제목 없음",
      coreSummary: finalCoreSummary,
      sections: allSections,
    };

    return {
      ...content,
      summary: structuredSummary,
    };
  } catch (error) {
    console.error("AI summarization error:", error);
    return {
      ...content,
      summary: {
        title: "요약 생성 실패",
        coreSummary: "AI 요약을 생성하는 중 오류가 발생했습니다.",
        sections: [],
      },
    };
  }
}

async function summarizeFromUrl(
  url: string,
  timeout?: number
): Promise<SummarizedContent> {
  const content = await NhkHTMLParser.parseFromUrl(url, timeout);
  return summarizeContent(content);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, timeout, summarize = false } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (typeof url !== "string") {
      return NextResponse.json(
        { error: "URL must be a string" },
        { status: 400 }
      );
    }

    let result;
    if (summarize) {
      result = await summarizeFromUrl(url, timeout);
    } else {
      result = await NhkHTMLParser.parseFromUrl(url, timeout);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Parse URL error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        success: false,
      },
      { status: 500 }
    );
  }
}
