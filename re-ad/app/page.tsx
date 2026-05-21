"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // ⭐️ 공통 헤더 임포트

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function MainPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [rankings, setRankings] = useState<any[]>([]); 
  const [activeFilter, setActiveFilter] = useState('전체');



  useEffect(() => {

    // 1. [API] 필사 데이터 최신 5개 (📍 백엔드 주소 /annotations/exhibition 으로 완벽 수정)
    fetch(`${API_BASE_URL}/annotations/exhibition`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // 백엔드에서 이미 최신순 10개를 주므로, 앞에서 5개만 자르기
          setExhibitions(data.slice(0, 5)); 
        }
      })
      .catch(err => console.error("필사 로드 실패:", err));

    // 2. [API] 모임방 데이터 최신 4개
    fetch(`${API_BASE_URL}/rooms`)
      .then(res => res.json())
      .then(data => {
        const roomArray = Array.isArray(data) ? data : (data.rooms || []);
        const latestRooms = roomArray
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setRooms(latestRooms);
      })
      .catch(err => console.error(err));

    // 3. [API] 실제 북랭킹 데이터 최신 5개
    fetch(`${API_BASE_URL}/books/public-ranking?genre=`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setRankings(data.slice(0, 5)); 
        }
      })
      .catch(err => console.error("랭킹 로드 실패:", err));

  }, []);

  const filteredRooms = rooms.filter((room) => {
    if (activeFilter === '전체') return true;
    return room.roomType === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      
      <Header />



      <section className="px-6 py-10 mx-auto max-w-7xl border-b border-gray-100">
        <div className="flex items-end justify-between mb-8">
          <div>
            <Link href="/annotations" className="group block">
              <h3 className="text-2xl font-black italic tracking-tighter group-hover:text-gray-500 transition-colors">필사 전시회</h3>
            </Link>
            <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-widest">오늘의 영감을 준 문장들</p>
          </div>
          <Link href="/annotations" className="text-xs font-black border-b-2 border-black pb-1 hover:text-gray-500 hover:border-gray-500 transition">VIEW ALL</Link>
        </div>

        <div className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar">
          {exhibitions.length > 0 ? (
            exhibitions.map((item) => (
              <Link href={`/annotations`} key={item._id} className="min-w-[280px] max-w-[280px] bg-white p-6 rounded-2xl shadow-sm border border-gray-50 group cursor-pointer hover:border-black transition-colors flex flex-col justify-between block">
                <div>
                  <div className="h-40 bg-gray-50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center p-4">
                    {/* 📍 백엔드의 quote 키값 사용 */}
                    <p className="text-xs font-serif text-center line-clamp-4 italic text-black">"{item.quote}"</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase truncate pr-2">
                    {/* 📍 백엔드의 populate 데이터 사용 */}
                    {item.bookId?.title || '도서'} | {item.userId?.nickname || '작자미상'}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <div className="w-full text-center py-10 text-gray-400 font-bold">등록된 전시글이 없습니다.</div>
          )}
        </div>
      </section>

      <main className="px-6 py-12 mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        <div className="lg:col-span-8 space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black tracking-tight">🤝 참여를 기다리는 모임방</h3>
            <Link href="/rooms" className="text-xs font-black border-b-2 border-black pb-1">VIEW ALL</Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {['전체', '온라인', '오프라인'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-[10px] font-black transition ${
                  activeFilter === filter
                    ? 'bg-black text-white shadow-md'
                    : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRooms.length > 0 ? (
              filteredRooms.map((room) => {
                const currentMembers = room.members?.length || 0;
                const isFull = currentMembers >= (room.maxMembers || 8);
                
                return (
                  <Link href={`/rooms/${room._id || room.id}`} key={room._id || room.id} className="bg-white p-7 rounded-3xl border border-gray-100 hover:shadow-lg transition-all group cursor-pointer relative flex flex-col justify-between h-[200px] block">
                    {isFull && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl shadow-sm">
                        모집 마감
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.roomType === '온라인' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {room.roomType || '온라인'}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center ${isFull ? 'text-red-500' : 'text-gray-400'}`}>
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" /></svg>
                          {currentMembers} / {room.maxMembers || 8}명
                        </span>
                      </div>
                      <h4 className="text-lg font-black mb-2 group-hover:text-gray-600 transition-colors line-clamp-1">{room.roomName}</h4>
                      <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2 break-keep">{room.roomDesc || room.description}</p>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-400 font-bold text-sm bg-white rounded-3xl border border-gray-100">
                현재 개설된 모임방이 없습니다.
              </div>
            )}
          </div>
        </div>

        <aside className="lg:col-span-4 space-y-10">
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-xs font-black tracking-[0.3em] text-gray-400 mb-8 uppercase">Book Ranking</h3>
            <div className="space-y-6">
              {rankings.length > 0 ? (
                rankings.map((book, idx) => (
                  <Link href="/ranking" key={book.isbn || idx} className="flex items-center group cursor-pointer">
                    <span className="text-xl font-serif italic text-gray-200 group-hover:text-black transition-colors w-8">{idx + 1}</span>
                    <div className="flex-1 min-w-0 pr-2">
                      <h4 className="text-sm font-bold leading-none mb-1 group-hover:text-gray-600 truncate text-black">{book.title}</h4>
                      <p className="text-[10px] text-gray-500 font-bold truncate">{book.author}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="text-center py-4 text-xs font-bold text-gray-400">랭킹을 불러오는 중...</div>
              )}
            </div>
            <Link href="/ranking" className="block text-center w-full mt-10 py-3 bg-gray-50 text-[10px] font-black tracking-widest text-gray-400 hover:bg-black hover:text-white transition rounded-xl">
              더보기
            </Link>
          </section>
        </aside>

      </main>
    </div>
  );
}