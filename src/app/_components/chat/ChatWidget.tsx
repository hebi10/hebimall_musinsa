'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useMutation } from '@tanstack/react-query';
import styles from './ChatWidget.module.css';

// ─── 상수 ──────────────────────────────────────────────
const CHAT_API_URL = '/api/chat';
const TYPING_DELAY_BASE = 800;
const TYPING_DELAY_RANGE = 400;
const SCROLL_THRESHOLD = 50;
const MAX_HISTORY_LENGTH = 5;
const MAX_TEXTAREA_HEIGHT = 80;

const QUICK_BUTTONS = [
  '1. 주문/배송',
  '2. 반품/교환',
  '3. 쿠폰/할인',
  '4. 사이즈 가이드',
  '5. 결제 방법 안내',
  '6. 회원 혜택 정보',
] as const;

const INITIAL_BOT_TEXT = `안녕하세요! STYNA 고객지원팀입니다.

어떤 도움이 필요하신가요? 아래 번호를 선택하거나 직접 문의해 주세요:

1. 주문/배송 문의
2. 반품/교환 안내
3. 쿠폰/할인 혜택
4. 사이즈 가이드
5. 결제 방법 안내
6. 회원 혜택 정보

상담원연결 - AI 상담원과 1:1 맞춤 상담

번호를 입력하시거나 궁금한 점을 직접 말씀해 주세요!`;

const AI_CONNECTED_TEXT = `AI 상담원과 연결되었습니다! 이제 더 자세하고 개인화된 상담을 받으실 수 있습니다.

무엇을 도와드릴까요?

AI 상담원은 다음과 같은 도움을 드릴 수 있습니다:
• 맞춤형 상품 추천
• 상세한 주문/배송 안내  
• 개인화된 고객 지원
• 실시간 문제 해결

이제 채팅창에서 자유롭게 메시지를 입력하실 수 있습니다!`;

const ERROR_TEXT =
  '죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.\n\n기본 상담은 "상담원연결" 버튼을 클릭하신 후 이용 가능합니다.';

// ─── 타입 ──────────────────────────────────────────────
export type ChatMode = 'idle' | 'menu' | 'ai';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatAPIParams {
  message: string;
  useAI: boolean;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

interface ChatAPIResponse {
  response?: string;
  error?: string;
}

// ─── 유틸리티 함수 ─────────────────────────────────────
function isAgentConnectCommand(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  return normalized === '상담원연결' || normalized === '상담원 연결';
}

function createMessage(text: string, sender: 'user' | 'bot'): ChatMessage {
  return {
    id: `${Date.now()}-${sender}`,
    text,
    sender,
    timestamp: new Date(),
  };
}

function buildConversationHistory(messages: ChatMessage[]) {
  return messages.slice(-MAX_HISTORY_LENGTH).map((msg) => ({
    role: (msg.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    content: msg.text,
  }));
}

function typingDelay(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, TYPING_DELAY_BASE + Math.random() * TYPING_DELAY_RANGE),
  );
}

