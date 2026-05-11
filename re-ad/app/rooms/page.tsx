"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // ⭐️ 공통 헤더

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 백엔드에서 모임방 목록 불러오기
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/rooms`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRooms(data);
        } else if (data.rooms && Array.isArray(data.rooms)) {
          // 혹시 백엔드가 { rooms: [...] } 형태로 준다면
          setRooms(data.rooms);
        }
      } catch (error) {
        console.error("모임방 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      {/* ⭐️ 공통 헤더 적용 */}
      <Header />

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16 relative">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            READING LOUNGE
          </span>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-black">Rooms</h2>
          <p className="mt-4 text-gray-700 font-bold">함께 읽고, 나누고, 성장하는 공간</p>
          
          {/* 모임방 개설 버튼 (우측 상단 배치) */}
          <div className="absolute right-0 bottom-0">
            <Link 
              href="/rooms/create" 
              className="bg-black text-white px-6 py-3 rounded-full font-black text-sm hover:bg-gray-800 transition shadow-lg flex items-center space-x-2"
            >
              <span>+ 방 만들기</span>
            </Link>
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.length === 0 ? (
              <div className="col-span-full text-center py-24 border-2 border-dashed border-gray-300 rounded-[2.5rem]">
                <p className="text-gray-600 font-bold text-lg">아직 개설된 모임방이 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">첫 번째 모임방의 방장이 되어보세요!</p>
              </div>
            ) : (
              rooms.map((room) => (
                <Link 
                  href={`/rooms/${room._id || room.id}`} 
                  key={room._id || room.id}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-200 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 hover:border-black transition-all group min-h-[280px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.roomType === '온라인' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {room.roomType}
                        </span>
                        <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-widest">
                          {room.category === 'READING' ? '독서' : '교환'}
                        </span>
                      </div>
                      {room.roomPassword && (
                        <span className="text-gray-400" title="비밀번호 필요">🔒</span>
                      )}
                    </div>
                    
                    <h3 className="text-xl font-black mb-3 text-black group-hover:text-gray-700 transition-colors line-clamp-2">
                      {room.roomName}
                    </h3>
                    <p className="text-sm font-bold text-gray-600 line-clamp-2 leading-relaxed">
                      {room.roomDesc || "모임 소개글이 없습니다."}
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-black text-gray-800">
                      인원 <span className="text-black">{room.members?.length || 0} / {room.maxMembers}</span>
                    </span>
                    <span className="text-[10px] font-bold text-gray-400">
                      방장: {room.hostName || "익명"}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}