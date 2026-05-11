"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // 공통 헤더 컴포넌트

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function ExhibitionPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 모달 및 폼 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    bookTitle: '', // UI용 유지
    content: ''
  });

  // 유저 정보 가져오기 함수들
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
    fetchExhibitions();
  }, []);

  // [GET] 필사 목록 불러오기 (최신 기능 유지)
  const fetchExhibitions = async () => {
    setIsLoading(true);
    try {
      // 백엔드 명세에 맞춰 /exhibition 으로 요청
      const res = await fetch(`${API_BASE_URL}/annotations/exhibition`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // 이미 백엔드에서 정렬되어 오므로 그대로 사용
        setExhibitions(data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사진 업로드 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // [POST] 필사 등록하기 (JSON 전송 기능 유지)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) return alert("로그인 후 이용해주세요!");

    if (!formData.content) {
      alert("문장은 반드시 입력해주세요!");
      return;
    }

    // 백엔드 규격(quote)에 맞춰 JSON 조립
    const submissionData = {
      userId: getMyId(), 
      annotationType: 'QUOTE_TEXT',
      quote: formData.content ?? '',
    };

    try {
      const res = await fetch(`${API_BASE_URL}/annotations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' // JSON 형태로 전송
        },
        body: JSON.stringify(submissionData),
      });

      if (res.ok) {
        alert("필사가 성공적으로 전시되었습니다! 🎉");
        setIsModalOpen(false);
        setPreviewImage(null);
        setUploadFile(null);
        setFormData({ bookTitle: '', content: '' });
        fetchExhibitions(); // 성공 시 새로고침
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`등록 실패: ${errData.message || res.status + ' 에러'}`);
      }
    } catch (error) {
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      <Header />

      <main className="mx-auto max-w-7xl px-6 mt-16 space-y-16">
        
        {/* --- ⭐️ [레이아웃 복원] 초창기 감성 Hero 섹션 --- */}
        <section className="text-center pt-10 pb-10">
          <span className="inline-block px-4 py-1.5 bg-black text-white text-xs font-black tracking-[0.3em] mb-6 rounded-full">
            MEMORIES
          </span>
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter uppercase text-black leading-tight">
            Recent<br />Memories展
          </h2>
          <p className="mt-6 text-gray-600 font-bold text-lg md:text-xl">
            멤버들이 남긴 오늘의 영감, 문장의 기록
          </p>
        </section>

        {/* --- ⭐️ [레이아웃 복원] 가로 스크롤 기반 전시회장 --- */}
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-3xl font-black text-black">Exhibition Hall</h3>
              <p className="text-sm font-bold text-gray-500 mt-2">지금 가장 뜨거운 영감의 문장들</p>
            </div>
            <Link href="/annotations" className="text-xs font-black text-gray-400 hover:text-black border-b-2 border-transparent hover:border-black transition-all pb-1 uppercase tracking-widest">
              VIEW ALL →
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            // 📍 가로 스크롤 레이아웃 및 no-scrollbar 적용
            <div className="flex space-x-6 overflow-x-auto pb-6 no-scrollbar">
              {exhibitions.length === 0 ? (
                <div className="w-full text-center py-24 border-2 border-dashed border-gray-300 rounded-[2.5rem]">
                  <p className="text-gray-600 font-bold text-lg">전시 중인 필사가 없습니다.</p>
                </div>
              ) : (
                exhibitions.map((item) => (
                  // --- ⭐️ [디자인 복원] 어두운 배경 이미지 위 화이트 Serif 텍스트 카드 ---
                  <div key={item._id} className="min-w-[320px] max-w-[320px] h-[450px] bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-2 transition-all group relative cursor-pointer flex flex-col justify-between">
                    
                    {/* 사진이 있을 경우 배경 이미지 및 dark 그라데이션 오버레이 */}
                    {item.imageUrl && (
                      <>
                        <img src={item.imageUrl} alt="필사 이미지" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 z-0" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/80 z-10"></div>
                      </>
                    )}

                    {/* 카드 내부 콘텐츠 영역 */}
                    <div className={`absolute inset-0 z-20 p-10 flex flex-col justify-between ${item.imageUrl ? 'text-white' : 'text-black'}`}>
                      <div className="relative">
                        {/* 책 제목 뱃지 (기존 디자인 복원) */}
                        <h4 className={`text-[10px] font-black uppercase tracking-widest inline-block px-2.5 py-1.5 rounded mb-6 ${item.imageUrl ? 'bg-white/10 text-white/90' : 'bg-gray-100 text-gray-600'}`}>
                          {/* 📍 실제 데이터(bookId.title) 연동 유지 */}
                          {item.bookId?.title || '도서'}
                        </h4>
                        
                        {/* 문장 내용 (Serif 폰트 및 큰 따옴표 복원) */}
                        <p className={`text-3xl font-black leading-tight break-keep font-serif italic ${item.imageUrl ? 'text-white' : 'text-black'}`}>
                          {/* 📍 실제 데이터(quote) 연동 유지 */}
                          “{item.quote}”
                        </p>
                      </div>
                      
                      {/* 카드 하단 정보 (닉네임 및 날짜) */}
                      <div className={`mt-auto pt-5 border-t ${item.imageUrl ? 'border-white/10' : 'border-gray-100'} flex justify-between items-center text-xs font-black`}>
                        {/* 📍 실제 데이터(userId.nickname) 연동 유지 */}
                        <span className={item.imageUrl ? 'text-white/70' : 'text-gray-500'}>
                          By {item.userId?.nickname || '작자미상'}
                        </span>
                        <span className={item.imageUrl ? 'text-white/50' : 'text-gray-400'}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </section>

      </main>

      {/* --- 플로팅 등록 버튼 --- */}
      <button onClick={() => {
        if (!getToken()) return alert("로그인 후 이용 가능합니다.");
        setIsModalOpen(true);
      }} className="fixed bottom-10 right-10 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50 group">
        <span className="text-4xl font-bold group-hover:rotate-90 transition-transform duration-300">+</span>
      </button>

      {/* --- 등록 모달창 (기존 기능 유지) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl my-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-10 text-gray-400 hover:text-black font-bold text-2xl">✕</button>
            <h3 className="text-3xl font-black tracking-tighter mb-8 text-black">새 필사 등록</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 사진 업로드 (UI 유지) */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Photo (선택)</label>
                <div className="group relative w-full h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-black transition-all">
                  {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold">📸 사진 업로드</span>}
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>
              <input type="text" className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-lg text-black" placeholder="책 제목 (현재 서버 저장 안됨)" value={formData.bookTitle} onChange={(e) => setFormData({...formData, bookTitle: e.target.value})} />
              <textarea className="w-full border-2 border-gray-100 rounded-3xl p-5 h-32 focus:border-black outline-none font-bold transition resize-none text-base text-black" placeholder="문장을 적어주세요" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} required></textarea>
              <button type="submit" className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-lg hover:bg-gray-800 transition shadow-xl mt-4">전시회에 올리기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}