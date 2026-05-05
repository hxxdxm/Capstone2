"use client";
const API_BASE_URL = 'http://13.124.191.57:5000/api';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExhibitionPage() {
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  // ⭐️ 1. 더미데이터(initialExhibitionData) 완전 삭제! 처음엔 빈 바구니([])로 시작합니다.
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]); 
  
  const [newPost, setNewPost] = useState({
    quote: '',
    book: '',
    author: '',
    style: 'bg-white text-gray-900 border-gray-200',
    imagePreview: '' 
  });

  useEffect(() => {
    // 로그인 체크
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const storedName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }

    // ⭐️ 2. 화면이 켜질 때 백엔드 DB에서 실제 데이터 가져오기
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      // 백엔드의 필사 API 주소 (필요시 맞게 수정하세요)
      const res = await fetch(`${API_BASE_URL}/transcriptions`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        // 최신순으로 정렬해서 화면에 반영
        const sortedData = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPosts(sortedData);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewPost({ ...newPost, imagePreview: imageUrl });
    }
  };

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.quote || !newPost.book) {
      alert("문장과 책 제목은 필수입니다.");
      return;
    }

    // ⭐️ 3. 백엔드 DB로 새 글 전송하기 (실제 DB에 저장)
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/transcriptions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content: newPost.quote,
          bookTitle: newPost.book,
          authorName: newPost.author || "작자 미상",
          type: newPost.imagePreview ? "image" : "text",
          image: newPost.imagePreview || "", 
          bgStyle: newPost.style
        })
      });

      if (res.ok) {
        alert("전시회에 문장이 성공적으로 걸렸습니다!");
        setIsWriteModalOpen(false); 
        setNewPost({ quote: '', book: '', author: '', style: 'bg-white text-gray-900 border-gray-200', imagePreview: '' }); 
        fetchPosts(); // DB에 저장됐으니 목록 다시 불러오기
      } else {
        alert("업로드에 실패했습니다.");
      }
    } catch (error) {
      alert("서버 오류가 발생했습니다.");
    }
  };

  const toggleLike = (postId: string) => {
    setLikedPostIds((prev) => 
      prev.includes(postId) 
        ? prev.filter((id) => id !== postId) 
        : [...prev, postId] 
    );
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
        {isLoading ? (
          <div className="py-20 text-center font-bold text-gray-300">데이터를 불러오는 중입니다...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center font-bold text-gray-300">아직 등록된 전시글이 없습니다. 첫 번째 주인공이 되어주세요!</div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {posts.map((item) => {
              // DB에서 오는 id값 매칭 (_id 또는 id)
              const postId = item._id || item.id;
              const isLiked = likedPostIds.includes(postId);
              
              // 필드명이 백엔드와 다를 수 있어 호환되도록 처리
              const quote = item.content || item.quote;
              const bookTitle = item.bookTitle || item.book;
              const authorName = item.authorName || item.author;
              const bgStyle = item.bgStyle || item.bg || 'bg-white text-gray-900 border-gray-200';

              return (
                <article 
                  key={postId} 
                  className={`break-inside-avoid relative group rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border ${bgStyle}`}
                >
                  {item.type === 'image' && item.image ? (
                    <div className="relative aspect-[4/5] bg-gray-900">
                      <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-700" style={{ backgroundImage: `url(${item.image})` }}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                      <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                        <p className="font-serif text-lg leading-relaxed italic mb-6 break-keep whitespace-pre-line shadow-black drop-shadow-md">"{quote}"</p>
                        <div>
                          <p className="text-xs font-black mb-1">{bookTitle}</p>
                          <p className="text-[10px] text-gray-300">{authorName}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-8 h-full flex flex-col justify-between ${bgStyle}`}>
                      <p className="font-serif text-lg leading-relaxed italic mb-10 break-keep whitespace-pre-line">"{quote}"</p>
                      <div>
                        <p className="text-xs font-black mb-1">{bookTitle}</p>
                        <p className="text-[10px] opacity-70">{authorName}</p>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full border border-white/30 mix-blend-difference">
                      @{item.user || userName || '독서가'}
                    </span>
                    
                    <button 
                      onClick={() => toggleLike(postId)}
                      className="bg-white/90 w-8 h-8 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform focus:outline-none"
                    >
                      <svg 
                        className={`w-4 h-4 transition-colors duration-300 ${isLiked ? 'text-red-500' : 'text-gray-300 hover:text-red-300'}`} 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
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

      {/* 모달창 코드는 이전과 동일하게 유지 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
           {/* ... 모달창 내용 (위 코드에 연결되어 있음) ... */}
           {/* (전체 코드는 복사해서 붙여넣기 하시면 문제없이 들어갑니다!) */}
        </div>
      )}
    </div>
  );
}