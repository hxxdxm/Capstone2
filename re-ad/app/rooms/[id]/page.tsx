"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

export default function RoomDetailPage() {
  const router = useRouter();
  // ⭐️ [백엔드 연동] URL 주소창에서 방의 고유 ID(roomId)를 빼오는 Next.js 마법 도구
  const params = useParams();
  const roomId = params?.id;

  // EC2 서버에서 받아올 실제 방 데이터를 담을 공간
  const [roomData, setRoomData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐️ [백엔드 연동] 화면 켜질 때 특정 방 정보 딱 1개만 가져오기
  useEffect(() => {
    if (!roomId) return;

    fetch(`http://13.124.191.57:5000/api/rooms/${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          // 에러 메시지가 온 경우 (방이 없거나 삭제됨)
          alert("방 정보를 불러올 수 없습니다.");
          router.push('/');
          return;
        }

        // 백엔드 데이터를 화면 디자인 규격에 맞게 예쁘게 가공
        setRoomData({
          id: data._id,
          title: data.roomName || "제목 없음",
          description: "함께 읽고 함께 성장하는 교환독서 모임방입니다. 단순한 독서를 넘어 문장 속에 숨겨진 나를 발견하는 시간을 가집니다.", // 백엔드에 상세 설명란이 없으므로 기본값
          type: data.roomType || "온라인",
          location: data.roomType === '오프라인' ? "협의 후 결정" : "온라인 링크",
          bookTitle: "자유 독서", // 아직 특정 책 지정 기능이 없으므로 기본값
          author: "자유 작가",
          tags: ["독서", "친목", "성장"], // 백엔드 태그 없으므로 기본값
          members: data.members ? data.members.length : 1,
          maxMembers: data.maxMembers || 4,
          host: "방장", // 백엔드에 hostNickname이 없으므로 임시처리
          schedule: "자유 일정",
          isFull: data.members && data.members.length >= (data.maxMembers || 4)
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("방 상세조회 에러:", err);
        alert("서버 오류로 방 정보를 가져올 수 없습니다.");
        router.push('/');
      });
  }, [roomId, router]);

  // ⭐️ [백엔드 연동] 이 상세페이지 안에서도 참여하기 버튼을 누를 수 있게 연동!
  const handleJoinRoom = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("로그인이 필요합니다.");
      router.push('/login');
      return;
    }

    try {
      // 토큰에서 내 ID 뽑아내기
      const userId = JSON.parse(atob(token.split('.')[1])).id;

      const res = await fetch(`http://13.124.191.57:5000/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId, roomPassword: '' })
      });

      const data = await res.json();

      if (res.ok) {
        alert('모임방 입장에 성공했습니다! 🎉');
        window.location.reload(); // 새로고침해서 인원수 +1 된 거 보여주기
      } else {
        alert(data.message || '방 입장에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 오류로 인해 방에 참여할 수 없습니다.');
    }
  };

  // 데이터 로딩 중 화면
  if (isLoading || !roomData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans selection:bg-black selection:text-white">
      
      {/* 1. 상단 헤더 */}
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        <div className="flex items-center space-x-4">
           <Link href="/rooms" className="text-sm font-bold text-gray-400 hover:text-black transition">뒤로가기</Link>
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
              {roomData.tags.map((tag: string) => (
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
                <span className={`text-2xl font-black ${roomData.isFull ? 'text-red-500' : 'text-black'}`}>
                  {roomData.members} <span className="text-gray-300 text-lg">/ {roomData.maxMembers}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${roomData.isFull ? 'bg-red-500' : 'bg-black'}`}
                  style={{ width: `${(roomData.members / roomData.maxMembers) * 100}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-gray-400 mt-3 font-bold text-center italic">
                {roomData.isFull ? "현재 정원이 모두 찼습니다." : `현재 ${roomData.maxMembers - roomData.members}자리 남았습니다.`}
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
              onClick={handleJoinRoom}
              disabled={roomData.isFull}
              className={`w-full py-5 rounded-2xl text-sm font-black tracking-widest transition-all shadow-lg ${
                roomData.isFull 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-black text-white hover:bg-gray-800 hover:scale-[1.02] active:scale-95 shadow-black/10'
              }`}
            >
              {roomData.isFull ? "모집 마감" : "모임 신청하기"}
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 font-bold">
            신청 시 방의 참여자 명단에 자동 등록됩니다.
          </p>
        </aside>
        
      </main>
    </div>
  );
}
