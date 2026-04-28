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

  // ✅ 토큰 가져오기 헬퍼
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  };

  // ✅ 내 ID 추출 헬퍼
  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
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
      const amIIn = data.members?.some((m: any) => m.userId === myId);
      
      setIsJoined(amIIn);
      setRoomData(data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      router.push('/rooms');
    }
  };

  // ✅ [신규] 모임 삭제 함수
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
        alert("모임방이 성공적으로 삭제되었습니다.");
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
        alert('모임 참여 성공!');
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

  if (isLoading || !roomData) return <div className="p-20 text-center">로드 중...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="bg-white px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-50">
        <Link href="/" className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></Link>
        <Link href="/rooms" className="text-sm font-bold text-gray-400 hover:text-black">뒤로가기</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="mb-6">
            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-black text-white mr-2">
              {roomData.roomType}
            </span>
          </div>
          <h2 className="text-4xl font-black mb-8 leading-tight">{roomData.roomName}</h2>
          
          <section className="space-y-6">
            <h3 className="text-xl font-black border-b-2 border-black pb-2 inline-block">모임 소개</h3>
            {/* ✅ 소개글 줄바꿈 수정 포인트 */}
            <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap break-keep bg-white p-6 rounded-2xl border border-gray-100">
              {roomData.roomDesc || "작성된 소개글이 없습니다."}
            </p>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl">
            <div className="flex justify-between items-end mb-6">
              <span className="text-sm font-bold text-gray-400">참여 현황</span>
              <span className="text-2xl font-black">{roomData.members?.length || 0} / {roomData.maxMembers}</span>
            </div>
            
            {/* ✅ 방장에게만 보이는 삭제 버튼 */}
            {roomData.creatorId === getMyId() && (
              <button 
                onClick={handleDeleteRoom}
                className="w-full mb-4 py-3 border-2 border-red-500 text-red-500 rounded-xl text-xs font-black hover:bg-red-50 transition"
              >
                모임방 삭제하기 (방장 전용)
              </button>
            )}

            <button 
              onClick={() => (roomData.roomPassword ? setIsPasswordModalOpen(true) : executeJoin())}
              disabled={isJoined || roomData.members?.length >= roomData.maxMembers}
              className={`w-full py-5 rounded-2xl text-sm font-black tracking-widest transition-all ${
                isJoined ? 'bg-gray-100 text-gray-400' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isJoined ? "이미 참여 중입니다" : "모임 신청하기"}
            </button>
          </div>
        </aside>
      </main>

      {/* 비밀번호 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm">
            <h3 className="text-center font-black mb-6">비밀번호 입력</h3>
            <input 
              type="password" 
              value={inputPassword} 
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 mb-6 focus:border-black outline-none"
            />
            <div className="flex space-x-3">
              <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 text-gray-400 font-bold">취소</button>
              <button onClick={() => executeJoin(inputPassword)} className="flex-1 bg-black text-white py-3 rounded-xl font-black">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}