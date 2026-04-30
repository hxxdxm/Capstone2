"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RoomsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // 비밀번호 입력을 위한 상태
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetRoomId, setTargetRoomId] = useState('');
  const [inputPassword, setInputPassword] = useState('');

  const [newRoom, setNewRoom] = useState({
    title: '', 
    desc: '', 
    type: '온라인', 
    maxMembers: 4, 
    tags: '', 
    category: '독서모임',
    isPrivate: false,
    password: ''
  });

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  };

  const getUserIdFromToken = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload.userId;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const token = getToken();
    if (token) setIsLoggedIn(true);
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      const myUserId = getUserIdFromToken();

      if (Array.isArray(data)) {
        const formattedRooms = data.map((r: any) => ({
          id: r._id,
          title: r.roomName || '제목 없음',
          // ⭐️ 더미 텍스트 삭제: 백엔드 데이터가 없으면 빈 문자열 처리
          desc: r.roomDesc || "", 
          members: r.members ? r.members.length : 0,
          maxMembers: r.maxMembers || 4,
          type: r.roomType || '온라인',
          category: r.category === 'EXCHANGE' ? '도서교환' : '독서모임',
          // ⭐️ 더미 태그 삭제: 백엔드 태그 배열이 없으면 빈 배열 처리
          tags: Array.isArray(r.tags) ? r.tags : [], 
          isJoined: myUserId && r.members ? r.members.some((m: any) => m.userId === myUserId) : false,
          isPrivate: !!(r.roomPassword && r.roomPassword !== "")
        }));
        setRooms(formattedRooms);
      }
      setIsLoading(false);
    } catch (error) {
      console.error('방 목록 로드 실패:', error);
      setIsLoading(false);
    }
  };

  const handleJoinClick = (room: any) => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.");
      router.push('/login');
      return;
    }
    if (room.isPrivate) {
      setTargetRoomId(room.id);
      setIsPasswordModalOpen(true);
    } else {
      executeJoin(room.id);
    }
  };

  const executeJoin = async (roomId: string, password: string = '') => {
    const userId = getUserIdFromToken();
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, roomPassword: password }) 
      });

      const data = await res.json();
      if (res.ok) {
        alert('모임방 참여 성공! 🎉');
        setIsPasswordModalOpen(false);
        setInputPassword('');
        fetchRooms(); 
      } else {
        alert(data.message || '입장에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.title) return alert("모임 이름을 입력해주세요.");
    const hostId = getUserIdFromToken();
    const token = getToken();
    const tagsArray = newRoom.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          roomType: newRoom.type,      
          roomName: newRoom.title,     
          roomDesc: newRoom.desc, 
          roomPassword: newRoom.isPrivate ? newRoom.password : '', 
          hostId: hostId,
          maxMembers: Number(newRoom.maxMembers),
          tags: tagsArray,
          category: newRoom.category 
        })
      });
      if (res.ok) {
        alert("개설 완료! 🎉");
        setIsCreateModalOpen(false); 
        setNewRoom({ title: '', desc: '', type: '온라인', maxMembers: 4, tags: '', category: '독서모임', isPrivate: false, password: '' }); 
        fetchRooms(); 
      }
    } catch (error) {
      alert("통신 에러");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <Link href="/" className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></Link>
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black transition">홈으로</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-12 space-y-10">
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-black pb-6 gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">LOUNGE</h2>
            <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">취향이 통하는 사람들과의 교환독서</p>
          </div>
          <button 
            onClick={() => isLoggedIn ? setIsCreateModalOpen(true) : (alert("로그인이 필요합니다."), router.push('/login'))}
            className="px-6 py-3 bg-black text-white text-sm font-black tracking-widest rounded-full hover:bg-gray-800 transition shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>모임방 만들기</span>
          </button>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 font-bold">개설된 모임이 없습니다.</div>
            ) : (
              rooms.map((room) => {
                const isFull = room.members >= room.maxMembers;
                return (
                  <div key={room.id} className="bg-white p-7 rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all flex flex-col h-full relative group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex space-x-1">
                        <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest ${room.type === '온라인' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>{room.type}</span>
                        <span className="px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">{room.category}</span>
                        {room.isPrivate && (
                          <span className="px-2 py-1 rounded bg-red-50 text-red-500"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" /></svg></span>
                        )}
                      </div>
                      <span className={`text-[10px] font-bold ${isFull ? 'text-red-500' : 'text-gray-400'}`}>{room.members} / {room.maxMembers}명</span>
                    </div>
                    
                    <Link href={`/rooms/${room.id}`} className="flex-1 cursor-pointer">
                      <h4 className="text-xl font-black mb-2 group-hover:text-gray-500 transition-colors">{room.title}</h4>
                      {/* ⭐️ 실제 데이터 연결 (데이터 없으면 표시 안됨) */}
                      <p className="text-xs text-gray-500 leading-relaxed mb-6 line-clamp-2">{room.desc}</p>
                    </Link>

                    <div className="flex flex-wrap gap-2 mb-6">
                      {/* ⭐️ 실제 태그 연결 */}
                      {room.tags.map((tag: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-gray-50 text-[10px] font-bold text-gray-400 rounded-md">#{tag}</span>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleJoinClick(room)}
                      disabled={isFull || room.isJoined}
                      className={`w-full py-3.5 rounded-xl text-sm font-black tracking-widest transition-all ${
                        room.isJoined ? 'bg-gray-100 text-gray-400' : isFull ? 'bg-red-50 text-red-300' : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {room.isJoined ? "참여 중" : isFull ? "정원 초과" : room.isPrivate ? "비밀방 참여" : "바로 참여하기"}
                    </button>
                  </div>
                );
              })
            )}
          </section>
        )}
      </main>

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-center text-xl font-black mb-6">비밀번호 입력</h3>
            <input 
              type="password" 
              value={inputPassword} 
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-2xl font-black focus:border-black outline-none mb-6"
            />
            <div className="flex space-x-3">
              <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-4 text-gray-400 font-bold">취소</button>
              <button onClick={() => executeJoin(targetRoomId, inputPassword)} className="flex-1 bg-black text-white rounded-xl font-black">확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 방 개설 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-black tracking-tighter">새 모임방 개설</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleCreateRoom} className="p-8 space-y-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">모임 이름</label>
                <input type="text" placeholder="예: 주말 아침 독서 클럽" value={newRoom.title} onChange={(e) => setNewRoom({...newRoom, title: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold" />
              </div>
              <div className="space-y-4">
                <div className={`flex items-center space-x-3 p-4 rounded-2xl border transition cursor-pointer ${newRoom.isPrivate ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 text-gray-900'}`} onClick={() => setNewRoom({...newRoom, isPrivate: !newRoom.isPrivate})}>
                  <input type="checkbox" checked={newRoom.isPrivate} readOnly className="w-5 h-5 accent-white cursor-pointer" />
                  <div className="flex flex-col"><span className="text-sm font-black">비밀방으로 만들기</span><span className={`text-[10px] font-bold ${newRoom.isPrivate ? 'text-gray-300' : 'text-gray-400'}`}>비밀번호가 있어야 입장 가능합니다.</span></div>
                </div>
                {newRoom.isPrivate && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold text-gray-500 mb-1">방 비밀번호</label>
                    <input type="password" placeholder="숫자 4자리 이상" value={newRoom.password} onChange={(e) => setNewRoom({...newRoom, password: e.target.value})} className="w-full bg-white border-2 border-black rounded-xl px-4 py-3 text-sm focus:outline-none font-bold" />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-bold text-gray-500 mb-1">카테고리</label>
                  <select value={newRoom.category} onChange={(e) => setNewRoom({...newRoom, category: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold"><option value="독서모임">독서모임</option><option value="도서교환">도서교환</option></select>
                </div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">형태</label>
                  <select value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold"><option value="온라인">온라인</option><option value="오프라인">오프라인</option></select>
                </div>
                <div><label className="block text-xs font-bold text-gray-500 mb-1">인원</label>
                  <input type="number" min="2" max="30" value={newRoom.maxMembers} onChange={(e) => setNewRoom({...newRoom, maxMembers: Number(e.target.value)})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold" />
                </div>
              </div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">모임 소개</label><textarea placeholder="소개를 작성해주세요." rows={3} value={newRoom.desc} onChange={(e) => setNewRoom({...newRoom, desc: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"></textarea></div>
              <div><label className="block text-xs font-bold text-gray-500 mb-1">태그 (쉼표 구분)</label><input type="text" placeholder="예: 인문학, 소설" value={newRoom.tags} onChange={(e) => setNewRoom({...newRoom, tags: e.target.value})} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" /></div>
              <button type="submit" className="w-full mt-4 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-lg">개설 완료하기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}