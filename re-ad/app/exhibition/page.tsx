"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function ExhibitionPage() {
  const [exhibitions, setExhibitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 📍 모달 및 업로드 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    bookTitle: '',
    content: '',
    author: '나' // 실제론 로그인 유저 이름
  });

  // 1. [Step 1] 과거 데이터 불러오기 (페이지 로드 시)
  useEffect(() => {
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/exhibition`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setExhibitions(data);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사진 미리보기 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // 2. [Step 1] 데이터 업로드 (서버에 저장)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !formData.bookTitle || !formData.content) {
      alert("사진과 내용을 모두 입력해주세요!");
      return;
    }

    const submissionData = new FormData();
    submissionData.append('image', uploadFile);
    submissionData.append('bookTitle', formData.bookTitle);
    submissionData.append('content', formData.content);
    submissionData.append('author', formData.author);

    try {
      const res = await fetch(`${API_BASE_URL}/exhibition`, {
        method: 'POST',
        body: submissionData, // 📍 FormData로 전송해야 사진이 넘어갑니다.
      });

      if (res.ok) {
        alert("필사가 등록되었습니다!");
        setIsModalOpen(false);
        setPreviewImage(null);
        setUploadFile(null);
        setFormData({ bookTitle: '', content: '', author: '나' });
        
        // 업로드 성공 후 즉시 다시 불러오기 (데이터 유지 핵심!)
        fetchExhibitions();
      }
    } catch (error) {
      alert("등록에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      <Header />

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">MEMORIES</span>
          <h2 className="text-5xl font-black tracking-tighter uppercase">Exhibition</h2>
          <p className="mt-4 text-gray-700 font-bold">사진과 함께 남기는 우리들의 문장</p>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exhibitions.map((item) => (
              <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden hover:shadow-2xl transition-all group flex flex-col">
                {/* 사진 영역 */}
                <div className="h-64 overflow-hidden relative">
                  <img src={item.imageUrl || item.image_url} alt="Book" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                {/* 텍스트 영역 */}
                <div className="p-8">
                  <h4 className="text-xs font-black text-gray-400 mb-4 tracking-widest uppercase">{item.bookTitle}</h4>
                  <p className="text-lg font-bold leading-relaxed text-black italic">"{item.content}"</p>
                  <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center text-xs font-black text-gray-400">
                    <span>By {item.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 플로팅 버튼 */}
      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50">
        <span className="text-3xl font-bold">+</span>
      </button>

      {/* 📍 사진 업로드 기능이 포함된 원조 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl my-auto">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-10 text-gray-400 hover:text-black font-bold text-2xl">✕</button>
            <h3 className="text-3xl font-black tracking-tighter mb-8 text-black">새 필사 등록</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 사진 선택 */}
              <div className="group relative w-full h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-black transition-all">
                {previewImage ? (
                  <img src={previewImage} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <span className="text-4xl block mb-2">📸</span>
                    <span className="text-xs font-black text-gray-400 uppercase">책 사진 업로드</span>
                  </div>
                )}
                <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Book Title</label>
                <input 
                  type="text" 
                  className="w-full border-b-2 border-gray-100 py-3 focus:border-black outline-none font-bold transition text-lg" 
                  placeholder="책 제목"
                  value={formData.bookTitle}
                  onChange={(e) => setFormData({...formData, bookTitle: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-2 uppercase">Your Thought</label>
                <textarea 
                  className="w-full border-2 border-gray-50 rounded-3xl p-5 h-40 focus:border-black outline-none font-bold transition resize-none text-base" 
                  placeholder="문장을 적어주세요"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-lg hover:bg-gray-800 transition shadow-xl">전시회에 제출하기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}