"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// 알라딘 API 카테고리 ID
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
      // 📍 [중요] 백엔드에 아직 Proxy API가 없다면 아래 주소는 에러가 날 수 있습니다.
      // 그럴 경우 팀장님께 /api/proxy/aladdin 경로 생성을 요청하세요!
      const API_URL = `http://13.124.191.57:5000/api/proxy/aladdin?categoryId=${selectedGenre.id}`;
      const res = await fetch(API_URL);
      const data = await res.json();
      
      if (data.item && Array.isArray(data.item)) {
        setBooks(data.item);
      } else {
        // 데이터가 없을 때의 예외 처리
        setBooks([]);
      }
    } catch (error) {
      console.error("랭킹 데이터 로드 실패:", error);
      // API 연결 전까지 화면이 비어보이지 않게 더미 데이터를 넣어둘 수 있습니다.
      setBooks([]); 
    } finally {
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
        <Link href="/rooms" className="text-sm font-bold text-gray-400 hover:text-black transition">라운지로</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            TRENDING NOW
          </span>
          <h2 className="text-5xl font-black tracking-tighter">BOOK RANKING</h2>
          <p className="mt-4 text-gray-400 font-bold">지금 사람들이 가장 많이 읽고 있는 도서 리스트</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400 font-bold">
                데이터를 불러오는 중이거나 순위 정보가 없습니다.
              </div>
            ) : (
              books.map((book, index) => (
                <div 
                  key={book.isbn || index} 
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-50 flex items-center space-x-6 hover:shadow-xl transition-all group relative overflow-hidden"
                >
                  {/* 순위 표시 */}
                  <div className="absolute top-0 left-0 bg-black text-white px-4 py-2 rounded-br-[1.5rem] font-black italic text-sm">
                    {index + 1}
                  </div>
                  
                  {/* 책 표지 */}
                  <div className="relative flex-shrink-0 ml-4">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-24 h-36 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* 책 정보 */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-lg font-black truncate mb-1 group-hover:text-gray-600 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-gray-400 font-bold mb-4 truncate">{book.author}</p>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="px-2 py-1 bg-gray-100 text-[9px] font-black text-gray-500 rounded uppercase">
                        {book.categoryName?.split('>')[1] || '도서'}
                      </span>
                      <span className="text-[10px] font-black text-orange-500 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        {book.customerReviewRank ? book.customerReviewRank / 10 : '0.0'}
                      </span>
                    </div>

                    <a 
                      href={book.link} 
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