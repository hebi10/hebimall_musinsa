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

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isChatStarted, setIsChatStarted] = useState(false); // 채팅 시작 여부
  const [isAgentConnected, setIsAgentConnected] = useState(false); // 상담원 연결 여부
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(false); // AI 상담원 연결 상태
  const [isMounted, setIsMounted] = useState(false); // 클라이언트 마운트 상태
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  // 컴포넌트 마운트 확인
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // SSR 안전한 subtitle 텍스트 생성
  const getSubtitleText = () => {
    if (!isMounted) {
      return '채팅 상담을 시작해보세요'; // 서버 렌더링 시 고정값
    }
    
    if (isLoading) {
      return '답변 작성 중...';
    }
    if (useAI) {
      return '맞춤형 AI 상담 연결됨';
    }
    if (isChatStarted && !isAgentConnected) {
      return '상담원 연결을 위해 "상담원연결" 버튼을 클릭해주세요';
    }
    if (isChatStarted && isAgentConnected) {
      return '언제든 문의해 주세요';
    }
    return '채팅 상담을 시작해보세요';
  };

  // 채팅 상담 시작 함수
  const startChat = () => {
    setIsChatStarted(true);
    const initialMessage: ChatMessage = {
      id: '1',
      text: `안녕하세요! STYNA 고객지원팀입니다.

어떤 도움이 필요하신가요? 아래 번호를 선택하거나 직접 문의해 주세요:

1. 주문/배송 문의
2. 반품/교환 안내
3. 쿠폰/할인 혜택
4. 사이즈 가이드
5. 결제 방법 안내
6. 회원 혜택 정보

상담원연결 - AI 상담원과 1:1 맞춤 상담

번호를 입력하시거나 궁금한 점을 직접 말씀해 주세요!`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    
    // 입력창에 포커스 (채팅이 열려있고 시작된 경우에만)
    setTimeout(() => {
      if (inputRef.current && isOpen) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // 메시지 스크롤을 맨 아래로 (항상 스크롤)
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
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

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [messages]);

  // 타이핑 인디케이터가 표시될 때 스크롤
  useEffect(() => {
    if (isTyping) {
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [isTyping]);

  // 채팅창 닫기 함수
  const closeChatWindow = () => {
    setIsOpen(false);
    // 채팅창을 닫을 때 상태 초기화는 하지 않음 (대화 기록 유지)
  };

  // 채팅 리셋 함수 (완전히 새로 시작하고 싶을 때)
  const resetChat = () => {
    setIsChatStarted(false);
    setIsAgentConnected(false);
    setMessages([]);
    setUseAI(false);
    setInputValue('');
    setIsTyping(false);
    setIsLoading(false);
  };

  // 메시지 전송 함수
  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || !isChatStarted || !isAgentConnected) return;

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
      setIsAgentConnected(true);
    }

    try {
      // 모든 환경에서 동일하게 /api/chat 사용 (Firebase Hosting에서 rewrite 처리)
      const apiUrl = '/api/chat';
      
      console.log('Chat API 호출:', { 
        apiUrl, 
        shouldUseAI, 
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
        messageText,
        useAI: shouldUseAI,
        environment: process.env.NODE_ENV
      });
      
      const requestBody = {
        message: messageText,
        useAI: shouldUseAI,
        conversationHistory: messages.slice(-10).map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }))
      };
      
      console.log('Request Body:', requestBody);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // 타이핑 효과를 위한 지연
      setTimeout(() => {
        let responseText = data.response || data.error || '응답을 받을 수 없습니다.';
        
        // AI 상담원 연결 시 특별 처리
        if ((messageText.toLowerCase() === '상담원연결' || messageText.toLowerCase() === '상담원 연결') && shouldUseAI) {
          responseText = `AI 상담원과 연결되었습니다! 이제 더 자세하고 개인화된 상담을 받으실 수 있습니다.

무엇을 도와드릴까요?

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
        text: '죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.\n\n기본 상담은 "상담원연결" 버튼을 클릭하신 후 이용 가능합니다.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 빠른 선택 버튼 클릭 처리
  const handleQuickButton = async (text: string) => {
    if (!isChatStarted) return;
    
    // "상담원연결" 버튼을 클릭하면 상담원 연결 상태로 변경
    if (text.toLowerCase() === '상담원연결' || text.toLowerCase() === '상담원 연결') {
      setUseAI(true);
      setIsAgentConnected(true);
    }
    
    // 직접 메시지 전송 (inputValue 상태를 거치지 않음)
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setIsTyping(true);

    // "상담원연결" 명령어 감지
    const shouldUseAI = text.toLowerCase() === '상담원연결' || text.toLowerCase() === '상담원 연결' || useAI;

    try {
      // 모든 환경에서 동일하게 /api/chat 사용 (Firebase Hosting에서 rewrite 처리)
      const apiUrl = '/api/chat';
      
      console.log('Quick Button - Chat API 호출:', { 
        apiUrl, 
        text,
        shouldUseAI, 
        hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
        environment: process.env.NODE_ENV
      });
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          useAI: shouldUseAI,
          conversationHistory: messages.slice(-10).map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      // 타이핑 효과를 위한 지연
      setTimeout(() => {
        let responseText = data.response || data.error || '응답을 받을 수 없습니다.';
        
        // AI 상담원 연결 시 특별 처리
        if ((text.toLowerCase() === '상담원연결' || text.toLowerCase() === '상담원 연결') && shouldUseAI) {
          responseText = `AI 상담원과 연결되었습니다! 이제 더 자세하고 개인화된 상담을 받으실 수 있습니다.

무엇을 도와드릴까요?

AI 상담원은 다음과 같은 도움을 드릴 수 있습니다:
• 맞춤형 상품 추천
• 상세한 주문/배송 안내  
• 개인화된 고객 지원
• 실시간 문제 해결

이제 채팅창에서 자유롭게 메시지를 입력하실 수 있습니다!`;
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
      console.error('Quick Button Chat error:', error);
      setIsTyping(false);
      setIsLoading(false);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: '죄송합니다. 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주시거나 고객센터(1588-0000)로 연락해 주세요.\n\n기본 상담은 "상담원연결" 버튼을 클릭하신 후 이용 가능합니다.',
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  // 임시 API 시뮬레이션 함수 (추후 제거 예정 - 현재는 API 라우트 사용)
  const simulateAPICall = async (message: string): Promise<string> => {
    // 이 함수는 더 이상 사용되지 않음 - API 라우트(/api/chat)를 통해 처리
    return '이 함수는 더 이상 사용되지 않습니다.';
  };

  // Enter 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && isChatStarted && isAgentConnected) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 입력 자동 크기 조절
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isChatStarted || !isAgentConnected) return;
    
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
              {useAI ? 'AI 상담원' : '고객상담'}
            </h3>
            <p className={styles.chatSubtitle}>
              {isMounted ? getSubtitleText() : '채팅 상담을 시작해보세요'}
            </p>
          </div>
          <div className={styles.headerButtons}>
            {isChatStarted && (
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
              onClick={closeChatWindow}
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
          {!isChatStarted ? (
            // 채팅 시작 전 화면
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
                <button 
                  className={styles.startChatButton}
                  onClick={startChat}
                >
                  채팅 상담 시작하기
                </button>
              </div>
            </div>
          ) : (
            // 채팅 메시지 영역
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
            </>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* 빠른 선택 버튼 */}
        {isChatStarted && !isAgentConnected && (
          <div className={styles.quickButtons}>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('1. 주문/배송')}
              disabled={isLoading}
            >
              1. 주문/배송
            </button>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('2. 반품/교환')}
              disabled={isLoading}
            >
              2. 반품/교환
            </button>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('3. 쿠폰/할인')}
              disabled={isLoading}
            >
              3. 쿠폰/할인
            </button>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('4. 사이즈 가이드')}
              disabled={isLoading}
            >
              4. 사이즈 가이드
            </button>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('5. 결제 방법 안내')}
              disabled={isLoading}
            >
              5. 결제 방법 안내
            </button>
            <button 
              className={styles.quickButton}
              onClick={() => handleQuickButton('6. 회원 혜택 정보')}
              disabled={isLoading}
            >
              6. 회원 혜택 정보
            </button>
            <button 
              className={`${styles.quickButton} ${styles.ai}`}
              onClick={() => handleQuickButton('상담원연결')}
              disabled={isLoading}
            >
              상담원연결
            </button>
          </div>
        )}

        {/* 입력 영역 */}
        {isChatStarted && (
          <div className={styles.chatInput}>
            <div className={styles.inputGroup}>
              <textarea
                ref={inputRef}
                className={styles.messageInput}
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder={
                  isAgentConnected 
                    ? "메시지를 입력하세요..." 
                    : "상담원 연결 후 이용 가능합니다"
                }
                disabled={isLoading || !isChatStarted || !isAgentConnected}
                rows={1}
              />
              <button
                className={styles.sendButton}
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading || !isChatStarted || !isAgentConnected}
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
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "채팅 닫기" : "채팅 열기"}
      >
        {isOpen ? '×' : '채팅 상담'}
      </button>
    </div>
  );
};

export default ChatWidget;
