"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ⭐️ [핵심 수정] 페이지가 렌더링될 때 브라우저 저장소의 토큰을 확인합니다!
  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const getLinkStyle = (path: string) => {
    if (pathname && pathname.startsWith(path)) {
      return "text-sm font-bold text-black border-b-2 border-black pb-1";
    }
    return "text-sm font-bold text-gray-500 hover:text-black transition pb-1";
  };

  const handleLogout = () => {
    // ⭐️ 로그아웃 시 토큰도 같이 지워줍니다
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    window.location.href = '/'; // 메인으로 튕겨내기
  };

  return (
    <header className="bg-white/90 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
      <div className="flex-1">
        <Link href="/" className="inline-flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter text-black">교환<span className="text-gray-400">독서</span></h1>
        </Link>
      </div>

      <nav className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8 items-center">
        <Link href="/ranking" className={getLinkStyle('/ranking')}>북랭킹</Link>
        <Link href="/exhibition" className={getLinkStyle('/exhibition')}>필사전시</Link>
        <Link href="/rooms" className={getLinkStyle('/rooms')}>모임방</Link>
        <Link href="/handmedowns" className={getLinkStyle('/handmedowns')}>물려주기</Link>
      </nav>

      <div className="flex-1 flex justify-end items-center space-x-4">
        {isLoggedIn ? (
          <>
            <button onClick={handleLogout} className="text-xs font-bold text-gray-500 hover:text-black transition">로그아웃</button>
            <Link href="/mypage" className="text-xs font-black bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm">마이페이지</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="text-xs font-bold text-gray-500 hover:text-black transition">로그인</Link>
            <Link href="/signup" className="text-xs font-black bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}