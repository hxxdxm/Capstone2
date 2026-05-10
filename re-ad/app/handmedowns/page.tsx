"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function HandMeDownsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 모달 및 폼 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bookTitle: '',
    bookThumbnail: '', // 이미지 URL
    bookAuthor: '',
    comment: '',
    contactLink: '' // 오픈카톡 링크 등
  });

  const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.id || payload.userId;
    } catch (e) { return null; }
  };

  useEffect(() => {
    const token = getToken();
    if (token) setIsLoggedIn(true);
    fetchItems();
  }, []);

  // 1. 전체 목록 불러오기 (GET)
  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/handmedowns`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 새 글 올리기 (POST)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) { alert("로그인이 필요합니다."); router.push('/login'); return; }
    if (!formData.bookTitle || !formData.comment) return alert("책 제목과 코멘트는 필수입니다.");

    try {
      const res = await fetch(`${API_BASE_URL}/handmedowns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        alert("게시글이 등록되었습니다! 🎉");
        setIsWriteModalOpen(false);
        setFormData({ bookTitle: '', bookThumbnail: '', bookAuthor: '', comment: '', contactLink: '' });
        fetchItems(); // 목록 새로고침
      } else {
        alert("등록에 실패했습니다.");
      }
    } catch (error) {
      alert("서버 연결 오류");
    }
  };

  // 3. 거래 상태 변경 (PUT)
  const handleToggleStatus = async (id: string) => {
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/handmedowns/${id}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchItems(); // 상태 변경 후 목록 새로고침
      } else {
        alert("상태 변경 권한이 없습니다.");
      }
    } catch (error) {
      alert("서버 연결 오류");
    }
  };

  // 4. 글 삭제 (DELETE)
  const handleDelete = async (id: string) => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/handmedowns/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("삭제되었습니다.");
        fetchItems();
      } else {
        alert("삭제 권한이 없습니다.");
      }
    } catch (error) {
      alert("서버 연결 오류");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-gray-900">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <Link href="/" className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></Link>
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black transition">홈으로</Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 mt-12 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end justify-between border-b border-black pb-6 gap-4">
          <div>
            <h2 className="text-4xl font-black tracking-tighter mb-2">물려주기</h2>
            <p className="text-sm font-bold text-gray-500 tracking-widest uppercase">다 읽은 책을 새로운 독자에게 보내주세요</p>
          </div>
          <button 
            onClick={() => isLoggedIn ? setIsWriteModalOpen(true) : (alert("로그인이 필요합니다."), router.push('/login'))}
            className="px-6 py-3 bg-black text-white text-sm font-black tracking-widest rounded-full hover:bg-gray-800 transition shadow-lg flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            <span>책 등록하기</span>
          </button>
        </section>

        {isLoading ? (
          <div className="py-20 text-center font-bold text-gray-300">데이터를 불러오는 중입니다...</div>
        ) : items.length === 0 ? (
          <div className="py-20 text-center font-bold text-gray-300 bg-white rounded-[2rem] border border-gray-100">
            아직 등록된 책이 없습니다. 첫 번째로 책을 나눠보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((item) => {
              const isMine = item.userId === getMyId() || item.userId?._id === getMyId();
              const isCompleted = item.status === 'COMPLETED' || item.status === '완료';

              return (
                <div key={item._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col relative group">
                  {/* 썸네일 이미지 영역 */}
                  <div className="relative aspect-[3/4] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {item.bookThumbnail ? (
                      <img src={item.bookThumbnail} alt={item.bookTitle} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isCompleted ? 'grayscale opacity-50' : ''}`} />
                    ) : (
                      <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
                    )}
                    
                    {/* 상태 뱃지 */}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest shadow-sm ${isCompleted ? 'bg-gray-800 text-white' : 'bg-green-500 text-white'}`}>
                        {isCompleted ? '거래완료' : '나눔대기'}
                      </span>
                    </div>
                  </div>

                  {/* 정보 영역 */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-black line-clamp-1 mb-1">{item.bookTitle}</h3>
                    <p className="text-xs text-gray-400 font-bold mb-4">{item.bookAuthor || '저자 미상'}</p>
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 break-keep mb-6 flex-1">
                      {item.comment}
                    </p>
                    
                    {/* 하단 액션 / 링크 */}
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                      {isMine ? (
                        <div className="flex space-x-2 w-full">
                          <button onClick={() => handleToggleStatus(item._id)} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-xs font-bold rounded-lg transition">
                            상태변경
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="py-2 px-3 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-lg transition">
                            삭제
                          </button>
                        </div>
                      ) : (
                        <a 
                          href={item.contactLink || '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          className={`w-full text-center py-2.5 rounded-xl text-xs font-black tracking-widest transition ${isCompleted ? 'bg-gray-100 text-gray-400 pointer-events-none' : 'bg-black text-white hover:bg-gray-800'}`}
                        >
                          {isCompleted ? '마감되었습니다' : '연락하기'}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 글쓰기 모달 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-black tracking-tighter">책 등록하기</h3>
              <button onClick={() => setIsWriteModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto no-scrollbar">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">책 제목 *</label>
                <input type="text" value={formData.bookTitle} onChange={(e) => setFormData({...formData, bookTitle: e.target.value})} placeholder="예: 코스모스" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">지은이</label>
                <input type="text" value={formData.bookAuthor} onChange={(e) => setFormData({...formData, bookAuthor: e.target.value})} placeholder="예: 칼 세이건" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none font-bold" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">표지 이미지 링크 (선택)</label>
                <input type="text" value={formData.bookThumbnail} onChange={(e) => setFormData({...formData, bookThumbnail: e.target.value})} placeholder="http://..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">남길 코멘트 *</label>
                <textarea rows={3} value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} placeholder="책 상태나 물려주는 이유를 적어주세요." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">오픈채팅/연락처 링크 (선택)</label>
                <input type="text" value={formData.contactLink} onChange={(e) => setFormData({...formData, contactLink: e.target.value})} placeholder="https://open.kakao.com/o/..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none text-blue-500 font-medium" />
              </div>

              <button type="submit" className="w-full mt-6 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-lg tracking-widest">
                등록 완료하기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}