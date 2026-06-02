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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
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

    fetchMessages(token, id);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [partnerId, router]);

  /* ── Socket.io 초기화 (한 번만) ── */
  useEffect(() => {
    const token = getToken();
    if (!token || !myId) return;

    if (socketRef.current?.connected) return;

    initSocket(token, myId);

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [myId]);

  /* ── REST: 기존 대화 불러오기 ── */
  const fetchMessages = async (token: string, userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dms/${partnerId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const msgs = Array.isArray(data) ? data : (data.messages || []);
        setMessages(msgs);

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
      // 초기 로드 시 맨 아래로 스크롤
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  /* ── Socket.io 초기화 ── */
  const initSocket = (token: string, userId: string) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { io } = require('socket.io-client');
      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        socket.emit('registerUser', userId);
      });

      // 🔴 중복 방지: 기존 리스너가 있다면 먼저 해제
      socket.off('receiveDM'); 

      // ── Socket.io 초기화 내부 ──
      socket.on('receiveDM', (dm: any) => {
        const senderId = dm.senderId?._id || dm.senderId;
        const receiverId = dm.receiverId?._id || dm.receiverId;
      
        // 상대방이 나에게 보냈거나, 내가 상대방에게 보낸(방금 내가 친) 메시지라면 띄우기!
        if (
          (senderId === partnerId && receiverId === myId) ||
          (senderId === myId && receiverId === partnerId)
        ) {
          setMessages(prev => {
            const exists = prev.some(m => m._id === dm._id);
            if (exists) return prev;
            return [...prev, dm];
          });
        }
      });

      socketRef.current = socket;
    } catch (e) {
      console.warn('Socket.io 연결 실패 (패키지 미설치 또는 서버 문제):', e);
    }
  };

  /* ── 메시지 전송 (Socket.io만 사용) ── */
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || isSending) return;

    setIsSending(true);
    setInputText('');

    // Socket.io로만 전송 (백엔드가 DB 저장 + receiveDM 브로드캐스트 처리)
    socketRef.current?.emit('sendDM', {
      senderId: myId,
      receiverId: partnerId,
      content: text,
    });

    setIsSending(false);
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

  /* ── 맨 아래로 자동 스크롤 ── */
  const scrollToBottom = (smooth = false) => {
    messagesContainerRef.current?.scrollTo({
      top: 999999,
      behavior: smooth ? 'smooth' : 'auto'
    });
  };

  /* ── 스크롤 위치 감지 (위로 올려서 과거 메시지 볼 때 사용) ── */
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      // 맨 아래로부터 100px 이내이면 '맨 아래' 상태
      isAtBottomRef.current = scrollHeight - scrollTop - clientHeight < 100;
    }
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

  // 새 메시지마다 맨 아래 자동 스크롤
  useEffect(() => {
    if (messages.length > 0 && isAtBottomRef.current) {
      scrollToBottom(true);
    }
  }, [messages]);

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
        <div
          className="chat-messages"
          ref={messagesContainerRef}
          onScroll={handleScroll}
        >
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
            onClick={(e) => {
              e.preventDefault();
              sendMessage();
            }}
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