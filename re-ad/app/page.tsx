"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MainPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // [NEW] 글쓰기 모달 상태 관리
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [writeTab, setWriteTab] = useState<'transcribe' | 'review'>('transcribe');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedName = localStorage.getItem('userName');
    
    if (token && storedName) {
      setIsLoggedIn(true);
      setUserName(storedName);
    }
    
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setIsLoggedIn(false);
    setUserName('');
    alert("로그아웃 되었습니다.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-gray-800 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-500 tracking-widest">TEXT HIP PORTAL</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans relative">
      
      {/* 상단 네비게이션 바 */}
      <header className="bg-white px-8 py-5 shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-black tracking-tighter text-gray-900">
              교환<span className="text-gray-400">독서</span>
            </h1>
          </Link>
          
          <div className="flex items-center space-x-6 text-gray-800">
            {isLoggedIn ? (
              <>
                <span className="text-sm font-bold bg-gray-100 px-3 py-1 rounded-full">{userName}님</span>
                <Link href="/mypage" className="text-sm font-bold hover:text-gray-500 transition">마이페이지</Link>
                <button onClick={handleLogout} className="text-sm font-bold text-gray-400 hover:text-gray-900 transition">로그아웃</button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-gray-900 transition">로그인</Link>
                <Link href="/register" className="text-sm font-bold text-white bg-gray-900 hover:bg-gray-700 px-5 py-2 rounded-full transition shadow-sm">시작하기</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 md:px-8 mt-8 space-y-12">
        
        {/* 1. 메인 히어로 배너 */}
        <section className="relative w-full h-[320px] md:h-[400px] bg-gray-900 rounded-3xl overflow-hidden shadow-xl group cursor-pointer">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition duration-500"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full">
            <span className="inline-block px-3 py-1 bg-white text-gray-900 text-xs font-black rounded-full mb-4">이달의 독서 전시</span>
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 tracking-tight leading-tight">
              당신의 밑줄이<br/>예술이 되는 공간
            </h2>
            <p className="text-gray-300 text-sm md:text-base font-medium mb-6">서촌 팝업 갤러리 '문장 수집가들' 展 (4.15 ~ 4.30)</p>
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-2.5 rounded-full text-sm font-bold transition border border-white/30">
              자세히 보기 →
            </button>
          </div>
        </section>

        {/* 2. 포털 그리드 레이아웃 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 왼쪽 영역: 텍스트힙 필사 갤러리 */}
          <section className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">✍️ 오늘의 필사</h3>
              <Link href="#" className="text-sm font-bold text-gray-500 hover:text-gray-900">더보기</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:border-gray-400 transition cursor-pointer group">
                <div className="h-40 bg-gray-100 rounded-2xl mb-4 flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center relative overflow-hidden">
                   <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition"></div>
                </div>
                <h4 className="font-serif text-lg font-bold text-gray-800 mb-2 leading-snug">"다정한 것이 살아남는다."</h4>
                <p className="text-sm text-gray-500 mb-4">브라이언 헤어 | 다정한 것이 살아남는다</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <span className="text-xs font-bold text-gray-600">만년필러버</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">♥ 342</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200 hover:border-gray-400 transition cursor-pointer group">
                <div className="h-40 bg-gray-50 rounded-2xl mb-4 flex items-center justify-center p-4 border border-gray-100">
                  <p className="font-serif text-xl text-center text-gray-700 leading-relaxed italic">
                    "우리는 모두 별빛으로<br/>만들어진 존재들이다."
                  </p>
                </div>
                <h4 className="font-serif text-lg font-bold text-gray-800 mb-2 leading-snug">코스모스</h4>
                <p className="text-sm text-gray-500 mb-4">칼 세이건</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200"></div>
                    <span className="text-xs font-bold text-gray-600">밤하늘</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400">♥ 128</span>
                </div>
              </div>
            </div>
          </section>

          {/* 오른쪽 영역: 사이드바 */}
          <aside className="lg:col-span-4 space-y-8">
            <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-gray-900">💬 실시간 독서 기록</h3>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              </div>
              <div className="space-y-4">
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2 hover:underline cursor-pointer">
                    결국 남는 건 사랑뿐이라는 걸, 이 책을 덮고 나서야 깨달았다. 새벽 감성에 읽기 딱 좋은 소설.
                  </p>
                  <p className="text-xs text-gray-400 font-bold">@독서광 · 쇼코의 미소</p>
                </div>
                <div className="border-b border-gray-100 pb-4">
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2 hover:underline cursor-pointer">
                    개발자라면 무조건 읽어야 할 바이블. 챕터 3까지만 읽었는데도 내 코드가 얼마나 부끄러운지 알게 됨...
                  </p>
                  <p className="text-xs text-gray-400 font-bold">@코딩노예 · 클린 코드</p>
                </div>
                <div>
                  <p className="text-sm text-gray-700 mb-2 line-clamp-2 hover:underline cursor-pointer">
                    매일 아침 10분씩 읽고 있는데, 하루를 시작하는 마음가짐이 달라진다.
                  </p>
                  <p className="text-xs text-gray-400 font-bold">@미라클모닝 · 명상록</p>
                </div>
              </div>
            </section>

            <section className="bg-gray-50 p-6 rounded-3xl border border-gray-200">
              <h3 className="text-lg font-black text-gray-900 mb-4">📍 텍스트힙 스팟</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-xl transition -ml-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 bg-[url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=200&auto=format&fit=crop')] bg-cover"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">최인아 책방</h4>
                    <p className="text-xs text-gray-500">강남구 역삼동 · 북토크 진행중</p>
                  </div>
                </li>
                <li className="flex items-center space-x-3 cursor-pointer hover:bg-gray-100 p-2 rounded-xl transition -ml-2">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=200&auto=format&fit=crop')] bg-cover"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">소전서림</h4>
                    <p className="text-xs text-gray-500">강남구 청담동 · 문학 프라이빗 도서관</p>
                  </div>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>

      {/* 우측 하단 플로팅 글쓰기 버튼 */}
      <button 
        onClick={() => {
          if(!isLoggedIn) { alert("기록을 남기려면 로그인이 필요합니다."); router.push('/login'); return; }
          setIsWriteModalOpen(true); // 모달 열기!
        }}
        className="fixed bottom-10 right-10 z-40 flex items-center justify-center w-14 h-14 bg-gray-900 text-white rounded-full shadow-2xl hover:bg-gray-700 transition-all transform hover:scale-110"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>

      {/* [NEW] 글쓰기 모달창 UI */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* 모달 헤더 (탭 선택) */}
            <div className="flex items-center justify-between px-8 pt-8 pb-4 border-b border-gray-100">
              <div className="flex space-x-6">
                <button 
                  onClick={() => setWriteTab('transcribe')} 
                  className={`text-lg font-black transition-colors ${writeTab === 'transcribe' ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  필사 올리기
                </button>
                <button 
                  onClick={() => setWriteTab('review')} 
                  className={`text-lg font-black transition-colors ${writeTab === 'review' ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
                >
                  기록 남기기
                </button>
              </div>
              <button onClick={() => setIsWriteModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* 모달 본문 */}
            <div className="p-8">
              {writeTab === 'transcribe' ? (
                <div className="space-y-5">
                  <div className="w-full h-40 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 hover:border-gray-300 transition cursor-pointer group">
                    <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    <span className="text-sm font-bold">필사한 노트를 촬영해 올려주세요</span>
                  </div>
                  <div>
                    <input type="text" placeholder="어떤 책의 문장인가요? (책 제목)" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition" />
                  </div>
                  <div>
                    <textarea placeholder="마음에 남은 문장을 텍스트로도 적어주세요." rows={3} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition resize-none"></textarea>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <input type="text" placeholder="다 읽은 책의 제목을 적어주세요." className="w-full border-b-2 border-gray-100 px-2 py-3 text-lg font-bold focus:outline-none focus:border-gray-900 transition placeholder:font-normal" />
                  </div>
                  <div>
                    <textarea placeholder="이 책은 당신에게 어떤 의미를 남겼나요? 자유롭게 기록해주세요." rows={6} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition resize-none leading-relaxed"></textarea>
                  </div>
                </div>
              )}

              {/* 하단 버튼 */}
              <button 
                onClick={() => {
                  alert("서버 연결 전입니다! 예쁘게 디자인된 UI를 확인해 주세요.");
                  setIsWriteModalOpen(false);
                }}
                className="w-full mt-8 bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-200"
              >
                기록 남기기
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}