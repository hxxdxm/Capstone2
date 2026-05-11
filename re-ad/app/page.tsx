"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // ⭐️ 공통 헤더 적용

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function MainPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [isLoadingRank, setIsLoadingRank] = useState(true);
  const [isLoadingEx, setIsLoadingEx] = useState(true);

  useEffect(() => {
    // 1. 실제 북랭킹 데이터 불러오기 (메인 화면용 3개)
    const fetchRankings = async () => {
      setIsLoadingRank(true);
      try {
        const res = await fetch(`${API_BASE_URL}/books/public-ranking?genre=`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRankings(data.slice(0, 3)); // 1위부터 3위까지만 자르기
        }
      } catch (err) {
        console.error("랭킹 로드 실패:", err);
      } finally {
        setIsLoadingRank(false);
      }
    };

    // 2. 실제 필사 전시 데이터 불러오기 (최신 5개)
    const fetchExhibitions = async () => {
      setIsLoadingEx(true);
      try {
        const res = await fetch(`${API_BASE_URL}/exhibition`);
        const data = await res.json();
        if (Array.isArray(data)) {
          // 최신순으로 정렬 후 5개만 자르기 (백엔드 정렬 여부에 따라 reverse 필요할 수 있음)
          const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setExhibitions(sortedData.slice(0, 5)); 
        }
      } catch (err) {
        console.error("필사 로드 실패:", err);
      } finally {
        setIsLoadingEx(false);
      }
    };

    fetchRankings();
    fetchExhibitions();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 font-sans text-black">
      {/* ⭐️ 공통 헤더 */}
      <Header />

      <main className="mx-auto max-w-6xl px-6 mt-16 space-y-32">
        
        {/* HERO SECTION */}
        <section className="text-center pt-10">
          <span className="inline-block px-4 py-1.5 bg-black text-white text-xs font-black tracking-[0.3em] mb-6 rounded-full">
            READ, SHARE, GROW
          </span>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase text-black leading-tight">
            Exchange <br /> Your Reading
          </h2>
          <p className="mt-6 text-gray-600 font-bold text-lg md:text-xl">
            단순한 독서를 넘어, 문장과 생각을 교환하는 공간
          </p>
          <div className="mt-10 flex justify-center space-x-4">
            <Link href="/rooms" className="px-8 py-4 bg-black text-white rounded-full font-black text-sm hover:scale-105 transition-transform shadow-xl">
              모임방 둘러보기
            </Link>
            <Link href="/exhibition" className="px-8 py-4 bg-white border-2 border-gray-200 text-black rounded-full font-black text-sm hover:border-black transition-colors">
              필사 전시 구경하기
            </Link>
          </div>
        </section>

        {/* BOOK RANKING SECTION */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-3xl font-black text-black">Trending Books</h3>
              <p className="text-sm font-bold text-gray-500 mt-2">지금 가장 많이 읽히는 베스트셀러</p>
            </div>
            <Link href="/ranking" className="text-xs font-black text-gray-400 hover:text-black border-b-2 border-transparent hover:border-black transition-all pb-1 uppercase tracking-widest">
              전체 순위 보기 →
            </Link>
          </div>

          {isLoadingRank ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rankings.length === 0 ? (
                <div className="col-span-full bg-white rounded-[2.5rem] p-10 text-center border border-gray-200">
                  <p className="font-bold text-gray-500">랭킹 데이터를 불러올 수 없습니다.</p>
                </div>
              ) : (
                rankings.map((book, index) => (
                  <Link href="/ranking" key={book.isbn || index} className="bg-white p-6 rounded-[2.5rem] border border-gray-200 flex items-center space-x-6 hover:shadow-xl hover:-translate-y-2 hover:border-black transition-all group relative">
                    <div className="absolute top-0 left-0 bg-black text-white px-4 py-2 rounded-br-[1.5rem] font-black italic text-sm z-10">
                      {index + 1}
                    </div>
                    <img src={book.cover} alt={book.title} className="w-20 h-28 object-cover rounded-xl shadow-md group-hover:scale-105 transition-transform duration-500 z-0" />
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-base font-black truncate mb-1 text-black">{book.title}</h4>
                      <p className="text-xs text-gray-500 font-bold truncate">{book.author}</p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </section>

        {/* EXHIBITION SECTION (최신 5개) */}
        <section>
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-3xl font-black text-black">Recent Memories</h3>
              <p className="text-sm font-bold text-gray-500 mt-2">멤버들이 방금 남긴 문장들</p>
            </div>
            <Link href="/exhibition" className="text-xs font-black text-gray-400 hover:text-black border-b-2 border-transparent hover:border-black transition-all pb-1 uppercase tracking-widest">
              전시회 입장하기 →
            </Link>
          </div>

          {isLoadingEx ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {exhibitions.length === 0 ? (
                <div className="col-span-full bg-white rounded-[2.5rem] p-10 text-center border border-gray-200">
                  <p className="font-bold text-gray-500">아직 등록된 필사가 없습니다.</p>
                </div>
              ) : (
                exhibitions.map((item) => {
                  const hasImage = item.imageUrl || item.image_url;
                  
                  return (
                    <Link href="/exhibition" key={item.id} className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden hover:shadow-xl hover:border-black transition-all group flex flex-col h-64 relative">
                      {hasImage && (
                        <div className="absolute inset-0 z-0">
                          <img src={hasImage} alt="Background" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors"></div>
                        </div>
                      )}
                      
                      <div className={`relative z-10 p-6 flex flex-col h-full justify-between ${hasImage ? 'text-white' : 'text-black'}`}>
                        <h4 className={`text-[10px] font-black uppercase tracking-widest inline-block px-2 py-1 rounded w-fit ${hasImage ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
                          {item.bookTitle}
                        </h4>
                        <p className={`font-bold leading-relaxed italic line-clamp-4 ${hasImage ? 'text-white' : 'text-gray-800'}`}>
                          "{item.content}"
                        </p>
                        <span className={`text-[10px] font-black ${hasImage ? 'text-white/70' : 'text-gray-400'}`}>
                          By {item.author}
                        </span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}