"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function MainPage() {
  // 1. 상태 관리
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<'none' | 'create' | 'join'>('none');
  
  // [NEW] isPrivate(비공개 여부)와 password(비밀번호) 상태 추가
  const [newRoomData, setNewRoomData] = useState({ 
    title: '', 
    currentBook: '', 
    maxUsers: 4,
    isPrivate: false,
    password: ''
  });
  
  const [joinCode, setJoinCode] = useState('');

  // 2. 임시 방 데이터 ([NEW] isPrivate 속성 추가 및 비공개 방 예시 추가)
  const [rooms, setRooms] = useState([
    { id: 1, title: "주말 아침 SF 단편 읽기 🚀", currentBook: "우리가 빛의 속도로 갈 수 없다면", totalBooks: 3, host: "우주여행자", currentUsers: 3, maxUsers: 5, status: "모집중", isMine: false, isPrivate: false },
    { id: 2, title: "퇴근 후 심리학 탐구 (조용히 읽어요)", currentBook: "미움받을 용기", totalBooks: 1, host: "토닥토닥", currentUsers: 4, maxUsers: 4, status: "정원초과", isMine: true, isPrivate: false },
    { id: 6, title: "우리끼리 비밀 독서 모임 🤫", currentBook: "다빈치 코드", totalBooks: 1, host: "탐정단장", currentUsers: 2, maxUsers: 4, status: "모집중", isMine: false, isPrivate: true },
    { id: 3, title: "고전 문학 정주행 방", currentBook: "데미안", totalBooks: 5, host: "싱클레어", currentUsers: 2, maxUsers: 8, status: "모집중", isMine: false, isPrivate: false },
    { id: 4, title: "프론트엔드 취준생 전공서적 스터디", currentBook: "모던 자바스크립트 Deep Dive", totalBooks: 2, host: "코딩머신", currentUsers: 5, maxUsers: 10, status: "진행중", isMine: true, isPrivate: true },
    { id: 5, title: "가볍게 읽는 에세이 모임", currentBook: "언어의 온도", totalBooks: 1, host: "따뜻한차한잔", currentUsers: 1, maxUsers: 6, status: "모집중", isMine: false, isPrivate: false },
  ]);

  // 3. 필터링 로직
  const displayedRooms = rooms
    .filter(room => activeTab === 'all' ? true : room.isMine)
    .filter(room => 
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.currentBook.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // 4. 새로운 방 생성 로직 ([NEW] 비밀번호 검증 추가)
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomData.title || !newRoomData.currentBook) {
      alert("방 제목과 첫 번째 책 제목을 입력해주세요!");
      return;
    }
    
    // 비공개 방인데 비밀번호를 안 썼을 경우 체크
    if (newRoomData.isPrivate && !newRoomData.password) {
      alert("비공개 방은 비밀번호를 설정해야 합니다!");
      return;
    }

    const newRoom = {
      id: rooms.length + 10,
      title: newRoomData.title,
      currentBook: newRoomData.currentBook,
      totalBooks: 1,
      host: "나(주인장)",
      currentUsers: 1,
      maxUsers: newRoomData.maxUsers,
      status: "모집중",
      isMine: true,
      isPrivate: newRoomData.isPrivate, // 데이터에 비공개 여부 저장
    };
    
    setRooms([newRoom, ...rooms]);
    setModalType('none');
    // 폼 초기화 시 비밀번호 관련 상태도 초기화
    setNewRoomData({ title: '', currentBook: '', maxUsers: 4, isPrivate: false, password: '' });
    setActiveTab('my');
  };

  // 5. 기존 방 참여 로직
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode) {
      alert("초대 코드를 입력해주세요!");
      return;
    }
    alert(`[${joinCode}] 코드로 모임에 참여했습니다!`);
    setModalType('none');
    setJoinCode('');
    setActiveTab('my');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 relative">
      
      {/* --- 상단 네비게이션 바 --- */}
      <header className="bg-white px-8 py-6 shadow-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9L4 10.636V17.294C4 18.069 4.436 18.775 5.127 19.121L12 22.558L18.873 19.121C19.564 18.775 20 18.069 20 17.294V10.636L23 9L12 3ZM12 5.279L18.748 8.941L12 12.603L5.252 8.941L12 5.279Z" /></svg>
            <h1 className="text-2xl font-black tracking-tight"><span className="text-green-600">교환</span><span className="text-orange-500">독서</span></h1>
          </Link>
          <div className="flex items-center space-x-6 text-gray-800">
            <button className="hover:text-green-600 transition"><svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
            <Link href="/messages" className="hover:text-green-600 transition"><svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></Link>
            <Link href="/mypage" className="hover:text-green-600 transition"><svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></Link>
          </div>
        </div>
      </header>

      {/* --- 메인 콘텐츠 영역 --- */}
      <main className="mx-auto max-w-7xl px-8 mt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-gray-200 mb-8 gap-4 pb-0">
          <div className="flex space-x-8">
            <button onClick={() => setActiveTab('all')} className={`pb-4 text-lg font-bold transition-all relative ${activeTab === 'all' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              현재 열려있는 방
              {activeTab === 'all' && <span className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-t-md"></span>}
            </button>
            <button onClick={() => setActiveTab('my')} className={`pb-4 text-lg font-bold transition-all relative ${activeTab === 'my' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              내가 참여 중인 방
              {activeTab === 'my' && <span className="absolute bottom-0 left-0 w-full h-1 bg-orange-500 rounded-t-md"></span>}
            </button>
          </div>

          <div className="relative w-full md:w-80 mb-4 md:mb-3">
            <input type="text" placeholder="방 이름이나 책 제목 검색" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 shadow-sm transition" />
            <svg className="absolute left-3.5 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>

        {displayedRooms.length === 0 ? (
           <div className="py-24 text-center">
             <div className="text-5xl mb-4">🔍</div>
             <h3 className="text-xl font-bold text-gray-800">{searchQuery ? `'${searchQuery}'에 대한 검색 결과가 없어요.` : '아직 참여 중인 독서 방이 없어요.'}</h3>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedRooms.map((room) => (
              <div key={room.id} className="group flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-green-200 cursor-pointer">
                
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-black rounded-full ${room.status === '모집중' ? 'bg-green-100 text-green-700' : room.status === '진행중' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{room.status}</span>
                  <div className="flex items-center space-x-1 text-sm font-bold text-gray-500">
                    <span>👤</span>
                    <span className={room.currentUsers === room.maxUsers ? 'text-red-500' : 'text-gray-700'}>{room.currentUsers}</span>
                    <span>/ {room.maxUsers}</span>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  {/* [NEW] 방 제목 옆에 비공개(자물쇠) 아이콘 표시 */}
                  <div className="flex items-start space-x-2">
                    {room.isPrivate && <span className="text-sm mt-0.5" title="비공개 방">🔒</span>}
                    <h3 className="text-lg font-black text-gray-900 line-clamp-2 group-hover:text-green-700 transition">{room.title}</h3>
                  </div>
                  
                  <div className="mt-3 flex items-start space-x-2">
                    <span className="mt-0.5 text-xs text-gray-400">📖</span>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-600 line-clamp-1">현재: {room.currentBook}</p>
                      {room.totalBooks > 1 && <span className="text-[11px] font-bold text-orange-500 mt-1 bg-orange-50 w-max px-2 py-0.5 rounded-md">+ 등록된 책 {room.totalBooks - 1}권 더보기</span>}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px]">👑</div>
                    <span className="text-xs font-bold text-gray-500">{room.host}</span>
                  </div>
                  <button className={`text-sm font-bold transition ${room.status === '정원초과' && activeTab === 'all' ? 'text-gray-300 cursor-not-allowed' : 'text-orange-500 group-hover:text-orange-600'}`}>
                    {activeTab === 'my' ? '이어 읽기 →' : (room.status === '정원초과' ? '입장불가' : '입장하기 →')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* --- 하단 우측 스피드 다이얼 (이전과 동일) --- */}
      <div className="fixed bottom-10 right-10 z-40 flex flex-col items-end group">
        <div className="flex flex-col items-end space-y-3 mb-4 opacity-0 translate-y-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto origin-bottom">
          <button onClick={() => setModalType('join')} className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:border-orange-500 transition-all transform hover:scale-105">
            <span className="text-sm font-bold text-gray-700">기존 모임 참여하기</span>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-lg">🤝</div>
          </button>
          <button onClick={() => setModalType('create')} className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:border-green-500 transition-all transform hover:scale-105">
            <span className="text-sm font-bold text-gray-700">새로운 모임 생성하기</span>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-lg">✨</div>
          </button>
        </div>
        <button className="flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/30 transition-all duration-300 group-hover:bg-gray-800 group-hover:shadow-gray-500/30">
          <svg className="w-8 h-8 transform transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* --- 모달창 그룹 --- */}
      {modalType !== 'none' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-800">
                {modalType === 'create' ? '새 독서 방 만들기' : '기존 모임 참여하기'}
              </h3>
              <button onClick={() => setModalType('none')} className="text-gray-400 hover:text-gray-600 transition p-1">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* 새 방 만들기 폼 */}
            {modalType === 'create' && (
              <form onSubmit={handleCreateRoom} className="p-6 space-y-5">
                
                {/* 1. 방 제목 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">방 제목</label>
                  <input type="text" placeholder="예: 주말 아침 해리포터 정주행 방" value={newRoomData.title} onChange={(e) => setNewRoomData({...newRoomData, title: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition" />
                </div>
                
                {/* 2. 첫 번째 책 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">첫 번째로 함께 읽을 책</label>
                  <input type="text" placeholder="현재 읽을 책의 제목을 입력하세요" value={newRoomData.currentBook} onChange={(e) => setNewRoomData({...newRoomData, currentBook: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition" />
                </div>
                
                {/* 3. [NEW] 공개/비공개 설정 토글 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">공개 설정</label>
                  <div className="flex space-x-2">
                    <button 
                      type="button" 
                      onClick={() => setNewRoomData({...newRoomData, isPrivate: false, password: ''})} 
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${!newRoomData.isPrivate ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                      🌐 누구나 참여
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setNewRoomData({...newRoomData, isPrivate: true})} 
                      className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${newRoomData.isPrivate ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}
                    >
                      🔒 비밀번호 설정
                    </button>
                  </div>
                </div>

                {/* 4. [NEW] 비밀번호 입력칸 (비공개 선택 시에만 스르륵 나타남) */}
                {newRoomData.isPrivate && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-orange-600">비밀번호 입력</label>
                    <input 
                      type="password" 
                      placeholder="입장 시 필요한 비밀번호를 입력하세요" 
                      value={newRoomData.password} 
                      onChange={(e) => setNewRoomData({...newRoomData, password: e.target.value})} 
                      className="w-full rounded-xl border border-orange-200 bg-orange-50/30 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white transition" 
                    />
                  </div>
                )}

                {/* 5. 최대 인원 */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">최대 참여 인원 (나 포함)</label>
                  <select value={newRoomData.maxUsers} onChange={(e) => setNewRoomData({...newRoomData, maxUsers: Number(e.target.value)})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition appearance-none cursor-pointer">
                    <option value={2}>2명 (오붓하게)</option>
                    <option value={4}>4명 (소그룹)</option>
                    <option value={6}>6명 (적당하게)</option>
                    <option value={10}>10명 (대규모)</option>
                  </select>
                </div>

                <div className="pt-2 flex space-x-3">
                  <button type="button" onClick={() => setModalType('none')} className="flex-1 rounded-xl bg-gray-100 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition">취소하기</button>
                  <button type="submit" className="flex-1 rounded-xl bg-green-500 py-3.5 text-sm font-bold text-white hover:bg-green-600 shadow-md shadow-green-200 transition">개설하기</button>
                </div>
              </form>
            )}

            {/* 기존 방 참여하기 폼 (이전과 동일) */}
            {modalType === 'join' && (
              <form onSubmit={handleJoinRoom} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">모임 초대 코드</label>
                  <input type="text" placeholder="공유받은 6자리 코드를 입력하세요" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white transition" />
                </div>
                <div className="pt-4 flex space-x-3">
                  <button type="button" onClick={() => setModalType('none')} className="flex-1 rounded-xl bg-gray-100 py-3.5 text-sm font-bold text-gray-600 hover:bg-gray-200 transition">취소하기</button>
                  <button type="submit" className="flex-1 rounded-xl bg-orange-500 py-3.5 text-sm font-bold text-white hover:bg-orange-600 shadow-md shadow-orange-200 transition">참여하기</button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}