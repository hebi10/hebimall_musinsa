'use client';

import React, { useState, useRef, useEffect } from 'react';
import styles from './ChatWidget.module.css';

// 메시지 타입 정의
export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// 메시지 텍스트 렌더링 컴포넌트
const MessageText: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div>
      {text.split('\n').map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index < text.split('\n').length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

// API 연결을 위한 인터페이스 (추후 구현)
interface ChatAPI {
  sendMessage: (message: string) => Promise<string>;
}

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: `안녕하세요! HEBIMALL 고객지원팀입니다. 😊

어떤 도움이 필요하신가요? 아래 번호를 선택하거나 직접 문의해 주세요:

1️⃣ 주문/배송 문의
2️⃣ 반품/교환 안내
3️⃣ 쿠폰/할인 혜택
4️⃣ 사이즈 가이드
5️⃣ 결제 방법 안내
6️⃣ 회원 혜택 정보

🤖 상담원연결 - AI 상담원과 1:1 맞춤 상담

번호를 입력하시거나 궁금한 점을 직접 말씀해 주세요!`,
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(false); // AI 상담원 연결 상태
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // 메시지 스크롤을 맨 아래로 (새 메시지가 있을 때만)
  const scrollToBottom = () => {
    if (!isUserScrolling && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 사용자가 스크롤 중인지 감지
  const handleScroll = () => {
    if (chatMessagesRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatMessagesRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      setIsUserScrolling(!isAtBottom);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 입력창 포커스 (채팅창 열릴 때) 및 스크롤 리셋
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // 채팅창 열릴 때 스크롤 상태 리셋
      setIsUserScrolling(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isOpen]);

  // 메시지 전송 함수
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // "상담원연결" 명령어 감지
    const shouldUseAI = messageText.toLowerCase() === '상담원연결' || messageText.toLowerCase() === '상담원 연결' || useAI;
    
    if (messageText.toLowerCase() === '상담원연결' || messageText.toLowerCase() === '상담원 연결') {
      setUseAI(true);
    }

    try {
      // 실제 API 호출 (GPT API와 연결됨)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          useAI: shouldUseAI,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        })
      });

      const data = await response.json();
      
      // 타이핑 효과를 위한 지연
      setTimeout(() => {
        let responseText = data.response || data.error || '응답을 받을 수 없습니다.';
        
        // AI 상담원 연결 시 특별 처리
        if ((messageText.toLowerCase() === '상담원연결' || messageText.toLowerCase() === '상담원 연결') && shouldUseAI) {
          responseText = `AI 상담원과 연결됩니다. 이제 더 자세하고 개인화된 상담을 받으실 수 있습니다! 

무엇을 도와드릴까요? 😊

AI 상담원은 다음과 같은 도움을 드릴 수 있습니다:
• 맞춤형 상품 추천
• 상세한 주문/배송 안내  
• 개인화된 고객 지원
• 실시간 문제 해결`;
        }
        
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: responseText,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setIsTyping(false);
        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }, 800 + Math.random() * 400); // 0.8-1.2초 랜덤 지연

    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setIsLoading(false);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 네트워크 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 빠른 선택 버튼 클릭 처리
  const handleQuickButton = (text: string) => {
    setInputValue(text);
    // 자동으로 메시지 전송
    setTimeout(() => {
      const event = new KeyboardEvent('keypress', { key: 'Enter' });
      document.dispatchEvent(event);
      sendMessage();
    }, 100);
  };

  // 임시 API 시뮬레이션 함수 (추후 제거 예정 - 현재는 API 라우트 사용)
  const simulateAPICall = async (message: string): Promise<string> => {
    // 이 함수는 더 이상 사용되지 않음 - API 라우트(/api/chat)를 통해 처리
    return '이 함수는 더 이상 사용되지 않습니다.';
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 입력 자동 크기 조절
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // 자동 높이 조절
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 80) + 'px';
  };

  return (
    <div className={styles.chatWidget}>
      {/* 채팅 창 */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.open : ''}`}>
        {/* 헤더 */}
        <div className={styles.chatHeader}>
          <div>
            <h3 className={styles.chatTitle}>
              {useAI ? '🤖 AI 상담원' : '고객상담'}
            </h3>
            <p className={styles.chatSubtitle}>
              {isLoading 
                ? '답변 작성 중...' 
                : useAI 
                  ? '맞춤형 AI 상담 연결됨' 
                  : '언제든 문의해 주세요'
              }
            </p>
          </div>
          <button
            className={styles.closeButton}
            onClick={() => setIsOpen(false)}
            aria-label="채팅 닫기"
          >
            ×
          </button>
        </div>

        {/* 메시지 영역 */}
        <div 
          className={styles.chatMessages}
          ref={chatMessagesRef}
          onScroll={handleScroll}
        >
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
          {isTyping && (
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
          
          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 선택 버튼 */}
        {!useAI && (
          <div className={styles.quickButtons}>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('1')}
              disabled={isLoading}
            >
              1️⃣ 주문/배송
            </button>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('2')}
              disabled={isLoading}
            >
              2️⃣ 반품/교환
            </button>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('3')}
              disabled={isLoading}
            >
              3️⃣ 쿠폰/할인
            </button>
            <button 
              className={`${styles.quickButton} ${styles.ai}`}
              onClick={() => handleQuickButton('상담원연결')}
              disabled={isLoading}
            >
              🤖 상담원연결
            </button>
          </div>
        )}

        {/* 입력 영역 */}
        <div className={styles.chatInput}>
          <div className={styles.inputGroup}>
            <textarea
              ref={inputRef}
              className={styles.messageInput}
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              disabled={isLoading}
              rows={1}
            />
            <button
              className={styles.sendButton}
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label="메시지 전송"
            >
              ➤
            </button>
          </div>
        </div>
      </div>

      {/* 채팅 토글 버튼 */}
      <button
        className={`${styles.chatButton} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "채팅 닫기" : "채팅 열기"}
      >
        {isOpen ? '×' : '💬'}
      </button>
    </div>
  );
};

export default ChatWidget;
