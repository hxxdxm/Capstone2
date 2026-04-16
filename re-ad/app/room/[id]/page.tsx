"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 타입 정의 (타입스크립트를 위해 데이터 형태를 미리 정의해 둡니다)
interface Book { id: number; title: string; author: string; status: string; addedDate: string; }
interface Member { id: number; name: string; progress: number; profile: string; }
interface Chat { user: string; text: string; time: string; }

export default function RoomDashboard({ params }: { params: { id: string } }) {
  const router = useRouter();

  // 1. 상태 관리 (초기값은 모두 비워둡니다!)
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [roomTitle, setRoomTitle] = useState("");
  const [books, setBooks] = useState<Book[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  
  const [chatInput, setChatInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingBook, setEditingBook] = useState<{ id: number; title: string; author: string } | null>(null);

  // 2. [NEW] 화면이 처음 켜질 때 서버에서 데이터를 불러오는 로직 (Fetch)
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        // [나중에 주석 해제할 부분] Node.js 서버가 완성되면 아래 코드를 씁니다!
        // const response = await fetch(`http://localhost:5000/api/rooms/${params.id}`);
        // const data = await response.json();
        
        // --- [백엔드 연결 전까지 에러를 막기 위한 임시 로딩 로직] ---
        setTimeout(() => {
          setRoomTitle(`${params.id}번 독서 모임 방`); // data.title
          setBooks([]); // 처음엔 빈 목록 (data.books)
          setMembers([{ id: 1, name: "나(방장)", progress: 0, profile: "😎" }]); // 방장 기본 정보 (data.members)
          setChats([]); // 채팅 내역 없음 (data.chats)
          setIsLoading(false); // 로딩 끝!
        }, 600); // 0.6초 뒤에 로딩 완료
        // --------------------------------------------------------

      } catch (error) {
        console.error("데이터를 불러오는데 실패했습니다:", error);
        setIsLoading(false);
      }
    };

    fetchRoomData();
  }, [params.id]);

  // 3. 핸들러: 책 업로드
  const handleAddBookClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // [서버 연동 시 추가할 부분]
      // const formData = new FormData();
      // formData.append("bookFile", file);
      // await fetch('서버주소/upload', { method: 'POST', body: formData });

      const bookTitle = file.name.replace(/\.[^/.]+$/, ""); 
      setBooks([...books, { id: Date.now(), title: bookTitle, author: "작자 미상", status: "대기 중", addedDate: new Date().toLocaleDateString() }]);
      e.target.value = '';
    }
  };

  // 4. 핸들러: 책 정보 수정 저장
  const handleSaveBookInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBook) return;
    
    // [서버 연동 시 추가할 부분]
    // await fetch(`서버주소/books/${editingBook.id}`, { method: 'PUT', ... });

    setBooks(books.map(b => b.id === editingBook.id ? { ...b, title: editingBook.title, author: editingBook.author } : b));
    setEditingBook(null);
  };

  // 5. 핸들러: 뷰어 이동
  const handleBookClick = (bookId: number) => {
    router.push(`/room/${params.id}/viewer`);
  };

  // 6. 핸들러: 채팅 전송
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newChat = { user: "나(방장)", text: chatInput, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    
    // [서버 연동 시 추가할 부분] Socket.io를 쓰면 여기서 socket.emit('sendMessage', newChat) 을 합니다.
    
    setChats([...chats, newChat]);
    setChatInput('');
  };

  // --- 화면 렌더링 ---
  
  // 로딩 중일 때 보여줄 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500">방 정보를 불러오는 중입니다...</p>
      </div>
    );
  }

  // 로딩이 끝나면 보여줄 진짜 화면
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-10 relative">
      
      <header className="bg-white border-b border-gray-100 px-8 py-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center space-x-4">
          <Link href="/" className="text-gray-400 hover:text-gray-700 font-bold transition">← 목록으로</Link>
          <h1 className="text-2xl font-black text-gray-900">{roomTitle}</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-8 mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 왼쪽 & 중앙 영역 */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white rounded-3xl p-8 shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900">우리 방 도서 목록</h3>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf, .epub" className="hidden" />
              <button onClick={handleAddBookClick} className="text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-xl shadow-sm transition flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                책 파일 업로드
              </button>
            </div>
            
            {/* 데이터가 비어있을 때 빈 화면 처리 */}
            {books.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <span className="text-3xl mb-2">📚</span>
                <p className="text-sm font-bold text-gray-500">아직 등록된 책이 없어요.</p>
                <p className="text-xs text-gray-400 mt-1">파일을 업로드해서 독서를 시작해보세요!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {books.map(book => (
                  <div key={book.id} onClick={() => handleBookClick(book.id)} className="relative border border-gray-100 p-4 rounded-2xl flex items-center space-x-4 hover:bg-green-50 hover:border-green-200 transition cursor-pointer group">
                    <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 font-bold group-hover:bg-white group-hover:text-green-500 transition shrink-0 shadow-inner">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12zM10 9h8v2h-8zm0 3h4v2h-4zm0-6h8v2h-8z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="font-bold text-gray-800 truncate group-hover:text-green-700 transition">{book.title}</h4>
                      <p className="text-xs text-gray-500">{book.author}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded ${book.status === '읽는 중' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{book.status}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setEditingBook({ id: book.id, title: book.title, author: book.author }); }} className="absolute right-4 top-4 text-gray-300 hover:text-blue-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity" title="책 정보 수정">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

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

        {/* 오른쪽: 채팅 채널 */}
        <div className="lg:col-span-1">
          <section className="bg-white rounded-3xl shadow-sm ring-1 ring-gray-100 h-[600px] flex flex-col overflow-hidden sticky top-32">
            <div className="p-5 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-black text-gray-800">모임 채팅</h3>
              <span className="text-xs text-gray-400 font-bold">참여 인원 전용</span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {chats.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm font-bold text-gray-400">
                  첫 메시지를 보내보세요! 👋
                </div>
              ) : (
                chats.map((c, i) => (
                  <div key={i} className={`flex flex-col ${c.user === "나(방장)" ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] font-bold text-gray-400 mb-1 mx-1">{c.user}</span>
                    <div className={`p-3 rounded-2xl text-sm w-max max-w-[90%] shadow-sm ${c.user === "나(방장)" ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-700 rounded-tl-sm'}`}>
                      {c.text}
                    </div>
                    <span className="text-[10px] text-gray-300 mt-1 mx-1">{c.time}</span>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 border-t border-gray-50 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 focus-within:ring-1 focus-within:ring-green-500 transition">
                <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="메시지 입력..." className="flex-1 bg-transparent border-none py-3 text-sm focus:outline-none" />
                <button type="submit" className="text-green-600 font-bold text-sm px-2 hover:text-green-700 transition">전송</button>
              </form>
            </div>
          </section>
        </div>
      </main>

      {/* 책 정보 수정 모달창 */}
      {editingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-xl font-black text-gray-800">책 정보 수정</h3>
              <button onClick={() => setEditingBook(null)} className="text-gray-400 hover:text-gray-600 p-1"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <form onSubmit={handleSaveBookInfo} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">책 제목</label>
                <input type="text" value={editingBook.title} onChange={(e) => setEditingBook({ ...editingBook, title: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">지은이 (저자)</label>
                <input type="text" value={editingBook.author} onChange={(e) => setEditingBook({ ...editingBook, author: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" required />
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