// ─── API 호출 함수 ─────────────────────────────────────
async function callChatAPI(params: ChatAPIParams): Promise<ChatAPIResponse> {
  const response = await fetch(CHAT_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  const json = await response.json();

  // 통합 응답 포맷 { success, data: { response } } 처리
  if (json.success && json.data?.response) {
    return { response: json.data.response };
  }

  // 레거시 포맷 호환 { response }
  return json;
}

// ─── MessageText 컴포넌트 (split 1회) ──────────────────
const MessageText = React.memo<{ text: string }>(({ text }) => {
  const lines = useMemo(() => text.split('\n'), [text]);

  return (
    <div>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
});
MessageText.displayName = 'MessageText';

// ─── ChatWidget 컴포넌트 ───────────────────────────────
const ChatWidget: React.FC = () => {
  // UI 상태
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 통합 채팅 상태: idle → menu → ai
  const [chatMode, setChatMode] = useState<ChatMode>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const isUserScrollingRef = useRef(false);

  // 파생 상태
  const isChatActive = chatMode !== 'idle';

  // ── 마운트 확인 ────────────────────────────────────
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ── 스크롤 제어 ───────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (!isUserScrollingRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (!chatMessagesRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
    isUserScrollingRef.current = scrollTop + clientHeight < scrollHeight - SCROLL_THRESHOLD;
  }, []);

  // 메시지 추가 시 자동 스크롤
  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  // ── TanStack Query Mutation ────────────────────────
  const chatMutation = useMutation({
    mutationFn: async (params: ChatAPIParams) => {
      const data = await callChatAPI(params);
      await typingDelay(); // 타이핑 딜레이를 mutation에 포함
      return { data, message: params.message, useAI: params.useAI };
    },
    onSuccess: ({ data, message, useAI }) => {
      const isConnect = isAgentConnectCommand(message);
      const responseText =
        isConnect && useAI
          ? AI_CONNECTED_TEXT
          : data.response || '응답을 받을 수 없습니다.';

      setMessages((prev) => [...prev, createMessage(responseText, 'bot')]);
    },
    onError: () => {
      setMessages((prev) => [...prev, createMessage(ERROR_TEXT, 'bot')]);
    },
  });

  // 타이핑 인디케이터 표시 중 스크롤
  useEffect(() => {
    if (!chatMutation.isPending) return;
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chatMutation.isPending, scrollToBottom]);

  // ── Subtitle 텍스트 ───────────────────────────────
  const subtitleText = useMemo(() => {
    if (!isMounted) return '채팅 상담을 시작해보세요';
    if (chatMutation.isPending) return '답변 작성 중...';

    switch (chatMode) {
      case 'ai':
        return '맞춤형 AI 상담 연결됨';
      case 'menu':
        return '상담원 연결을 위해 "상담원연결" 버튼을 클릭해주세요';
      default:
        return '채팅 상담을 시작해보세요';
    }
  }, [isMounted, chatMutation.isPending, chatMode]);

  // ── 채팅 시작 ─────────────────────────────────────
  const startChat = useCallback(() => {
    setChatMode('menu');
    setMessages([createMessage(INITIAL_BOT_TEXT, 'bot')]);

    setTimeout(() => {
      if (inputRef.current && isOpen) inputRef.current.focus();
    }, 100);
  }, [isOpen]);

  // ── 채팅 리셋 ─────────────────────────────────────
  const resetChat = useCallback(() => {
    setChatMode('idle');
    setMessages([]);
    setInputValue('');
    chatMutation.reset();
  }, [chatMutation]);

  // ── 공통 메시지 전송 코어 ─────────────────────────
  const sendMessageCore = useCallback(
    (messageText: string) => {
      if (!messageText.trim() || chatMutation.isPending) return;

      const isConnect = isAgentConnectCommand(messageText);
      const shouldUseAI = isConnect || chatMode === 'ai';

      if (isConnect) setChatMode('ai');

      // Optimistic: 사용자 메시지 즉시 추가
      setMessages((prev) => [...prev, createMessage(messageText, 'user')]);

      chatMutation.mutate({
        message: messageText,
        useAI: shouldUseAI,
        conversationHistory: buildConversationHistory(messages),
      });
    },
    [chatMutation, chatMode, messages],
  );

  // ── 텍스트 입력 → 전송 ────────────────────────────
  const sendMessage = useCallback(() => {
    if (chatMode !== 'ai') return;
    sendMessageCore(inputValue.trim());
    setInputValue('');
  }, [chatMode, inputValue, sendMessageCore]);

  // ── 빠른 선택 버튼 → 전송 ─────────────────────────
  const handleQuickButton = useCallback(
    (text: string) => {
      if (chatMode === 'idle') return;
      sendMessageCore(text);
    },
    [chatMode, sendMessageCore],
  );

  // ── 키보드 이벤트 ─────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && chatMode === 'ai') {
        e.preventDefault();
        sendMessage();
      }
    },
    [chatMode, sendMessage],
  );

  // ── 입력 변경 + 자동 높이 ─────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (chatMode !== 'ai') return;
      setInputValue(e.target.value);

      const textarea = e.target;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`;
    },
    [chatMode],
  );

  // ── 파생 disabled 상태 ────────────────────────────
  const isInputDisabled = chatMutation.isPending || chatMode !== 'ai';
  const isSendDisabled = !inputValue.trim() || isInputDisabled;

  // ── 렌더링 ────────────────────────────────────────
  return (
    <div className={styles.chatWidget}>
      {/* 채팅 창 */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        {/* 헤더 */}
        <div className={styles.chatHeader}>
          <div>
            <h3 className={styles.chatTitle}>
              {chatMode === 'ai' ? 'AI 상담원' : '고객상담'}
            </h3>
            <p className={styles.chatSubtitle}>
              {isMounted ? subtitleText : '채팅 상담을 시작해보세요'}
            </p>
          </div>
          <div className={styles.headerButtons}>
            {isChatActive && (
              <button
                className={styles.resetButton}
                onClick={resetChat}
                aria-label="채팅 처음부터 시작"
                title="새로 시작"
              >
                ↻
              </button>
            )}
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="채팅 닫기"
            >
              ×
            </button>
          </div>
        </div>

        {/* 메시지 영역 */}
        <div
          className={styles.chatMessages}
          ref={chatMessagesRef}
          onScroll={handleScroll}
        >
          {chatMode === 'idle' ? (
            <div className={styles.chatStart}>
              <div className={styles.welcomeMessage}>
                <h3>STYNA 고객상담</h3>
                <p>안녕하세요! 무엇을 도와드릴까요?</p>
                <div className={styles.chatFeatures}>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>●</span>
                    <span>실시간 상담 지원</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>●</span>
                    <span>AI 맞춤 상담</span>
                  </div>
                  <div className={styles.feature}>
                    <span className={styles.featureIcon}>●</span>
                    <span>빠른 문제 해결</span>
                  </div>
                </div>
                <button className={styles.startChatButton} onClick={startChat}>
                  채팅 상담 시작하기
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${styles[message.sender]}`}
                >
                  <div className={styles.messageBubble}>
                    <MessageText text={message.text} />
                  </div>
                </div>
              ))}

              {/* 타이핑 인디케이터 */}
              {chatMutation.isPending && (
                <div className={`${styles.message} ${styles.bot}`}>
                  <div className={styles.typingIndicator}>
                    <div className={styles.typingDots}>
                      <div className={styles.typingDot}></div>
                      <div className={styles.typingDot}></div>
                      <div className={styles.typingDot}></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 선택 버튼 (menu 모드에서만) */}
        {chatMode === 'menu' && (
          <div className={styles.quickButtons}>
            {QUICK_BUTTONS.map((label) => (
              <button
                key={label}
                className={styles.quickButton}
                onClick={() => handleQuickButton(label)}
                disabled={chatMutation.isPending}
              >
                {label}
              </button>
            ))}
            <button
              className={`${styles.quickButton} ${styles.ai}`}
              onClick={() => handleQuickButton('상담원연결')}
              disabled={chatMutation.isPending}
            >
              상담원연결
            </button>
          </div>
        )}

        {/* 입력 영역 */}
        {isChatActive && (
          <div className={styles.chatInput}>
            <div className={styles.inputGroup}>
              <textarea
                ref={inputRef}
                className={styles.messageInput}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={
                  chatMode === 'ai'
                    ? '메시지를 입력하세요...'
                    : '상담원 연결 후 이용 가능합니다'
                }
                disabled={isInputDisabled}
                rows={1}
              />
              <button
                className={styles.sendButton}
                onClick={sendMessage}
                disabled={isSendDisabled}
                aria-label="메시지 전송"
              >
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 채팅 토글 버튼 */}
      <button
        className={`${styles.chatButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? '채팅 닫기' : '채팅 열기'}
      >
        {isOpen ? '×' : '채팅 상담'}
      </button>
    </div>
  );
};

export default ChatWidget;
