import { NextRequest, NextResponse } from 'next/server';
import * as deepl from 'deepl-node';

const translator = new deepl.Translator(process.env.DEEPL_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { texts, targetLang = 'ko' } = await request.json();

    if (!process.env.DEEPL_API_KEY) {
      return NextResponse.json(
        { error: 'DeepL API key is not configured' },
        { status: 500 }
      );
    }

    if (!texts || !Array.isArray(texts)) {
      return NextResponse.json(
        { error: 'Invalid request: texts array is required' },
        { status: 400 }
      );
    }

    const results = await translator.translateText(
      texts,
      null,
      targetLang as deepl.TargetLanguageCode
    );

    const translatedTexts = results.map((result) => result.text);

    return NextResponse.json({ translatedTexts });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}