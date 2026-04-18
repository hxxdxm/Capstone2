"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // 모임방 만들기 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 모임방 리스트 상태 관리 (새로 추가하거나 참여할 때 업데이트 됨)
  const [rooms, setRooms] = useState([
    { id: 1, title: "헤르만 헤세 읽는 밤", desc: "데미안을 함께 읽고 각자의 성장에 대해 나눕니다.", members: 5, maxMembers: 8, type: "오프라인", tags: ["인문학", "소설"], isJoined: false },
    { id: 2, title: "React Deep Dive", desc: "리액트 공식 문서를 한 장씩 파헤치며 토론해요.", members: 8, maxMembers: 8, type: "온라인", tags: ["개발", "IT"], isJoined: false },
    { id: 3, title: "텍스트힙 수집가들", desc: "서촌 북카페 투어를 하며 각자의 인생 문장을 교환합니다.", members: 4, maxMembers: 6, type: "오프라인", tags: ["필사", "친목"], isJoined: false },
    { id: 4, title: "미라클 독서", desc: "매일 아침 7시, 줌에서 만나 30분간 조용히 독서합니다.", members: 12, maxMembers: 20, type: "온라인", tags: ["자기계발", "습관"], isJoined: false },
  ]);

  // 새 모임방 생성용 폼 데이터
  const [newRoom, setNewRoom] = useState({
    title: '', desc: '', type: '온라인', maxMembers: 4, tags: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }
  }, []);

  // [기능] 모임방 참여하기 로직
  const handleJoinRoom = (roomId: number) => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.push('/login');
      return;
    }

    setRooms(rooms.map(room => {
      if (room.id === roomId) {
        if (room.isJoined) {
          alert("이미 참여 중인 모임입니다.");
          return room;
        }
        if (room.members >= room.maxMembers) {
          alert("이미 마감된 모임입니다.");
          return room;
        }
        alert(`'${room.title}' 모임에 참여하셨습니다!`);
        return { ...room, members: room.members + 1, isJoined: true };
      }
      return room;
    }));
  };

  // [기능] 새 모임방 만들기 로직
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.title || !newRoom.desc) {
      alert("제목과 소개를 입력해주세요.");
      return;
    }

    const tagArray = newRoom.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    const createdRoom = {
      id: rooms.length + 1,
      title: newRoom.title,
      desc: newRoom.desc,
      type: newRoom.type,
      members: 1, // 방장은 기본으로 참여됨
      maxMembers: Number(newRoom.maxMembers),
      tags: tagArray.length > 0 ? tagArray : ["독서"],
      isJoined: true, // 방장은 이미 참여 상태
    };

    setRooms([createdRoom, ...rooms]); // 새 방을 맨 앞에 추가
    setIsCreateModalOpen(false); // 모달 닫기
    alert("새로운 모임방이 개설되었습니다!");
    setNewRoom({ title: '', desc: '', type: '온라인', maxMembers: 4, tags: '' }); // 폼 초기화
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      
      {/* 1. 상단 헤더 */}
      <header className="bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black transition">
          홈으로
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-12 space-y-10">
        
        {/* 2. 페이지 타이틀 및 방 만들기 버튼 */}
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-black pb-6 gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">LOUNGE</h2>
            <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">취향이 통하는 사람들과의 교환독서</p>
          </div>
          <button 
            onClick={() => {
              if(!isLoggedIn) { alert("로그인이 필요합니다."); router.push('/login'); return; }
              setIsCreateModalOpen(true);
            }}
            className="px-6 py-3 bg-black text-white text-sm font-black tracking-widest rounded-full hover:bg-gray-800 transition shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>모임방 만들기</span>
          </button>
        </section>

        {/* 3. 모임방 그리드 리스트 */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => {
            const isFull = room.members >= room.maxMembers;
            
            return (
              <div key={room.id} className="bg-white p-7 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all flex flex-col h-full relative overflow-hidden group">
                
                {/* 마감 배지 */}
                {isFull && !room.isJoined && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl shadow-sm">
                    모집 마감
                  </div>
                )}
                {/* 참여 완료 배지 */}
                {room.isJoined && (
                  <div className="absolute top-0 right-0 bg-black text-white text-[9px] font-black px-4 py-1.5 rounded-bl-xl shadow-sm z-10">
                    참여 중
                  </div>
                )}

                {/* 태그 & 인원 현황 */}
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.type === '온라인' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                    {room.type}
                  </span>
                  <span className={`text-[10px] font-bold flex items-center ${isFull ? 'text-red-500' : 'text-gray-400'}`}>
                    {room.members} / {room.maxMembers}명
                  </span>
                </div>
                
                {/* 정보 영역 */}
                <Link href={`/rooms/${room.id}`} className="flex-1 cursor-pointer">
                  <h4 className="text-xl font-black mb-2 group-hover:text-gray-500 transition-colors">{room.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">{room.desc}</p>
                </Link>

                <div className="flex flex-wrap gap-2 mb-6">
                  {room.tags.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md">#{tag}</span>
                  ))}
                </div>

                {/* [핵심] 리스트에서 바로 누르는 참여 버튼 */}
                <button 
                  onClick={() => handleJoinRoom(room.id)}
                  disabled={isFull || room.isJoined}
                  className={`w-full py-3.5 rounded-xl text-sm font-black tracking-widest transition-all ${
                    room.isJoined 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                      : isFull 
                        ? 'bg-red-50 text-red-300 cursor-not-allowed'
                        : 'bg-gray-900 text-white hover:bg-black shadow-md'
                  }`}
                >
                  {room.isJoined ? "참여 완료" : isFull ? "정원 초과" : "바로 참여하기"}
                </button>

              </div>
            );
          })}
        </section>
      </main>

      {/* ==========================================
          [모달] 새 모임방 만들기
          ========================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-black tracking-tighter">새 모임방 개설</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">모임 이름</label>
                <input 
                  type="text" 
                  placeholder="예: 주말 아침 독서 클럽" 
                  value={newRoom.title}
                  onChange={(e) => setNewRoom({...newRoom, title: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition font-bold"
                />
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">모임 형태</label>
                  <select 
                    value={newRoom.type}
                    onChange={(e) => setNewRoom({...newRoom, type: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold appearance-none"
                  >
                    <option value="온라인">온라인</option>
                    <option value="오프라인">오프라인</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">최대 인원</label>
                  <input 
                    type="number" 
                    min="2" max="30"
                    value={newRoom.maxMembers === 0 ? '' : newRoom.maxMembers}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewRoom({...newRoom, maxMembers: val === '' ? 0 : Number(val)});
                    }}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">모임 소개</label>
                <textarea 
                  placeholder="어떤 책을 어떻게 읽을지 소개해주세요." 
                  rows={3}
                  value={newRoom.desc}
                  onChange={(e) => setNewRoom({...newRoom, desc: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">관심 태그 (쉼표로 구분)</label>
                <input 
                  type="text" 
                  placeholder="예: 인문학, 필사, 힐링" 
                  value={newRoom.tags}
                  onChange={(e) => setNewRoom({...newRoom, tags: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-4 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-lg tracking-widest"
              >
                개설 완료하기
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}