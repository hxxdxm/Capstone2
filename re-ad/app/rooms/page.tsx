"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // ⭐️ [NEW] 필터 상태 (전체 / 온라인 / 오프라인)
  const [activeFilter, setActiveFilter] = useState('전체');

  // ⭐️ [NEW] 방 만들기 모달 상태 및 폼 데이터
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomName: '',
    roomType: '온라인', // 기본값
    maxMembers: 10,
    roomPassword: '',
    roomDesc: '',
    tags: '' // 콤마로 입력받을 예정
  });

  const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.id || payload.userId;
    } catch (e) { return null; }
  };

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      } else if (data.rooms && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("모임방 목록 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // ⭐️ [NEW] 모임방 생성 API 호출
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    const myId = getMyId();

    if (!token || !myId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!newRoom.roomName.trim()) {
      alert("모임방 이름을 입력해주세요.");
      return;
    }

    // 태그를 콤마 기준으로 배열로 변환
    const tagArray = newRoom.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    const roomPayload = {
      ...newRoom,
      hostId: myId,
      tags: tagArray
      // category 필드는 완전히 제거했습니다!
    };

    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(roomPayload)
      });

      if (res.ok) {
        alert("모임방이 성공적으로 개설되었습니다!");
        setIsCreateModalOpen(false);
        setNewRoom({ roomName: '', roomType: '온라인', maxMembers: 10, roomPassword: '', roomDesc: '', tags: '' });
        fetchRooms(); // 목록 새로고침
      } else {
        alert("방 생성에 실패했습니다.");
      }
    } catch (error) {
      alert("서버와 연결할 수 없습니다.");
    }
  };

  // ⭐️ [NEW] 필터 적용 로직
  const filteredRooms = rooms.filter(room => {
    if (activeFilter === '전체') return true;
    return room.roomType === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      <Header />

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-10 relative">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            READING LOUNGE
          </span>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-black">Rooms</h2>
          <p className="mt-4 text-gray-700 font-bold">함께 읽고, 나누고, 성장하는 공간</p>
          
          {/* 모임방 개설 버튼 (모달 열기) */}
          <div className="absolute right-0 bottom-0">
            <button 
              onClick={() => {
                if (!getToken()) return alert("로그인 후 이용 가능합니다.");
                setIsCreateModalOpen(true);
              }}
              className="bg-black text-white px-6 py-3 rounded-full font-black text-sm hover:bg-gray-800 transition shadow-lg flex items-center space-x-2"
            >
              <span>+ 방 만들기</span>
            </button>
          </div>
        </section>

        {/* ⭐️ [NEW] 필터 탭 */}
        <div className="flex justify-center space-x-2 mb-12">
          {['전체', '온라인', '오프라인'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all ${
                activeFilter === filter
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.length === 0 ? (
              <div className="col-span-full text-center py-24 border-2 border-dashed border-gray-300 rounded-[2.5rem]">
                <p className="text-gray-600 font-bold text-lg">해당하는 모임방이 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">조건을 바꾸거나 새 모임방을 개설해 보세요!</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <Link 
                  href={`/rooms/${room._id || room.id}`} 
                  key={room._id || room.id}
                  className="bg-white p-8 rounded-[2.5rem] border border-gray-200 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-1 hover:border-black transition-all group min-h-[280px]"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      {/* ⭐️ 카테고리(독서/교환) 뱃지 삭제됨 */}
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.roomType === '온라인' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                        {room.roomType}
                      </span>
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

      {/* ⭐️ [NEW] 방 만들기 모달창 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl my-8">
            <button 
              onClick={() => setIsCreateModalOpen(false)} 
              className="absolute top-8 right-8 text-gray-400 hover:text-black font-bold text-xl"
            >
              ✕
            </button>
            
            <h3 className="text-3xl font-black tracking-tighter mb-8 text-black">새 모임방 개설</h3>
            
            <form onSubmit={handleCreateRoom} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">모임방 이름 *</label>
                <input 
                  type="text" 
                  className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black transition" 
                  placeholder="예) 금요일 밤 소설 읽기" 
                  value={newRoom.roomName}
                  onChange={(e) => setNewRoom({...newRoom, roomName: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2">진행 방식 *</label>
                  <select 
                    className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black bg-white"
                    value={newRoom.roomType}
                    onChange={(e) => setNewRoom({...newRoom, roomType: e.target.value})}
                  >
                    <option value="온라인">온라인</option>
                    <option value="오프라인">오프라인</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2">최대 인원 *</label>
                  <input 
                    type="number" 
                    min="2" max="100"
                    className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black transition" 
                    value={newRoom.maxMembers}
                    onChange={(e) => setNewRoom({...newRoom, maxMembers: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">비밀번호 (선택)</label>
                <input 
                  type="password" 
                  className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black transition" 
                  placeholder="입력 시 비공개 방으로 설정됩니다" 
                  value={newRoom.roomPassword}
                  onChange={(e) => setNewRoom({...newRoom, roomPassword: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">모임 소개</label>
                <textarea 
                  className="w-full border-2 border-gray-100 rounded-2xl p-4 h-24 focus:border-black outline-none font-bold text-black transition resize-none" 
                  placeholder="어떤 모임인지 자세히 적어주세요"
                  value={newRoom.roomDesc}
                  onChange={(e) => setNewRoom({...newRoom, roomDesc: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">태그 (선택)</label>
                <input 
                  type="text" 
                  className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black transition" 
                  placeholder="콤마(,)로 구분해 주세요 예) 소설,주말,온라인" 
                  value={newRoom.tags}
                  onChange={(e) => setNewRoom({...newRoom, tags: e.target.value})}
                />
              </div>

              <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition shadow-lg mt-4">
                모임방 만들기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}