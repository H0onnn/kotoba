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
    
    ## 요청 단어:
    '${word}'
    
    ## 작성 규칙
    1. **word_jp**: 해당 단어의 일본어 표준 표기 (가능하면 한자 포함).
    2. **yomigana**: word_jp의 올바른 요미가나.
       - **중요**: 현대 일본어 표기법을 따르세요. 
       - づ/ず, ぢ/じ 구분 주의: 恥じ→はじ (はぢ 아님), 続く→つづく, 鼻血→はなぢ
       - 역사적 가나 표기가 아닌 현대 표준 발음에 맞는 히라가나 사용
    3. **part_of_speech**: 품사 정보 (동사, 명사, 형용사, 부사, 조사, 접속사, 감탄사, 접두사, 접미사 등)
    4. **meaning_kr**: 한국어로 간결하고 정확한 뜻.
    5. **examples**:
       - 총 2개 작성.
       - 반드시 요청 단어(word_jp)가 그대로 포함되어야 함.
       - 1개는 구어체, 1개는 문어체.
       - 속어, 번역투 금지.
    6. **각 예문 데이터**
       - sentence_jp: 일본어 문장
       - yomigana: 모든 한자에 요미가나 추가 (현대 표준 발음 기준)
       - meaning_kr: 의미가 자연스러운 한국어 번역
    
    ## 요미가나 검증
    답변하기 전 모든 요미가나가 현대 일본어 표준 발음과 일치하는지 확인하세요.
    
    ## 출력 JSON 예시
    {
      "word_jp": "恥じる",
      "yomigana": "はじる",
      "part_of_speech": "동사",
      "meaning_kr": "부끄러워하다, 수치스럽게 여기다",
      "examples": [
        {
          "sentence_jp": "自分の無知を恥じることなく、彼は質問した。",
          "yomigana": "じぶんのむちをはじることなく、かれはしつもんした。",
          "meaning_kr": "자신의 무지를 부끄러워하지 않고 그는 질문했다."
        },
        {
          "sentence_jp": "彼は過去の過ちを深く恥じていた。",
          "yomigana": "かれはかこのあやまちをふかくはじていた。",
          "meaning_kr": "그는 과거의 잘못을 깊이 부끄러워하고 있었다."
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
