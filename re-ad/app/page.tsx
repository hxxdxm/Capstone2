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
        // 1. 모임방 데이터 가져오기
        const roomsRes = await fetch(`${API_BASE_URL}/rooms`);
        const roomsData = await roomsRes.json();
        if (Array.isArray(roomsData)) {
          // 최신순 정렬 후 4개만 추출
          const latestRooms = roomsData
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 4);
          setRooms(latestRooms);
        }

        // 2. 필사 데이터 가져오기 (API 주소가 /transcriptions 라고 가정)
        const transRes = await fetch(`${API_BASE_URL}/transcriptions`);
        const transData = await transRes.json();
        if (Array.isArray(transData)) {
          // 최신순 정렬 후 4개만 추출
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
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-black selection:text-white">
      {/* 네비게이션 바 */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-black tracking-tighter italic">RE-AD</Link>
        <div className="hidden md:flex space-x-10 text-[10px] font-black tracking-[0.2em] uppercase">
          <Link href="/ranking" className="hover:text-gray-400 transition">Ranking</Link>
          <Link href="/rooms" className="hover:text-gray-400 transition">Lounge</Link>
          <Link href="/transcription" className="hover:text-gray-400 transition">Transcription</Link>
          <Link href="/mypage" className="hover:text-gray-400 transition">My Page</Link>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <header className="pt-40 pb-20 px-8 text-center bg-white border-b border-gray-50">
        <span className="inline-block px-4 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-6 rounded-full">EST. 2024</span>
        <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-8 leading-[0.85]">
          READING <br /> <span className="text-gray-200">EXPERIENCE</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg font-bold text-gray-400 leading-relaxed">
          단순한 독서를 넘어, 기록하고 공유하며 새로운 가치를 발견하는 <br/> 우리들만의 교환독서 플랫폼
        </p>
      </header>

      <main className="max-w-7xl mx-auto py-24 px-8 space-y-32">
        
        {/* 모임방 섹션 (최신 4개) */}
        <section>
          <div className="flex justify-between items-end mb-12 border-b-4 border-black pb-4">
            <h2 className="text-4xl font-black tracking-tighter">LOUNGE</h2>
            <Link href="/rooms" className="text-xs font-black border-b-2 border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition">VIEW ALL</Link>
          </div>
          
          {isLoading ? (
            <div className="py-10 text-center font-bold text-gray-300">LOADING...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rooms.length > 0 ? rooms.map((room) => (
                <Link href={`/rooms/${room._id}`} key={room._id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 hover:shadow-2xl transition-all duration-500 flex flex-col justify-between h-[300px]">
                  <div>
                    <span className="text-[9px] font-black bg-gray-100 px-2 py-1 rounded mb-4 inline-block uppercase">{room.roomType}</span>
                    <h3 className="text-xl font-black leading-tight group-hover:text-gray-500 transition-colors line-clamp-2">{room.roomName}</h3>
                    <p className="text-xs text-gray-400 mt-4 font-bold line-clamp-3">{room.roomDesc}</p>
                  </div>
                  <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                    <span className="text-[10px] font-black">{room.members?.length || 0} / {room.maxMembers} MEMBERS</span>
                    <span className="text-lg">→</span>
                  </div>
                </Link>
              )) : (
                <div className="col-span-full py-10 text-center text-gray-400 font-bold">최근 개설된 모임이 없습니다.</div>
              )}
            </div>
          )}
        </section>

        {/* 필사 게시판 섹션 (최신 4개) */}
        <section>
          <div className="flex justify-between items-end mb-12 border-b-4 border-black pb-4">
            <h2 className="text-4xl font-black tracking-tighter">TRANSCRIPTION</h2>
            <Link href="/transcription" className="text-xs font-black border-b-2 border-black pb-1 hover:text-gray-400 hover:border-gray-400 transition">EXPLORE</Link>
          </div>

          {isLoading ? (
             <div className="py-10 text-center font-bold text-gray-300">LOADING...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {transcriptions.length > 0 ? transcriptions.map((item) => (
                <div key={item._id} className="group cursor-pointer">
                  <div className="aspect-[3/4] bg-white rounded-[3rem] p-8 border border-gray-100 mb-6 group-hover:shadow-3xl transition-all duration-500 relative overflow-hidden flex flex-col justify-center text-center">
                    <div className="absolute top-0 left-0 w-full h-1 bg-black scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    <p className="text-sm font-serif italic text-gray-600 leading-relaxed line-clamp-6 mb-4">"{item.content}"</p>
                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.bookTitle}</p>
                  </div>
                  <h4 className="font-black text-sm mb-1">{item.title}</h4>
                  <p className="text-[10px] font-bold text-gray-400">{item.authorName} · {new Date(item.createdAt).toLocaleDateString()}</p>
                </div>
              )) : (
                <div className="col-span-full py-10 text-center text-gray-400 font-bold">작성된 필사 기록이 없습니다.</div>
              )}
            </div>
          )}
        </section>

      </main>

      {/* 푸터 */}
      <footer className="bg-black text-white py-20 px-8 mt-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <h2 className="text-6xl font-black italic mb-4 tracking-tighter">RE-AD</h2>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">Digital Archive of Reading Experience</p>
          </div>
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Connect</h4>
              <ul className="text-sm font-bold space-y-2">
                <li><a href="#" className="hover:text-gray-400 transition">Github</a></li>
                <li><a href="#" className="hover:text-gray-400 transition">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Project</h4>
              <ul className="text-sm font-bold space-y-2">
                <li><a href="#" className="hover:text-gray-400 transition">Capstone</a></li>
                <li><a href="#" className="hover:text-gray-400 transition">About Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}