"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useParams } from 'next/navigation';
import { io } from 'socket.io-client';

const API_BASE_URL = 'http://13.124.191.57:5000/api';
const SOCKET_URL = 'http://13.124.191.57:5000';

export default function RoomDetailPage() {
  const { id } = useParams();
  
  // 상태 관리
  const [room, setRoom] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLeader, setIsLeader] = useState(false); // 방장 여부
  const [isEditingIntro, setIsEditingIntro] = useState(false);
  const [newIntro, setNewIntro] = useState('');
  const [hasLiked, setHasLiked] = useState(false); // 좋아요 토글 상태
  
  const socketRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. 모임방 정보 및 과거 기록 불러오기 (Step 1: API)
    const fetchRoomData = async () => {
      try {
        // 모임방 상세 정보
        const roomRes = await fetch(`${API_BASE_URL}/rooms/${id}`);
        const roomData = await roomRes.json();
        setRoom(roomData);
        setNewIntro(roomData.description);
        
        // [임시] 현재 유저가 방장인지 확인 (실제론 유저 ID 비교)
        if (roomData.leaderId === "currentUser") setIsLeader(true);

        // 과거 채팅 기록 불러오기
        const chatRes = await fetch(`${API_BASE_URL}/rooms/${id}/messages`);
        const chatData = await chatRes.json();
        setMessages(chatData);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      }
    };

    fetchRoomData();

    // 2. 실시간 소켓 연결 (Step 2: Socket)
    socketRef.current = io(SOCKET_URL);
    socketRef.current.emit('joinRoom', id);

    socketRef.current.on('message', (message: any) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [id]);

  // 스크롤 하단 고정
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송
  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const msgData = { roomId: id, text: inputMessage, sender: "나" };
    socketRef.current.emit('chatMessage', msgData);
    setInputMessage('');
  };

  // 좋아요 토글 (한 사람당 한 번)
  const toggleLike = async () => {
    try {
      const method = hasLiked ? 'DELETE' : 'POST';
      await fetch(`${API_BASE_URL}/rooms/${id}/like`, { method });
      setHasLiked(!hasLiked);
      setRoom({ ...room, likes: hasLiked ? room.likes - 1 : room.likes + 1 });
    } catch (error) {
      console.error("좋아요 처리 실패");
    }
  };

  // 방장 전용 소개글 수정
  const handleUpdateIntro = async () => {
    try {
      await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: newIntro })
      });
      setRoom({ ...room, description: newIntro });
      setIsEditingIntro(false);
    } catch (error) {
      alert("수정에 실패했습니다.");
    }
  };

  if (!room) return <div className="p-10 text-center font-bold">로딩 중...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-10 font-sans text-black">
      <Header />

      <main className="mx-auto max-w-5xl px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 좌측: 모임 정보 및 소개 */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-3xl font-black tracking-tighter mb-4 text-black">{room.title}</h2>
            
            {isEditingIntro ? (
              <div className="space-y-3">
                <textarea 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 text-sm font-bold focus:border-black outline-none"
                  value={newIntro}
                  onChange={(e) => setNewIntro(e.target.value)}
                />
                <div className="flex space-x-2">
                  <button onClick={handleUpdateIntro} className="text-xs font-black bg-black text-white px-3 py-2 rounded-lg">저장</button>
                  <button onClick={() => setIsEditingIntro(false)} className="text-xs font-bold text-gray-500">취소</button>
                </div>
              </div>
            ) : (
              <div className="relative group">
                <p className="text-gray-700 font-bold leading-relaxed">{room.description}</p>
                {isLeader && (
                  <button 
                    onClick={() => setIsEditingIntro(true)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-gray-100 p-2 rounded-full transition"
                  >
                    ✏️
                  </button>
                )}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button 
                onClick={toggleLike}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full border-2 transition-all font-black text-xs ${
                  hasLiked ? 'bg-black text-white border-black' : 'bg-white text-gray-800 border-gray-100 hover:border-black'
                }`}
              >
                <span>{hasLiked ? '❤️' : '🤍'}</span>
                <span>{room.likes}</span>
              </button>
              <span className="text-xs font-black text-gray-400">멤버 {room.memberCount}명</span>
            </div>
          </div>

          {/* 게시글 작성 버튼 (사이드바 형태) */}
          <button className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-lg shadow-xl hover:scale-[1.02] transition-transform">
            새 게시글 작성하기 +
          </button>
        </div>

        {/* 우측: 실시간 채팅방 */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col h-[700px] overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h3 className="font-black text-lg">실시간 대화</h3>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          </div>

          {/* 채팅 내역 (API 기록 + 소켓 실시간) */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "나" ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] p-4 rounded-2xl font-bold text-sm shadow-sm ${
                  msg.sender === "나" ? 'bg-black text-white rounded-tr-none' : 'bg-white text-black rounded-tl-none border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* 채팅 입력 */}
          <form onSubmit={sendMessage} className="p-6 bg-white border-t border-gray-100 flex space-x-3">
            <input 
              type="text" 
              className="flex-1 bg-gray-100 border-none rounded-2xl px-5 font-bold text-sm focus:ring-2 focus:ring-black outline-none"
              placeholder="메시지를 입력하세요..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
            />
            <button className="bg-black text-white px-6 py-3 rounded-2xl font-black text-sm hover:bg-gray-800 transition">전송</button>
          </form>
        </div>
      </main>
    </div>
  );
}