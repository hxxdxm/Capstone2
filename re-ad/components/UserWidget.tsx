"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import './header.css';

export default function UserWidget() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const name = localStorage.getItem('userName') || sessionStorage.getItem('userName') || '';

    if (token && token !== 'undefined' && token !== 'null') {
      setIsLoggedIn(true);

      if (name) {
        setUserName(name);
        return;
      }

      // 1) JWT payload에서 닉네임 추출 시도
      try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        console.log('🪙 JWT payload:', payload);
        const jwtName = payload.nickname || payload.name || payload.email?.split('@')[0] || '';
        if (jwtName) {
          setUserName(jwtName);
          if (localStorage.getItem('token')) localStorage.setItem('userName', jwtName);
          else sessionStorage.setItem('userName', jwtName);
          return;
        }
      } catch {}

      // 2) API로 사용자 정보 조회 (여러 엔드포인트 시도)
      const endpoints = [
        'http://13.124.191.57:5000/api/users/me',
        'http://13.124.191.57:5000/api/users/my-profile',
        'http://13.124.191.57:5000/api/users/profile',
      ];

      const tryFetch = (idx: number) => {
        if (idx >= endpoints.length) return;
        fetch(endpoints[idx], { headers: { 'Authorization': `Bearer ${token}` } })
          .then(res => {
            if (!res.ok) { tryFetch(idx + 1); return null; }
            return res.json();
          })
          .then(data => {
            if (!data) return;
            console.log(`📡 ${endpoints[idx]} 응답:`, data);
            const user = data.user || data.data || data;
            const fetchedName =
              user.nickname || user.name ||
              data.nickname || data.name || '';
            if (fetchedName) {
              setUserName(fetchedName);
              if (localStorage.getItem('token')) localStorage.setItem('userName', fetchedName);
              else sessionStorage.setItem('userName', fetchedName);
            }
          })
          .catch(() => tryFetch(idx + 1));
      };
      tryFetch(0);
    }
  }, []);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName('');
    setIsOpen(false);
    window.location.href = '/';
  };

  /* ── 로그인 상태 ── */
  if (isLoggedIn) {
    return (
      <div className="relative">
        {/* 트리거 버튼 — 닉네임 + 아바타 */}
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(prev => !prev)}
          className="widget-trigger"
        >
          <div className="widget-avatar">
            {userName ? userName[0].toUpperCase() : '?'}
          </div>
          <span className="widget-username">{userName}</span>
          <svg
            className={`widget-chevron${isOpen ? ' open' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* 드롭다운 패널 */}
        {isOpen && (
          <div ref={panelRef} className="widget-dropdown">
            {/* 상단 프로필 영역 */}
            <div className="dropdown-profile">
              <div className="dropdown-avatar-lg">
                {userName ? userName[0].toUpperCase() : '?'}
              </div>
              <div>
                <div className="dropdown-profile-name">
                  {userName}<span style={{ fontWeight: 400, color: '#8A7A60' }}>님</span>
                </div>
                <div className="dropdown-profile-sub">안녕하세요 🌿</div>
              </div>
            </div>

            {/* 메뉴 리스트 */}
            <nav className="dropdown-nav">
              <Link
                href="/mypage"
                onClick={() => setIsOpen(false)}
                className="dropdown-menu-link"
              >
                <svg className="dropdown-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                마이페이지
              </Link>

              <Link
                href="/record"
                onClick={() => setIsOpen(false)}
                className="dropdown-menu-link"
              >
                <svg className="dropdown-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                독서 기록
              </Link>

              <Link
                href="/dms"
                onClick={() => setIsOpen(false)}
                className="dropdown-menu-link"
              >
                <svg className="dropdown-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                메시지
              </Link>

              <div className="dropdown-divider" />

              <button onClick={handleLogout} className="dropdown-menu-btn">
                <svg className="dropdown-menu-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                로그아웃
              </button>
            </nav>
          </div>
        )}
      </div>
    );
  }

  /* ── 비로그인 상태 ── */
  return (
    <div className="widget-auth-buttons">
      <Link href="/login" className="btn-login">로그인</Link>
      <Link href="/signup" className="btn-signup">회원가입</Link>
    </div>
  );
}
