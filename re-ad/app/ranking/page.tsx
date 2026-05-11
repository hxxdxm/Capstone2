"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header'; // 📍 공통 헤더 불러오기

const GENRES = [
  { name: '전체', value: '' },
  { name: '소설', value: '소설' },
  { name: '자연과학', value: '자연과학' },
  { name: '에세이', value: '에세이' },
  { name: '인문학', value: '인문학' },
  { name: '경제경영', value: '경제경영' },
];

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RankingPage() {
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRanking = async (genreValue: string) => {
    setIsLoading(true);
    try {
      const API_URL = `${API_BASE_URL}/books/public-ranking?genre=${encodeURIComponent(genreValue)}`;
      const res = await fetch(API_URL);
      const data = await res.json();

      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setBooks([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking(selectedGenre.value);
  }, [selectedGenre]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      {/* 📍 기존의 길었던 header 태그를 지우고 딱 한 줄로 통일! */}
      <Header />

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            TRENDING NOW
          </span>
          <h2 className="text-5xl font-black tracking-tighter text-black">BOOK RANKING</h2>
          {/* 📍 텍스트 대비 향상: text-gray-400 -> text-gray-600 */}
          <p className="mt-4 text-gray-600 font-bold">실시간 알라딘 베스트셀러 순위</p>
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
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-black hover:text-black' // 📍 비활성 탭도 더 선명하게
              }`}
            >
              {genre.name}
            </button>
          ))}
        </nav>

        {/* 로딩 및 리스트 영역 */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {books.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-600 font-bold border-2 border-dashed border-gray-300 rounded-[2.5rem]">
                현재 랭킹 데이터를 불러올 수 없습니다. <br/> 다시 시도하거나 잠시만 기다려 주세요!
              </div>
            ) : (
              books.map((book, index) => (
                <div 
                  key={book.isbn || index} 
                  className="bg-white p-6 rounded-[2.5rem] border border-gray-100 flex items-center space-x-6 hover:shadow-xl hover:border-gray-300 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bg-black text-white px-4 py-2 rounded-br-[1.5rem] font-black italic text-sm z-10">
                    {index + 1}
                  </div>
                  
                  <div className="relative flex-shrink-0 ml-4 z-0">
                    <img 
                      src={book.cover} 
                      alt={book.title} 
                      className="w-24 h-36 object-cover rounded-xl shadow-lg group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="flex-1 min-w-0 pr-4 z-10">
                    {/* 📍 책 제목과 작가 이름 더 선명하게 */}
                    <h4 className="text-lg font-black truncate mb-1 text-black group-hover:text-gray-700 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-gray-600 font-bold mb-4 truncate">{book.author}</p>
                    
                    <div className="flex items-center space-x-3 mb-4">
                      <span className="px-2 py-1 bg-gray-100 text-[9px] font-black text-gray-700 rounded uppercase border border-gray-200">
                        {selectedGenre.name === '전체' ? '베스트셀러' : selectedGenre.name}
                      </span>
                    </div>

                    <a 
                      href={book.link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-[10px] font-black tracking-widest text-gray-500 hover:text-black border-b-2 border-transparent hover:border-black transition-all"
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