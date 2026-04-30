"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id;

  const [roomData, setRoomData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  // ✅ 토큰 가져오기 (로컬/세션 모두 확인)
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  };

  // ✅ 내 ID 추출 헬퍼 (JWT 디코딩)
  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      // 백엔드에서 주는 ID 필드명(id 또는 userId)에 맞게 유연하게 대응
      return payload.id || payload.userId;
    } catch (e) { 
      return null; 
    }
  };

  useEffect(() => {
    if (!roomId) return;
    fetchRoomDetail();
  }, [roomId]);

  const fetchRoomDetail = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      const data = await res.json();
      if (!res.ok) throw new Error("방 정보 로드 실패");

      const myId = getMyId();
      // ⭐️ 참여 여부 확인
      const amIIn = data.members?.some((m: any) => m.userId === myId);
      
      setIsJoined(amIIn);
      setRoomData(data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      router.push('/rooms');
    }
  };

  // ⭐️ [신규] 모임 삭제 함수
  const handleDeleteRoom = async () => {
    if (!confirm("정말로 이 모임방을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) return;

    const token = getToken();
    const myId = getMyId();

    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: myId })
      });

      if (res.ok) {
        alert("모임방이 삭제되었습니다. 라운지로 이동합니다.");
        router.push('/rooms');
      } else {
        const err = await res.json();
        alert(err.message || "삭제 권한이 없습니다.");
      }
    } catch (error) {
      alert("서버 연결에 실패했습니다.");
    }
  };

  const executeJoin = async (password: string = '') => {
    const myId = getMyId();
    const token = getToken();

    if (!myId || !token) {
      alert("로그인이 필요합니다.");
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ userId: myId, roomPassword: password })
      });

      if (res.ok) {
        alert('모임 참여 성공! 🎉');
        setIsPasswordModalOpen(false);
        fetchRoomDetail();
      } else {
        const result = await res.json();
        alert(result.message || '참여 실패');
      }
    } catch (error) {
      alert('서버 오류');
    }
  };

  if (isLoading || !roomData) return <div className="p-20 text-center font-black">데이터를 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></Link>
        <Link href="/rooms" className="text-sm font-bold text-gray-400 hover:text-black transition">뒤로가기</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* 왼쪽 섹션 */}
        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roomData.roomType === '온라인' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                {roomData.roomType}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">{roomData.roomName}</h2>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black border-b-2 border-black pb-2 inline-block">모임 소개</h3>
            {/* ✅ 소개글 줄바꿈 유지 (whitespace-pre-wrap) */}
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap break-keep bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              {roomData.roomDesc || "작성된 소개글이 없습니다."}
            </p>
          </section>
        </div>

        {/* 오른쪽 사이드바 */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
            <div className="flex justify-between items-end mb-4">
              <span className="text-sm font-black text-gray-400">참여 현황</span>
              <span className="text-2xl font-black">{roomData.members?.length || 0} / {roomData.maxMembers}</span>
            </div>

            {/* ✅ ⭐️ 방장 전용 삭제 버튼: 내 ID와 방장 ID가 같을 때만 노출 */}
            {roomData.hostId === getMyId() && (
              <button 
                onClick={handleDeleteRoom}
                className="w-full py-4 border-2 border-red-500 text-red-500 rounded-2xl text-xs font-black hover:bg-red-50 transition-all flex items-center justify-center space-x-2 mb-4"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                <span>이 모임 삭제하기</span>
              </button>
            )}

            <button 
              onClick={() => (roomData.roomPassword ? setIsPasswordModalOpen(true) : executeJoin())}
              disabled={isJoined || roomData.members?.length >= roomData.maxMembers}
              className={`w-full py-5 rounded-2xl text-sm font-black tracking-widest transition-all shadow-lg ${
                isJoined 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : 'bg-black text-white hover:bg-gray-800 active:scale-95'
              }`}
            >
              {isJoined ? "이미 참여 중인 모임" : roomData.members?.length >= roomData.maxMembers ? "정원 초과" : "모임 신청하기"}
            </button>
          </div>
        </aside>
      </main>

      {/* 비밀번호 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-center text-xl font-black mb-6">비밀번호 입력</h3>
            <input 
              type="password" 
              value={inputPassword} 
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="숫자 4자리"
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 mb-6 text-center text-2xl font-black focus:border-black outline-none transition-all"
            />
            <div className="flex space-x-3">
              <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-4 text-gray-400 font-bold hover:text-black transition">취소</button>
              <button onClick={() => executeJoin(inputPassword)} className="flex-1 bg-black text-white py-4 rounded-xl font-black shadow-lg">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}