"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  
  // ⭐️ [버그수정] 누락된 상태 선언 추가
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('독서가');
  
  // 내가 쓴 문장 및 스크랩한 문장
  const [myQuotes, setMyQuotes] = useState<any[]>([]);

  // 인스타 내보내기 모달 상태
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState({ text: '', book: '', author: '' });

  // 프로필 수정 모달 상태 관리
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    password: '',
    passwordConfirm: ''
  });

  // ⭐️ [통합] 로컬/세션 스토리지 모두 확인하는 헬퍼 함수
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
  const getStoredUserName = () => localStorage.getItem('userName') || sessionStorage.getItem('userName');

  useEffect(() => {
    const token = getToken();
    const storedName = getStoredUserName();
    
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    } else {
      router.push('/login');
      return;
    }

    // 내 수집 문장 데이터 가져오기
    if (token) {
      fetch('http://13.124.191.57:5000/api/annotations/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data) && data.length > 0) {
          setMyQuotes(data);
        } else {
          // 기본 예시 데이터 (수집한 문장이 없을 때)
          setMyQuotes([
            { _id: '1', quote: "다정한 것이 살아남는다. 그것은 진화의 역사에서 가장 위대한 무기였다.", bookId: { title: "다정한 것이 살아남는다" }, author: "브라이언 헤어" },
            { _id: '2', quote: "우리는 모두 별빛으로 만들어진 존재들이다.", bookId: { title: "코스모스" }, author: "칼 세이건" }
          ]);
        }
      })
      .catch(err => console.error("내 문장 불러오기 에러:", err));
    }
  }, []);

  const openExportModal = (text: string, book: string, author: string) => {
    setSelectedQuote({ text, book, author });
    setIsExportModalOpen(true);
  };

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userName');
      alert("성공적으로 로그아웃 되었습니다.");
      router.push('/');
    }
  };

  const handleWithdraw = async () => {
    const token = getToken();
    if (window.confirm("정말 탈퇴하시겠습니까? 기록된 모든 독서 데이터가 삭제되며 복구할 수 없습니다.")) {
      try {
        await fetch('http://13.124.191.57:5000/api/users/withdraw', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userName');
        alert("그동안 교환독서를 이용해주셔서 감사합니다. 탈퇴 처리되었습니다.");
        router.push('/');
      } catch (error) {
        alert("탈퇴 처리 중 에러가 발생했습니다.");
      }
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    
    if (editFormData.password && editFormData.password !== editFormData.passwordConfirm) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (!editFormData.name.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      const response = await fetch('http://13.124.191.57:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          nickname: editFormData.name,
          newPassword: editFormData.password || undefined 
        })
      });

      if (response.ok) {
        // 주머니 양쪽 다 업데이트
        if(localStorage.getItem('userName')) localStorage.setItem('userName', editFormData.name);
        if(sessionStorage.getItem('userName')) sessionStorage.setItem('userName', editFormData.name);
        
        setUserName(editFormData.name);
        setIsEditProfileOpen(false);
        alert("프로필 정보가 성공적으로 수정되었습니다!");
      } else {
        alert("프로필 수정에 실패했습니다.");
      }
    } catch (error) {
      alert("서버 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans relative">
      
      {/* 상단 헤더 */}
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-400 hover:text-gray-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-xl font-black tracking-tighter uppercase">Library</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 mt-8 space-y-10">
        
        {/* 1. 프로필 & 요약 섹션 */}
        <section className="flex items-center justify-between bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
          
          <button 
            onClick={() => {
              setEditFormData(prev => ({ ...prev, name: userName }));
              setIsEditProfileOpen(true);
            }}
            className="absolute top-6 right-6 text-[10px] font-black tracking-widest text-gray-400 hover:text-black transition flex items-center space-x-1 z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
            <span className="underline decoration-transparent hover:decoration-black pb-0.5 transition-colors uppercase">Edit Profile</span>
          </button>

          <div className="flex items-center space-x-6 relative z-10">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg">
              {userName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1">{userName}님,</h2>
              <p className="text-gray-500 text-sm">이번 달은 총 <span className="text-gray-900 font-bold underline">3권</span>의 책과 만났어요.</p>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-12 text-center relative z-10">
            <div>
              <p className="text-3xl font-black text-gray-900">12</p>
              <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-tighter">Quotes</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">4</p>
              <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-tighter">Finished</p>
            </div>
          </div>
        </section>

        {/* 2 & 3 캘린더 및 통계 (코드 동일하여 유지) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
             <div className="flex items-center justify-between mb-6">
               <h3 className="text-lg font-black tracking-tight">📅 4월의 독서 기록</h3>
               <div className="flex space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                 <span className="flex items-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>Done</span>
                 <span className="flex items-center"><div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-1"></div>Hip</span>
               </div>
             </div>
             <div className="grid grid-cols-7 gap-2 text-center">
               {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                 <div key={day} className="text-[10px] font-black text-gray-300 pb-2">{day}</div>
               ))}
               {Array.from({ length: 3 }).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
               {Array.from({ length: 30 }).map((_, i) => {
                 const day = i + 1;
                 const hasBookCover = day === 5 || day === 15;
                 const hasQuote = day === 12 || day === 16 || day === 22;
                 return (
                   <div key={day} className="aspect-square relative flex items-center justify-center rounded-xl hover:bg-gray-50 cursor-pointer transition group">
                     <span className={`text-xs font-bold z-10 ${hasBookCover || hasQuote ? 'text-gray-900' : 'text-gray-400'}`}>{day}</span>
                     {hasBookCover && <div className="absolute inset-1 bg-gray-100 rounded-lg border border-gray-200"></div>}
                     {hasQuote && !hasBookCover && <div className="absolute bottom-1.5 w-1 h-1 bg-orange-400 rounded-full"></div>}
                   </div>
                 );
               })}
             </div>
           </section>

           <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
             <h3 className="text-lg font-black mb-1 tracking-tight">📊 주간 독서량</h3>
             <p className="text-[10px] text-gray-400 font-black mb-8 uppercase tracking-widest">Unit: Page</p>
             <div className="flex-1 flex items-end justify-between gap-2 h-40 mt-auto">
               {[
                 { day: 'M', value: 40 }, { day: 'T', value: 85 }, { day: 'W', value: 20 },
                 { day: 'T', value: 120 }, { day: 'F', value: 0 }, { day: 'S', value: 60, isToday: true },
                 { day: 'S', value: 0 },
               ].map((data, idx) => (
                 <div key={idx} className="flex flex-col items-center w-full group cursor-pointer">
                   <div className="relative w-full flex justify-center">
                     <div 
                       className={`w-full max-w-[20px] rounded-full transition-all duration-700 ${data.isToday ? 'bg-black' : 'bg-gray-100 group-hover:bg-gray-200'}`}
                       style={{ height: `${data.value}%`, minHeight: '4px' }}
                     ></div>
                   </div>
                   <span className={`text-[10px] mt-3 font-black ${data.isToday ? 'text-black' : 'text-gray-300'}`}>{data.day}</span>
                 </div>
               ))}
             </div>
           </section>
        </div>

        {/* 4. 나의 문집 수집 (갤러리 레이아웃 다듬기) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic tracking-tighter">My Collection</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{myQuotes.length} Quotes</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {myQuotes.map((q) => (
              <div key={q._id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group flex flex-col justify-between h-[320px]">
                <div>
                  <div className="text-3xl font-serif text-gray-100 absolute top-4 left-6">"</div>
                  <p className="font-serif text-gray-800 leading-relaxed mb-4 line-clamp-6 relative z-10 break-keep">
                    {q.quote}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-black font-black mb-6 uppercase tracking-tight truncate border-l-2 border-black pl-3">
                    {q.bookId?.title || 'Unknown Book'}
                  </p>
                  <button 
                    onClick={() => openExportModal(q.quote, q.bookId?.title || '책', q.author || '작자 미상')}
                    className="w-full py-3.5 bg-gray-50 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    <span>Share Story</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 바닥글 및 위험 구역 */}
        <footer className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center">
          <button onClick={handleLogout} className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition-colors mb-12">Sign Out</button>
          
          <div className="bg-red-50 p-8 rounded-[2rem] w-full max-w-lg text-center">
             <h4 className="text-red-500 font-black text-sm mb-2 uppercase">Danger Zone</h4>
             <p className="text-[10px] text-red-400 font-bold mb-6 break-keep">회원 탈퇴 시 모든 독서 기록과 수집한 문장이 즉시 삭제되며 복구할 수 없습니다.</p>
             <button 
               onClick={handleWithdraw} 
               className="px-8 py-3 bg-red-500 text-white text-[10px] font-black rounded-full hover:bg-red-600 transition shadow-lg shadow-red-200 uppercase tracking-widest"
             >
               Delete Account
             </button>
          </div>
        </footer>
      </main>

      {/* 모달 섹션 (동일하게 유지) */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
             <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
               <h3 className="text-lg font-black tracking-tighter uppercase">Edit Profile</h3>
               <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-black transition">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <form onSubmit={handleEditProfile} className="p-8 space-y-5">
               <div className="flex justify-center mb-8">
                 <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-black shadow-xl">
                   {editFormData.name ? editFormData.name[0] : userName[0]}
                 </div>
               </div>
               <div>
                 <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Nickname</label>
                 <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold transition" />
               </div>
               <div>
                 <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">New Password</label>
                 <input type="password" value={editFormData.password} onChange={(e) => setEditFormData({...editFormData, password: e.target.value})} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition" />
               </div>
               <button type="submit" className="w-full mt-6 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-lg uppercase tracking-widest text-xs">Save Changes</button>
             </form>
           </div>
        </div>
      )}

      {/* 인스타그램 공유 모달 (디자인 유지) */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in zoom-in duration-300">
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition" onClick={() => setIsExportModalOpen(false)}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          
          <div className="relative w-full max-w-[320px] aspect-[9/16] bg-[#0A0A0A] rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center p-8 overflow-hidden border border-white/10">
             <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-black"></div>
             <div className="relative z-10 w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] shadow-2xl">
                <span className="text-6xl text-white/10 font-serif absolute -top-4 -left-2 select-none">“</span>
                <p className="font-serif text-white text-xl leading-relaxed mb-10 relative z-10 break-keep italic">
                  {selectedQuote.text}
                </p>
                <div className="flex flex-col items-end border-r-2 border-white/20 pr-4">
                  <span className="text-xs font-black text-white uppercase tracking-tight">{selectedQuote.book}</span>
                  <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{selectedQuote.author}</span>
                </div>
             </div>
             <div className="absolute bottom-12 left-0 w-full text-center z-10">
                <span className="text-[9px] font-black text-white/20 tracking-[0.4em] uppercase">Text Hip Archive</span>
             </div>
          </div>
          
          <div className="mt-12 flex flex-col items-center space-y-4 w-full max-w-[320px]">
            <button 
              className="w-full bg-white text-black font-black py-5 rounded-full hover:scale-105 transition-all shadow-2xl flex items-center justify-center space-x-3"
              onClick={() => { alert("이미지가 갤러리에 저장되었습니다!"); setIsExportModalOpen(false); }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              <span className="uppercase text-[11px] tracking-widest">Save to Gallery</span>
            </button>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter italic">Share your taste on Instagram</p>
          </div>
        </div>
      )}
    </div>
  );
}