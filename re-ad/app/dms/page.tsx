"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import './dm.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function DmListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  };

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/login'); return; }
    fetchDmList(token);
  }, []);

  const fetchDmList = async (token: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dms`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('DM 목록 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return '방금';
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}시간 전`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <div className="dm-page">
      <Header />
      <div className="dm-inner">
        <h2 className="dm-page-title">💬 메시지</h2>

        {isLoading ? (
          <div className="dm-loading"><div className="spinner" /></div>
        ) : conversations.length === 0 ? (
          <div className="dm-empty">
            아직 나눈 대화가 없습니다.<br />
            친구 찾기에서 독서 메이트를 만나보세요 🌿
          </div>
        ) : (
          <div className="dm-list">
            {conversations.map((conv: any) => {
              const partner = conv.partner || conv.otherUser || {};
              const partnerId = partner._id || partner.id || conv.partnerId;
              const partnerName = partner.nickname || partner.name || '알 수 없음';
              const lastMsg = conv.lastMessage?.content || conv.content || '';
              const lastTime = conv.lastMessage?.createdAt || conv.createdAt || '';

              return (
                <Link
                  key={partnerId}
                  href={`/dms/${partnerId}`}
                  className="dm-list-item"
                >
                  <div className="dm-avatar">
                    {partnerName[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="dm-item-info">
                    <div className="dm-item-name">{partnerName}</div>
                    <div className="dm-item-preview">{lastMsg || '대화를 시작해보세요'}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span className="dm-item-time">{formatTime(lastTime)}</span>
                    {(conv.unreadCount > 0) && (
                      <span className="dm-unread-badge">{conv.unreadCount}</span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
