import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word || !word.trim()) {
      return NextResponse.json(
        { error: "단어를 입력하세요." },
        { status: 400 }
      );
    }

    const prompt = `
    You are a Japanese vocabulary learning support tool.  
    Regardless of whether the word entered by the user is in Japanese, Korean, English, hiragana, or katakana, please output the word according to the following rules.
    **If only hiragana/katakana is given, or if hiragana and kanji are mixed, please enter the standard Japanese spelling of the word (which may include kanji) in word_jp and the correct reading in yomigana. **
    All output must be provided in JSON format only. Unnecessary text, explanations, and greetings are prohibited.
    ** Only provide words that actually exist. Do not generate arbitrary words under any circumstances.**
    
    ## Request word:
    '${word}'
    
    ## Creation Rules
    1. **word_jp**: Standard Japanese spelling of the word
    2. **yomigana**: Correct reading of word_jp.
       - Must follow modern Japanese spelling rules.  
       - Pay attention to づ/ず and ぢ/じ: 恥じ → はじ, 続く → つづく, 鼻血 → はなぢ  
       - Katakana words must stay in katakana.  
    3. **part_of_speech**: Part of speech information (verb, noun, adjective, adverb, particle, conjunction, interjection, prefix, suffix, etc.) — **written in Korean**.
    4. **meaning_kr**: Provide a concise, accurate Korean meaning.  
       - **Must be natural Korean (avoid stiff or dictionary-like expressions).**  
       - Use expressions that would appear in a real Korean dictionary or newspaper, not translationese.
       - **Use commas (,) to separate multiple meanings, but avoid other punctuation marks (periods, semicolons, etc.).**
       - Keep it simple and clean without unnecessary special characters.  
    5. **homonyms**: Words with the same reading but different kanji/meanings (up to 3).  
       - Each: { "word_jp": "", "meaning_kr": "" }  
       - meaning_kr can use commas for multiple meanings, but avoid other punctuation marks.
       - If none, return an empty array [].  
    6. **synonyms**: Similar or related Japanese words (up to 3).  
       - Each: { "word_jp": "", "yomigana": "", "meaning_kr": "" }
       - meaning_kr can use commas for multiple meanings, but avoid other punctuation marks.
    7. **compounds**: Compound words using the input word (0–3).  
       - Each: { "word_jp": "", "yomigana": "", "meaning_kr": "" }
       - meaning_kr can use commas for multiple meanings, but avoid other punctuation marks.  
    8. **examples**: Two example sentences.  
       - Both must include word_jp as-is.  
       - One should be colloquial, one formal.  
       - **Important:**  
         - Must sound like natural Korean when translated (no literal or stiff phrasing).  
         - Avoid slang and overly textbook-style.  
         - Example sentences should be contextually realistic (daily life, news, conversation, writing).  
         - **Korean translation must be completely natural and fluent, as if written by a native Korean speaker.**
         - **Avoid direct word-order translation. Use natural Korean sentence structure and expressions.**
         - **Examples: '今年の夏の暑さは格別だ' → '올여름은 특히 덥다' (not '올여름 더위는 특별하다')**
       - Each example requires:  
         - sentence_jp: Japanese sentence  
         - meaning_kr: Completely natural Korean translation (rewrite for natural flow, not word-for-word)  
         - highlight_word: word_jp itself  
         - example_words: Extracted meaningful words (see below)  
    9. **example_words**:  
       - Extract ALL meaningful words from both example sentences except the search term itself.  
       - Include: nouns, verbs, adjectives, adjectival verbs, adverbs, numerals, and any other content words.
       - Exclude: particles (は、が、を、に、で、と, etc.), auxiliary verbs, conjunctions, interjections.  
       - Keep duplicates only once.  
       - Each: { "word_jp": "", "yomigana": "" }  
    10. **highlight_word**: The searched word itself, for highlighting.  
    11. **General Style Rules**:  
       - All Korean outputs (meanings, translations) must be **natural, fluent Korean** suitable for a native Korean dictionary or article.  
       - Never use awkward literal translations.  
       - Always ensure readability and flow over word-for-word accuracy.  
    
    *Important: If any rule is violated, recreate valid JSON. Only output JSON. Nothing else.*

    ## example JSON
{
    "word_jp": "更新",
    "yomigana": "こうしん",
    "part_of_speech": "명사",
    "meaning_kr": "갱신, 최신화",
    "homonyms": [
        {
            "word_jp": "行進",
            "meaning_kr": "행진"
        },
        {
            "word_jp": "功臣",
            "meaning_kr": "공신"
        }
    ],
    "synonyms": [
        {
            "word_jp": "改訂",
            "yomigana": "かいてい",
            "meaning_kr": "개정, 수정"
        },
        {
            "word_jp": "刷新",
            "yomigana": "さっしん",
            "meaning_kr": "쇄신, 일신"
        }
    ],
    "compounds": [
        {
            "word_jp": "更新料",
            "yomigana": "こうしんりょう",
            "meaning_kr": "갱신료"
        },
        {
            "word_jp": "更新手続き",
            "yomigana": "こうしんてつづき",
            "meaning_kr": "갱신 절차"
        }
    ],
    "examples": [
        {
            "sentence_jp": "パスワードを定期的に更新してください。",
            "meaning_kr": "비밀번호를 정기적으로 갱신해 주세요.",
            "highlight_word": "更新",
            "example_words": [
                {
                    "word_jp": "パスワード",
                    "yomigana": "ぱすわーど"
                },
                {
                    "word_jp": "定期的",
                    "yomigana": "ていきてき"
                },
                {
                    "word_jp": "更新",
                    "yomigana": "こうしん"
                },
                {
                    "word_jp": "する",
                    "yomigana": "する"
                }
            ]
        },
        {
            "sentence_jp": "最新の情報をウェブサイトで更新した。",
            "meaning_kr": "최신 정보를 웹사이트에서 업데이트했다.",
            "highlight_word": "更新",
            "example_words": [
                {
                    "word_jp": "最新",
                    "yomigana": "さいしん"
                },
                {
                    "word_jp": "情報",
                    "yomigana": "じょうほう"
                },
                {
                    "word_jp": "ウェブサイト",
                    "yomigana": "うぇぶさいと"
                },
                {
                    "word_jp": "更新",
                    "yomigana": "こうしん"
                }
            ]
        }
    ]
}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 0.0,
        topP: 0.1,
        responseMimeType: "application/json",
      },
    });

    const text = response.text ?? "";
    const cleanedText = text
      .replace(/^```json\n?/, "")
      .replace(/\n?```$/, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch {
      return NextResponse.json(
        { error: "AI 응답 파싱 실패", raw: text },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Gemini API 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
