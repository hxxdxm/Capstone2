"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// [NEW] 타입 정의 (방 데이터 구조)
interface Room {
  id: number;
  title: string;
  currentBook: string;
  totalBooks: number;
  host: string;
  currentUsers: number;
  maxUsers: number;
  status: string;
  isMine: boolean;
  isPrivate: boolean;
}

export default function MainPage() {
  const router = useRouter();

  // 1. 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false); // 임시 로그인 상태
  const [isLoading, setIsLoading] = useState(true); // [NEW] 로딩 상태 추가
  const [rooms, setRooms] = useState<Room[]>([]); // [NEW] 초기값을 빈 배열로 설정

  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState<'none' | 'create' | 'join'>('none');
  
  const [newRoomData, setNewRoomData] = useState({ 
    title: '', currentBook: '', maxUsers: 4, isPrivate: false, password: ''
  });
  const [joinCode, setJoinCode] = useState('');

  // 2. [NEW] 화면이 처음 켜질 때 서버에서 방 목록을 불러오는 로직 (Fetch)
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        // [서버 연동 시 주석 해제]
        // const response = await fetch('http://localhost:5000/api/rooms');
        // const data = await response.json();
        
        // --- [임시 로딩 로직] ---
        setTimeout(() => {
          setRooms([]); // 처음엔 아무 방도 없는 빈 상태로 시작합니다.
          setIsLoading(false); // 0.6초 뒤 로딩 끝!
        }, 600);
        
      } catch (error) {
        console.error("방 목록을 불러오는데 실패했습니다:", error);
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, []);

  // 3. 필터링 로직
  const displayedRooms = rooms
    .filter(room => activeTab === 'all' ? true : room.isMine)
    .filter(room => 
      room.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.currentBook.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // 4. 새로운 방 생성 로직
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("방을 만들려면 로그인이 필요합니다!");
      router.push('/login'); 
      return;
    }
    if (!newRoomData.title || !newRoomData.currentBook) {
      alert("방 제목과 첫 번째 책 제목을 입력해주세요!");
      return;
    }

    // [서버 연동 시 추가할 부분] 백엔드에 새 방 정보를 POST로 보냅니다.
    // await fetch('http://localhost:5000/api/rooms', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(newRoomData)
    // });

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
      isPrivate: newRoomData.isPrivate,
    };
    
    setRooms([newRoom, ...rooms]);
    setModalType('none');
    setNewRoomData({ title: '', currentBook: '', maxUsers: 4, isPrivate: false, password: '' });
    setActiveTab('my');
  };

  // 5. 기존 방 참여 로직
  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      alert("모임에 참여하려면 로그인이 필요합니다!");
      router.push('/login');
      return;
    }
    if (!joinCode) {
      alert("초대 코드를 입력해주세요!");
      return;
    }

    // [서버 연동 시 추가할 부분] 백엔드에 초대 코드가 유효한지 확인하고 참여 요청을 보냅니다.
    // const response = await fetch('http://localhost:5000/api/rooms/join', {
    //   method: 'POST',
    //   body: JSON.stringify({ code: joinCode })
    // });

    alert(`[${joinCode}] 코드로 모임에 참여했습니다!`);
    setModalType('none');
    setJoinCode('');
    setActiveTab('my');
  };

  // 6. 방 클릭 시 이동
  const handleRoomClick = (roomId: number, isPrivate: boolean) => {
    if (isPrivate && activeTab === 'all') {
      alert("비공개 방입니다. 참여하기 버튼을 통해 비밀번호를 입력해주세요.");
      return;
    }
    router.push(`/room/${roomId}`);
  };

  // --- 화면 렌더링 ---

  // [NEW] 로딩 중일 때 보여줄 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500">독서 모임 목록을 불러오는 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 relative">
      
      {/* 상단 네비게이션 바 */}
      <header className="bg-white px-8 py-6 shadow-sm sticky top-0 z-30">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9L4 10.636V17.294C4 18.069 4.436 18.775 5.127 19.121L12 22.558L18.873 19.121C19.564 18.775 20 18.069 20 17.294V10.636L23 9L12 3ZM12 5.279L18.748 8.941L12 12.603L5.252 8.941L12 5.279Z" /></svg>
            <h1 className="text-2xl font-black tracking-tight"><span className="text-green-600">교환</span><span className="text-orange-500">독서</span></h1>
          </Link>
          
          <div className="flex items-center space-x-4 md:space-x-6 text-gray-800">
            {isLoggedIn ? (
              <>
                <button className="hover:text-green-600 transition"><svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg></button>
                <Link href="/messages" className="hover:text-green-600 transition"><svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg></Link>
                <Link href="/mypage" className="hover:text-green-600 transition"><svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg></Link>
                <button onClick={() => setIsLoggedIn(false)} className="text-xs font-bold text-gray-400 hover:text-gray-600 underline ml-2">로그아웃</button>
              </>
            ) : (
              <>
                <button onClick={() => setIsLoggedIn(true)} className="text-sm font-bold text-gray-600 hover:text-green-600 transition">로그인 테스트</button>
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-green-600 transition">로그인</Link>
                <Link href="/signup" className="text-sm font-bold text-white bg-green-500 hover:bg-green-600 px-5 py-2.5 rounded-xl transition shadow-sm">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
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

        {/* 빈 화면 처리 */}
        {displayedRooms.length === 0 ? (
           <div className="py-24 flex flex-col items-center justify-center bg-white rounded-3xl shadow-sm ring-1 ring-gray-100">
             <div className="text-5xl mb-4 opacity-80">🔍</div>
             <h3 className="text-xl font-bold text-gray-800">
               {searchQuery ? `'${searchQuery}'에 대한 검색 결과가 없어요.` : '아직 개설된 독서 모임이 없어요.'}
             </h3>
             <p className="text-gray-500 mt-2 text-sm">오른쪽 아래 <b>+ 버튼</b>을 눌러 첫 번째 모임을 만들어보세요!</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {displayedRooms.map((room) => (
              <div 
                key={room.id} 
                onClick={() => handleRoomClick(room.id, room.isPrivate)}
                className="group flex flex-col justify-between rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:ring-green-200 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 text-xs font-black rounded-full ${room.status === '모집중' ? 'bg-green-100 text-green-700' : room.status === '진행중' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>{room.status}</span>
                  <div className="flex items-center space-x-1 text-sm font-bold text-gray-500">
                    <span>👤</span>
                    <span className={room.currentUsers === room.maxUsers ? 'text-red-500' : 'text-gray-700'}>{room.currentUsers}</span>
                    <span>/ {room.maxUsers}</span>
                  </div>
                </div>

                <div className="mb-6 flex-1">
                  <div className="flex items-start space-x-2">
                    <span className="text-sm mt-0.5" title={room.isPrivate ? "비공개 방" : "공개 방"}>
                      {room.isPrivate ? "🔒" : "🌐"}
                    </span>
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

      {/* 하단 우측 스피드 다이얼 */}
      <div className="fixed bottom-10 right-10 z-40 flex flex-col items-end group">
        <div className="flex flex-col items-end space-y-3 mb-4 opacity-0 translate-y-4 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto origin-bottom">
          <button onClick={() => {
             if(!isLoggedIn) { alert("로그인이 필요합니다!"); router.push('/login'); return; }
             setModalType('join');
          }} className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:border-orange-500 transition-all transform hover:scale-105">
            <span className="text-sm font-bold text-gray-700">기존 모임 참여하기</span>
            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-lg">🤝</div>
          </button>
          <button onClick={() => {
             if(!isLoggedIn) { alert("로그인이 필요합니다!"); router.push('/login'); return; }
             setModalType('create');
          }} className="flex items-center space-x-3 bg-white px-4 py-2.5 rounded-full shadow-lg border border-gray-100 hover:border-green-500 transition-all transform hover:scale-105">
            <span className="text-sm font-bold text-gray-700">새로운 모임 생성하기</span>
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-lg">✨</div>
          </button>
        </div>
        <button className="flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/30 transition-all duration-300 group-hover:bg-gray-800 group-hover:shadow-gray-500/30">
          <svg className="w-8 h-8 transform transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* 모달창 그룹 */}
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

            {modalType === 'create' && (
              <form onSubmit={handleCreateRoom} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">방 제목</label>
                  <input type="text" placeholder="예: 주말 아침 해리포터 정주행 방" value={newRoomData.title} onChange={(e) => setNewRoomData({...newRoomData, title: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">첫 번째로 함께 읽을 책</label>
                  <input type="text" placeholder="현재 읽을 책의 제목을 입력하세요" value={newRoomData.currentBook} onChange={(e) => setNewRoomData({...newRoomData, currentBook: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-green-500 focus:bg-white transition" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">공개 설정</label>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => setNewRoomData({...newRoomData, isPrivate: false, password: ''})} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${!newRoomData.isPrivate ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}>🌐 누구나 참여</button>
                    <button type="button" onClick={() => setNewRoomData({...newRoomData, isPrivate: true})} className={`flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all ${newRoomData.isPrivate ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-100 bg-white text-gray-400 hover:bg-gray-50'}`}>🔒 비밀번호 설정</button>
                  </div>
                </div>
                {newRoomData.isPrivate && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-bold text-gray-700 mb-1.5 text-orange-600">비밀번호 입력</label>
                    <input type="password" placeholder="입장 시 필요한 비밀번호를 입력하세요" value={newRoomData.password} onChange={(e) => setNewRoomData({...newRoomData, password: e.target.value})} className="w-full rounded-xl border border-orange-200 bg-orange-50/30 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:bg-white transition" />
                  </div>
                )}
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