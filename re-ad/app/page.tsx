"use client";

import React from 'react';
import Link from 'next/link';

export default function MainPage() {
  // 1. 네비게이션 메뉴 구성 (협업자가 경로를 수정하기 편하게 배열로 관리)
  const navMenus = [
    { name: '독서 목록', href: '/', icon: '📚' },
    { name: '메시지', href: '/messages', icon: '💬' },
    { name: '마이페이지', href: '/mypage', icon: '👤' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F8F9FA] text-gray-900">
      
      {/* --- [왼쪽 사이드 네비게이션 바] --- */}
      <aside className="w-20 lg:w-64 flex flex-col border-r border-gray-200 bg-white transition-all">
        <div className="p-6">
          <h1 className="text-xl font-black tracking-tighter">
            <span className="text-green-600 lg:inline hidden">교환</span>
            <span className="text-orange-500 lg:inline hidden">독서</span>
            <span className="text-green-600 lg:hidden font-black">교</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2 px-4">
          {navMenus.map((menu) => (
            <Link 
              key={menu.name} 
              href={menu.href}
              className="flex items-center space-x-3 rounded-xl p-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition group"
            >
              <span className="text-xl">{menu.icon}</span>
              <span className="font-bold lg:block hidden">{menu.name}</span>
            </Link>
          ))}
        </nav>

        {/* 하단 로그아웃 버튼 자리 */}
        <div className="p-4 border-t border-gray-100">
          <button className="flex w-full items-center space-x-3 p-3 text-gray-400 hover:text-red-500">
            <span>🚪</span>
            <span className="font-medium lg:block hidden">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* --- [메인 콘텐츠 영역] --- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* 상단 검색 및 필터 바 */}
        <header className="flex items-center justify-between bg-white px-8 py-4 shadow-sm">
          <div className="relative w-full max-w-md">
            <input 
              type="text" 
              placeholder="읽고 싶은 책을 검색해 보세요" 
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:bg-white outline-none transition"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          <div className="flex items-center space-x-4">
             <button className="rounded-full bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600 transition">
               + 책 등록
             </button>
          </div>
        </header>

        {/* 실제 도서 그리드 영역 */}
        <section className="flex-1 overflow-y-auto p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">전체 독서 목록</h2>
            <div className="flex space-x-2">
               <span className="text-xs font-medium text-gray-400">최신순</span>
               <span className="text-xs font-medium text-gray-200">|</span>
               <span className="text-xs font-medium text-gray-400">인기순</span>
            </div>
          </div>

          {/* 도서 카드 리스트 (이 부분에 나중에 API 데이터를 뿌리면 됩니다) */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="group cursor-pointer rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100 transition hover:shadow-lg hover:ring-green-100">
                <div className="aspect-[3/4] mb-4 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center text-gray-300 font-bold group-hover:bg-green-50 transition text-xs">
                  BOOK IMAGE
                </div>
                <h4 className="font-bold text-gray-800 truncate">책 제목입니다 {item}</h4>
                <p className="text-xs text-gray-500 mt-1">저자 이름</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">교환가능</span>
                  <span className="text-[10px] text-gray-400 italic">주인장님</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

    </div>
  );
}