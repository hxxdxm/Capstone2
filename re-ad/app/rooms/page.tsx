"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  
  // ⭐️ [백엔드 연동] EC2 서버에서 가져온 진짜 방 목록 상태
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 모임방 만들기 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 새 모임방 생성용 폼 데이터
  const [newRoom, setNewRoom] = useState({
    title: '', desc: '', type: '온라인', maxMembers: 4, tags: ''
  });

  // JWT 토큰에서 내 고유 ID(userId)를 뽑아내는 마법의 함수
  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      // 토큰의 중간 부분을 해독해서 내 ID를 꺼냄
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch (e) {
      return null;
    }
  };

  // ⭐️ [백엔드 연동] 화면 켜질 때 로그인 확인 & 전체 방 목록 가져오기
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }

    // EC2 서버에서 전체 방 목록 싹 가져오기
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch('http://13.124.191.57:5000/api/rooms');
      const data = await res.json();
      
      const myUserId = getUserIdFromToken();

      if (Array.isArray(data)) {
        // 백엔드 방 데이터를 프론트엔드 형식에 맞게 예쁘게 가공
        const formattedRooms = data.map(r => {
          // 내가 이 방의 멤버 목록에 들어있는지 확인
          const amIMember = myUserId && r.members ? r.members.some(m => m.userId === myUserId) : false;
          
          return {
            id: r._id,
            title: r.roomName || '제목 없음',
            desc: "함께 읽고 함께 성장하는 교환독서 모임방입니다.", // 백엔드에 desc가 없으므로 임의 문구
            members: r.members ? r.members.length : 0,
            maxMembers: r.maxMembers || 4,
            type: r.roomType || '온라인',
            tags: ["독서", "친목"], // 태그도 기본값
            isJoined: amIMember,
          };
        });
        setRooms(formattedRooms);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('방 목록 가져오기 에러:', error);
      setIsLoading(false);
    }
  };

  // ⭐️ [백엔드 연동] 특정 모임방 참여하기 로직
  const handleJoinRoom = async (roomId: string) => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.push('/login');
      return;
    }

    const userId = getUserIdFromToken();
    if (!userId) {
      alert("로그인 정보가 만료되었습니다. 다시 로그인해주세요.");
      return;
    }

    try {
      const res = await fetch(`http://13.124.191.57:5000/api/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 💡 백엔드 라우터(routes/rooms.js)가 요구하는 userId 넘겨주기
        body: JSON.stringify({ userId: userId, roomPassword: '' }) 
      });

      const data = await res.json();

      if (res.ok) {
        alert('모임방 입장에 성공했습니다! 🎉');
        fetchRooms(); // 목록 새로고침해서 '참여 중' 배지 띄우기
      } else {
        alert(data.message || '방 입장에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 오류로 인해 방에 참여할 수 없습니다.');
    }
  };

  // ⭐️ [백엔드 연동] 새 모임방 만들기 로직
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRoom.title) {
      alert("모임 이름을 입력해주세요.");
      return;
    }

    const hostId = getUserIdFromToken();
    if (!hostId) {
      alert("로그인 정보가 올바르지 않습니다.");
      return;
    }

    try {
      const res = await fetch('http://13.124.191.57:5000/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 💡 백엔드 라우터(routes/rooms.js) 규격에 딱 맞춰서 데이터 쏘기!
        body: JSON.stringify({
          roomType: newRoom.type,
          roomName: newRoom.title,
          roomPassword: '', // 프론트 화면에 비번 입력란이 없으므로 빈칸
          hostId: hostId,
          maxMembers: Number(newRoom.maxMembers)
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert("새로운 모임방이 개설되었습니다!");
        setIsCreateModalOpen(false); // 모달 닫기
        setNewRoom({ title: '', desc: '', type: '온라인', maxMembers: 4, tags: '' }); // 폼 초기화
        fetchRooms(); // 새로 만든 방이 보이게 새로고침!
      } else {
        alert(data.message || "방 생성에 실패했습니다.");
      }
    } catch (error) {
      alert("서버 통신 에러가 발생했습니다.");
    }
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
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 font-bold">
                아직 개설된 모임방이 없습니다. 첫 번째 모임방의 방장이 되어주세요!
              </div>
            ) : (
              rooms.map((room) => {
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
              })
            )}
          </section>
        )}
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
