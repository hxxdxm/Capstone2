"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // ⭐️ 1. [백엔드 연동] 진짜 데이터를 담을 바구니(State) 준비
  // 처음엔 빈 배열([])로 시작해서, 백엔드에서 데이터를 주면 채워 넣습니다.
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);

  // 배너 데이터 (이 부분은 보통 고정해두거나 관리자 페이지에서 따로 관리합니다)
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

  // ⭐️ 2. [백엔드 연동] 화면이 켜질 때 DB에서 데이터 가져오기
  useEffect(() => {
    // 로그인 상태 확인 (세션/로컬 스토리지 통합)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }

    // 캐러셀 자동 타이머
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    // 💡 [API 호출] 최근 필사 전시글 5개 가져오기
    fetch('http://13.124.191.57:5000/api/annotations?limit=5')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExhibitions(data);
      })
      .catch(err => console.error("필사 데이터 불러오기 실패:", err));

    // 💡 [API 호출] 최근 모임방 목록 가져오기
    fetch('http://13.124.191.57:5000/api/rooms')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRooms(data);
      })
      .catch(err => console.error("모임방 데이터 불러오기 실패:", err));

    return () => clearInterval(timer);
  }, [banners.length]);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userName');
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
              className="w-full bg-gray-100 border-none rounded-full py-2.5 pl-5 pr-12 text-xs focus:ring-2 focus:ring-black transition font-bold"
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
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-[10px] text-white font-black group-hover:bg-gray-700 transition">MY</div>
                  <span className="text-sm font-bold hidden sm:inline-block">마이페이지</span>
                </Link>
                <button onClick={handleLogout} className="text-xs font-bold text-gray-400 hover:text-gray-900 transition ml-2">로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-black transition">로그인</Link>
                <Link href="/register" className="text-sm font-bold bg-black text-white px-5 py-2 rounded-full hover:bg-gray-800 transition shadow-lg">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. 캐러셀형 메인 배너 영역 (동일) */}
      <section className="px-6 py-8 mx-auto max-w-7xl relative group">
        <div className="relative h-[300px] md:h-[400px] bg-black rounded-3xl overflow-hidden shadow-xl">
          {banners.map((banner, index) => (
            <div 
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105"
                style={{ backgroundImage: `url(${banner.image})` }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-10 left-10 text-white z-20">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest mb-4">
                  {banner.tag}
                </span>
                <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight whitespace-pre-line">
                  {banner.title}
                </h2>
                <p className="text-gray-300 text-sm font-medium">
                  {banner.desc}
                </p>
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
              <button 
                key={index}
                onClick={() => setCurrentBannerIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${index === currentBannerIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
              ></button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. 필사 전시 레이아웃 */}
      <section className="px-6 py-10 mx-auto max-w-7xl border-b border-gray-100">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Link href="/exhibition" className="group block">
              <h3 className="text-2xl font-black italic tracking-tighter group-hover:text-gray-500 transition-colors">
                필사 전시회
              </h3>
            </Link>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">오늘의 영감을 준 문장들</p>
          </div>
          <Link 
            href="/exhibition" 
            className="text-xs font-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition"
          >
            VIEW ALL
          </Link>
        </div>
        
        {/* ⭐️ 3-1. [백엔드 연동] 실제 데이터를 화면에 뿌려주기 */}
        <div className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar">
          {exhibitions.length > 0 ? (
            exhibitions.map((item) => (
              <div key={item._id} className="min-w-[280px] max-w-[280px] bg-white p-6 rounded-2xl shadow-sm border border-gray-50 group cursor-pointer hover:border-black transition-colors flex flex-col justify-between">
                <div>
                  <div className="h-40 bg-gray-100 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center p-4">
                    {item.type === 'image' && item.image ? (
                      <img src={item.image} alt="손글씨" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className={`w-full h-full rounded-lg ${item.style || 'bg-white'} border border-gray-200 flex items-center justify-center p-4 shadow-sm`}>
                         <p className="text-xs font-serif text-center line-clamp-4 break-keep">"{item.quote}"</p>
                      </div>
                    )}
                  </div>
                  <p className="font-serif italic text-gray-800 text-sm leading-relaxed mb-4 line-clamp-2">"{item.quote}"</p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase truncate pr-2">{item.bookName || '알 수 없는 책'} | {item.author || '작자 미상'}</span>
                  <div className="w-6 h-6 bg-black rounded-full flex-shrink-0 flex items-center justify-center text-[8px] text-white">ID</div>
                </div>
              </div>
            ))
          ) : (
            // 데이터가 아직 로딩 중이거나 없을 때 보여줄 안내문
            <div className="w-full text-center py-10 text-gray-400 font-bold text-sm">
              아직 등록된 전시글이 없습니다. 첫 번째 문장의 주인공이 되어보세요!
            </div>
          )}
        </div>
      </section>

      {/* 4. 메인 콘텐츠: 모임방 & 랭킹 */}
      <main className="px-6 py-12 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 왼쪽 영역: 모임방 리스트 */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight">🤝 참여를 기다리는 모임방</h3>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-full">전체</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-400 text-[10px] font-bold rounded-full hover:bg-gray-200 transition">온라인</button>
            </div>
          </div>

          {/* ⭐️ 3-2. [백엔드 연동] 모임방 실제 데이터 뿌려주기 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.length > 0 ? (
              rooms.slice(0, 4).map((room) => {
                const isFull = room.participants?.length >= (room.maxMembers || 8);
                
                return (
                  <div key={room._id} className="bg-white p-7 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden flex flex-col justify-between h-full">
                    {isFull && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl shadow-sm">
                        모집 마감
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.type === '온라인' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                          {room.type || '온/오프라인'}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center ${isFull ? 'text-red-500' : 'text-gray-400'}`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                          {room.participants?.length || 0} / {room.maxMembers || 8}명
                        </span>
                      </div>
                      <Link href={`/rooms/${room._id}`}>
                        <h4 className="text-lg font-black mb-2 group-hover:text-gray-600 transition-colors line-clamp-1">{room.title}</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2 break-keep">{room.description}</p>
                      </Link>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-auto">
                      {(room.tags || ['독서', '친목']).map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md">#{tag}</span>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-400 font-bold text-sm bg-white rounded-3xl border border-gray-100">
                현재 개설된 모임방이 없습니다.
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Link 
              href="/rooms" 
              className="group flex items-center space-x-2 text-xs font-black tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              <span className="border-b border-transparent group-hover:border-black pb-0.5 transition-colors">
                EXPLORE MORE ROOMS
              </span>
              <svg className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>

        {/* 오른쪽 영역: 책 추천 랭킹 (동일) */}
        <aside className="lg:col-span-4 space-y-10">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black tracking-[0.3em] text-gray-400 mb-8 uppercase">Book Ranking</h3>
            <div className="space-y-6">
              {[
                { title: "모순", author: "양귀자", trend: "up" },
                { title: "다정한 것이 살아남는다", author: "브라이언 헤어", trend: "up" },
                { title: "클린 코드", author: "로버트 C. 마틴", trend: "down" },
                { title: "코스모스", author: "칼 세이건", trend: "stable" },
                { title: "사피엔스", author: "유발 하라리", trend: "up" },
              ].map((book, idx) => (
                <div key={idx} className="flex items-center group cursor-pointer">
                  <span className="text-xl font-serif italic text-gray-200 group-hover:text-black transition-colors w-8">{idx + 1}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold leading-none mb-1">{book.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">{book.author}</p>
                  </div>
                  {book.trend === 'up' && <span className="text-[10px] text-red-500 font-black">▲</span>}
                  {book.trend === 'down' && <span className="text-[10px] text-blue-500 font-black">▼</span>}
                </div>
              ))}
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
    </div>
  );
}