import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { NhkHTMLParser, type ParsedContent } from "@/app/news/_utils";
import { SummarizedContent } from "@/app/news/_types";
import { type Summary } from "@/app/news/_types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function summarizeContent(
  content: ParsedContent
): Promise<SummarizedContent> {
  try {
    const prompt = `
You are a professional news summary expert.  
Your task is to extract and write **only the essential news summary** in fluent Korean, not a full translation.  
The writing style should be clear and natural, like a Korean news article written by a journalist.  

Key Instructions:
- Focus only on the **core message and most relevant details** from the article.  
- Do not translate or rewrite the full article. Summarize concisely.  
- Use Markdown formatting for readability (headings, bullet points).  
- Keep the provided JSON structure exactly as defined.  
- Ensure each section is short, structured, and easy to read.  
- Do not add or infer information beyond the article.
- **CRITICAL: Create sections in the SAME ORDER as they appear in the original text. Do not reorganize by importance or topic - maintain the original flow and sequence of the article.**

### Output Structure (must be JSON):
{
  "title": "Article Title (in natural Korean)",
  "coreSummary": "Summarize the core content of the article in 1-2 paragraphs",
  "sections": [
    {
      "title": "Section Title",
      "items": ["Key Point 1", "Key Point 2", "..."],
      "relatedParagraphs": [
        {
          "id": 0,
          "preview": "First 50 chars of paragraph"
        }
      ]
    }
  ]
}

Important: 
1. For each section, include "relatedParagraphs" array with objects containing both paragraph ID and preview text. 
2. Match the preview text with the structured content provided below to ensure accurate mapping.
3. **MAINTAIN THE ORIGINAL ORDER**: Process the structured content sequentially from ID 0 to the highest ID, creating sections that follow the natural flow of the article. Do not reorder sections by importance or theme.

### Provided Data:
Title: ${content.title}  
URL: ${content.url}  
Description: ${content.metadata.description || "None"}  

Structured Content (ORDERED BY APPEARANCE - Process sequentially from ID 0):
${
  content.structuredText
    ? content.structuredText
        .sort((a, b) => a.id - b.id) // 원문과의 순서 보장
        .map(
          (p) =>
            `[ID:${p.id}] ${p.type.toUpperCase()}: "${p.preview}" | ${p.text}`
        )
        .join("\n")
    : "No structured content available"
}

**INSTRUCTION: Create summary sections following the exact order of IDs above (0, 1, 2, 3...). Each summary section should reference paragraphs in sequential order, not by importance.**

Main Content Body:  
${content.text}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [prompt],
      config: {
        temperature: 0.0,
        topP: 0.1,
        responseMimeType: "application/json",
      },
    });

    const summaryText = response.text || "요약을 생성할 수 없습니다.";

    let structuredSummary: Summary;
    try {
      const parsed = JSON.parse(summaryText);
      if (parsed.title && parsed.coreSummary && parsed.sections) {
        structuredSummary = parsed;
      } else {
        throw new Error("Invalid structure");
      }
    } catch (error) {
      console.log("Failed to parse summary as structured JSON, using fallback");
      structuredSummary = {
        title: content.title || "제목 없음",
        coreSummary: summaryText,
        sections: [],
      };
    }

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

async function summarizeFromUrl(url: string): Promise<SummarizedContent> {
  const content = await NhkHTMLParser.parseFromUrl(url);
  return summarizeContent(content);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, timeout = 10000, summarize = false } = body;

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
      result = await summarizeFromUrl(url);
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
