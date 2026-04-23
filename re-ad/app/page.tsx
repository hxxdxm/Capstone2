"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // ⭐️ [백엔드 연동] EC2에서 불러올 3가지 핵심 데이터 상태
  const [rooms, setRooms] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]);
  const [exhibitions, setExhibitions] = useState<any[]>([]);

  // 1. 배너 데이터 (이건 이벤트용이므로 그대로 유지)
  const banners = [
    {
      id: 1, image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000",
      tag: "EVENT & EXHIBITION", title: "문장으로 잇는\n우리들의 독서 기록 展", desc: "서촌 한옥 서점 '무목적' (4.15 - 4.25)"
    },
    {
      id: 2, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000",
      tag: "BOOK TALK", title: "양귀자 작가와 함께하는\n'모순' 북토크", desc: "4월 20일 저녁 7시, 온/오프라인 동시 진행"
    },
    {
      id: 3, image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000",
      tag: "NOTICE", title: "텍스트힙 수집가라면?\n앱 리뷰 이벤트 참여!", desc: "참가자 전원에게 전용 폰트 증정"
    }
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  const prevBanner = () => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
  const nextBanner = () => setCurrentBannerIndex((prev) => (prev + 1) % banners.length);

  // ⭐️ [백엔드 연동] 페이지 접속 시 서버에서 3가지 데이터 모두 가져오기!
  useEffect(() => {
    // 로그인 확인
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }

    // 1️⃣ 방 목록 가져오기 (메인 화면이라 4개만 자르기)
    fetch('http://13.124.191.57:5000/api/rooms')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setRooms(data.slice(0, 4)); })
      .catch(console.error);

    // 2️⃣ 책 랭킹 가져오기 (인기 순 상위 5개)
    fetch('http://13.124.191.57:5000/api/books/ranking')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setRankings(data.slice(0, 5)); })
      .catch(console.error);

    // 3️⃣ 필사 전시회 피드 가져오기
    fetch('http://13.124.191.57:5000/api/annotations/exhibition')
      .then(res => res.json())
      .then(data => { if(Array.isArray(data)) setExhibitions(data.slice(0, 5)); })
      .catch(console.error);

    // 배너 자동 넘김 타이머
    const timer = setInterval(() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length), 5000); 
    return () => clearInterval(timer);
  }, [banners.length]);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      setIsLoggedIn(false);
      setUserName('');
      alert("로그아웃 되었습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      
      {/* 1. 최상단 헤더 */}
      <header className="bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        
        <div className="flex items-center space-x-6 flex-1 justify-end">
          <div className="relative hidden md:block w-72">
            <input 
              type="text" 
              placeholder="도서, 모임, 전시 검색" 
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-5 pr-12 text-xs focus:ring-2 focus:ring-black transition"
            />
            <button className="absolute right-4 top-2.5 text-gray-400 hover:text-black">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>

          <div className="flex items-center space-x-5">
            {isLoggedIn ? (
              <>
                <button className="text-gray-400 hover:text-black transition relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
                <Link href="/mypage" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-bold group-hover:bg-gray-700 transition">MY</div>
                  <span className="text-sm font-bold hidden sm:inline-block">마이페이지</span>
                </Link>
                <button onClick={handleLogout} className="text-xs font-bold text-gray-400 hover:text-gray-900 transition ml-2">로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-black transition">로그인</Link>
                <Link href="/register" className="text-sm font-bold bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. 캐러셀형 메인 배너 영역 (유지) */}
      <section className="px-6 py-8 mx-auto max-w-7xl relative group">
        <div className="relative h-[300px] md:h-[400px] bg-black rounded-3xl overflow-hidden shadow-xl">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url(${banner.image})` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-white z-20">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest mb-4">{banner.tag}</span>
                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight whitespace-pre-line">{banner.title}</h2>
                <p className="text-gray-300 text-sm font-medium">{banner.desc}</p>
              </div>
            </div>
          ))}

          <button onClick={prevBanner} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextBanner} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
            {banners.map((_, index) => (
              <button key={index} onClick={() => setCurrentBannerIndex(index)} className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentBannerIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}></button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 필사 전시 레이아웃 (백엔드 연동) */}
      <section className="px-6 py-10 mx-auto max-w-7xl border-b border-gray-100">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Link href="/exhibition" className="group block">
              <h3 className="text-2xl font-black italic tracking-tighter group-hover:text-gray-500 transition-colors">필사 전시회</h3>
            </Link>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">오늘의 영감을 준 문장들</p>
          </div>
          <Link href="/exhibition" className="text-xs font-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition">VIEW ALL</Link>
        </div>
        <div className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar">
          
          {exhibitions.length > 0 ? (
            exhibitions.map((item, idx) => (
              <div key={idx} className="min-w-[280px] bg-white p-6 rounded-2xl shadow-sm border border-gray-50 group cursor-pointer hover:border-black transition-colors">
                {/* 만약 사진이 있으면 보여주고 없으면 안 보여줌 */}
                {item.imageUrl && (
                  <div className="h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden relative">
                    <div className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                  </div>
                )}
                <p className="font-serif italic text-gray-800 text-sm leading-relaxed mb-4 line-clamp-3">"{item.quote}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">{item.bookId?.title || '책이름'}</span>
                  <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center text-[8px] text-white">
                    {item.userId?.nickname ? item.userId.nickname[0] : 'U'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm py-4">아직 전시된 문장이 없습니다.</p>
          )}

        </div>
      </section>

      {/* 4. 메인 콘텐츠 포털 레이아웃: 모임방 & 랭킹 */}
      <main className="px-6 py-12 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 왼쪽 영역: 모임방 리스트 (백엔드 연동) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black">🤝 참여를 기다리는 모임방</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full">전체</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.length > 0 ? (
              rooms.map((room, idx) => {
                const isFull = room.members?.length >= (room.maxMembers || 4);
                
                return (
                  <div key={idx} className="bg-white p-7 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                    {isFull && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl shadow-sm">모집 마감</div>
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.roomType === '온라인' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                        {room.roomType || '온라인'}
                      </span>
                      <span className={`text-[10px] font-bold flex items-center ${isFull ? 'text-red-500' : 'text-gray-400'}`}>
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                        {room.members?.length || 0} / {room.maxMembers || 4}명
                      </span>
                    </div>
                    <Link href={`/rooms/${room._id}`}>
                      <h4 className="text-lg font-black mb-2 group-hover:text-gray-600 transition-colors">{room.roomName || '방 제목 없음'}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">함께 읽고 함께 성장하는 교환독서 모임방입니다.</p>
                    </Link>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-400 text-sm py-4">개설된 모임방이 없습니다.</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Link href="/rooms" className="group flex items-center space-x-2 text-xs font-black tracking-widest text-gray-400 hover:text-black transition-colors">
              <span className="border-b border-transparent group-hover:border-black pb-0.5 transition-colors">EXPLORE MORE ROOMS</span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>

        {/* 오른쪽 영역: 책 추천 랭킹 (백엔드 연동) */}
        <aside className="lg:col-span-4 space-y-10">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black tracking-[0.3em] text-gray-400 mb-8 uppercase">Book Ranking</h3>
            <div className="space-y-6">
              {rankings.length > 0 ? (
                rankings.map((book, idx) => (
                  <div key={idx} className="flex items-center group cursor-pointer">
                    <span className="text-xl font-serif italic text-gray-200 group-hover:text-black transition-colors w-8">{idx + 1}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold leading-none mb-1">{book.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">{book.author || '저자 미상'}</p>
                    </div>
                    {/* 클수가 높을수록 인기있으므로 가상의 트렌드 아이콘 표시 */}
                    <span className="text-[10px] text-red-500 font-black">▲</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">아직 랭킹 데이터가 없습니다.</p>
              )}
            </div>
            <button className="w-full mt-10 py-3 bg-gray-50 text-[10px] font-black tracking-widest text-gray-400 hover:bg-black hover:text-white transition rounded-xl">더보기</button>
          </section>

          <div className="bg-gray-900 text-white p-8 rounded-3xl relative overflow-hidden">
             <div className="relative z-10">
               <h4 className="text-lg font-black mb-2 italic">Text Hip Archive</h4>
               <p className="text-xs text-gray-400 leading-relaxed font-light">당신이 수집한 문장이 누군가의 내일을 바꿀 수 있습니다.</p>
             </div>
             <div className="absolute -bottom-4 -right-4 text-white/5 font-serif text-8xl italic font-black select-none">"</div>
          </div>
        </aside>
      </main>

      {/* 우측 하단 플로팅 글쓰기 버튼 */}
      <button 
        onClick={() => {
          if(!isLoggedIn) { alert("기록을 남기려면 로그인이 필요합니다."); router.push('/login'); return; }
        }} 
        className="fixed bottom-10 right-10 z-50 w-16 h-16 bg-black text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>
    </div>
  );
}
