"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function UserWidget() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const name = localStorage.getItem('userName') || sessionStorage.getItem('userName') || '';
    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true);
      if (name) {
        setUserName(name);
      } else {
        // 닉네임이 저장되어 있지 않으면 API로 사용자 정보 조회
        fetch('http://13.124.191.57:5000/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => {
            if (data) {
              const fetchedName = data.username || '';
              setUserName(fetchedName);
              // 스토리지에도 저장
              if (localStorage.getItem('token')) localStorage.setItem('userName', fetchedName);
              else sessionStorage.setItem('userName', fetchedName);
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName('');
    alert('로그아웃 되었습니다.');
    window.location.href = '/';
  };

  return (
    <div
      className="fixed right-5 z-40"
      style={{ top: '72px' }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* 위젯 카드 */}
      <div
        className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 ease-in-out"
        style={{ width: isExpanded ? '160px' : '48px' }}
      >
        {isLoggedIn ? (
          <>
            {/* 축소 상태: 아바타 아이콘만 */}
            <div className="flex items-center justify-center h-12 px-3 gap-3 whitespace-nowrap">
              {/* 아바타 */}
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
              {/* 확장 상태: 이름 표시 */}
              <span
                className="text-xs font-black text-gray-800 truncate transition-all duration-300"
                style={{ opacity: isExpanded ? 1 : 0, maxWidth: isExpanded ? '80px' : '0px' }}
              >
                {userName || '회원'}
              </span>
            </div>

            {/* 확장 시 메뉴 */}
            <div
              className="border-t border-gray-100 transition-all duration-300 overflow-hidden"
              style={{ maxHeight: isExpanded ? '120px' : '0px', opacity: isExpanded ? 1 : 0 }}
            >
              <Link
                href="/mypage"
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                마이페이지
              </Link>
              <Link
                href="/record"
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                독서 기록
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-gray-400 hover:bg-gray-50 hover:text-red-500 transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </div>
          </>
        ) : (
          <>
            {/* 비로그인: 사람 아이콘 */}
            <div className="flex items-center justify-center h-12 px-3 gap-3 whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span
                className="text-xs font-black text-gray-500 transition-all duration-300"
                style={{ opacity: isExpanded ? 1 : 0, maxWidth: isExpanded ? '80px' : '0px' }}
              >
                로그인
              </span>
            </div>

            <div
              className="border-t border-gray-100 transition-all duration-300 overflow-hidden"
              style={{ maxHeight: isExpanded ? '80px' : '0px', opacity: isExpanded ? 1 : 0 }}
            >
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                로그인
              </Link>
              <Link
                href="/signup"
                className="flex items-center gap-2 px-4 py-2.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-black transition-colors whitespace-nowrap"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                회원가입
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
