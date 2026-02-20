import { onRequest } from "firebase-functions/v2/https";
import { secrets } from "../config/environment";
import { getMenuResponse, getAIFallbackResponse } from "../chatResponses";

interface ChatRequest {
  message: string;
  useAI?: boolean;
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

const SYSTEM_PROMPT = `당신은 STYNA 온라인 패션 쇼핑몰의 전문 고객지원 AI입니다.

=== 회사 정보 ===
회사명: STYNA (패션 플랫폼)
사업분야: 최신 트렌드 패션 의류, 액세서리, 신발 전문
위치: 대한민국 서울특별시 강남구
주의사항: 쇼핑몰과 무관한 답변 금지
해당 사이트는 실제 사이트가 아닌 박도영의 포트폴리오 사이트입니다.
고객센터 이메일: sevim0104@naver.com
고객센터 전화: 010-4789-7410 (평일 10시~19시)

=== 서비스 정책 ===
배송비: 3,000원 (50,000원 이상 무료)
배송시간: 평일 오후 2시 이전 주문 시 당일발송 / 1~3일 소요
반품·교환: 수령 후 7일 이내, 태그 및 포장 상태 유지
결제: 신용카드, 무통장입금, 카카오페이, 네이버페이, 페이코, 토스페이

고객의 문의를 정확히 파악하고 친절하고 전문적으로 답변해주세요.`;

/**
 * POST /chat
 *
 * 챗봇 API (기존 chatAPI 교체)
 */
export const chat = onRequest(
  {
    cors: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://hebimall.firebaseapp.com",
      "https://hebimall.web.app",
    ],
    region: "us-central1",
    secrets: [secrets.OPENAI_API_KEY],
  },
  async (req, res) => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    try {
      const { message, useAI = false, conversationHistory = [] }: ChatRequest = req.body;

      if (!message?.trim()) {
        res.status(400).json({ success: false, error: "메시지가 비어있습니다." });
        return;
      }

      // AI 미사용 시 메뉴 기반 응답
      let apiKey: string | undefined;
      try {
        apiKey = secrets.OPENAI_API_KEY.value();
      } catch {
        // Secret 접근 실패 시 무시
      }

      if (!useAI || !apiKey) {
        res.status(200).json({ success: true, data: { response: getMenuResponse(message) } });
        return;
      }

      // OpenAI API 호출
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...conversationHistory.slice(-10),
            { role: "user", content: message },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!openaiRes.ok) {
        throw new Error(`OpenAI API error: ${openaiRes.status}`);
      }

      const data: any = await openaiRes.json();
      const aiResponse = data.choices[0]?.message?.content ?? getAIFallbackResponse(message);

      res.status(200).json({ success: true, data: { response: aiResponse } });
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(200).json({
        success: true,
        data: {
          response:
            "죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(sevim0104@naver.com)로 연락해 주세요.",
        },
      });
    }
  }
);
