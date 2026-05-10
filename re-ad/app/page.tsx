"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function MainPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // 실데이터 상태 관리
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]); // ⭐️ 북랭킹 데이터
  const [handMeDowns, setHandMeDowns] = useState<any[]>([]); // ⭐️ 물려주기 데이터

  // 배너 데이터 (이벤트성 공지는 유지하되 깔끔하게 정리)
  const banners = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000",
      tag: "SERVICE",
      title: "나의 독서 성향은?\nMBTI 테스트 하러가기",
      link: "/mypage"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000",
      tag: "SHARE",
      title: "안 읽는 책이 있다면?\n이웃에게 물려주기",
      link: "/handmedowns"
    }
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }

    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    // 1. [API] 필사 데이터 최신 4개 (링크 수정: /annotations)
    fetch(`${API_BASE_URL}/annotations`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setExhibitions(data.slice(0, 4));
      }).catch(err => console.error(err));

    // 2. [API] 모임방 데이터 최신 4개
    fetch(`${API_BASE_URL}/rooms`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRooms(data.slice(0, 4));
      }).catch(err => console.error(err));

    // 3. [API] ⭐️ 북랭킹 데이터 5개 (추천 도서)
    fetch(`${API_BASE_URL}/books`) // 실제 백엔드 랭킹/도서 엔드포인트
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRankings(data.slice(0, 5));
      }).catch(err => console.error(err));

    // 4. [API] ⭐️ 물려주기 최신 3개
    fetch(`${API_BASE_URL}/handmedowns`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHandMeDowns(data.slice(0, 3));
      }).catch(err => console.error(err));

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userName');
      setIsLoggedIn(false);
      alert("로그아웃 되었습니다.");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      
      {/* 1. 상단 헤더 (메뉴 정리) */}
      <header className="bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></Link>
        
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 space-x-8 text-sm font-black">
          <Link href="/ranking" className="hover:text-gray-400 transition">북랭킹</Link>
          <Link href="/rooms" className="hover:text-gray-400 transition">모임방</Link>
          <Link href="/handmedowns" className="hover:text-gray-400 transition">물려주기</Link>
          <Link href="/mypage" className="hover:text-gray-400 transition">마이페이지</Link>
        </nav>

        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link href="/mypage" className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-[10px] font-black hover:bg-gray-800 transition">MY</Link>
              <button onClick={handleLogout} className="text-xs font-bold text-gray-400">로그아웃</button>
            </div>
          ) : (
            <Link href="/login" className="text-sm font-bold bg-black text-white px-6 py-2.5 rounded-full shadow-lg">시작하기</Link>
          )}
        </div>
      </header>

      {/* 2. 메인 배너 */}
      <section className="px-6 py-8 mx-auto max-w-7xl">
        <Link href={banners[currentBannerIndex].link}>
          <div className="relative h-[300px] md:h-[450px] bg-black rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer">
            <div className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-1000 group-hover:scale-105" style={{ backgroundImage: `url(${banners[currentBannerIndex].image})` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-12 left-12 text-white">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black tracking-widest mb-6 uppercase">{banners[currentBannerIndex].tag}</span>
              <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight whitespace-pre-line">{banners[currentBannerIndex].title}</h2>
              <p className="text-gray-400 text-sm font-bold">자세히 보기 &rarr;</p>
            </div>
          </div>
        </Link>
      </section>

      {/* 3. 퀵 메뉴 (MBTI, 영수증 바로가기) - ⭐️ 추가 기능 연결 */}
      <section className="px-6 py-10 mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/mypage" className="bg-purple-600 p-8 rounded-[2.5rem] text-white shadow-xl hover:-translate-y-2 transition-transform">
          <p className="text-[10px] font-black tracking-widest opacity-60 mb-2 uppercase">Analysis</p>
          <h4 className="text-xl font-black mb-4">독서 성향 MBTI<br/>테스트 하기</h4>
          <span className="text-xs font-bold bg-white/20 px-4 py-2 rounded-full">Go Test</span>
        </Link>
        <Link href="/mypage" className="bg-black p-8 rounded-[2.5rem] text-white shadow-xl hover:-translate-y-2 transition-transform">
          <p className="text-[10px] font-black tracking-widest opacity-60 mb-2 uppercase">Dashboard</p>
          <h4 className="text-xl font-black mb-4">이번 달 나의<br/>독서 영수증 🧾</h4>
          <span className="text-xs font-bold bg-white/20 px-4 py-2 rounded-full">View Receipt</span>
        </Link>
        <Link href="/handmedowns" className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl hover:-translate-y-2 transition-transform">
          <p className="text-[10px] font-black tracking-widest text-gray-400 mb-2 uppercase">Exchange</p>
          <h4 className="text-xl font-black mb-4 text-black">중고 도서<br/>물려주기 게시판</h4>
          <span className="text-xs font-bold bg-gray-100 text-gray-400 px-4 py-2 rounded-full">Explore</span>
        </Link>
      </section>

      {/* 4. 필사 전시회 (링크 수정: /annotations) */}
      <section className="px-6 py-10 mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-black italic tracking-tighter">My Collection</h3>
          <Link href="/annotations" className="text-xs font-black border-b-2 border-black pb-1">VIEW ALL</Link>
        </div>
        <div className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar">
          {exhibitions.map((item) => (
            <Link href="/annotations" key={item._id} className="min-w-[300px] bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between h-[280px]">
              <p className="font-serif text-gray-800 leading-relaxed italic line-clamp-5">"{item.quote || item.content}"</p>
              <div className="mt-6 pt-6 border-t border-gray-50">
                <p className="text-[10px] font-black uppercase text-gray-400">{item.bookTitle || 'Book'}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. 메인 그리드 (모임방 & 랭킹) */}
      <main className="px-6 py-12 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* 좌측: 모임방 */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black">참여 중인 모임</h3>
            <Link href="/rooms" className="text-xs font-black text-gray-400">전체보기</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rooms.map((room) => (
              <Link href={`/rooms/${room._id}`} key={room._id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:border-black transition-all group h-[220px] flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-2 py-1 rounded mb-4 inline-block">{room.roomType || 'Online'}</span>
                  <h4 className="text-xl font-black group-hover:text-gray-600 transition-colors line-clamp-1">{room.roomName}</h4>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{room.roomDesc}</p>
                </div>
                <div className="flex items-center text-[10px] font-black text-gray-300">
                  <span className="mr-3">Members {room.members?.length || 0}/{room.maxMembers}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 우측: 실데이터 북랭킹 */}
        <aside className="lg:col-span-4">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm sticky top-24">
            <h3 className="text-xs font-black tracking-[0.3em] text-gray-400 mb-10 uppercase text-center">Top Ranking</h3>
            <div className="space-y-8">
              {rankings.map((book, idx) => (
                <Link href="/ranking" key={idx} className="flex items-center group">
                  <span className="text-2xl font-serif italic text-gray-200 group-hover:text-black transition-colors w-10">{idx + 1}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-black leading-none mb-1.5 group-hover:text-gray-600 transition-colors">{book.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold">{book.author}</p>
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/ranking" className="block text-center w-full mt-10 py-4 bg-gray-50 text-[10px] font-black tracking-widest text-gray-400 hover:bg-black hover:text-white transition rounded-2xl">VIEW ALL RANKING</Link>
          </div>
        </aside>
      </main>
    </div>
  );
}