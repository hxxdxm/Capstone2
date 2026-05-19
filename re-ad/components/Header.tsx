"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true);
    }
  }, []);

  const getLinkStyle = (path: string) => {
    if (pathname && pathname.startsWith(path)) {
      return "text-sm font-black text-black border-b-2 border-black pb-1";
    }
    return "text-sm font-black text-gray-400 hover:text-black transition pb-1 uppercase tracking-widest";
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    setIsLoggedIn(false);
    alert("로그아웃 되었습니다.");
    window.location.href = '/';
  };

  return (
    <header className="bg-white/90 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
      {/* 로고 */}
      <div className="flex-1">
        <Link href="/" className="inline-flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter text-black">교환<span className="text-gray-400">독서</span></h1>
        </Link>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8 items-center">
        <Link href="/ranking" className={getLinkStyle('/ranking')}>랭킹</Link>
        <Link href="/annotations" className={getLinkStyle('/annotations')}>필사</Link>
        <Link href="/rooms" className={getLinkStyle('/rooms')}>모임</Link>
        <Link href="/handmedowns" className={getLinkStyle('/handmedowns')}>나눔</Link>
        <Link href="/search" className={getLinkStyle('/search')}>친구찾기</Link>
      </nav>

      {/* 우측: 로그인/마이페이지 */}
      <div className="flex-1 flex justify-end items-center space-x-4">
        {isLoggedIn ? (
          <>
            <button onClick={handleLogout} className="text-xs font-black text-gray-400 hover:text-black transition uppercase tracking-widest">로그아웃</button>
            <Link href="/mypage" className="text-xs font-black bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm uppercase tracking-widest">마이페이지</Link>
          </>
        ) : (
          <>
            <Link href="/login" className="text-xs font-black text-gray-400 hover:text-black transition uppercase tracking-widest">로그인</Link>
            <Link href="/signup" className="text-xs font-black bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm uppercase tracking-widest">회원가입</Link>
          </>
        )}
      </div>
    </header>
  );
}