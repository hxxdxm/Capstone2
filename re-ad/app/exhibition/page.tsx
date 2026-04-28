"use client";
const API_BASE_URL = 'http://13.124.191.57:5000/api';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 초기 전시 데이터
const initialExhibitionData = [
  {
    id: 1, type: "text", quote: "우리는 모두 별빛으로 만들어진 존재들이다.", book: "코스모스", author: "칼 세이건", user: "starlight_99", likes: 128, bg: "bg-white text-gray-900 border-gray-200"
  },
  {
    id: 2, type: "image", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600", quote: "다정한 것이 살아남는다.\n그것은 진화의 역사에서 가장 위대한 무기였다.", book: "다정한 것이 살아남는다", author: "브라이언 헤어", user: "reader_mind", likes: 342,
  },
  {
    id: 3, type: "text", quote: "인생은 탐구하면서 살아가는 것이 아니라, 살아가면서 탐구하는 것이다.", book: "모순", author: "양귀자", user: "booklover", likes: 89, bg: "bg-gray-900 text-white border-gray-900" 
  },
  {
    id: 4, type: "text", quote: "결국 중요한 건 속도가 아니라 방향이다.", book: "마흔에 읽는 쇼펜하우어", author: "강용수", user: "slow_walker", likes: 45, bg: "bg-[#FDFBF7] text-gray-800 border-orange-100"
  },
  {
    id: 5, type: "image", image: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600", quote: "사랑은 언제나 그곳에 있다. 우리가 보지 못할 뿐.", book: "사랑의 기술", author: "에리히 프롬", user: "romantic_read", likes: 210,
  },
];

export default function ExhibitionPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const [posts, setPosts] = useState<any[]>(initialExhibitionData);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  
  // ⭐️ [NEW] 이미지 파일과 미리보기를 저장할 상태 추가
  const [newPost, setNewPost] = useState({
    quote: '',
    book: '',
    author: '',
    style: 'bg-white text-gray-900 border-gray-200',
    imagePreview: '' // 사진 미리보기 URL
  });

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }
  }, []);

  // ⭐️ [NEW] 사진 업로드 시 미리보기 생성 함수
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일을 브라우저에서 바로 볼 수 있는 임시 URL로 변환
      const imageUrl = URL.createObjectURL(file);
      setNewPost({ ...newPost, imagePreview: imageUrl });
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.quote || !newPost.book) {
      alert("문장과 책 제목은 필수입니다.");
      return;
    }

    // ⭐️ [NEW] 사진이 있으면 'image' 타입으로, 없으면 'text' 타입으로 저장
    const createdPost = {
      id: posts.length + 1,
      type: newPost.imagePreview ? "image" : "text",
      image: newPost.imagePreview || undefined, // 사진이 있을 때만 이미지 URL 저장
      quote: newPost.quote,
      book: newPost.book,
      author: newPost.author || "작자 미상",
      user: userName || "독서가",
      likes: 0,
      bg: newPost.style
    };

    setPosts([createdPost, ...posts]); 
    setIsWriteModalOpen(false); 
    setNewPost({ quote: '', book: '', author: '', style: 'bg-white text-gray-900 border-gray-200', imagePreview: '' }); 
    alert("전시회에 문장이 성공적으로 걸렸습니다!");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100 shadow-sm">
        <Link href="/" className="flex items-center space-x-2">
          <h1 className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></h1>
        </Link>
        <Link href="/" className="text-sm font-bold text-gray-400 hover:text-black transition">
          홈으로
        </Link>
      </header>

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

      <main className="mx-auto max-w-7xl px-6">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {posts.map((item) => (
            <article 
              key={item.id} 
              className={`break-inside-avoid relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border ${item.bg || 'border-transparent'}`}
            >
              {item.type === 'image' ? (
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
                <div className={`p-8 h-full flex flex-col justify-between ${item.bg}`}>
                  <p className="font-serif text-lg leading-relaxed italic mb-10 break-keep whitespace-pre-line">"{item.quote}"</p>
                  <div>
                    <p className="text-xs font-black mb-1">{item.book}</p>
                    <p className="text-[10px] opacity-70">{item.author}</p>
                  </div>
                </div>
              )}

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

      <button 
        onClick={() => {
          if(!isLoggedIn) { alert("문장을 기록하려면 로그인이 필요합니다."); router.push('/login'); return; }
          setIsWriteModalOpen(true);
        }}
        className="fixed bottom-10 right-10 z-30 w-16 h-16 bg-black text-white rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
      </button>

      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-black tracking-tighter">새 문장 기록하기</h3>
              <button onClick={() => setIsWriteModalOpen(false)} className="text-gray-400 hover:text-gray-900 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="p-8 space-y-6 overflow-y-auto no-scrollbar">
              
              {/* ⭐️ [NEW] 손글씨 사진 첨부 영역 */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">손글씨 사진 첨부 (선택)</label>
                <div className="flex items-center space-x-4">
                  {newPost.imagePreview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm border border-gray-200">
                      <img src={newPost.imagePreview} alt="preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                  )}
                  
                  <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:border-black hover:text-black transition shadow-sm">
                    {newPost.imagePreview ? '사진 변경' : '사진 업로드'}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  
                  {newPost.imagePreview && (
                    <button 
                      type="button" 
                      onClick={() => setNewPost({...newPost, imagePreview: ''})} 
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      삭제
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 mt-2">사진을 첨부하면 갤러리에 이미지 모드로 전시됩니다.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">기억하고 싶은 문장</label>
                <textarea 
                  placeholder="당신의 영혼을 흔든 문장을 적어주세요." 
                  rows={3}
                  value={newPost.quote}
                  onChange={(e) => setNewPost({...newPost, quote: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition resize-none font-serif italic"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">책 제목</label>
                  <input 
                    type="text" 
                    placeholder="예: 다정한 것이 살아남는다" 
                    value={newPost.book}
                    onChange={(e) => setNewPost({...newPost, book: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">저자</label>
                  <input 
                    type="text" 
                    placeholder="예: 브라이언 헤어" 
                    value={newPost.author}
                    onChange={(e) => setNewPost({...newPost, author: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold"
                  />
                </div>
              </div>

              {/* 사진이 없을 때만 갤러리 테마 선택 창 보이기 */}
              {!newPost.imagePreview && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">텍스트 테마 선택</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      type="button"
                      onClick={() => setNewPost({...newPost, style: 'bg-white text-gray-900 border-gray-200'})}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center text-xs font-bold bg-white text-gray-900 transition ${newPost.style.includes('bg-white') ? 'border-black' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      순백
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewPost({...newPost, style: 'bg-gray-900 text-white border-gray-900'})}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center text-xs font-bold bg-gray-900 text-white transition ${newPost.style.includes('bg-gray-900') ? 'border-gray-400' : 'border-gray-900 hover:border-gray-700'}`}
                    >
                      심연
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewPost({...newPost, style: 'bg-[#FDFBF7] text-gray-800 border-orange-100'})}
                      className={`h-12 rounded-xl border-2 flex items-center justify-center text-xs font-bold bg-[#FDFBF7] text-gray-800 transition ${newPost.style.includes('FDFBF7') ? 'border-black' : 'border-orange-100 hover:border-orange-300'}`}
                    >
                      미색
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="w-full mt-4 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-lg tracking-widest"
              >
                전시하기
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}