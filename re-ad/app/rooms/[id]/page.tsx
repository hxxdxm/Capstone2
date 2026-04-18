"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function RoomDetailPage() {
  // 실제로는 URL의 id를 통해 백엔드에서 받아올 데이터입니다.
  const [roomData] = useState({
    title: "헤르만 헤세 읽는 밤",
    description: "데미안을 함께 읽고 각자의 성장에 대해 나눕니다. 단순한 독서를 넘어 문장 속에 숨겨진 나를 발견하는 시간을 가집니다. 필사노트 지참 필수입니다.",
    type: "오프라인",
    location: "서울 서촌 '무목적' 북카페",
    bookTitle: "데미안",
    author: "헤르만 헤세",
    tags: ["인문학", "소설", "성장", "필사"],
    members: 5,
    maxMembers: 8,
    host: "Hesse_Lover",
    schedule: "매주 목요일 저녁 7시",
  });

  const isFull = roomData.members >= roomData.maxMembers;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans selection:bg-black selection:text-white">
      
      {/* 1. 상단 헤더 */}
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        <div className="flex items-center space-x-4">
           <button className="text-gray-400 hover:text-black transition">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
           </button>
           <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black transition">닫기</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* 왼쪽 영역: 모임 상세 소개 */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* 모임 타이틀 섹션 */}
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roomData.type === '온라인' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                {roomData.type}
              </span>
              <span className="text-xs font-bold text-gray-400">{roomData.schedule}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">{roomData.title}</h2>
            
            <div className="flex flex-wrap gap-2 mb-10">
              {roomData.tags.map((tag) => (
                <span key={tag} className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-500 rounded-xl">
                  #{tag}
                </span>
              ))}
            </div>
          </section>

          {/* 함께 읽는 책 정보 */}
          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center space-x-8">
            <div className="w-24 h-36 bg-gray-200 rounded-lg shadow-md flex-shrink-0 bg-[url('https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=300')] bg-cover"></div>
            <div>
              <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1 block">CURRENTLY READING</span>
              <h3 className="text-xl font-black mb-1">{roomData.bookTitle}</h3>
              <p className="text-sm text-gray-500">{roomData.author} 저</p>
            </div>
          </section>

          {/* 상세 소개글 */}
          <section className="space-y-6">
            <h3 className="text-xl font-black border-b border-black pb-2 inline-block">모임 소개</h3>
            <p className="text-gray-600 leading-loose text-lg font-medium break-keep">
              {roomData.description}
            </p>
            {roomData.type === '오프라인' && (
              <div className="p-6 bg-gray-50 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-white rounded-xl shadow-sm">📍</div>
                <div>
                  <p className="text-xs font-black text-gray-400">모임 장소</p>
                  <p className="text-sm font-bold">{roomData.location}</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* 오른쪽 사이드바: 신청 정보 (Sticky) */}
        <aside className="lg:col-span-4 lg:sticky lg:top-28 h-fit space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
            
            {/* 인원 현황 시각화 */}
            <div>
              <div className="flex items-end justify-between mb-4">
                <span className="text-sm font-black text-gray-400">참여 현황</span>
                <span className={`text-2xl font-black ${isFull ? 'text-red-500' : 'text-black'}`}>
                  {roomData.members} <span className="text-gray-300 text-lg">/ {roomData.maxMembers}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${isFull ? 'bg-red-500' : 'bg-black'}`}
                  style={{ width: `${(roomData.members / roomData.maxMembers) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 font-bold text-center italic">
                {isFull ? "현재 정원이 모두 찼습니다." : `현재 ${roomData.maxMembers - roomData.members}자리 남았습니다.`}
              </p>
            </div>

            {/* 개설자 정보 */}
            <div className="flex items-center space-x-4 py-6 border-y border-gray-50">
              <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white text-[10px] font-black">HOST</div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase">HOSTED BY</p>
                <p className="text-sm font-black">{roomData.host}</p>
              </div>
            </div>

            {/* 신청 버튼 */}
            <button 
              disabled={isFull}
              className={`w-full py-5 rounded-2xl text-sm font-black tracking-widest transition-all shadow-lg ${
                isFull 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-95 shadow-black/10'
              }`}
            >
              {isFull ? "모집 마감" : "모임 신청하기"}
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 font-bold">
            신청 시 호스트에게 알림이 전송됩니다.
          </p>
        </aside>
        
      </main>
    </div>
  );
}