"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 알라딘 API 카테고리 ID (알라딘 API 가이드를 참조한 번호입니다)
const GENRES = [
  { name: '전체', id: 0 },
  { name: '소설', id: 1 },
  { name: '자연과학', id: 987 },
  { name: '에세이', id: 55889 },
  { name: '인문학', id: 656 },
  { name: '경제경영', id: 170 },
];

export default function RankingPage() {
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, [selectedGenre]);

  const fetchRanking = async () => {
    setIsLoading(true);
    try {
      // 💡 실제 구현 시에는 알라딘 API를 직접 호출하면 CORS 에러가 나므로, 
      // 백엔드 서버(5000포트)에 대행 요청을 보내는 API를 하나 만드시는 걸 추천합니다.
      const API_URL = `http://13.124.191.57:5000/api/proxy/aladdin?categoryId=${selectedGenre.id}`;
      const res = await fetch(API_URL);
      const data = await res.json();
      
      // 알라딘 응답 데이터의 item 배열을 상태에 저장
      setBooks(data.item || []);
      setIsLoading(false);
    } catch (error) {
      console.error("랭킹 데이터 로드 실패:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      {/* 상단 헤더 */}
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black transition">홈으로</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            TRENDING NOW
          </span>
          <h2 className="text-5xl font-black tracking-tighter">BOOK RANKING</h2>
        </section>

        {/* 장르 선택 탭 */}
        <nav className="flex justify-center flex-wrap gap-2 mb-12">
          {GENRES.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all ${
                selectedGenre.id === genre.id
                  ? 'bg-black text-white shadow-lg scale-105'
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-black hover:text-black'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </nav>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book, index) => (
              <div 
                key={book.isbn} 
                className="bg-white p-6 rounded-[2rem] border border-gray-50 flex items-center space-x-6 hover:shadow-xl transition-all group"
              >
                {/* 순위 표시 */}
                <span className="text-4xl font-black italic text-gray-100 group-hover:text-black transition-colors">
                  {String(index + 1).padStart(2, '0')}
                </span>
                
                {/* 책 표지 */}
                <img 
                  src={book.cover} 
                  alt={book.title} 
                  className="w-20 h-28 object-cover rounded-lg shadow-md group-hover:scale-105 transition-transform"
                />

                {/* 책 정보 */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-lg font-black truncate mb-1">{book.title}</h4>
                  <p className="text-xs text-gray-400 font-bold mb-3">{book.author}</p>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-50 text-[10px] font-black text-gray-400 rounded">
                      {book.categoryName.split('>')[1] || '도서'}
                    </span>
                    <span className="text-[10px] font-bold text-orange-500">
                      ★ {book.customerReviewRank / 10}
                    </span>
                  </div>
                </div>

                <a 
                  href={book.link} 
                  target="_blank" 
                  className="p-3 bg-gray-50 rounded-full hover:bg-black hover:text-white transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}