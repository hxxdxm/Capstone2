"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

export default function RoomPage() {
  // 1. 상태 관리
  const [currentPage, setCurrentPage] = useState(15);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'users'>('chat');
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // 2. 임시 데이터 (모임 정보, 참여자, 채팅, 책 내용)
  const roomInfo = {
    title: "주말 아침 SF 단편 읽기 🚀",
    bookTitle: "우리가 빛의 속도로 갈 수 없다면",
    totalPages: 320,
  };

  const participants = [
    { id: 1, name: "나(주인장)", profile: "😎", isMe: true, currentPage: 15 },
    { id: 2, name: "우주여행자", profile: "👽", isMe: false, currentPage: 16 },
    { id: 3, name: "별빛바다", profile: "🌊", isMe: false, currentPage: 12 },
  ];

  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: "우주여행자", text: "다들 들어오셨나요? 오늘 읽을 부분 정말 기대됩니다!", time: "10:00 AM", isMe: false },
    { id: 2, user: "별빛바다", text: "네 방금 들어왔어요~ 커피 한 잔 내리고 오겠습니다 ☕", time: "10:02 AM", isMe: false },
    { id: 3, user: "나(주인장)", text: "환영합니다! 천천히 15페이지부터 읽기 시작할게요.", time: "10:05 AM", isMe: true },
  ]);

  const mockBookContent = `
    우리가 빛의 속도로 갈 수 없다면, 우리는 어떻게 서로에게 닿을 수 있을까. 
    \n\n
    수많은 별들이 점점이 박힌 우주 정거장 창밖을 보며 안나는 생각에 잠겼다. 
    지구에서 출발한 지 벌써 3년. 동면에서 깨어난 사람들은 저마다의 그리움을 안고 창가로 모여들었다.
    \n\n
    "도착하려면 아직 10년은 더 가야 해."
    \n\n
    뒤에서 들려온 목소리에 안나는 고개를 돌렸다. 낡은 작업복을 입은 정비사 렌이었다. 
    그의 손에는 늘 그렇듯 기름때 묻은 스패너가 들려 있었다.
    \n\n
    (중략... 실제 서비스에서는 이곳에 PDF나 ePub 뷰어가 렌더링됩니다.)
  `;

  // 3. 채팅 전송 로직
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const newChat = {
      id: chatMessages.length + 1,
      user: "나(주인장)",
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setChatMessages([...chatMessages, newChat]);
    setNewMessage('');
  };

  // 4. 채팅이 추가될 때마다 스크롤 맨 아래로 내리기
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  return (
    // 전체 화면을 꽉 채우고 스크롤을 없앰 (앱처럼 동작하도록)
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      
      {/* --- [상단 헤더] --- */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <div className="flex flex-col">
            <h1 className="text-base font-black text-gray-900 leading-tight">{roomInfo.title}</h1>
            <p className="text-xs text-gray-500 font-medium">📖 {roomInfo.bookTitle}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span>독서 진행 중</span>
          </div>
          <button className="px-4 py-1.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition">
            방 설정
          </button>
        </div>
      </header>

      {/* --- [메인 콘텐츠 영역 (좌우 분할)] --- */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 1. 좌측: 책 뷰어 영역 (넓게) */}
        <div className="flex-1 flex flex-col bg-[#F9F9F7] relative">
          
          {/* 책 텍스트 / 뷰어 */}
          <div className="flex-1 overflow-y-auto p-12 lg:p-20 scrollbar-hide">
            <div className="max-w-2xl mx-auto">
              <p className="text-lg leading-loose text-gray-800 font-serif whitespace-pre-line">
                {mockBookContent}
              </p>
            </div>
          </div>

          {/* 뷰어 하단 컨트롤러 (페이지 이동) */}
          <div className="h-16 bg-white/80 backdrop-blur-md border-t border-gray-200 flex items-center justify-between px-8 shrink-0 absolute bottom-0 w-full">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 text-gray-400 hover:text-gray-800 transition rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <div className="flex flex-col items-center">
              <span className="text-sm font-bold text-gray-700">{currentPage} / {roomInfo.totalPages}</span>
              <div className="w-64 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-green-500 rounded-full" style={{ width: `${(currentPage / roomInfo.totalPages) * 100}%` }}></div>
              </div>
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(roomInfo.totalPages, prev + 1))}
              className="p-2 text-gray-400 hover:text-gray-800 transition rounded-full hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* 2. 우측: 사이드바 (참여자 목록 & 채팅) */}
        <div className="w-80 lg:w-96 bg-white border-l border-gray-200 flex flex-col shrink-0 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)] z-20">
          
          {/* 우측 탭 네비게이션 */}
          <div className="flex border-b border-gray-100 shrink-0">
            <button 
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'chat' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              실시간 채팅
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-4 text-sm font-bold transition-all border-b-2 ${activeTab === 'users' ? 'border-green-500 text-green-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
              참여자 ({participants.length})
            </button>
          </div>

          {/* 탭 내용: 실시간 채팅 */}
          {activeTab === 'chat' && (
            <>
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
                    {!msg.isMe && <span className="text-xs font-bold text-gray-500 mb-1 ml-1">{msg.user}</span>}
                    <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${msg.isMe ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-1 mx-1">{msg.time}</span>
                  </div>
                ))}
              </div>
              
              {/* 채팅 입력창 */}
              <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <form onSubmit={handleSendMessage} className="flex space-x-2">
                  <input 
                    type="text" 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..." 
                    className="flex-1 bg-gray-100 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                  />
                  <button type="submit" className="bg-green-500 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-green-600 transition shadow-sm">
                    <svg className="w-5 h-5 translate-x-[-1px] translate-y-[1px]" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </form>
              </div>
            </>
          )}

          {/* 탭 내용: 참여자 목록 */}
          {activeTab === 'users' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {participants.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg shadow-inner">
                      {user.profile}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 flex items-center space-x-1">
                        <span>{user.name}</span>
                        {user.isMe && <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded text-center">나</span>}
                      </h4>
                      <p className="text-xs text-gray-500 mt-0.5">현재 {user.currentPage}p 읽는 중</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}