"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserWidget from '@/components/UserWidget';
import './header.css';

export default function Header() {
  const pathname = usePathname();

  const navLinkClass = (path: string) => {
    const isActive = pathname && pathname.startsWith(path);
    return `nav-link${isActive ? ' active' : ''}`;
  };

  return (
    <header className="site-header">
      {/* 로고 */}
      <div className="header-logo-wrap">
        <Link href="/" className="header-logo-link">
          <span className="header-logo-leaf">🌿</span>
          <h1 className="header-logo-text">이음</h1>
        </Link>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="header-nav">
        <Link href="/ranking"    className={navLinkClass('/ranking')}>랭킹</Link>
        <Link href="/annotations" className={navLinkClass('/annotations')}>필사</Link>
        <Link href="/rooms"      className={navLinkClass('/rooms')}>모임</Link>
        <Link href="/handmedowns" className={navLinkClass('/handmedowns')}>나눔</Link>
        <Link href="/search"     className={navLinkClass('/search')}>친구찾기</Link>
      </nav>

      {/* 우측 유저 위젯 */}
      <div className="header-widget-wrap">
        <UserWidget />
      </div>
    </header>
  );
}