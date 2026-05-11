"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function HandMeDownsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('전체');

  // 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: '거의 새 것',
    tradeType: '나눔',
    description: ''
  });

  const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;

  useEffect(() => {
    // 📍 임시 더미 데이터 (백엔드 API가 완성되기 전까지 UI를 보여주기 위함)
    const dummyData = [
      {
        id: 1,
        title: "다정한 것이 살아남는다",
        author: "브라이언 헤어",
        condition: "거의 새 것",
        tradeType: "나눔",
        provider: "독서광",
        imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800",
        description: "두 번 읽고 깨끗하게 보관했습니다. 꼭 읽어보고 싶으신 분께 드려요.",
        createdAt: new Date().toISOString()
      },
      {
        id: 2,
        title: "모순",
        author: "양귀자",
        condition: "사용감 있음",
        tradeType: "교환",
        provider: "하민",
        imageUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800",
        description: "다른 소설책이랑 교환하고 싶습니다. 표지에 약간의 구김이 있어요.",
        createdAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 3,
        title: "클린 코드 (Clean Code)",
        author: "로버트 C. 마틴",
        condition: "밑줄 많음",
        tradeType: "나눔",
        provider: "개발자A",
        imageUrl: "https://images.unsplash.com/photo-1555662800-87311cb37552?q=80&w=800",
        description: "공부하면서 밑줄을 많이 쳤지만 읽는 데는 지장 없습니다. 후배님들 가져가세요!",
        createdAt: new Date(Date.now() - 172800000).toISOString()
      }
    ];

    // 📍 나중에 백엔드 API가 완성되면 아래 주석을 풀고 연결하세요!
    /*
    const fetchItems = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/handmedowns`); // 백엔드 주소 확인 필요
        const data = await res.json();
        if (Array.isArray(data)) setItems(data);
      } catch (error) {
        console.error("물려주기 목록 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
    */

    // 임시로 더미데이터 세팅 후 로딩 해제 (0.5초 딜레이)
    setTimeout(() => {
      setItems(dummyData);
      setIsLoading(false);
    }, 500);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!getToken()) return alert("로그인 후 등록할 수 있습니다.");
    
    // 📍 나중에 백엔드 POST 로직으로 교체할 부분
    alert("도서가 성공적으로 등록되었습니다! (현재는 UI 테스트 모드입니다)");
    setIsModalOpen(false);
    setFormData({ title: '', author: '', condition: '거의 새 것', tradeType: '나눔', description: '' });
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === '전체') return true;
    return item.tradeType === activeFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      <Header />

      <main className="mx-auto max-w-6xl px-6 mt-16">
        {/* 상단 헤더 섹션 */}
        <section className="text-center mb-12 relative">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-4 rounded-full">
            BOOK EXCHANGE
          </span>
          <h2 className="text-5xl font-black tracking-tighter uppercase text-black">물려주기</h2>
          <p className="mt-4 text-gray-700 font-bold">다 읽은 책은 나누고, 새로운 책을 만나보세요</p>
          
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
                activeFilter === filter
                  ? 'bg-black text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-200 hover:border-black hover:text-black'
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
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-24 border-2 border-dashed border-gray-300 rounded-[2.5rem]">
                <p className="text-gray-600 font-bold text-lg">조건에 맞는 도서가 없습니다.</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-[2rem] border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full cursor-pointer">
                  {/* 도서 표지 이미지 */}
                  <div className="h-48 overflow-hidden relative bg-gray-100">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 flex space-x-2">
                      <span className={`px-2 py-1 rounded text-[10px] font-black tracking-widest text-white shadow-sm ${item.tradeType === '나눔' ? 'bg-green-500' : 'bg-purple-500'}`}>
                        {item.tradeType}
                      </span>
                    </div>
                  </div>
                  
                  {/* 도서 정보 */}
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-black mb-1 text-black line-clamp-1">{item.title}</h3>
                    <p className="text-xs font-bold text-gray-400 mb-4">{item.author}</p>
                    
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-500">
                      <span className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                        <span>{item.condition}</span>
                      </span>
                      <span>By {item.provider}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* 등록 모달창 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl my-8">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-gray-400 hover:text-black font-bold text-xl">✕</button>
            <h3 className="text-3xl font-black tracking-tighter mb-8 text-black">물려줄 책 등록</h3>
            
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">책 제목 *</label>
                <input type="text" className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black transition" placeholder="책 제목을 정확히 입력해주세요" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-500 mb-2">저자명 *</label>
                <input type="text" className="w-full border-b-2 border-gray-200 py-2 focus:border-black outline-none font-bold text-black transition" placeholder="지은이를 입력해주세요" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} required />
              </div>

              <div className="grid grid-cols-2 gap-6">
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
                <textarea className="w-full border-2 border-gray-100 rounded-2xl p-4 h-24 focus:border-black outline-none font-bold text-black transition resize-none" placeholder="어떤 책과 교환하고 싶은지, 혹은 책의 상태에 대해 자유롭게 적어주세요" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <button type="submit" className="w-full bg-black text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-800 transition shadow-lg mt-4">
                서재에 책 올리기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}