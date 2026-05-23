"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserWidget from '@/components/UserWidget';

export default function Header() {
  const pathname = usePathname();

  const getLinkStyle = (path: string) => {
    if (pathname && pathname.startsWith(path)) {
      return "text-sm font-black text-black border-b-2 border-black pb-1";
    }
    return "text-sm font-black text-gray-400 hover:text-black transition pb-1 uppercase tracking-widest";
  };

  return (
    <header className="bg-white/90 backdrop-blur-md px-8 py-4 flex items-center sticky top-0 z-50 border-b border-gray-100">
      {/* 로고 */}
      <div className="flex-1">
        <Link href="/" className="inline-flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter text-black">교환<span className="text-gray-400">독서</span></h1>
        </Link>
      </div>

      {/* 네비게이션 메뉴 */}
      <nav className="flex space-x-8 items-center">
        <Link href="/ranking" className={getLinkStyle('/ranking')}>랭킹</Link>
        <Link href="/annotations" className={getLinkStyle('/annotations')}>필사</Link>
        <Link href="/rooms" className={getLinkStyle('/rooms')}>모임</Link>
        <Link href="/handmedowns" className={getLinkStyle('/handmedowns')}>나눔</Link>
        <Link href="/search" className={getLinkStyle('/search')}>친구찾기</Link>
      </nav>

      {/* 우측 유저 위젯 */}
      <div className="flex-1 flex justify-end items-center">
        <UserWidget />
      </div>
    </header>
  );
}