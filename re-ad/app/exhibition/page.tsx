"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ExhibitionPage() {
  const [filter, setFilter] = useState('ALL');
  
  // ⭐️ [백엔드 연동] EC2 서버에서 가져온 전시회 데이터를 담을 공간
  const [exhibitionData, setExhibitionData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ⭐️ [백엔드 연동] 화면이 켜지자마자 백엔드로 요청 쏘기
  useEffect(() => {
    // 팀장님의 EC2 서버 주소 (최신 피드 10개 가져오는 API)
    fetch('http://13.124.191.57:5000/api/annotations/exhibition')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // 백엔드에서 받은 실제 데이터를 프론트엔드 디자인 틀에 맞게 변환 (가공)
          const formattedData = data.map((item) => ({
            id: item._id,
            // 사진이 있으면 image 타입, 없으면 text 타입으로 분류
            type: item.annotationType === 'PHOTO_MEMO' || item.imageUrl ? 'image' : 'text',
            image: item.imageUrl,
            quote: item.quote,
            book: item.bookId?.title || '알 수 없는 책',
            author: '교환독서', // (참고: 백엔드 전시회 API에서 현재 작가 데이터는 안 보내줌)
            user: item.userId?.nickname || '익명의 독서가',
            likes: Math.floor(Math.random() * 200), // 아직 백엔드 좋아요 기능이 없으므로 임시 랜덤 숫자
            bg: item.color || "bg-white text-gray-900 border-gray-200" // 배경색
          }));
          setExhibitionData(formattedData);
        } else {
          // ⚠️ 만약 서버에 아직 아무도 글을 안 썼다면(텅 비었다면) 보여줄 기본 샘플 데이터
          setExhibitionData([
            {
              id: 'sample1', type: "image", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
              quote: "다정한 것이 살아남는다.\n그것은 진화의 역사에서 가장 위대한 무기였다.",
              book: "다정한 것이 살아남는다", author: "브라이언 헤어", user: "reader_mind", likes: 342, bg: ""
            },
            {
              id: 'sample2', type: "text", quote: "인생은 탐구하면서 살아가는 것이 아니라, 살아가면서 탐구하는 것이다.",
              book: "모순", author: "양귀자", user: "booklover", likes: 89,
              bg: "bg-gray-900 text-white border-gray-900" 
            }
          ]);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("전시회 데이터 불러오기 에러:", err);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      
      {/* 1. 상단 헤더 */}
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
      </header>

      {/* 2. 전시회 히어로 배너 */}
      <section className="px-6 py-12 md:py-20 mx-auto max-w-7xl text-center">
        <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-6 rounded-full">
          ONLINE EXHIBITION
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black italic mb-6 tracking-tight text-gray-900">
          당신의 밑줄, <br className="md:hidden" />우리의 영감
        </h2>
        <p className="text-sm md:text-base text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          교환독서 멤버들이 직접 남긴 인생 문장들을 갤러리처럼 감상해 보세요. <br className="hidden md:block"/>
          마음에 드는 문장은 내 서재로 스크랩할 수 있습니다.
        </p>
      </section>

      {/* 3. 필터 네비게이션 */}
      <nav className="flex justify-center space-x-2 md:space-x-4 mb-12 px-6">
        {['ALL', 'TRENDING', 'NEW', 'EDITOR PICK'].map((item) => (
          <button 
            key={item}
            onClick={() => setFilter(item)}
            className={`px-5 py-2 rounded-full text-xs font-black tracking-widest transition-all ${
              filter === item 
                ? 'bg-black text-white shadow-md' 
                : 'bg-white text-gray-400 border border-gray-200 hover:border-black hover:text-black'
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* 로딩 중일 때 표시할 UI */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        /* 4. 메이슨리(Masonry) 갤러리 그리드 (백엔드 데이터 매핑) */
        <main className="mx-auto max-w-7xl px-6">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            
            {exhibitionData.map((item) => (
              <article 
                key={item.id} 
                className={`break-inside-avoid relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border ${item.bg || 'border-transparent'}`}
              >
                {item.type === 'image' ? (
                  // 이미지형 카드
                  <div className="relative aspect-[4/5] bg-gray-900">
                    <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url(${item.image})` }}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                      <p className="font-serif text-lg leading-relaxed italic mb-6 break-keep whitespace-pre-line shadow-black drop-shadow-md">"{item.quote}"</p>
                      <div>
                        <p className="text-xs font-black mb-1">{item.book}</p>
                        <p className="text-[10px] text-gray-300">{item.author}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 텍스트형 카드
                  <div className={`p-8 h-full flex flex-col justify-between ${item.bg}`}>
                    <p className="font-serif text-lg leading-relaxed italic mb-10 break-keep">"{item.quote}"</p>
                    <div>
                      <p className="text-xs font-black mb-1">{item.book}</p>
                      <p className="text-[10px] opacity-70">{item.author}</p>
                    </div>
                  </div>
                )}

                {/* 하단 공통 정보 (작성자 & 좋아요) */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full border border-white/30 mix-blend-difference">
                    @{item.user}
                  </span>
                  <button className="bg-white/90 text-red-500 w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
                  </button>
                </div>
              </article>
            ))}

          </div>
        </main>
      )}

      {/* 5. 더보기 버튼 */}
      {!isLoading && (
        <div className="mt-16 text-center">
          <button className="px-8 py-3 bg-white border border-gray-200 text-sm font-bold text-gray-500 rounded-full hover:border-black hover:text-black transition shadow-sm">
            더 많은 문장 불러오기
          </button>
        </div>
      )}

    </div>
  );
}
