"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 백엔드 기본 주소
const API_BASE_URL = 'http://13.124.191.57:5000/api';

interface ExhibitionItem {
  id: number;
  bookTitle: string;
  content: string;
  author: string;
  createdAt: string;
}

export default function ExhibitionPage() {
  const [exhibitions, setExhibitions] = useState<ExhibitionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExhibitions = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/exhibition`); 
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setExhibitions(data);
        }
      } catch (error) {
        console.error("필사 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExhibitions();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      {/* 상단 헤더 */}
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter text-black">교환<span className="text-gray-500">독서</span></h1>
        </Link>
        <nav className="flex space-x-6 items-center">
          <Link href="/ranking" className="text-sm font-bold text-gray-600 hover:text-black transition">랭킹</Link>
          <Link href="/rooms" className="text-sm font-bold text-gray-600 hover:text-black transition">라운지</Link>
          <Link href="/" className="text-sm font-bold text-black border-b-2 border-black">홈으로</Link>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            MEMORIES OF READING
          </span>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-black">Exhibition</h2>
          <p className="mt-4 text-gray-600 font-bold">우리들의 문장이 전시되는 공간</p>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibitions.length === 0 ? (
              <div className="col-span-full text-center py-24 border-2 border-dashed border-gray-300 rounded-[2.5rem]">
                <p className="text-gray-600 font-bold text-lg">현재 전시 중인 필사가 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">첫 번째 필사를 등록해 보세요!</p>
              </div>
            ) : (
              exhibitions.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col justify-between hover:shadow-2xl hover:border-gray-300 transition-all group min-h-[300px] relative overflow-hidden"
                >
                  {/* 따옴표 장식 */}
                  <div className="absolute top-6 right-8 text-gray-200 group-hover:text-gray-300 transition-colors">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14.017 21L14.017 18C14.017 16.8954 14.9125 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H12.017V9C12.017 6.79086 13.8079 5 16.017 5H19.017C21.2262 5 23.017 6.79086 23.017 9V15C23.017 18.3137 20.3308 21 17.017 21H14.017ZM1.017 21L1.017 18C1.017 16.8954 1.91243 16 3.017 16H6.017C6.56929 16 7.017 15.5523 7.017 15V9C7.017 8.44772 6.56929 8 6.017 8H3.017C2.46472 8 2.017 8.44772 2.017 9V12C2.017 12.5523 1.56929 13 1.017 13H-0.983V9C-0.983 6.79086 0.80786 5 3.017 5H6.017C8.22615 5 10.017 6.79086 10.017 9V15C10.017 18.3137 7.33075 21 4.017 21H1.017Z" />
                    </svg>
                  </div>

                  <div className="relative z-10">
                    <h4 className="text-xs font-black text-gray-700 mb-4 tracking-widest uppercase bg-gray-100 inline-block px-2 py-1 rounded">
                      {item.bookTitle}
                    </h4>
                    <p className="text-xl font-bold leading-relaxed text-black break-keep">
                      "{item.content}"
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-black text-gray-700">By {item.author}</span>
                    <span className="text-xs font-bold text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* 📍 [추가됨] 우측 하단 고정 글쓰기 버튼 */}
      <Link 
        href="/exhibition/write" 
        className="fixed bottom-8 right-8 bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:scale-110 hover:bg-gray-800 transition-all z-50 group"
        title="필사 등록하기"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </Link>
    </div>
  );
}