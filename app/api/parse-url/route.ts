import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

import { NhkHTMLParser, type ParsedContent } from '@/app/news/_utils';
import { SummarySection, StructuredParagraph } from '@/app/news/_types';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function* summarizeContentChunksStream(
  structuredChunks: StructuredParagraph[][],
  basicInfo: { title: string; url: string; description?: string },
): AsyncGenerator<SummarySection[], void, unknown> {
  const chunkPrompts = structuredChunks.map(
    (chunk, index) => `
You are a professional news summary expert.
Summarize this specific chunk of a news article **ONLY in Korean**.  
**The source text may be in Japanese, but you MUST translate and summarize into Korean.**  
**Do NOT output Japanese in the summary. If you use Japanese, it is considered invalid.**
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
Description: ${basicInfo.description || 'None'}

Content to summarize:
${chunk.map((p: StructuredParagraph) => `[ID:${p.id}] ${p.type.toUpperCase()}: "${p.preview}" | ${p.text}`).join('\n')}
`,
  );

  for (const prompt of chunkPrompts) {
    try {
      const response = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [prompt],
        config: {
          temperature: 0.0,
          topP: 0.1,
          responseMimeType: 'application/json',
        },
      });

      let accumulatedText = '';

      for await (const chunk of response) {
        accumulatedText += chunk.text || '';
      }

      const result = JSON.parse(accumulatedText || '{"sections": []}');

      yield result.sections || [];
    } catch (error) {
      console.error('Chunk summarization error:', error);
      yield [];
    }
  }
}

async function* generateCoreSummaryStream(
  title: string,
  allSections: SummarySection[],
): AsyncGenerator<string, void, unknown> {
  const prompt = `
You are a professional news editor.
Based on the section summaries below, write a concise core summary of the entire article.  
**The summary MUST be written in natural Korean.**
**Output should contain ONLY Korean text.**

Title: ${title}

Section summaries:
${allSections.map((section) => `${section.title}: ${section.items?.join(', ') || ''}`).join('\n')}

Return only the core summary text (no JSON, no formatting).
**Important: It must be written in Korean.**
`;

  try {
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: [prompt],
      config: {
        temperature: 0.0,
        topP: 0.1,
      },
    });

    for await (const chunk of response) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error('Core summary error:', error);
    yield '핵심 요약을 생성하는 중 오류가 발생했습니다.';
  }
}

async function* summarizeContentStream(
  content: ParsedContent,
): AsyncGenerator<{ type: 'sections' | 'coreSummary' | 'complete'; data: any; error?: string }, void, unknown> {
  try {
    if (!content.structuredText || content.structuredText.length === 0) {
      yield {
        type: 'complete',
        data: {
          ...content,
          summary: {
            title: content.title || '제목 없음',
            coreSummary: '구조화된 텍스트가 없어 요약을 생성할 수 없습니다.',
            sections: [],
          },
        },
      };

      return;
    }

    const sortedStructuredText = content.structuredText.sort((a, b) => a.id - b.id);

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

    const allSections: SummarySection[] = [];

    for await (const sections of summarizeContentChunksStream(chunks, basicInfo)) {
      allSections.push(...sections);
      yield {
        type: 'sections',
        data: sections,
      };
    }

    let coreSummaryText = '';

    for await (const chunk of generateCoreSummaryStream(content.title, allSections)) {
      coreSummaryText += chunk;
      yield {
        type: 'coreSummary',
        data: chunk,
      };
    }

    yield {
      type: 'complete',
      data: {
        ...content,
        summary: {
          title: content.title || '제목 없음',
          coreSummary: coreSummaryText,
          sections: allSections,
        },
      },
    };
  } catch (error) {
    console.error('AI summarization error:', error);
    yield {
      type: 'complete',
      data: {
        ...content,
        summary: {
          title: '요약 생성 실패',
          coreSummary: 'AI 요약을 생성하는 중 오류가 발생했습니다.',
          sections: [],
        },
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function* parseContentStream(url: string, timeout?: number): AsyncGenerator<ParsedContent, void, unknown> {
  const content = await NhkHTMLParser.parseFromUrl(url, timeout);

  yield content;
}

async function* summarizeFromUrlStream(
  url: string,
  timeout?: number,
): AsyncGenerator<
  {
    type: 'metadata' | 'sections' | 'coreSummary' | 'complete';
    data: any;
    error?: string;
  },
  void,
  unknown
> {
  for await (const content of parseContentStream(url, timeout)) {
    // 제목, 요약, 키워드
    yield {
      type: 'metadata',
      data: {
        title: content.title,
        metadata: content.metadata,
      },
    };

    // ai 요약
    for await (const result of summarizeContentStream(content)) {
      yield result;
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, timeout, summarize = false } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    if (typeof url !== 'string') {
      return NextResponse.json({ error: 'URL must be a string' }, { status: 400 });
    }

    // Handle summarization with streaming
    if (summarize) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const result of summarizeFromUrlStream(url, timeout)) {
              const chunk = encoder.encode(`data: ${JSON.stringify(result)}\n\n`);

              controller.enqueue(chunk);
            }
            controller.close();
          } catch (error) {
            console.error('Streaming error:', error);
            const errorChunk = encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
              })}\n\n`,
            );

            controller.enqueue(errorChunk);
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // Handle URL parsing streaming (default)
    {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'html',
                  data: { message: 'URL에서 HTML 가져오는 중...' },
                  progress: 10,
                })}\n\n`,
              ),
            );

            const result = await NhkHTMLParser.parseFromUrl(url, timeout);

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'metadata',
                  data: {
                    title: result.title,
                    metadata: result.metadata,
                  },
                  progress: 40,
                })}\n\n`,
              ),
            );

            if (result.structuredText && result.structuredText.length > 0) {
              const chunkSize = Math.max(1, Math.ceil(result.structuredText.length / 3));

              for (let i = 0; i < result.structuredText.length; i += chunkSize) {
                const chunk = result.structuredText.slice(i, i + chunkSize);
                const progress = 40 + ((i + chunkSize) / result.structuredText.length) * 50;

                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      type: 'paragraphs',
                      data: chunk,
                      progress: Math.min(90, progress),
                    })}\n\n`,
                  ),
                );

                await new Promise((resolve) => setTimeout(resolve, 100));
              }
            }

            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'complete',
                  data: result,
                  progress: 100,
                })}\n\n`,
              ),
            );

            controller.close();
          } catch (error) {
            console.error('URL parsing streaming error:', error);
            const errorChunk = encoder.encode(
              `data: ${JSON.stringify({
                type: 'error',
                error: error instanceof Error ? error.message : 'URL 파싱 중 오류가 발생했습니다.',
              })}\n\n`,
            );

            controller.enqueue(errorChunk);
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }
  } catch (error) {
    console.error('Parse URL error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false,
      },
      { status: 500 },
    );
  }
}
