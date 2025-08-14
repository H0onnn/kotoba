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

    const userPrompt = `
      ## 요청 단어:
      '${word}'
    `;

    const systemPrompt = `
당신은 일본어 어휘 학습 도우미입니다.
사용자가 입력한 단어가 일본어, 한국어, 영어, 히라가나, 가타카나 중 무엇이든 간에 반드시 아래 규칙에 따라 출력하세요.
**히라가나/가타카나만 주어진 경우 혹은 히라가나와 한자가 섞여있는 경우에도 해당 단어의 표준적인 일본어 표기(漢字 포함 가능)를 찾아서 word_jp에 작성하고, 올바른 요미가나를 yomigana에 작성하세요.**
모든 출력은 JSON 형식으로만 제공하세요. 불필요한 텍스트, 설명, 인사말 금지.
**모든 단어는 실제로 존재하는 단어만 제공하세요. 절대로 임의의 단어를 생성하지 마세요.**

## 작성 규칙
1. **word_jp**: 해당 단어의 일본어 표준 표기 (가능하면 한자 포함).
2. **yomigana**: word_jp의 올바른 요미가나.
   - **중요**: 현대 일본어 표기법을 따르세요. 
   - づ/ず, ぢ/じ 구분 주의: 恥じ→はじ, 続く→つづく, 鼻血→はなぢ
   - **가타카나 단어는 가타카나 그대로 반환하세요.**
3. **part_of_speech**: 품사 정보 (동사, 명사, 형용사, 부사, 조사, 접속사, 감탄사, 접두사, 접미사 등) **반드시 한국어로 반환**
4. **meaning_kr**: 한국어로 간결하고 정확한 뜻.
5. **homonyms**: 검색한 단어와 yomigana가 완전히 동일하지만 다른 한자나 뜻을 가진 단어들 (최대 3개)
   - **중요**: 검색한 단어와 yomigana가 완전히 동일한 단어만 표기하세요. (降りる를 검색한 경우, 같은 おりる만 おる는 금지)
   - 각 항목: { "word_jp": "", "meaning_kr": "" }
   - 입력 단어와 관련 없는 뜻도 포함 가능 (발음이 동일한 경우만)
   - **의미적으로 유사하거나 일부 발음만 비슷한 단어는 절대 포함금지**
   - homonyms가 없으면 빈 배열 []을 반환
6. **synonyms**: 입력 단어와 뜻이 비슷하거나 관련 있는 일본어 단어 (최대 3개)
   - 각 항목: { "word_jp": "", "yomigana": "", "meaning_kr": "" }
7. **compounds**: 입력 단어를 사용한 복합어 단어 (존재할 경우에만, 최소 0개 ~ 최대 3개)
    - 각 항목: { "word_jp": "", "yomigana": "", "meaning_kr": "" }
8. **examples**:
   - 총 2개 작성.
   - 반드시 요청 단어(word_jp)가 그대로 포함되어야 함.
   - 1개는 구어체, 1개는 문어체.
   - 속어, 번역투 금지.
9. **example_words**:
   - 제공된 예문 속에서 '검색어를 제외한' 주요 단어를 원형 형태로 넣습니다. **(형태소 분석을 흉내내서 명사·동사·형용사 등 의미 있는 단어만 추출)**
   - **제공된 예문에 있는 모든 단어를 추출할 것 단, 중복된 단어는 한 번만 추출**
   - 검색어(word_jp)는 절대 포함하지 마세요.
   - **조사, 조동사, 감탄사, 접속사, 수식어(부사)는 제외하세요. (예: は, を, に, が, する, だろう 등)**
   - 명사, 동사, 형용사, 형용동사만 포함.
   - 모든 항목은 원형(사전형)으로 표기.
   - 각 항목: { "word_jp": "最新", "yomigana": "さいしん" }
10. **각 예문 데이터 작성 규칙**
   - sentence_jp: 일본어 원문 (한자 포함 가능)
   - yomigana:  
     - **중요**: 절대로 한자, 숫자, 로마자, 특수기호 포함 금지, 가타카나 단어는 가타카나 그대로 반환
     - **올바른 발음으로 작성되었는지 반드시 확인할 것**
     - 올바른 현대 표준 발음으로만 작성.
     - 단어와 단어 사이에 띄어쓰기 금지.
     - 예: sentence_jp: "万博の開催は、地域経済の活性化に大きく貢献するだろう。"  
       → yomigana: "ばんぱくのかいさいは、ちいきけいざいのかっせいかにおおきくこうけんするだろう。"
   - meaning_kr: 의미가 자연스러운 한국어 번역

## 출력 JSON 예시
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
            "yomigana": "パスワードをていきてきにこうしんしてください。",
            "meaning_kr": "비밀번호를 정기적으로 갱신해 주세요.",
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
            "yomigana": "さいしんのじょうほうをウェブサイトでこうしんした。",
            "meaning_kr": "최신 정보를 웹사이트에서 업데이트했다.",
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

    const messages = [
      {
        role: "system",
        content: systemPrompt,
        cache: true,
      },
      {
        role: "user",
        content: userPrompt,
      },
    ];

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: messages,
        config: {
          // temperature: 0.0,
          // topP: 0.1,
          responseMimeType: "application/json",
        },
      });
    } catch (error: any) {
      console.warn("캐시된 요청 실패, 일반 요청으로 재시도:", error.message);

      const fallbackPrompt = `${systemPrompt}\n\n${userPrompt}`;
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: fallbackPrompt,
        config: {
          responseMimeType: "application/json",
        },
      });
    }

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
