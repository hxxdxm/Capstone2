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
    bookTitle: '',
    content: '',
    author: '나' // 실제론 로그인 유저 이름
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 📍 사진 확인 로직 제거: 책 제목과 내용만 있으면 통과!
    if (!formData.bookTitle || !formData.content) {
      alert("책 제목과 문장은 반드시 입력해주세요!");
      return;
    }

    const submissionData = new FormData();
    
    // 📍 사진이 있을 때만 FormData에 추가
    if (uploadFile) {
      submissionData.append('image', uploadFile);
    }
    
    submissionData.append('bookTitle', formData.bookTitle);
    submissionData.append('content', formData.content);
    submissionData.append('author', formData.author);

    try {
      const res = await fetch(`${API_BASE_URL}/exhibition`, {
        method: 'POST',
        body: submissionData,
      });

      if (res.ok) {
        alert("필사가 등록되었습니다!");
        setIsModalOpen(false);
        setPreviewImage(null);
        setUploadFile(null);
        setFormData({ bookTitle: '', content: '', author: '나' });
        
        fetchExhibitions();
      } else {
        alert("등록에 실패했습니다.");
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
            {exhibitions.length === 0 ? (
              <div className="col-span-full text-center py-24 border-2 border-dashed border-gray-300 rounded-[2.5rem]">
                <p className="text-gray-600 font-bold text-lg">현재 전시 중인 필사가 없습니다.</p>
                <p className="text-sm text-gray-500 mt-2">첫 번째 필사를 등록해 보세요!</p>
              </div>
            ) : (
              exhibitions.map((item) => {
                const hasImage = item.imageUrl || item.image_url;
                
                return (
                  <div key={item.id} className="bg-white rounded-[2.5rem] border border-gray-200 overflow-hidden hover:shadow-2xl hover:border-gray-300 transition-all group flex flex-col min-h-[300px]">
                    
                    {/* 📍 이미지가 있을 때만 사진 영역을 렌더링 */}
                    {hasImage && (
                      <div className="h-56 overflow-hidden relative flex-shrink-0">
                        <img src={hasImage} alt={item.bookTitle} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                    )}
                    
                    {/* 텍스트 영역 (이미지가 없으면 이 부분이 카드 전체를 예쁘게 채움) */}
                    <div className="p-8 flex flex-col flex-1 justify-between relative">
                      {/* 따옴표 장식 (이미지가 없을 때만 표시하여 덜 심심하게) */}
                      {!hasImage && (
                        <div className="absolute top-6 right-8 text-gray-100">
                          <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9125 16 16.017 16H19.017C19.5693 16 20.017 15.5523 20.017 15V9C20.017 8.44772 19.5693 8 19.017 8H16.017C15.4647 8 15.017 8.44772 15.017 9V12C15.017 12.5523 14.5693 13 14.017 13H12.017V9C12.017 6.79086 13.8079 5 16.017 5H19.017C21.2262 5 23.017 6.79086 23.017 9V15C23.017 18.3137 20.3308 21 17.017 21H14.017ZM1.017 21L1.017 18C1.017 16.8954 1.91243 16 3.017 16H6.017C6.56929 16 7.017 15.5523 7.017 15V9C7.017 8.44772 6.56929 8 6.017 8H3.017C2.46472 8 2.017 8.44772 2.017 9V12C2.017 12.5523 1.56929 13 1.017 13H-0.983V9C-0.983 6.79086 0.80786 5 3.017 5H6.017C8.22615 5 10.017 6.79086 10.017 9V15C10.017 18.3137 7.33075 21 4.017 21H1.017Z" />
                          </svg>
                        </div>
                      )}

                      <div className="relative z-10">
                        <h4 className="text-[10px] font-black text-gray-600 mb-4 tracking-widest uppercase bg-gray-100 inline-block px-2 py-1 rounded">
                          {item.bookTitle}
                        </h4>
                        <p className="text-lg font-bold leading-relaxed text-black italic break-keep">
                          "{item.content}"
                        </p>
                      </div>

                      <div className="mt-8 pt-5 border-t border-gray-100 flex justify-between items-center text-xs font-black text-gray-500">
                        <span>By {item.author}</span>
                        <span className="text-[10px] text-gray-400">
                          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '최근'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all z-50 group">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 relative shadow-2xl my-auto">
            <button onClick={() => {
              setIsModalOpen(false);
              setPreviewImage(null);
              setUploadFile(null);
            }} className="absolute top-8 right-10 text-gray-400 hover:text-black font-bold text-2xl">✕</button>
            
            <h3 className="text-3xl font-black tracking-tighter mb-8 text-black">새 필사 등록</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 📍 (선택) 사진 업로드 영역 */}
              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Photo (선택)</label>
                <div className="group relative w-full h-40 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-black transition-all">
                  {previewImage ? (
                    <img src={previewImage} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <span className="text-3xl block mb-2">📸</span>
                      <span className="text-xs font-black text-gray-400 uppercase">클릭하여 사진 첨부하기</span>
                    </div>
                  )}
                  <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Book Title *</label>
                <input 
                  type="text" 
                  className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold transition text-lg text-black" 
                  placeholder="책 제목"
                  value={formData.bookTitle}
                  onChange={(e) => setFormData({...formData, bookTitle: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase">Your Thought *</label>
                <textarea 
                  className="w-full border-2 border-gray-100 rounded-3xl p-5 h-32 focus:border-black outline-none font-bold transition resize-none text-base text-black" 
                  placeholder="마음에 남은 문장을 적어주세요"
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="w-full bg-black text-white py-5 rounded-[2rem] font-black text-lg hover:bg-gray-800 transition shadow-xl mt-4">
                전시회에 올리기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}