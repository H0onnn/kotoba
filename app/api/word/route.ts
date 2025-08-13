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
당신은 일본어 어휘 학습 도우미입니다.
사용자가 입력한 단어가 일본어, 한국어, 영어, 히라가나, 가타카나 중 무엇이든 간에 반드시 아래 규칙에 따라 출력하세요.
**히라가나/가타카나만 주어진 경우 혹은 히라가나와 한자가 섞여있는 경우에도 해당 단어의 표준적인 일본어 표기(漢字 포함 가능)를 찾아서 word_jp에 작성하고, 올바른 요미가나를 yomigana에 작성하세요.**
모든 출력은 JSON 형식으로만 제공하세요. 불필요한 텍스트, 설명, 인사말 금지.
**모든 단어는 실제로 존재하는 단어만 제공하세요. 절대로 임의의 단어를 생성하지 마세요.**

## 요청 단어:
'${word}'

## 작성 규칙
1. **word_jp**: 해당 단어의 일본어 표준 표기 (가능하면 한자 포함).
2. **yomigana**: word_jp의 올바른 요미가나.
   - **중요**: 현대 일본어 표기법을 따르세요. 
   - づ/ず, ぢ/じ 구분 주의: 恥じ→はじ, 続く→つづく, 鼻血→はなぢ
3. **part_of_speech**: 품사 정보 (동사, 명사, 형용사, 부사, 조사, 접속사, 감탄사, 접두사, 접미사 등)
4. **meaning_kr**: 한국어로 간결하고 정확한 뜻.
5. **homonyms**: 발음(yomigana)이 동일하지만 다른 한자나 뜻을 가진 단어들 (존재할 경우에만, 최소 0개 ~ 최대 3개)
   - **중요**: 발음(yomigana)가 완전히 동일한 단어만 표기하세요. (降りる를 검색한 경우, 같은 おりる만 おる는 금지)
   - 각 항목: { "word_jp": "", "meaning_kr": "" }
   - 입력 단어와 관련 없는 뜻도 포함 가능 (발음이 동일한 경우만)
6. **synonyms**: 입력 단어와 뜻이 비슷하거나 관련 있는 일본어 단어 (최대 3개)
   - 각 항목: { "word_jp": "", "yomigana": "", "meaning_kr": "" }
7. **compound_word**: 입력 단어를 사용한 복합어 단어 (존재할 경우에만, 최소 0개 ~ 최대 3개)
    - 각 항목: { "word_jp": "", "yomigana": "", "meaning_kr": "" }
8. **examples**:
   - 총 2개 작성.
   - 반드시 요청 단어(word_jp)가 그대로 포함되어야 함.
   - 1개는 구어체, 1개는 문어체.
   - 속어, 번역투 금지.
9. **각 예문 데이터**
   - sentence_jp: 일본어 문장
   - yomigana: 모든 한자에 요미가나 추가 (현대 표준 발음 기준)
   - meaning_kr: 의미가 자연스러운 한국어 번역

## 출력 JSON 예시
{
  "word_jp": "心中",
  "yomigana": "しんじゅう",
  "part_of_speech": "명시",
  "meaning_kr": "정사, 함께 죽음, 운명을 함께함",
  "homonyms": [
    { "word_jp": "神獣", "meaning_kr": "길조로서 나타난다는 영묘한 동물(용・기린((麒麟)) 등)" }
    { "word_jp": "臣従", "meaning_kr": "신종; 신하로서 좇음" }
  ],
  "synonyms": [
    { "word_jp": "心中事件", "yomigana": "しんじゅうじけん", "meaning_kr": "동반 자살 사건" },
  ],
  "compound_word": [
    { "word_jp": "心中尽", "yomigana": "しんじゅうずく", "meaning_kr": "상대에 대한 신의·애정을 일관하다[끝까지 변치 않다]" },
    { "word_jp": "心中立て", "yomigana": "しんじゅうだて", "meaning_kr": "끝까지 남에 대한 의리·약속을 지킴" }
  ],
  "examples": [
    {
      "sentence_jp": "仕事と心中する",
      "yomigana": "しごととしんじゅうする",
      "meaning_kr": "일과 운명을 같이하다"
    },
    {
      "sentence_jp": "心中事件の報道は、多くの人々に衝撃を与えた。",
      "yomigana": "しんじゅうじけんのほうどうは、おおくのひとびとにしょうげきをあたえた。",
      "meaning_kr": "동반 자살 사건 보도는 많은 사람들에게 충격을 주었다."
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

    const text = response.text || "";
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
