"use client";

import React from 'react';
import Link from 'next/link';

export default function MyPage() {
  // 1. 사용자 정보 (나중에 API로 가져올 부분)
  const user = {
    name: "독서왕 홍길동",
    email: "gildong@example.com",
    profileImg: "👤", // 나중에 이미지 경로로 변경
    bio: "안녕하세요! 소설과 인문학 책을 주로 읽습니다. 깨끗한 책 위주로 교환해요.",
    point: 1250,
  };

  // 2. 내가 등록한 도서 목록 (가짜 데이터)
  const myBooks = [
    { id: 101, title: "나미야 잡화점의 기적", status: "교환가능", date: "2024.03.20" },
    { id: 102, title: "미움받을 용기", status: "교환중", date: "2024.03.15" },
    { id: 103, title: "언어의 온도", status: "교환완료", date: "2024.02.28" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* 상단 헤더 영역 */}
      <header className="bg-white border-b border-gray-100 px-8 py-6">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-green-600">← 홈으로 돌아가기</Link>
          <button className="text-sm font-bold text-gray-400 hover:text-orange-500 transition">프로필 수정</button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-8 mt-10">
        
        {/* --- [섹션 1: 프로필 카드] --- */}
        <section className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-gray-100 flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-orange-50 flex items-center justify-center text-5xl shadow-inner border-4 border-white ring-4 ring-orange-100">
            {user.profileImg}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-black text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
            <p className="mt-4 text-gray-600 leading-relaxed font-medium">{user.bio}</p>
            
            <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
              <div className="bg-green-50 px-4 py-2 rounded-2xl">
                <span className="text-xs text-green-600 font-bold uppercase tracking-wider">교환 포인트</span>
                <p className="text-lg font-black text-green-700">{user.point.toLocaleString()} P</p>
              </div>
              <div className="bg-orange-50 px-4 py-2 rounded-2xl">
                <span className="text-xs text-orange-600 font-bold uppercase tracking-wider">등록한 도서</span>
                <p className="text-lg font-black text-orange-700">{myBooks.length} 권</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- [섹션 2: 나의 도서 관리] --- */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">내가 등록한 책</h3>
            <button className="text-sm font-bold text-green-600 bg-green-50 px-4 py-2 rounded-xl hover:bg-green-100 transition">
              + 새 책 등록하기
            </button>
          </div>

          <div className="space-y-4">
            {myBooks.map((book) => (
              <div key={book.id} className="bg-white p-5 rounded-2xl shadow-sm ring-1 ring-gray-100 flex items-center justify-between group hover:ring-orange-200 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-bold">IMAGE</div>
                  <div>
                    <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition">{book.title}</h4>
                    <p className="text-xs text-gray-400 mt-1">등록일: {book.date}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full ${
                    book.status === '교환가능' ? 'bg-green-100 text-green-700' : 
                    book.status === '교환중' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {book.status}
                  </span>
                  <button className="text-gray-300 hover:text-gray-600 font-bold text-sm px-2">관리</button>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}