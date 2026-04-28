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

  // ✅ 토큰을 로컬/세션 모두에서 안전하게 가져오는 헬퍼 함수
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token') || sessionStorage.getItem('token');
    }
    return null;
  };

  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      // JWT 디코딩 시 에러 방지를 위해 구조 확인
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      return payload.id || payload.userId; // 백엔드 필드명에 따라 유연하게 대응
    } catch (e) { 
      console.error("토큰 파싱 에러:", e);
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
      
      if (!res.ok) throw new Error("방을 찾을 수 없습니다.");

      const myId = getMyId();
      // 내 아이디가 참여 명단에 있는지 체크
      const amIIn = data.members?.some((m: any) => m.userId === myId);
      
      setIsJoined(amIIn);
      setRoomData(data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      alert("방 정보를 불러오는 중 에러가 발생했습니다.");
      router.push('/rooms');
    }
  };

  const executeJoin = async (password: string = '') => {
    const myId = getMyId();
    const token = getToken();

    if (!myId || !token) {
      alert("로그인이 필요한 서비스입니다. 로그인 페이지로 이동합니다.");
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // 헤더에 토큰 추가
        },
        body: JSON.stringify({ userId: myId, roomPassword: password })
      });

      const result = await res.json();

      if (res.ok) {
        alert('모임방 입장에 성공했습니다! 🎉');
        setIsPasswordModalOpen(false);
        setInputPassword('');
        fetchRoomDetail(); // 정보 새로고침
      } else {
        alert(result.message || '입장에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 오류가 발생했습니다.');
    }
  };

  const handleJoinClick = () => {
    if (isJoined) return;

    // 비밀방 여부 확인 (백엔드 데이터 기준)
    const isPrivate = !!(roomData.roomPassword && roomData.roomPassword !== "");

    if (isPrivate) {
      setIsPasswordModalOpen(true);
    } else {
      executeJoin();
    }
  };

  if (isLoading || !roomData) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F8F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        <Link href="/rooms" className="text-sm font-bold text-gray-400 hover:text-black transition">뒤로가기</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-12">
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roomData.roomType === '온라인' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                {roomData.roomType}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black bg-gray-100 text-gray-500 uppercase tracking-widest">
                {roomData.category === 'READING' ? '독서모임' : '도서교환'}
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">{roomData.roomName}</h2>
            <div className="flex flex-wrap gap-2 mb-10">
              {roomData.tags?.map((tag: string) => (
                <span key={tag} className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-500 rounded-xl">#{tag}</span>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="text-xl font-black border-b border-black pb-2 inline-block">모임 소개</h3>
            <p className="text-gray-600 leading-loose text-lg font-medium break-keep whitespace-pre-wrap">
              {roomData.roomDesc || "작성된 소개글이 없습니다."}
            </p>
          </section>
        </div>

        <aside className="lg:col-span-4 lg:sticky lg:top-28 h-fit space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl space-y-8">
            <div>
              <div className="flex items-end justify-between mb-4">
                <span className="text-sm font-black text-gray-400">참여 현황</span>
                <span className="text-2xl font-black">
                  {roomData.members?.length || 0} <span className="text-gray-300 text-lg">/ {roomData.maxMembers}</span>
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 bg-black"
                  style={{ width: `${((roomData.members?.length || 0) / roomData.maxMembers) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Invite Code</p>
                <p className="text-lg font-mono font-black tracking-wider text-black">{roomData.inviteCode}</p>
              </div>
              <button 
                onClick={() => { navigator.clipboard.writeText(roomData.inviteCode); alert("복사 완료!"); }}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:border-black transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Members</p>
              <div className="flex flex-wrap gap-2">
                {roomData.members?.map((member: any, i: number) => (
                  <div key={i} className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-full border border-gray-100">
                    <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[8px] text-white font-black">{i + 1}</div>
                    <span className="text-xs font-bold text-gray-700">{member.userId.substring(0, 8)}...</span>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={handleJoinClick}
              disabled={isJoined || (roomData.members?.length >= roomData.maxMembers)}
              className={`w-full py-5 rounded-2xl text-sm font-black tracking-widest transition-all shadow-lg ${
                isJoined 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                : roomData.members?.length >= roomData.maxMembers
                  ? 'bg-red-50 text-red-300 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800 active:scale-95'
              }`}
            >
              {isJoined ? "참여 중인 모임" : roomData.members?.length >= roomData.maxMembers ? "정원 초과" : "모임 신청하기"}
            </button>
          </div>
        </aside>
      </main>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white rounded-[2rem] p-8 shadow-2xl">
            <h3 className="text-xl font-black mb-6 text-center">비밀번호 입력</h3>
            <input 
              type="password"
              placeholder="비밀번호 입력"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-2xl font-black focus:border-black focus:outline-none mb-6 transition"
            />
            <div className="flex space-x-3">
              <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 py-4 text-sm font-bold text-gray-400">취소</button>
              <button onClick={() => executeJoin(inputPassword)} className="flex-1 py-4 bg-black text-white rounded-xl text-sm font-black shadow-lg">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}