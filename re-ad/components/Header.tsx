"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserWidget from '@/components/UserWidget';
import './header.css';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navLinkClass = (path: string) => {
    const isActive = pathname && pathname.startsWith(path);
    return `nav-link${isActive ? ' active' : ''}`;
  };

  // 메뉴 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [mobileMenuOpen]);

  // 페이지 이동 시 메뉴 닫기
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: '/ranking',     label: '랭킹' },
    { href: '/annotations', label: '필사' },
    { href: '/rooms',       label: '모임' },
    { href: '/handmedowns', label: '나눔' },
    { href: '/search',      label: '친구찾기' },
    { href: '/dms',         label: '메시지' },
  ];

  return (
    <header className="site-header">
      {/* 로고 */}
      <div className="header-logo-wrap">
        <Link href="/" className="header-logo-link">
          <span className="header-logo-leaf">🌿</span>
          <h1 className="header-logo-text">이음</h1>
        </Link>
      </div>

      {/* 데스크탑 네비게이션 */}
      <nav className="header-nav">
        {navItems.map(item => (
          <Link key={item.href} href={item.href} className={navLinkClass(item.href)}>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 우측 영역: 위젯 + 모바일 햄버거 */}
      <div className="header-right">
        {/* 우측 유저 위젯 */}
        <div className="header-widget-wrap">
          <UserWidget />
        </div>

        {/* 모바일 전용 점 세 개 버튼 */}
        <div className="mobile-menu-wrap" ref={menuRef}>
          <button
            className={`mobile-menu-btn${mobileMenuOpen ? ' open' : ''}`}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="메뉴 열기"
          >
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
          </button>

          {/* 드롭다운 메뉴 */}
          {mobileMenuOpen && (
            <div className="mobile-menu-dropdown">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`mobile-nav-link${pathname?.startsWith(item.href) ? ' active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}