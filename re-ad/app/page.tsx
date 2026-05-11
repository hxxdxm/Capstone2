"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // 공통 헤더 컴포넌트 불러오기

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function MainPage() {
  // 상태 관리 (State)
  const [exhibitions, setExhibitions] = useState<any[]>([]); // 필사 전시 데이터
  const [rooms, setRooms] = useState<any[]>([]);             // 모임방 데이터
  const [rankings, setRankings] = useState<any[]>([]);       // 북랭킹 데이터

  // 하드코딩된 메인 배너 데이터
  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000",
      tag: "EVENT & EXHIBITION",
      title: "문장으로 잇는\n우리들의 독서 기록 展",
      desc: "서촌 한옥 서점 '무목적' (4.15 - 4.25)"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000",
      tag: "BOOK TALK",
      title: "양귀자 작가와 함께하는\n'모순' 북토크",
      desc: "4월 20일 저녁 7시, 온/오프라인 동시 진행"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000",
      tag: "NOTICE",
      title: "텍스트힙 수집가라면?\n앱 리뷰 이벤트 참여!",
      desc: "참가자 전원에게 전용 폰트 증정"
    }
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const prevBanner = () => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  const nextBanner = () => setCurrentBannerIndex((prev) => (prev + 1) % banners.length);

  // 페이지가 처음 켜질 때 실행되는 로직들
  useEffect(() => {
    // 1. 배너 자동 넘김 타이머 (5초)
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    // 2. [API] 필사 데이터 최신 5개 불러오기
    fetch(`${API_BASE_URL}/annotations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const latestTrans = data
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);
          setExhibitions(latestTrans);
        }
      })
      .catch(err => console.error("필사 데이터 로드 실패:", err));

    // 3. [API] 모임방 데이터 최신 4개 불러오기
    fetch(`${API_BASE_URL}/rooms`)
      .then(res => res.json())
      .then(data => {
        const roomArray = Array.isArray(data) ? data : (data.rooms || []);
        const latestRooms = roomArray
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setRooms(latestRooms);
      })
      .catch(err => console.error("모임방 데이터 로드 실패:", err));

    // 4. [API] 실제 북랭킹 데이터 최신 5개 불러오기
    fetch(`${API_BASE_URL}/books/public-ranking?genre=`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRankings(data.slice(0, 5));
        }
      })
      .catch(err => console.error("랭킹 로드 실패:", err));

    // 컴포넌트가 꺼질 때 타이머 정리
    return () => clearInterval(timer);
  }, [banners.length]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      
      {/* --- 공통 헤더 영역 --- */}
      <Header />

      {/* --- 메인 배너 슬라이드 영역 --- */}
      <section className="px-6 py-8 mx-auto max-w-7xl relative group">
        <div className="relative h-[300px] md:h-[400px] bg-black rounded-3xl overflow-hidden shadow-xl">
          {banners.map((banner, index) => (
            <div key={banner.id} className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
              <div className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url(${banner.image})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-white z-20">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest mb-4">{banner.tag}</span>
                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight whitespace-pre-line">{banner.title}</h2>
                <p className="text-gray-300 text-sm font-medium">{banner.desc}</p>
              </div>
            </div>
          ))}

          {/* 배너 좌우 이동 버튼 */}
          <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
          <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
        </div>
      </section>

      {/* --- 필사 전시 리스트 영역 --- */}
      <section className="px-6 py-10 mx-auto max-w-7xl border-b border-gray-100">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Link href="/annotations" className="group block">
              <h3 className="text-2xl font-black italic tracking-tighter group-hover:text-gray-500 transition-colors">필사 전시회</h3>
            </Link>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">오늘의 영감을 준 문장들</p>
          </div>
          <Link href="/annotations" className="text-xs font-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition">VIEW ALL</Link>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar">
          {exhibitions.length > 0 ? (
            exhibitions.map((item) => (
              <Link href={`/annotations`} key={item.id || item._id} className="min-w-[280px] max-w-[280px] bg-white p-6 rounded-2xl shadow-sm border border-gray-50 group cursor-pointer hover:border-black transition-colors flex flex-col justify-between block">
                <div>
                  <div className="h-40 bg-gray-50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center p-4">
                    <p className="text-xs font-serif text-center line-clamp-4 italic text-black">"{item.description || item.content}"</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase truncate pr-2">
                    {item.bookTitle || '도서'} | {item.author || '작자미상'}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full text-center py-10 text-gray-400 font-bold">등록된 전시글이 없습니다.</div>
          )}
        </div>
      </section>

      {/* --- 메인 하단: 모임방 & 북랭킹 영역 --- */}
      <main className="px-6 py-12 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 좌측: 모임방 카드 리스트 */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight">🤝 참여를 기다리는 모임방</h3>
            <Link href="/rooms" className="text-xs font-black border-b-2 border-black pb-1">VIEW ALL</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.length > 0 ? (
              rooms.map((room) => {
                const currentMembers = room.members?.length || 0;
                const isFull = currentMembers >= (room.maxMembers || 8);
                
                return (
                  <Link href={`/rooms/${room._id || room.id}`} key={room._id || room.id} className="bg-white p-7 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group cursor-pointer relative flex flex-col justify-between h-[200px] block">
                    {/* 정원 초과 시 보여주는 뱃지 */}
                    {isFull && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl shadow-sm">
                        모집 마감
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.roomType === '온라인' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {room.roomType || '온라인'}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center ${isFull ? 'text-red-500' : 'text-gray-400'}`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                          {currentMembers} / {room.maxMembers || 8}명
                        </span>
                      </div>
                      <h4 className="text-lg font-black mb-2 group-hover:text-gray-600 transition-colors line-clamp-1">{room.roomName}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2 break-keep">{room.roomDesc || room.description}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-400 font-bold text-sm bg-white rounded-3xl border border-gray-100">
                현재 개설된 모임방이 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* 우측: 북랭킹 리스트 */}
        <aside className="lg:col-span-4 space-y-10">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black tracking-[0.3em] text-gray-400 mb-8 uppercase">Book Ranking</h3>
            <div className="space-y-6">
              {rankings.length > 0 ? (
                rankings.map((book, idx) => (
                  <Link href="/ranking" key={book.isbn || idx} className="flex items-center group cursor-pointer">
                    <span className="text-xl font-serif italic text-gray-200 group-hover:text-black transition-colors w-8">{idx + 1}</span>
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-sm font-bold leading-none mb-1 group-hover:text-gray-600 truncate text-black">{book.title}</h4>
                      <p className="text-[10px] text-gray-500 font-bold truncate">{book.author}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 text-xs font-bold text-gray-400">랭킹을 불러오는 중...</div>
              )}
            </div>
            <Link href="/ranking" className="block text-center w-full mt-10 py-3 bg-gray-50 text-[10px] font-black tracking-widest text-gray-400 hover:bg-black hover:text-white transition rounded-xl">
              더보기
            </Link>
          </section>
        </aside>

      </main>
    </div>
  );
}