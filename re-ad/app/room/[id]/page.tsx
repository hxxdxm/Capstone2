"use client";

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // [NEW] 라우터 추가

export default function RoomDashboard({ params }: { params: { id: string } }) {
  const router = useRouter(); // [NEW] 페이지 이동을 위한 라우터
  
  // 1. 상태 및 Ref 관리
  const [activeTab, setActiveTab] = useState<'books' | 'members'>('books');
  const [chatInput, setChatInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // [NEW] 책 정보 수정 모달 상태
  const [editingBook, setEditingBook] = useState<{ id: number; title: string; author: string } | null>(null);

  // 2. 가짜 데이터
  const [books, setBooks] = useState([
    { id: 1, title: "우리가 빛의 속도로 갈 수 없다면", author: "김초엽", status: "읽는 중", addedDate: "2024.03.25" },
    { id: 2, title: "지구 끝의 온실", author: "김초엽", status: "대기 중", addedDate: "2024.03.30" },
  ]);

  const [members, setMembers] = useState([
    { id: 1, name: "나(방장)", progress: 75, profile: "😎" },
    { id: 2, name: "우주여행자", progress: 40, profile: "👽" },
    { id: 3, name: "별빛바다", progress: 90, profile: "🌊" },
  ]);

  const [chats, setChats] = useState([
    { user: "우주여행자", text: "오늘 50페이지까지 읽기로 한 거 맞죠?", time: "14:20" },
    { user: "나(방장)", text: "네 맞습니다! 다들 화이팅!", time: "14:22" },
  ]);

  // 3. 핸들러 함수들
  const handleAddBookClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const bookTitle = file.name.replace(/\.[^/.]+$/, ""); 
      setBooks([
        ...books, 
        { id: Date.now(), title: bookTitle, author: "작자 미상", status: "대기 중", addedDate: new Date().toLocaleDateString() }
      ]);
      e.target.value = '';
    }
  };

  // [NEW] 책 정보 수정 저장
  const handleSaveBookInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;

    setBooks(books.map(book => 
      book.id === editingBook.id 
        ? { ...book, title: editingBook.title, author: editingBook.author } 
        : book
    ));
    setEditingBook(null); // 모달 닫기
  };

  // [NEW] 책 클릭 시 뷰어로 이동 (단, 수정 버튼 클릭 시에는 이동 막음)
  const handleBookClick = (bookId: number) => {
    router.push(`/room/${params.id}/viewer`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-10 relative">
      
      {/* --- 헤더 ('독서 시작하기' 버튼 제거됨) --- */}
      <header className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <Link href="/" className="text-gray-400 hover:text-gray-700 font-bold transition">← 목록으로</Link>
          <h1 className="text-2xl font-black text-gray-900">주말 아침 SF 단편 읽기 🚀</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 왼쪽 & 중앙 영역 */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* --- [섹션 1: 도서 목록] --- */}
          <section className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">우리 방 도서 목록 <span className="text-sm font-medium text-gray-400 ml-1">(책을 누르면 바로 읽을 수 있어요)</span></h3>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf, .epub" className="hidden" />
              <button onClick={handleAddBookClick} className="text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                책 파일 업로드
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map(book => (
                // [NEW] 책 카드 클릭 이벤트 (뷰어로 이동)
                <div 
                  key={book.id} 
                  onClick={() => handleBookClick(book.id)}
                  className="relative border border-gray-100 p-4 rounded-2xl flex items-center space-x-4 hover:bg-green-50 hover:border-green-200 transition cursor-pointer group"
                >
                  <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 font-bold group-hover:bg-white group-hover:text-green-500 transition shrink-0 shadow-inner">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/></svg>
                  </div>
                  <div className="flex-1 min-w-0 pr-6"> {/* pr-6은 수정버튼 공간 확보 */}
                    <h4 className="font-bold text-gray-800 truncate group-hover:text-green-700 transition">{book.title}</h4>
                    <p className="text-xs text-gray-500">{book.author}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded ${book.status === '읽는 중' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {book.status}
                      </span>
                    </div>
                  </div>

                  {/* [NEW] 수정 버튼 (클릭 시 이벤트 전파를 막아 뷰어 이동을 방지함) */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation(); // 부모인 카드의 onClick(뷰어 이동)이 실행되지 않게 막음
                      setEditingBook({ id: book.id, title: book.title, author: book.author });
                    }}
                    className="absolute right-4 top-4 text-gray-300 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="책 정보 수정"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* --- [섹션 2: 참여자 진도율] --- */}
          <section className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">참여자 진도율 ({members.length}명)</h3>
              <span className="text-sm text-green-600 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                실시간 업데이트 중
              </span>
            </div>
            <div className="space-y-6">
              {members.map(member => (
                <div key={member.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{member.profile}</span>
                      <span className="font-bold text-gray-700">{member.name}</span>
                    </div>
                    <span className="font-black text-green-600">{member.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full transition-all duration-1000 ease-out" style={{ width: `${member.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* --- [오른쪽: 채팅 채널 (이전과 동일)] --- */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 h-[600px] flex flex-col overflow-hidden sticky top-32">
            <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-black text-gray-800">모임 채팅</h3>
              <span className="text-xs text-gray-400 font-bold">참여 인원 전용</span>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chats.map((c, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 mb-1 ml-1">{c.user}</span>
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-sm text-sm text-gray-700 w-max max-w-[90%] shadow-sm">{c.text}</div>
                  <span className="text-[10px] text-gray-300 mt-1 ml-1">{c.time}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-gray-50 bg-white">
              <form 
                onSubmit={(e) => { e.preventDefault(); if(chatInput.trim()) { setChats([...chats, { user: "나(방장)", text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); setChatInput(''); } }}
                className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-1 focus-within:ring-green-500 transition"
              >
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="메시지 입력..." className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none" />
                <button type="submit" className="text-green-600 font-bold text-sm px-2 hover:text-green-700 transition">전송</button>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* --- [NEW] 책 정보 수정 모달창 --- */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-800">책 정보 수정</h3>
              <button onClick={() => setEditingBook(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSaveBookInfo} className="p-6 space-y-4">
              <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg mb-2">
                💡 <b>Tip:</b> 나중에는 여기에 네이버/알라딘 책 검색 API가 연동되어서 표지와 정보를 자동으로 불러올 수 있습니다!
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">책 제목</label>
                <input 
                  type="text" 
                  value={editingBook.title}
                  onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" 
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">지은이 (저자)</label>
                <input 
                  type="text" 
                  value={editingBook.author}
                  onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" 
                  required
                />
              </div>
              <div className="pt-2 flex space-x-3">
                <button type="button" onClick={() => setEditingBook(null)} className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-600 hover:bg-gray-200 transition">취소</button>
                <button type="submit" className="flex-1 rounded-xl bg-green-500 py-3 text-sm font-bold text-white hover:bg-green-600 transition">저장하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}