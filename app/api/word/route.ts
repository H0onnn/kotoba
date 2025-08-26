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
- **Important**: Please follow modern Japanese spelling rules.  
   - Note the distinction between づ/ず and ぢ/じ: 恥じ → はじ, 続く → つづく, 鼻血 → はなぢ  
   - **Please return katakana words as katakana.**
3. **part_of_speech**: Part of speech information (verb, noun, adjective, adverb, particle, conjunction, interjection, prefix, suffix, etc.) **Must be returned in Korean**
4. **meaning_kr**: Concise and accurate meaning in Korean.
5. **homonyms**: 
   - **Important**: **Words that have the same reading as the searched word but different kanji or meanings (up to 3 words). (If you search for “降りる,” only list ‘おりる’ and do not list “おる.”)**
   - Each item: { “word_jp”: “”, ‘meaning_kr’: “” }  
   - May include meanings unrelated to the input word (only if the pronunciation is the same)  
   - **Do not include words that are similar in meaning or have only a similar pronunciation**  
   - If there are no homonyms, return an empty array [].
6. **synonyms**: Japanese words with similar or related meanings to the input word (up to 3 words)  
   - Each item: { “word_jp”: “”, “yomigana”: ‘’, 『meaning_kr』: “” }
7. **compounds**: Compound words using the input word (if any, minimum 0 to maximum 3)  
    - Each item: { “word_jp”: “”, “yomigana”: ‘’, 『meaning_kr』: “” }
8. **examples**:
   - Create a total of 2 items.
   - The requested word (word_jp) must be included as is.
   - One example should be colloquial, and one should be formal.
   - Slang and translation-style language are prohibited.
9. **example_words**:
   - Enter the main words from the provided example sentences in their original form, excluding the search term. **(Imitate morphological analysis and extract only meaningful words such as nouns, verbs, and adjectives.)**
- **Extract all words from the provided example sentences. However, duplicate words should only be extracted once.**  
- Do not include the search term (word_jp) under any circumstances.  
   - **Exclude particles, auxiliary verbs, interjections, conjunctions, and modifiers (adverbs). (Examples: は, を, に, が, する, だろう, etc.)**
   - Include only nouns, verbs, adjectives, and adjectival verbs.  
   - All items should be written in their original form (dictionary form).  
   - Each item: { “word_jp”: “最新”, ‘yomigana’: “さいしん” }
10. **highlight_word**:
   - Word extraction for highlighting search terms in example sentences
   - **Extract words such as nouns, verbs, and adjectives through morphological analysis of the searched words or search terms.**
   - **In cases such as “Please go up,” extract up to “go up.”**
11. **Rules for creating each example sentence data**  
   - sentence_jp: Japanese original text (kanji characters are acceptable) 
   - meaning_kr: Natural Korean translation of the meaning

* Important: Each item in the output JSON must comply with the rules, and if even one item violates the rules, the entire output will be invalid.  
If there is a violation of the rules, do not output invalid JSON, but recreate JSON that meets all conditions.

- Furigana field:  
  1. Permitted characters: Hiragana, Katakana, ー (long vowel)  
  2. Absolutely prohibited: Kanji, Roman letters, special symbols  
  3. Katakana words must be kept in Katakana.

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
