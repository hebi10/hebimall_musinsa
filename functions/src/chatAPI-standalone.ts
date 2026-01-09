import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import fetch from "node-fetch";

/**
 * Secret 정의 (선언만, 접근은 요청 시점에만)
 */
const openaiApiKey = defineSecret("OPENAI_API_KEY");

/**
 * 요청 인터페이스
 */
interface ChatRequest {
  message: string;
  useAI?: boolean;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

/**
 * Chat API (Standalone)
 */
export const chatAPIStandalone = onRequest(
  {
    cors: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://hebimall.firebaseapp.com",
      "https://hebimall.web.app",
    ],
    region: "us-central1",
    secrets: [openaiApiKey],
  },
  async (req, res) => {
    // CORS
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      const {
        message,
        useAI = false,
        conversationHistory = [],
      }: ChatRequest = req.body ?? {};

      // 메시지 검증
      if (!message || !message.trim()) {
        res.status(400).json({
          response: "메시지를 입력해 주세요.",
        });
        return;
      }

      /**
       * 1️⃣ AI 사용 안 함 → 즉시 fallback
       */
      if (!useAI) {
        res.json({
          response: getTemporaryResponse(message),
        });
        return;
      }

      /**
       * 2️⃣ Secret 안전 접근 (실패해도 throw 금지)
       */
      let apiKey: string | undefined;
      try {
        apiKey = openaiApiKey.value();
      } catch (e) {
        console.error("❌ Secret Manager 접근 실패", e);
      }

      if (!apiKey) {
        res.json({
          response: getTemporaryResponse(message),
        });
        return;
      }

      /**
       * 3️⃣ OpenAI 호출 (실패해도 서버는 살아야 함)
       */
      const systemPrompt = `
당신은 STYNA 온라인 패션 쇼핑몰의 전문 고객지원 AI입니다.

- 주문/배송
- 반품/교환
- 쿠폰/포인트
- 결제/회원 정보

고객에게 친절하고 정확하게 답변하세요.
      `.trim();

      let aiResponse: string | null = null;

      try {
        const response = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-3.5-turbo",
              messages: [
                { role: "system", content: systemPrompt },
                ...conversationHistory.slice(-10),
                { role: "user", content: message },
              ],
              max_tokens: 500,
              temperature: 0.7,
            }),
          }
        );

        if (!response.ok) {
          console.error(
            "❌ OpenAI HTTP Error:",
            response.status,
            response.statusText
          );
        } else {
          const data: any = await response.json();
          aiResponse =
            data?.choices?.[0]?.message?.content?.trim() ?? null;
        }
      } catch (e) {
        console.error("❌ OpenAI 호출 실패", e);
      }

      /**
       * 4️⃣ 최종 응답 (AI 실패해도 fallback)
       */
      res.json({
        response: aiResponse ?? getTemporaryResponse(message),
      });
    } catch (e) {
      /**
       * 🚨 절대 서버 크래시 금지
       */
      console.error("❌ Chat API Fatal Error", e);

      res.json({
        response: getTemporaryResponse(""),
      });
    }
  }
);

/**
 * Fallback 응답 (절대 실패하지 않음)
 */
function getTemporaryResponse(message: string): string {
  const text = message.toLowerCase();

  if (text.includes("상담원")) {
    return "상담원 연결을 준비 중입니다. 잠시만 기다려 주세요.";
  }

  if (
    text.includes("안녕") ||
    text.includes("문의") ||
    message.length < 10
  ) {
    return `
안녕하세요! STYNA 고객지원입니다 😊

아래 번호를 선택해 주세요.

1️⃣ 주문/배송
2️⃣ 반품/교환
3️⃣ 쿠폰/할인
4️⃣ 결제/회원

🤖 상담원연결
    `.trim();
  }

  return `
문의해 주셔서 감사합니다.

아래 중 선택해 주세요.
1️⃣ 주문/배송
2️⃣ 반품/교환
3️⃣ 쿠폰/할인
4️⃣ 결제/회원

📞 고객센터: 1588-0000
  `.trim();
}
