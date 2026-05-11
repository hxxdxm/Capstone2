"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function ExhibitionPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    bookTitle: '', // 아직 백엔드 API에 단순히 제목만 보내는 기능은 없지만 일단 UI용으로 유지
    content: ''
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
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    setIsLoading(true);
    try {
      // 📍 [GET] 불러오는 주소를 백엔드의 /exhibition 으로 수정
      const res = await fetch(`${API_BASE_URL}/annotations/exhibition`);
      const data = await res.json();
      if (Array.isArray(data)) {
        // 백엔드에서 이미 최신순 정렬해서 주므로 그대로 사용
        setExhibitions(data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = getToken();
    if (!token) return alert("로그인 후 이용해주세요!");

    if (!formData.content) {
      alert("문장은 반드시 입력해주세요!");
      return;
    }

    // 📍 핵심: 백엔드가 원하는 키값(quote, userId 등)에 맞춰 JSON 조립
    const submissionData = {
      userId: getMyId(), 
      annotationType: 'QUOTE_TEXT', // 기본값
      quote: formData.content ?? '', // 문장 내용을 quote로 전송
      // 백엔드 POST 로직에 bookId나 roomId가 필수일 수 있지만, 
      // 현재 UI에는 책 검색/방 선택 기능이 없으므로 일단 텍스트만 보냄
    };

    try {
      // 📍 [POST] 저장하는 주소는 /annotations 가 맞음
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
        fetchExhibitions(); // 저장 후 목록 새로고침
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
      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">MEMORIES</span>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-black">Exhibition</h2>
          <p className="mt-4 text-gray-700 font-bold">사진과 함께, 혹은 문장만 가볍게 남겨보세요</p>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibitions.map((item) => {
              const hasImage = item.imageUrl || item.image_url;
              return (
                <div key={item.id || item._id} className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden hover:shadow-2xl transition-all group flex flex-col min-h-[300px]">
                  {hasImage && (
                    <div className="h-56 overflow-hidden relative flex-shrink-0">
                      <img src={hasImage} alt="필사 이미지" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-8 flex flex-col flex-1 justify-between relative">
                    <div className="relative z-10">
                      <h4 className="text-[10px] font-black text-gray-600 mb-4 tracking-widest uppercase bg-gray-100 inline-block px-2 py-1 rounded">
                        {/* 📍 책 제목은 백엔드의 bookId.title 사용 */}
                        {item.bookId?.title || '도서'}
                      </h4>
                      <p className="text-lg font-bold leading-relaxed text-black italic break-keep">
                        {/* 📍 문장 내용은 백엔드의 quote 사용 */}
                        "{item.quote}" 
                      </p>
                    </div>
                    <div className="mt-8 pt-5 border-t border-gray-100 flex justify-between items-center text-xs font-black text-gray-500">
                      {/* 📍 작성자 이름은 백엔드의 userId.nickname 사용 */}
                      <span>By {item.userId?.nickname || '작자미상'}</span>
                      <span className="text-[10px] text-gray-400">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50">
        <span className="text-3xl font-bold">+</span>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-10 text-gray-400 hover:text-black font-bold text-2xl">✕</button>
            <h3 className="text-3xl font-black tracking-tighter mb-8 text-black">새 필사 등록</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Photo (선택)</label>
                <div className="group relative w-full h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-black transition-all">
                  {previewImage ? <img src={previewImage} className="w-full h-full object-cover" /> : <span className="text-gray-400 font-bold">📸 사진 업로드</span>}
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>
              <input type="text" className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-lg text-black" placeholder="책 제목 (현재 서버 저장 안됨)" value={formData.bookTitle} onChange={(e) => setFormData({...formData, bookTitle: e.target.value})} />
              <textarea className="w-full border-2 border-gray-100 rounded-3xl p-5 h-32 focus:border-black outline-none font-bold transition resize-none text-base text-black" placeholder="문장을 적어주세요" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})}></textarea>
              <button type="submit" className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-lg hover:bg-gray-800 transition shadow-xl mt-4">전시회에 올리기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}