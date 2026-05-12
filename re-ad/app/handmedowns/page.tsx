"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function HandMeDownsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('전체');

  // 모달 상태 및 폼 데이터
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: '거의 새 것',
    tradeType: '나눔',
    description: '',
    imagePreview: '', // 📍 사진 미리보기 URL
    imageFile: null as File | null // 📍 실제 서버로 보낼 파일 객체
  });

  const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;

  // 📍 사진 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file) // 로컬 미리보기 생성
      });
    }
  };

  useEffect(() => {
    // 임시 더미 데이터 (구조 확인용)
    const dummyData = [
      {
        id: 1,
        title: "다정한 것이 살아남는다",
        author: "브라이언 헤어",
        condition: "거의 새 것",
        tradeType: "나눔",
        provider: "독서광",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800",
        description: "두 번 읽고 깨끗하게 보관했습니다.",
        createdAt: new Date().toISOString()
      }
    ];

    setTimeout(() => {
      setItems(dummyData);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getToken()) return alert("로그인 후 등록할 수 있습니다.");
    
    // 📍 사진이 필수라면 체크
    if (!formData.imagePreview) {
      alert("책 상태를 확인할 수 있는 사진을 등록해주세요!");
      return;
    }

    // [참고] 백엔드에 보낼 때는 사진이 포함되므로 FormData를 사용해야 할 수 있습니다.
    // 지금은 UI 확인용으로 알림창만 띄웁니다.
    alert("도서 상태 사진과 함께 성공적으로 등록되었습니다!");
    
    setIsModalOpen(false);
    // 폼 초기화 (사진 정보까지 싹 비워줌)
    setFormData({ 
      title: '', author: '', condition: '거의 새 것', tradeType: '나눔', 
      description: '', imagePreview: '', imageFile: null 
    });
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === '전체') return true;
    return item.tradeType === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      <Header />

      <main className="mx-auto max-w-6xl px-6 mt-16">
        <section className="text-center mb-12 relative">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            BOOK EXCHANGE
          </span>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-black">물려주기</h2>
          <p className="mt-4 text-gray-700 font-bold">책 사진을 올리면 거래 확률이 2배 더 높아져요!</p>
          
          <div className="absolute right-0 bottom-0">
            <button 
              onClick={() => {
                if (!getToken()) return alert("로그인 후 이용 가능합니다.");
                setIsModalOpen(true);
              }}
              className="bg-black text-white px-6 py-3 rounded-full font-black text-sm hover:bg-gray-800 transition shadow-lg flex items-center space-x-2"
            >
              <span>+ 책 등록하기</span>
            </button>
          </div>
        </section>

        {/* 필터 탭 */}
        <div className="flex justify-center space-x-2 mb-12">
          {['전체', '나눔', '교환'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full text-xs font-black transition-all ${
                activeFilter === filter ? 'bg-black text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 책 목록 그리드 */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full">
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 left-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest text-white shadow-sm ${item.tradeType === '나눔' ? 'bg-green-500' : 'bg-purple-500'}`}>
                      {item.tradeType}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-lg font-black mb-1 text-black line-clamp-1">{item.title}</h3>
                  <p className="text-xs font-bold text-gray-400 mb-4">{item.author}</p>
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-500">
                    <span>{item.condition}</span>
                    <span>By {item.provider}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 📍 등록 모달창 (사진 업로드 기능 추가됨) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black font-bold text-xl">✕</button>
            <h3 className="text-3xl font-black tracking-tighter mb-8 text-black">물려줄 책 등록</h3>
            
            <form onSubmit={handleRegister} className="space-y-5">
              
              {/* 📍 사진 업로드 영역 */}
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">책 상태 사진 *</label>
                <div className="group relative w-full h-44 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center cursor-pointer hover:border-black transition-all">
                  {formData.imagePreview ? (
                    <div className="relative w-full h-full">
                      <img src={formData.imagePreview} className="w-full h-full object-cover" alt="미리보기" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-white font-bold text-sm">사진 변경하기</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <span className="text-2xl mb-2 block">📸</span>
                      <span className="text-gray-400 font-bold text-xs">클릭하여 책 사진 올리기</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">책 제목 *</label>
                <input type="text" className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black" placeholder="책 제목을 입력해주세요" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">저자명 *</label>
                <input type="text" className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black" placeholder="지은이를 입력해주세요" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2">책 상태 *</label>
                  <select className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black bg-white" value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}>
                    <option value="거의 새 것">거의 새 것</option>
                    <option value="사용감 있음">사용감 있음</option>
                    <option value="밑줄 많음">밑줄 많음</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 mb-2">거래 방식 *</label>
                  <select className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black bg-white" value={formData.tradeType} onChange={(e) => setFormData({...formData, tradeType: e.target.value})}>
                    <option value="나눔">나눔 (무료)</option>
                    <option value="교환">교환 (책 맞교환)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">상세 설명</label>
                <textarea className="w-full border-2 border-gray-100 rounded-2xl p-4 h-24 focus:border-black outline-none font-bold text-black transition resize-none" placeholder="책 상태에 대해 자유롭게 적어주세요" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition shadow-lg mt-2">
                도서 등록 완료
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}