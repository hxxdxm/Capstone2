"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import './detail.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

const getImageUrl = (url: string | undefined | null) => {
  if (!url) return null;
  if (url.startsWith('/uploads')) return `http://43.202.179.130:3000${url}`;
  return url;
};

export default function HandMeDownDetailPage() {
  const params = useParams();
  const router = useRouter();
  const itemId = params?.id as string;

  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [dmMessage, setDmMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [dmSent, setDmSent] = useState(false);

  const getToken = () =>
    typeof window !== 'undefined'
      ? localStorage.getItem('token') || sessionStorage.getItem('token')
      : null;

  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const p = JSON.parse(window.atob(token.split('.')[1]));
      return p.id || p.userId;
    } catch { return null; }
  };

  const getTradeTypeLabel = (t: string) => {
    if (t === 'SHARE') return '나눔';
    if (t === 'EXCHANGE') return '교환';
    return t || '나눔';
  };

  useEffect(() => {
    if (!itemId) return;
    fetch(`${API_BASE_URL}/handmedowns/${itemId}`)
      .then(res => {
        if (!res.ok) throw new Error('not found');
        return res.json();
      })
      .then(data => { setItem(data); setIsLoading(false); })
      .catch(() => {
        // 단일 조회 API가 없을 경우 목록에서 찾기
        fetch(`${API_BASE_URL}/handmedowns`)
          .then(r => r.json())
          .then(list => {
            const found = Array.isArray(list)
              ? list.find((i: any) => i._id === itemId || i.id === itemId)
              : null;
            if (found) setItem(found);
            else router.push('/handmedowns');
          })
          .catch(() => router.push('/handmedowns'))
          .finally(() => setIsLoading(false));
      });
  }, [itemId]);

  const handleSendDM = async () => {
    if (!dmMessage.trim()) return;
    const token = getToken();
    if (!token) { alert('로그인이 필요합니다.'); router.push('/login'); return; }

    const ownerId = item?.ownerId?._id || item?.ownerId || item?.userId?._id || item?.userId;
    if (!ownerId) { alert('게시자 정보를 찾을 수 없습니다.'); return; }

    const myId = getMyId();
    if (myId === ownerId) { alert('본인 게시물에는 메시지를 보낼 수 없습니다.'); return; }

    setIsSending(true);
    try {
      // DM API 시도 - 엔드포인트가 다를 수 있으므로 여러 경로 시도
      const res = await fetch(`${API_BASE_URL}/dms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: ownerId,
          message: dmMessage,
          content: dmMessage
        })
      });

      if (res.ok) {
        setDmSent(true);
        setDmMessage('');
        setTimeout(() => setDmSent(false), 3000);
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || '메시지 전송에 실패했습니다.');
      }
    } catch {
      alert('서버와 통신 중 오류가 발생했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) return (
    <div style={{ minHeight: '100vh', background: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Header />
      <div className="hmd-spinner" />
    </div>
  );

  if (!item) return null;

  const imageUrl = getImageUrl(item.bookThumbnail || item.imageUrl);
  const tradeLabel = getTradeTypeLabel(item.tradeType);
  const ownerNickname = item.ownerId?.nickname || item.ownerId?.username || item.provider || '익명';
  const isShare = tradeLabel === '나눔';

  return (
    <div className="hmd-detail-page">
      <Header />

      <main className="hmd-detail-main">
        {/* 뒤로 가기 */}
        <Link href="/handmedowns" className="hmd-back-btn">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          물려주기 목록으로
        </Link>

        <div className="hmd-detail-layout">

          {/* ── 좌측: 이미지 ── */}
          <div className="hmd-detail-image-col">
            <div className="hmd-detail-image-wrap" onClick={() => imageUrl && setIsImageZoomed(true)}>
              {imageUrl ? (
                <>
                  <img src={imageUrl} alt={item.bookTitle} className="hmd-detail-image" />
                  <div className="hmd-zoom-hint">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                    크게 보기
                  </div>
                </>
              ) : (
                <div className="hmd-no-image">
                  <span>📚</span>
                  <p>등록된 사진이 없습니다</p>
                </div>
              )}
            </div>
            <div className="hmd-detail-badge-row">
              <span className={`hmd-trade-badge ${isShare ? 'share' : 'exchange'}`}>{tradeLabel}</span>
              {item.condition && <span className="hmd-condition-badge">{item.condition}</span>}
            </div>
          </div>

          {/* ── 우측: 정보 + 채팅 ── */}
          <div className="hmd-detail-info-col">
            <div className="hmd-detail-card">
              <h1 className="hmd-detail-title">{item.bookTitle || item.title}</h1>
              <p className="hmd-detail-author">{item.bookAuthor || item.author || '저자 미상'}</p>

              <div className="hmd-divider" />

              {/* 게시자 정보 */}
              <div className="hmd-owner-row">
                <div className="hmd-owner-avatar">{ownerNickname[0]}</div>
                <div>
                  <p className="hmd-owner-name">{ownerNickname}</p>
                  <p className="hmd-owner-sub">게시자</p>
                </div>
              </div>

              {/* 설명 */}
              {(item.comment || item.description) && (
                <div className="hmd-desc-box">
                  <p className="hmd-desc-label">📝 상세 설명</p>
                  <p className="hmd-desc-text">{item.comment || item.description}</p>
                </div>
              )}

              <div className="hmd-divider" />

              {/* 개인채팅 */}
              <div className="hmd-dm-section">
                <p className="hmd-dm-title">💬 게시자에게 메시지 보내기</p>
                <p className="hmd-dm-sub">나눔/교환을 원한다면 직접 연락해 보세요!</p>
                <textarea
                  className="hmd-dm-input"
                  placeholder={`${ownerNickname}님에게 보낼 메시지를 입력하세요...`}
                  value={dmMessage}
                  onChange={e => setDmMessage(e.target.value)}
                  rows={3}
                />
                <button
                  className={`hmd-dm-btn ${dmSent ? 'sent' : ''}`}
                  onClick={handleSendDM}
                  disabled={isSending || !dmMessage.trim()}
                >
                  {dmSent ? (
                    <>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      전송 완료!
                    </>
                  ) : isSending ? '전송 중...' : (
                    <>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                      </svg>
                      메시지 보내기
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── 이미지 확대 모달 ── */}
      {isImageZoomed && imageUrl && (
        <div className="hmd-zoom-backdrop" onClick={() => setIsImageZoomed(false)}>
          <button className="hmd-zoom-close" onClick={() => setIsImageZoomed(false)}>✕</button>
          <img
            src={imageUrl}
            alt={item.bookTitle}
            className="hmd-zoom-image"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
