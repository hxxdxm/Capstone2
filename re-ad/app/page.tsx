"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // ⭐️ 공통 헤더 임포트
import './main.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function MainPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [handmedowns, setHandmedowns] = useState<any[]>([]);
  const [activeFilter, setActiveFilter] = useState('전체');

  useEffect(() => {

    // 1. [API] 필사 데이터 최신 5개 (📍백엔드 주소 /annotations/exhibition 으로 완벽 수정)
    fetch(`${API_BASE_URL}/annotations/exhibition`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // 백엔드에서 이미 최신순 10개를 주므로, 앞에서 5개만 자르기
          setExhibitions(data.slice(0, 5));
        }
      })
      .catch(err => console.error("필사 로드 실패:", err));

    // 2. [API] 모임방 데이터 최신 4개
    fetch(`${API_BASE_URL}/rooms`)
      .then(res => res.json())
      .then(data => {
        const roomArray = Array.isArray(data) ? data : (data.rooms || []);
        const latestRooms = roomArray
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setRooms(latestRooms);
      })
      .catch(err => console.error(err));

    // 3. [API] 실제 북랭킹 데이터 최신 5개
    fetch(`${API_BASE_URL}/books/public-ranking?genre=`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRankings(data.slice(0, 5));
        }
      })
      .catch(err => console.error("랭킹 로드 실패:", err));

    // 4. [API] 물려주기 데이터 최신 4개
    fetch(`${API_BASE_URL}/handmedowns`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const latestItems = data
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
          setHandmedowns(latestItems);
        }
      })
      .catch(err => console.error("물려주기 로드 실패:", err));

  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (activeFilter === '전체') return true;
    const type = room.roomType || '온라인';
    return type === activeFilter;
  });

  return (
    <div className="main-wrap">
      <Header />

      <div className="main-grid">

        {/* ── 좌측 메인 콘텐츠 ── */}
        <div className="main-content-left">

          {/* 1. 필사 전시회 섹션 */}
          <section className="main-section">
            <div className="section-header">
              <div>
                <Link href="/annotations" className="section-title-link">
                  <h3 className="section-title">🖊 필사 전시회</h3>
                </Link>
                <p className="section-title-sub">오늘의 영감을 준 문장들</p>
              </div>
              <Link href="/annotations" className="view-all-link">전체 보기</Link>
            </div>

            <div className="card-scroll-row">
              {exhibitions.length > 0 ? (
                exhibitions.map((item) => (
                  <Link href="/annotations" key={item._id} className="exhibition-card">
                    <div>
                      <div className="exhibition-quote-box">
                        <p className="exhibition-quote">"{item.quote}"</p>
                      </div>
                    </div>
                    <div className="exhibition-meta">
                      <span className="exhibition-meta-text">
                        {item.bookId?.title || '도서'} | {item.userId?.nickname || '작자미상'}
                      </span>
                      <span className="exhibition-meta-icon">📖</span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">등록된 전시글이 없습니다.</div>
              )}
            </div>
          </section>

          {/* 2. 모임방 섹션 */}
          <section className="main-section">
            <div className="section-header">
              <div>
                <Link href="/rooms" className="section-title-link">
                  <h3 className="section-title">🤝 참여를 기다리는 모임방</h3>
                </Link>
                <p className="section-title-sub">함께 읽고 나누는 즐거움</p>
              </div>
              <Link href="/rooms" className="view-all-link">전체 보기</Link>
            </div>

            <div className="filter-tabs">
              {['전체', '온라인', '오프라인'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`filter-tab${activeFilter === filter ? ' active' : ''}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="rooms-grid">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => {
                  const currentMembers = room.members?.length || 0;
                  const isFull = currentMembers >= (room.maxMembers || 8);
                  return (
                    <Link
                      href={`/rooms/${room._id || room.id}`}
                      key={room._id || room.id}
                      className="room-card"
                    >
                      {isFull && <div className="room-full-badge">모집 마감</div>}
                      <div>
                        <div className="room-card-top">
                          <span className={`room-type-badge ${room.roomType === '온라인' ? 'online' : 'offline'}`}>
                            {room.roomType || '온라인'}
                          </span>
                          <span className={`room-member-count ${isFull ? 'full' : 'ok'}`}>
                            <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            {currentMembers} / {room.maxMembers || 8}명
                          </span>
                        </div>
                        <h4 className="room-name">{room.roomName}</h4>
                        <p className="room-desc">{room.roomDesc || room.description}</p>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="rooms-empty">현재 개설된 모임방이 없습니다.</div>
              )}
            </div>
          </section>

          {/* 3. 물려주기/교환하기 섹션 */}
          <section className="main-section">
            <div className="section-header">
              <div>
                <Link href="/handmedowns" className="section-title-link">
                  <h3 className="section-title">📚 물려주기/교환하기</h3>
                </Link>
                <p className="section-title-sub">이웃이 물려준 따뜻한 책들</p>
              </div>
              <Link href="/handmedowns" className="view-all-link">전체 보기</Link>
            </div>

            <div className="handmedown-grid">
              {handmedowns.length > 0 ? (
                handmedowns.map((item) => (
                  <Link href="/handmedowns" key={item._id} className="handmedown-card">
                    <div className="hm-card-img-wrap">
                      {item.image ? (
                        <img src={item.image} alt={item.bookTitle} className="hm-card-img" />
                      ) : (
                        <div className="hm-card-no-img">NO IMG</div>
                      )}
                      <span className="hm-trade-badge">{item.tradeType === 'SELL' ? '판매' : '나눔'}</span>
                    </div>
                    <div className="hm-card-info">
                      <h4 className="hm-card-title">{item.bookTitle}</h4>
                      <p className="hm-card-author">{item.bookAuthor || '저자 미상'}</p>
                      <p className="hm-card-desc">{item.comment}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">아직 등록된 물려주기 책이 없습니다.</div>
              )}
            </div>
          </section>

        </div>

        {/* ── 우측 도서 랭킹 사이드바 ── */}
        <aside className="ranking-aside">
          <div className="ranking-card">
            <div className="ranking-card-title">📚 도서 랭킹</div>
            <div className="ranking-list">
              {rankings.length > 0 ? (
                rankings.map((book, idx) => (
                  <Link href="/ranking" key={book.isbn || idx} className="ranking-item">
                    <span className={`ranking-num${idx < 3 ? ' top' : ''}`}>{idx + 1}</span>
                    <div className="ranking-book-info">
                      <div className="ranking-book-title">{book.title}</div>
                      <div className="ranking-book-author">{book.author}</div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="ranking-loading">랭킹을 불러오는 중...</div>
              )}
            </div>
            <Link href="/ranking" className="ranking-more-btn">더 보기</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}