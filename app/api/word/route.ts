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
あなたは日本語の単語学習支援ツールです。  
ユーザーが入力した単語が日本語、韓国語、英語、ひらがな、カタカナのいずれであっても、必ず以下のルールに従って出力してください。
**ひらがな/カタカナのみが与えられた場合、またはひらがなと漢字が混在している場合でも、その単語の標準的な日本語表記（漢字を含む可能性あり）をword_jpに記入し、正しい読み仮名をyomiganaに記入してください。**
すべての出力はJSON形式のみで提供してください。不要なテキスト、説明、挨拶文は禁止です。
**すべての単語は実際に存在する単語のみを提供してください。絶対に任意の単語を生成しないでください。**

## リクエスト単語:
'${word}'

## 作成規則  
1. **word_jp**: 該当単語の日本語標準表記  
2. **yomigana**: word_jpの正しい読み仮名。
   - **重要**: 現代日本語の表記法に従ってください。  
   - づ/ず、ぢ/じの区別に注意：恥じ→はじ、続く→つづく、鼻血→はなぢ  
   - **カタカナの単語はカタカナのまま返してください。**
3. **part_of_speech**: 品詞情報（動詞、名詞、形容詞、副詞、助詞、接続詞、感嘆詞、接頭辞、接尾辞など）**必ず韓国語で返却**
4. **meaning_kr**: 韓国語で簡潔かつ正確な意味。
5. **homonyms**: 検索した単語と読み仮名が完全に一致するが、異なる漢字や意味を持つ単語（最大3つ）  
   - **重要**: 検索した単語と読み仮名が完全に一致する単語のみを記載してください。（"降りる"を検索した場合、"おりる"のみを記載し、"おる"は禁止）
   - 各項目: { "word_jp": "", "meaning_kr": "" }  
   - 入力単語と無関係な意味も含まれる可能性あり（発音が同じ場合のみ）  
   - **意味的に類似または一部の発音のみが似ている単語は絶対に含めない**  
   - homonymsがない場合は空の配列[]を返す
6. **synonyms**: 入力単語と意味が似ているか関連する日本語の単語（最大3つ）  
   - 各項目: { "word_jp": "", "yomigana": "", 『meaning_kr』: "" }
7. **compounds**: 入力単語を使用した複合語（存在する場合のみ、最小0個～最大3個）  
    - 各項目: { "word_jp": "", "yomigana": "", 『meaning_kr』: "" }
8. **examples**:
   - 総計2件作成。
   - 必ずリクエスト単語（word_jp）がそのまま含まれていなければならない。
   - 1件は口語体、1件は文語体。
   - 俗語、翻訳調は禁止。
9. **example_words**:
   - 提供された例文の中から"検索語を除く"主要な単語を原形のまま入力します。**（形態素解析を模倣し、名詞・動詞・形容詞など意味のある単語のみを抽出）**
   - **提供された例文内のすべての単語を抽出する。ただし、重複する単語は1回のみ抽出**  
   - 検索語（word_jp）は絶対に含めないでください。  
   - **助詞、助動詞、感嘆詞、接続詞、修飾語（副詞）は除外してください。（例：は、を、に、が、する、だろうなど）**
   - 名詞、動詞、形容詞、形容動詞のみを含む。  
   - すべての項目は原形（辞書形）で表記。  
   - 各項目：{ "word_jp": "最新", "yomigana": "さいしん" }
10. **各例文データ作成ルール**  
   - sentence_jp：日本語原文 （漢字を含む可）  
   - yomigana:  
     - **重要**：絶対に漢字、数字、ローマ字、特殊記号を含まないこと  
     - **必ずカタカナの単語はカタカナのまま返却**  
     - **正しい発音で作成されているか必ず確認すること**
     - 正しい現代標準発音のみで作成。
     - 単語と単語の間にスペースを挿入禁止。
     - 例: sentence_jp: "万博の開催は、地域経済の活性化に大きく貢献するだろう。"  
       → yomigana: "ばんぱくのかいさいは、ちいきけいざいのかっせいかにおおきくこうけんするだろう。"
   - meaning_kr: 意味が自然な韓国語翻訳

※ 重要: 出力 JSONの各項目は必ず規則を守らなければならず、一つでも違反した場合、全体が出力無効となります。  
規則違反の場合、無効なJSONを出力せず、すべての条件を満たすJSONを再作成してください。

- 読み仮名項目:  
  1. 許可文字: ひらがな、カタカナ、ー（長音）  
  2. 絶対禁止: 漢字、ローマ字、特殊記号  
  3. カタカナ語は必ずカタカナのまま維持すること

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
