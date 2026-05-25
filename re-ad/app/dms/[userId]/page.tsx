"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import '../dm.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';
const SOCKET_URL   = 'http://13.124.191.57:5000';

export default function ChatPage() {
  const params   = useParams();
  const router   = useRouter();
  const partnerId = params?.userId as string;

  const [messages, setMessages]       = useState<any[]>([]);
  const [inputText, setInputText]     = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [myId, setMyId]               = useState('');
  const [myName, setMyName]           = useState('');
  const [isLoading, setIsLoading]     = useState(true);
  const [isSending, setIsSending]     = useState(false);

  const socketRef    = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  /* ── 토큰 / 유저 정보 ── */
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  };

  const getMyIdFromToken = (token: string) => {
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.id || payload.userId || payload._id || '';
    } catch { return ''; }
  };

  /* ── 초기화 ── */
  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }

    const id   = getMyIdFromToken(token);
    const name = localStorage.getItem('userName') || sessionStorage.getItem('userName') || '나';
    setMyId(id);
    setMyName(name);

    fetchMessages(token);
    initSocket(token, id);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [partnerId]);

  /* ── REST: 기존 대화 불러오기 ── */
  const fetchMessages = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dms/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const msgs = Array.isArray(data) ? data : (data.messages || []);
        setMessages(msgs);

        // 상대방 닉네임 추출
        const partnerMsg = msgs.find((m: any) =>
          (m.senderId?._id || m.senderId) === partnerId ||
          (m.receiverId?._id || m.receiverId) === partnerId
        );
        if (partnerMsg) {
          const sender = partnerMsg.senderId;
          if (typeof sender === 'object' && sender._id === partnerId) {
            setPartnerName(sender.nickname || '상대방');
          } else {
            const receiver = partnerMsg.receiverId;
            if (typeof receiver === 'object') setPartnerName(receiver.nickname || '상대방');
          }
        }
      }
    } catch (err) {
      console.error('메시지 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── Socket.io 초기화 ── */
  const initSocket = (token: string, userId: string) => {
    // socket.io-client가 설치된 경우에만 연결 시도
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { io } = require('socket.io-client');
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        // 앱 시작 시 꼭 호출: 내 userId 등록
        socket.emit('registerUser', userId);
      });

      // 메시지 수신 리스닝
      socket.on('receiveDM', (dm: any) => {
        // 현재 대화 상대의 메시지만 추가
        const senderId = dm.senderId?._id || dm.senderId;
        if (senderId === partnerId) {
          setMessages(prev => [...prev, dm]);
        }
      });

      socketRef.current = socket;
    } catch (e) {
      console.warn('Socket.io 연결 실패 (패키지 미설치 또는 서버 문제):', e);
    }
  };

  /* ── 메시지 전송 ── */
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    const token = getToken();
    if (!token) return;

    setIsSending(true);
    setInputText('');

    // 낙관적 업데이트 (바로 화면에 표시)
    const optimistic = {
      _id: `tmp-${Date.now()}`,
      content: text,
      senderId: { _id: myId, nickname: myName },
      receiverId: partnerId,
      createdAt: new Date().toISOString(),
      _isOptimistic: true,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      // REST API로 전송
      const res = await fetch(`${API_BASE_URL}/dms/${partnerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      });

      if (res.ok) {
        // Socket.io로도 emit (실시간 알림)
        socketRef.current?.emit('sendDM', {
          senderId: myId,
          receiverId: partnerId,
          content: text,
        });
      } else {
        // 실패 시 낙관적 메시지 제거
        setMessages(prev => prev.filter(m => m._id !== optimistic._id));
        alert('메시지 전송에 실패했습니다.');
      }
    } catch (err) {
      setMessages(prev => prev.filter(m => m._id !== optimistic._id));
      alert('서버 통신 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 새 메시지마다 맨 아래 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── 시간 포맷 ── */
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  /* ── 날짜 그룹핑 ── */
  const groupByDate = (msgs: any[]) => {
    const groups: { date: string; msgs: any[] }[] = [];
    msgs.forEach(msg => {
      const dateKey = formatDate(msg.createdAt);
      const last = groups[groups.length - 1];
      if (last && last.date === dateKey) {
        last.msgs.push(msg);
      } else {
        groups.push({ date: dateKey, msgs: [msg] });
      }
    });
    return groups;
  };

  const isMyMessage = (msg: any) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return senderId === myId || msg._isOptimistic;
  };

  const getSenderName = (msg: any) =>
    msg.senderId?.nickname || (isMyMessage(msg) ? myName : partnerName || '상대방');

  return (
    <div className="chat-page">
      <Header />

      <div className="chat-container">
        {/* 채팅 헤더바 */}
        <div className="chat-header-bar">
          <Link href="/dms" className="chat-back-btn">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="chat-partner-avatar">
            {(partnerName || '?')[0]?.toUpperCase()}
          </div>
          <span className="chat-partner-name">{partnerName || '대화 상대'}</span>
        </div>

        {/* 메시지 목록 */}
        <div className="chat-messages">
          {isLoading ? (
            <div className="dm-loading"><div className="spinner" /></div>
          ) : messages.length === 0 ? (
            <div className="dm-empty">
              첫 메시지를 보내 대화를 시작해보세요 🌿
            </div>
          ) : (
            groupByDate(messages).map(group => (
              <React.Fragment key={group.date}>
                {/* 날짜 구분선 */}
                <div className="chat-date-divider">
                  <span className="chat-date-label">{group.date}</span>
                </div>

                {group.msgs.map((msg, idx) => {
                  const mine = isMyMessage(msg);
                  return (
                    <div key={msg._id || idx} className={`msg-row${mine ? ' mine' : ''}`}>
                      <div className="msg-sender-avatar">
                        {(getSenderName(msg)[0] || '?').toUpperCase()}
                      </div>
                      <div className="msg-bubble-wrap">
                        {!mine && (
                          <span className="msg-sender-name">{getSenderName(msg)}</span>
                        )}
                        <div className={`msg-bubble ${mine ? 'mine' : 'theirs'}`}>
                          {msg.content}
                        </div>
                        <span className="msg-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </React.Fragment>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 메시지 입력 */}
        <div className="chat-input-bar">
          <textarea
            ref={textareaRef}
            className="chat-input"
            placeholder="메시지를 입력하세요 (Enter 전송, Shift+Enter 줄바꿈)"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={sendMessage}
            disabled={!inputText.trim() || isSending}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
