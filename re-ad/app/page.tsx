"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function MainPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [transcriptions, setTranscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMainData = async () => {
      setIsLoading(true);
      try {
        // 1. 모임방 데이터 가져오기 (최신순 4개)
        const roomsRes = await fetch(`${API_BASE_URL}/rooms`);
        const roomsData = await roomsRes.json();
        if (Array.isArray(roomsData)) {
          const latestRooms = roomsData
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
          setRooms(latestRooms);
        }

        // 2. 필사 데이터 가져오기 (최신순 4개)
        const transRes = await fetch(`${API_BASE_URL}/transcriptions`);
        const transData = await transRes.json();
        if (Array.isArray(transData)) {
          const latestTrans = transData
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
          setTranscriptions(latestTrans);
        }
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMainData();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans">
      {/* 네비게이션 */}
      <nav className="fixed top-0 w-full z-50 bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></Link>
        <div className="flex space-x-6 text-sm font-bold">
          <Link href="/ranking" className="hover:text-gray-400 transition">랭킹</Link>
          <Link href="/rooms" className="hover:text-gray-400 transition">모임방</Link>
          <Link href="/transcription" className="hover:text-gray-400 transition">필사</Link>
          <Link href="/mypage" className="hover:text-gray-400 transition">마이페이지</Link>
        </div>
      </nav>

      {/* 히어로 */}
      <header className="pt-32 pb-20 px-8 text-center bg-white border-b border-gray-50">
        <h1 className="text-5xl md:text-6xl font-black tracking-tighter mb-6">
          기록하고 공유하는 <br /> 새로운 <span className="text-gray-300">독서 문화</span>
        </h1>
        <p className="text-gray-400 font-bold">교환독서에서 취향이 맞는 독서 모임을 찾아보세요.</p>
      </header>

      <main className="max-w-6xl mx-auto py-20 px-6 space-y-24">
        
        {/* 모임방 섹션 */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-3">
            <h2 className="text-2xl font-black">최신 모임방</h2>
            <Link href="/rooms" className="text-xs font-bold text-gray-400 hover:text-black">전체보기 +</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rooms.length > 0 ? rooms.map((room) => (
              <Link href={`/rooms/${room._id}`} key={room._id} className="bg-white p-6 rounded-3xl border border-gray-100 hover:shadow-lg transition-all flex flex-col justify-between h-[220px]">
                <div>
                  <span className="text-[10px] font-bold text-blue-500 mb-2 inline-block">{room.roomType}</span>
                  <h3 className="text-lg font-black leading-tight line-clamp-2">{room.roomName}</h3>
                  <p className="text-xs text-gray-400 mt-2 line-clamp-2">{room.roomDesc}</p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-300">
                  <span>{room.members?.length || 0} / {room.maxMembers} 참여</span>
                </div>
              </Link>
            )) : (
              <div className="col-span-full py-10 text-center text-gray-300 font-bold">최근 개설된 모임이 없습니다.</div>
            )}
          </div>
        </section>

        {/* 필사 게시판 섹션 */}
        <section>
          <div className="flex justify-between items-end mb-8 border-b-2 border-black pb-3">
            <h2 className="text-2xl font-black">최신 필사</h2>
            <Link href="/transcription" className="text-xs font-bold text-gray-400 hover:text-black">더보기 +</Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {transcriptions.length > 0 ? transcriptions.map((item) => (
              <div key={item._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <p className="text-sm text-gray-600 italic leading-relaxed line-clamp-4 mb-4">"{item.content}"</p>
                  <p className="text-[10px] font-bold text-gray-300 uppercase">{item.bookTitle}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                  <span className="text-[10px] font-black">{item.authorName}</span>
                  <span className="text-[10px] text-gray-300">{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-gray-300 font-bold">작성된 필사 기록이 없습니다.</div>
            )}
          </div>
        </section>

      </main>

      {/* 푸터 */}
      <footer className="bg-gray-900 text-white py-12 px-8 text-center">
        <h2 className="text-xl font-black mb-4">교환독서</h2>
        <p className="text-xs text-gray-500">© 2026 Re-ad. All rights reserved.</p>
      </footer>
    </div>
  );
}