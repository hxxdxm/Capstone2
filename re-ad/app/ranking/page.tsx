"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 백엔드 요구사항에 맞춘 장르 리스트 (id 대신 name/value 사용)
const GENRES = [
  { name: '전체', value: '' },
  { name: '소설', value: '소설' },
  { name: '자연과학', value: '자연과학' },
  { name: '에세이', value: '에세이' },
  { name: '인문학', value: '인문학' },
  { name: '경제경영', value: '경제경영' },
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
      // 1. 백엔드 팀원이 알려준 새로운 엔드포인트와 쿼리 스트링 적용
      const API_URL = `http://13.124.191.57:5000/api/books/public-ranking?genre=${selectedGenre.value}`;
      
      const res = await fetch(API_URL);
      const data = await res.json();
      
      // 2. 백엔드에서 배열로 데이터를 바로 주기로 했으므로 data가 배열인지 확인 후 저장
      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("알라딘 랭킹 로드 실패:", error);
      setBooks([]); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        <Link href="/rooms" className="text-sm font-bold text-gray-400 hover:text-black transition">라운지로</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            TRENDING NOW
          </span>
          <h2 className="text-5xl font-black tracking-tighter">BOOK RANKING</h2>
          <p className="mt-4 text-gray-400 font-bold">실시간 베스트셀러 순위</p>
        </section>

        {/* 장르 선택 탭 */}
        <nav className="flex justify-center flex-wrap gap-2 mb-12">
          {GENRES.map((genre) => (
            <button
              key={genre.name}
              onClick={() => setSelectedGenre(genre)}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all ${
                selectedGenre.name === genre.name
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400 font-bold">
                랭킹 데이터를 불러올 수 없습니다.
              </div>
            ) : (
              books.map((book, index) => (
                <div 
                  key={book.isbn || index} 
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center space-x-6 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bg-black text-white px-4 py-2 rounded-br-[1.5rem] font-black italic text-sm">
                    {index + 1}
                  </div>
                  
                  <div className="relative flex-shrink-0 ml-4">
                    {/* 백엔드 필드명(cover)에 맞춰 출력 */}
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-24 h-36 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-lg font-black truncate mb-1 group-hover:text-gray-600 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold mb-4 truncate">{book.author}</p>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="px-2 py-1 bg-gray-100 text-[9px] font-black text-gray-500 rounded uppercase">
                        {selectedGenre.name === '전체' ? '베스트셀러' : selectedGenre.name}
                      </span>
                    </div>

                    {/* 알라딘 상세 페이지 링크 */}
                    <a 
                      href={book.link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-[10px] font-black tracking-widest text-gray-400 hover:text-black border-b-2 border-transparent hover:border-black transition-all"
                    >
                      상세 정보 보기 →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}