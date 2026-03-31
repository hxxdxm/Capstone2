"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function MyPage() {
  // 1. 내 프로필 및 독서 통계 데이터
  const user = {
    name: "독서왕 홍길동",
    email: "gildong@example.com",
    profileImg: "📚", 
    bio: "안녕하세요! 소설과 인문학을 사랑하는 직장인입니다. 주로 주말 오전에 책을 읽어요.",
    stats: {
      temperature: 36.5, // 독서 온도 (활동량)
      activeRooms: 2,    // 현재 참여 중인 모임
      finishedBooks: 14, // 완독한 책 수
    }
  };

  // 2. 내가 참여 중인 독서 방 (진도율 포함)
  const myActiveRooms = [
    { id: 2, title: "퇴근 후 심리학 탐구", currentBook: "미움받을 용기", progress: 65, totalPages: 320, currentPages: 208 },
    { id: 4, title: "프론트엔드 취준생 전공서적 스터디", currentBook: "모던 자바스크립트 Deep Dive", progress: 30, totalPages: 900, currentPages: 270 },
  ];

  // 3. 다 읽은 책 (독서 기록)
  const readingHistory = [
    { id: 101, title: "나미야 잡화점의 기적", author: "히가시노 게이고", date: "2024.03.15", rating: "⭐⭐⭐⭐⭐" },
    { id: 102, title: "불편한 편의점", author: "김호연", date: "2024.02.28", rating: "⭐⭐⭐⭐" },
    { id: 103, title: "사피엔스", author: "유발 하라리", date: "2024.01.10", rating: "⭐⭐⭐⭐⭐" },
  ];

  // 탭 상태 (참여 중인 모임 vs 독서 기록)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24">
      
      {/* --- [상단 네비게이션 바 (메인 페이지와 동일)] --- */}
      <header className="bg-white px-8 py-6 shadow-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3L1 9L4 10.636V17.294C4 18.069 4.436 18.775 5.127 19.121L12 22.558L18.873 19.121C19.564 18.775 20 18.069 20 17.294V10.636L23 9L12 3ZM12 5.279L18.748 8.941L12 12.603L5.252 8.941L12 5.279Z" />
            </svg>
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-green-600">교환</span>
              <span className="text-orange-500">독서</span>
            </h1>
          </Link>
          <div className="flex items-center space-x-6 text-gray-800">
            <button className="hover:text-green-600 transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
            </button>
            <Link href="/messages" className="hover:text-green-600 transition">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
            </Link>
            <Link href="/mypage" className="text-green-600 transition">
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.03 0-4.43-.82-6.14-2.88C7.55 15.8 9.68 15 12 15s4.45.8 6.14 2.12C16.43 19.18 14.03 20 12 20z"/></svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 mt-10">
        
        {/* --- [섹션 1: 프로필 및 독서 통계 카드] --- */}
        <section className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-gray-100 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 shrink-0 rounded-full bg-green-50 flex items-center justify-center text-6xl shadow-inner border-4 border-white ring-4 ring-green-100">
            {user.profileImg}
          </div>
          
          <div className="flex-1 text-center md:text-left w-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
              <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
              <button className="text-sm font-bold text-gray-400 hover:text-green-600 transition mt-2 md:mt-0">프로필 수정</button>
            </div>
            <p className="text-sm text-gray-500 mb-4">{user.email}</p>
            <p className="text-gray-700 leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl">{user.bio}</p>
            
            {/* 통계 지표 */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-orange-50 px-4 py-3 rounded-2xl flex flex-col items-center md:items-start">
                <span className="text-[11px] text-orange-600 font-bold uppercase tracking-wider mb-1">독서 온도</span>
                <p className="text-xl font-black text-orange-700">{user.stats.temperature}°C</p>
              </div>
              <div className="bg-green-50 px-4 py-3 rounded-2xl flex flex-col items-center md:items-start">
                <span className="text-[11px] text-green-600 font-bold uppercase tracking-wider mb-1">참여 중인 모임</span>
                <p className="text-xl font-black text-green-700">{user.stats.activeRooms}개</p>
              </div>
              <div className="bg-blue-50 px-4 py-3 rounded-2xl flex flex-col items-center md:items-start">
                <span className="text-[11px] text-blue-600 font-bold uppercase tracking-wider mb-1">완독한 책</span>
                <p className="text-xl font-black text-blue-700">{user.stats.finishedBooks}권</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- [섹션 2: 하단 탭 (진행 중인 독서 / 독서 기록)] --- */}
        <section className="mt-12">
          <div className="flex space-x-8 border-b border-gray-200 mb-8">
            <button 
              onClick={() => setActiveTab('active')}
              className={`pb-4 text-lg font-bold transition-all relative ${activeTab === 'active' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              현재 읽고 있는 책
              {activeTab === 'active' && <span className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-md"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`pb-4 text-lg font-bold transition-all relative ${activeTab === 'history' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
            >
              나의 독서 기록
              {activeTab === 'history' && <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 rounded-t-md"></span>}
            </button>
          </div>

          {/* 탭 내용 1: 현재 읽고 있는 책 (프로그레스 바 포함) */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {myActiveRooms.map((room) => (
                <div key={room.id} className="bg-white p-6 rounded-3xl shadow-sm ring-1 ring-gray-100 hover:shadow-md transition group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-md">{room.title}</span>
                      </div>
                      <h4 className="text-xl font-black text-gray-900 group-hover:text-green-700 transition">{room.currentBook}</h4>
                    </div>
                    
                    <Link href={`/room/${room.id}`} className="shrink-0 bg-green-50 text-green-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-500 hover:text-white transition">
                      이어서 읽기 →
                    </Link>
                  </div>

                  {/* 진도율 프로그레스 바 */}
                  <div className="mt-6">
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span className="text-green-600">진도율 {room.progress}%</span>
                      <span className="text-gray-400">{room.currentPages} / {room.totalPages}쪽</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-green-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${room.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 탭 내용 2: 나의 독서 기록 */}
          {activeTab === 'history' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readingHistory.map((book) => (
                <div key={book.id} className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-100 flex items-start space-x-4 hover:ring-blue-200 transition">
                  <div className="w-16 h-24 bg-gray-100 rounded-lg flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    📕
                  </div>
                  <div className="flex-1 py-1">
                    <h4 className="font-bold text-gray-900 line-clamp-1">{book.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-gray-400 font-medium">완독일: {book.date}</span>
                      <span className="text-sm tracking-widest">{book.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}