"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true);
    }
  }, []);

  // 검색창이 열릴 때 자동 포커스
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
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
      </nav>

      {/* 우측 영역: 검색 + 로그인/마이페이지 */}
      <div className="flex-1 flex justify-end items-center space-x-3">

        {/* 🔍 인라인 검색창 */}
        <div className="flex items-center">
          {isSearchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-gray-50 border border-gray-200 rounded-full overflow-hidden transition-all duration-300 w-52 shadow-sm"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="닉네임으로 검색..."
                className="flex-1 bg-transparent px-4 py-2 text-xs font-bold text-gray-700 placeholder-gray-400 focus:outline-none"
                onKeyDown={(e) => e.key === 'Escape' && handleSearchClose()}
              />
              <button type="submit" className="p-2 text-gray-500 hover:text-black transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
              <button type="button" onClick={handleSearchClose} className="p-2 text-gray-400 hover:text-black transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-9 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-black transition"
              aria-label="검색"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          )}
        </div>

        {/* 로그인 상태별 버튼 */}
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