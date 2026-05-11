"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  
  // 📍 임시 로그인 상태 관리 (true면 로그인됨, false면 로그아웃됨)
  // 나중에 백엔드와 연결할 때 이 부분을 토큰 확인 로직으로 바꾸시면 됩니다!
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 현재 메뉴에 밑줄 긋는 함수
  const getLinkStyle = (path: string) => {
    if (pathname && pathname.startsWith(path)) {
      return "text-sm font-bold text-black border-b-2 border-black pb-1";
    }
    return "text-sm font-bold text-gray-500 hover:text-black transition pb-1";
  };

  // 로그아웃 버튼 눌렀을 때의 동작
  const handleLogout = () => {
    setIsLoggedIn(false);
    // localStorage.removeItem('token'); // 실제 구현 시 이런 식으로 토큰을 지웁니다.
    alert("로그아웃 되었습니다.");
  };

  return (
    <header className="bg-white/90 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
      
      {/* 1. 좌측: 메인 페이지로 가는 로고 */}
      <div className="flex-1">
        <Link href="/" className="inline-flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter text-black">교환<span className="text-gray-400">독서</span></h1>
        </Link>
      </div>

      {/* 2. 중앙: 내비게이션 (정중앙 고정) */}
      <nav className="absolute left-1/2 transform -translate-x-1/2 flex space-x-8 items-center">
        <Link href="/ranking" className={getLinkStyle('/ranking')}>북랭킹</Link>
        <Link href="/exhibition" className={getLinkStyle('/exhibition')}>필사전시</Link>
        <Link href="/rooms" className={getLinkStyle('/rooms')}>모임방</Link>
        <Link href="/handmedowns" className={getLinkStyle('/handmedowns')}>물려주기</Link>
      </nav>

      {/* 3. 우측: 로그인 여부에 따라 바뀌는 버튼들 */}
      <div className="flex-1 flex justify-end items-center space-x-4">
        {isLoggedIn ? (
          // 로그인 되어있을 때
          <>
            <button 
              onClick={handleLogout} 
              className="text-xs font-bold text-gray-500 hover:text-black transition"
            >
              로그아웃
            </button>
            <Link 
              href="/mypage" 
              className="text-xs font-black bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm"
            >
              마이페이지
            </Link>
          </>
        ) : (
          // 로그인 안 되어있을 때
          <>
            <Link 
              href="/login" 
              className="text-xs font-bold text-gray-500 hover:text-black transition"
            >
              로그인
            </Link>
            <Link 
              href="/signup" 
              className="text-xs font-black bg-black text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition shadow-sm"
            >
              회원가입
            </Link>
          </>
        )}
      </div>

    </header>
  );
}