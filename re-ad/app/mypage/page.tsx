"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MyPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('독서가');
  
  // ⭐️ [백엔드 연동] 내가 쓴 문장들을 저장할 상태 배열
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

  // ⭐️ [백엔드 연동] 화면 켜질 때 내 정보 및 내 피드 가져오기
  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    const token = localStorage.getItem('token');
    
    if (storedName && storedName !== 'undefined') {
      setUserName(storedName);
      setEditFormData(prev => ({ ...prev, name: storedName })); 
    }

    if (token) {
      // 내 수집 문장 데이터 가져오기 (백엔드에 API 추가 예정)
      fetch('http://13.124.191.57:5000/api/annotations/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        // 백엔드에서 데이터가 오면 기존 가짜 데이터 대신 덮어씌움
        if(Array.isArray(data) && data.length > 0) {
          setMyQuotes(data);
        } else {
          // 서버 통신은 됐지만 아직 글을 안 썼거나 API 미완성일 때 보여줄 기본값
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
      alert("성공적으로 로그아웃 되었습니다.");
      router.push('/');
    }
  };

  // ⭐️ [백엔드 연동] 회원 탈퇴 API 쏘기
  const handleWithdraw = async () => {
    if (window.confirm("정말 탈퇴하시겠습니까? 기록된 모든 독서 데이터가 삭제되며 복구할 수 없습니다.")) {
      try {
        await fetch('http://13.124.191.57:5000/api/users/withdraw', {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        alert("그동안 교환독서를 이용해주셔서 감사합니다. 탈퇴 처리되었습니다.");
        router.push('/');
      } catch (error) {
        alert("탈퇴 처리 중 에러가 발생했습니다.");
      }
    }
  };

  // ⭐️ [백엔드 연동] 프로필 수정 API 쏘기
  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          nickname: editFormData.name,
          newPassword: editFormData.password || undefined // 비번은 바꿀 때만 보냄
        })
      });

      if (response.ok) {
        localStorage.setItem('userName', editFormData.name);
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
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-400 hover:text-gray-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-xl font-black tracking-tighter">내 서재</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 mt-8 space-y-10">
        
        {/* 1. 프로필 & 요약 섹션 */}
        <section className="flex items-center justify-between bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative group">
          
          <button 
            onClick={() => {
              setEditFormData(prev => ({ ...prev, name: userName }));
              setIsEditProfileOpen(true);
            }}
            className="absolute top-6 right-6 text-[10px] font-black tracking-widest text-gray-400 hover:text-black transition flex items-center space-x-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
            <span className="underline decoration-transparent hover:decoration-black pb-0.5 transition-colors">프로필 수정</span>
          </button>

          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-md">
              {userName[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1">{userName}님,</h2>
              <p className="text-gray-500">이번 달은 총 <span className="text-gray-900 font-bold">3권</span>의 책과 만났어요.</p>
            </div>
          </div>
          
          <div className="hidden md:flex space-x-8 text-center mt-4 md:mt-0 pt-4 md:pt-0">
            <div>
              <p className="text-3xl font-black text-gray-900">12</p>
              <p className="text-xs text-gray-400 font-bold mt-1">남긴 기록</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">4</p>
              <p className="text-xs text-gray-400 font-bold mt-1">완독한 책</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* 2. 독서 캘린더 */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black">📅 4월의 독서 기록</h3>
              <div className="flex space-x-2 text-xs font-bold text-gray-400">
                <span className="flex items-center"><div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>완독</span>
                <span className="flex items-center"><div className="w-2 h-2 bg-orange-400 rounded-full mr-1"></div>필사</span>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                <div key={day} className="text-xs font-bold text-gray-400 pb-2">{day}</div>
              ))}
              {Array.from({ length: 3 }).map((_, i) => <div key={`empty-${i}`} className="p-2"></div>)}
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const hasBookCover = day === 5 || day === 15;
                const hasQuote = day === 12 || day === 16 || day === 22;
                return (
                  <div key={day} className="aspect-square relative flex items-center justify-center rounded-xl hover:bg-gray-50 cursor-pointer transition">
                    <span className={`text-sm font-bold ${hasBookCover || hasQuote ? 'text-gray-900 z-10' : 'text-gray-500'}`}>{day}</span>
                    {hasBookCover && (
                       <div className="absolute inset-1 bg-gray-200 rounded-lg opacity-40 bg-[url('https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=100&auto=format&fit=crop')] bg-cover"></div>
                    )}
                    {hasQuote && !hasBookCover && (
                      <div className="absolute bottom-1 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. 독서 통계 막대그래프 */}
          <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black mb-1">📊 주간 독서량</h3>
            <p className="text-xs text-gray-400 font-bold mb-8">단위: 페이지 (Page)</p>
            <div className="flex-1 flex items-end justify-between gap-2 h-40 mt-auto">
              {[
                { day: '월', value: 40 },
                { day: '화', value: 85, isToday: false },
                { day: '수', value: 20 },
                { day: '목', value: 120, isToday: false },
                { day: '금', value: 0 },
                { day: '토', value: 60, isToday: true },
                { day: '일', value: 0 },
              ].map((data, idx) => (
                <div key={idx} className="flex flex-col items-center w-full group cursor-pointer">
                  <div className="relative w-full flex justify-center">
                    <span className="absolute -top-8 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none">
                      {data.value}p
                    </span>
                    <div 
                      className={`w-full max-w-[32px] rounded-t-md transition-all duration-500 ${data.isToday ? 'bg-green-500' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                      style={{ height: `${data.value}%`, minHeight: '4px' }}
                    ></div>
                  </div>
                  <span className={`text-xs mt-3 font-bold ${data.isToday ? 'text-gray-900' : 'text-gray-400'}`}>{data.day}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* 4. 내 기록 보관함 (백엔드 연동 매핑) */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black">나의 문장 수집</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {myQuotes.map((q) => (
              <div key={q._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative group overflow-hidden">
                <p className="font-serif text-gray-800 leading-relaxed mb-4">"{q.quote}"</p>
                <p className="text-xs text-gray-400 font-bold mb-6">{q.bookId?.title || '알 수 없는 책'} | {q.author || '작자 미상'}</p>
                <button 
                  onClick={() => openExportModal(q.quote, q.bookId?.title || '책', q.author || '')}
                  className="w-full py-3 bg-gray-50 text-gray-600 font-bold text-sm rounded-xl hover:bg-gray-900 hover:text-white transition flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                  <span>스토리로 공유하기</span>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 5. 바디 맨 아래: 회원탈퇴 버튼 */}
        <section className="mt-20 pt-8 border-t border-gray-200 flex flex-col items-center justify-center pb-8">
          <button onClick={handleLogout} className="text-sm font-bold text-gray-400 hover:text-black underline mb-10">로그아웃</button>
          
          <p className="text-xs text-gray-400 mb-4 font-bold">더 이상 교환독서 서비스를 이용하지 않으시려면</p>
          <button 
            onClick={handleWithdraw} 
            className="w-full max-w-xs py-4 bg-red-500 text-white text-sm font-black rounded-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30"
          >
            회원탈퇴 진행하기
          </button>
        </section>

      </main>

      {/* ==========================================
          [모달] 프로필 / 회원정보 수정
          ========================================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-black tracking-tighter">프로필 수정</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-gray-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleEditProfile} className="p-8 space-y-5">
              
              {/* 프로필 이미지 변경 (UI용) */}
              <div className="flex justify-center mb-6">
                <div className="relative cursor-pointer group">
                  <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-black">
                    {editFormData.name ? editFormData.name[0] : userName[0]}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">닉네임</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">새 비밀번호 (선택)</label>
                <input 
                  type="password" 
                  placeholder="변경할 비밀번호 입력"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">새 비밀번호 확인</label>
                <input 
                  type="password" 
                  placeholder="비밀번호 다시 입력"
                  value={editFormData.passwordConfirm}
                  onChange={(e) => setEditFormData({...editFormData, passwordConfirm: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition"
                />
              </div>

              <button 
                type="submit" 
                className="w-full mt-6 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-lg tracking-widest"
              >
                변경 내용 저장
              </button>
            </form>

          </div>
        </div>
      )}

      {/* 인스타그램 스토리 내보내기 모달 */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="absolute top-6 right-6 flex space-x-4">
            <button className="text-white hover:text-gray-300" onClick={() => setIsExportModalOpen(false)}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="relative w-full max-w-[320px] aspect-[9/16] bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
            <div className="relative z-10 w-full bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-xl">
              <span className="text-4xl text-green-400 opacity-50 font-serif absolute -top-4 -left-2">"</span>
              <p className="font-serif text-white text-lg leading-relaxed mb-6 relative z-10 break-keep">
                {selectedQuote.text}
              </p>
              <div className="flex flex-col items-end">
                <span className="text-sm font-black text-white">{selectedQuote.book}</span>
                <span className="text-xs text-gray-400 mt-1">{selectedQuote.author}</span>
              </div>
            </div>
            <div className="absolute bottom-8 left-0 w-full text-center z-10">
              <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase">From. 교환독서</span>
            </div>
          </div>
          <div className="mt-8 flex space-x-4 w-full max-w-[320px]">
            <button 
              className="flex-1 bg-white text-gray-900 font-black py-4 rounded-full hover:bg-gray-200 transition shadow-lg flex items-center justify-center space-x-2"
              onClick={() => {
                alert("이미지가 갤러리에 저장되었습니다!");
                setIsExportModalOpen(false);
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              <span>이미지 저장</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
