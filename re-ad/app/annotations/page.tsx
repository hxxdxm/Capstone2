"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function ExhibitionPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [posts, setPosts] = useState<any[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);
  
  const [newPost, setNewPost] = useState({
    quote: '',
    book: '',
    author: '',
    style: 'bg-white text-gray-900 border-gray-200',
    imagePreview: '' 
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
    const token = getToken();
    const storedName = localStorage.getItem('userName') || sessionStorage.getItem('userName');
    if (token && storedName && storedName !== 'undefined') {
      setIsLoggedIn(true);
      setUserName(storedName);
    }
    fetchExhibitions();
  }, []);

  const fetchExhibitions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/annotations/exhibition`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        const myId = getMyId();
        const initialLikedIds: string[] = [];

        const formattedData = data.map((apiItem: any) => {
          if (myId && apiItem.likes && apiItem.likes.includes(myId)) {
            initialLikedIds.push(apiItem._id);
          }

          const hasImage = apiItem.imageUrl || apiItem.image_url;
          return {
            id: apiItem._id, 
            type: hasImage ? "image" : "text",
            image: hasImage,
            quote: apiItem.quote || apiItem.content,
            book: apiItem.bookId?.title || '도서',
            author: '작자미상', 
            user: apiItem.userId?.nickname || '익명',
            likes: apiItem.likes?.length || 0,
            bg: apiItem.color || "bg-white text-gray-900 border-gray-200"
          };
        });

        setPosts(formattedData);
        setLikedPostIds(initialLikedIds);
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
    const token = getToken();
    
    if (!token) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!newPost.quote || !newPost.book) {
      alert("문장과 책 제목은 필수입니다.");
      return;
    }

    const payload = {
      userId: getMyId(),
      annotationType: 'QUOTE_TEXT',
      quote: newPost.quote,
      color: newPost.style 
    };

    try {
      const res = await fetch(`${API_BASE_URL}/annotations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("전시회에 문장이 성공적으로 걸렸습니다! 🎉");
        setIsWriteModalOpen(false); 
        setNewPost({ quote: '', book: '', author: '', style: 'bg-white text-gray-900 border-gray-200', imagePreview: '' }); 
        fetchExhibitions(); 
      } else {
        alert("등록에 실패했습니다.");
      }
    } catch (error) {
      alert("서버 통신 에러");
    }
  };

  const toggleLike = async (postId: string) => {
    const token = getToken();
    if (!token) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/annotations/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        
        setLikedPostIds((prev) => 
          prev.includes(postId) 
            ? prev.filter((id) => id !== postId) 
            : [...prev, postId] 
        );

        setPosts((prevPosts) => 
          prevPosts.map((post) => 
            post.id === postId 
              ? { ...post, likes: result.likesCount } 
              : post
          )
        );
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      <Header />

      {/* 📍 필터가 삭제된 만큼 mb-12를 추가하여 아래 갤러리와의 여백을 자연스럽게 맞췄습니다. */}
      <section className="px-6 py-12 md:py-20 mx-auto max-w-7xl text-center mb-12">
        <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-6 rounded-full">
          ONLINE EXHIBITION
        </span>
        <h2 className="text-4xl md:text-6xl font-serif font-black italic mb-6 tracking-tight text-gray-900">
          당신의 밑줄, <br className="md:hidden" />우리의 영감
        </h2>
        <p className="text-sm md:text-base text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
          교환독서 멤버들이 직접 남긴 인생 문장들을 갤러리처럼 감상해 보세요.
        </p>
      </section>

      <main className="mx-auto max-w-7xl px-6">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-400 font-bold">
                전시된 필사가 없습니다. 첫 번째 영감을 기록해 보세요!
              </div>
            ) : (
              posts.map((item) => {
                const isLiked = likedPostIds.includes(item.id);

                return (
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
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-xs font-black mb-1">{item.book}</p>
                            <p className="text-[10px] opacity-70">{item.author}</p>
                          </div>
                          <span className="text-[10px] font-black opacity-40">♥ {item.likes}</span>
                        </div>
                      </div>
                    )}

                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black px-3 py-1.5 rounded-full border border-white/30 mix-blend-difference">
                        @{item.user}
                      </span>
                      
                      <button 
                        onClick={() => toggleLike(item.id)}
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
              })
            )}
          </div>
        )}
      </main>

      <button 
        onClick={() => {
          if(!isLoggedIn) { alert("로그인이 필요합니다."); router.push('/login'); return; }
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
                    placeholder="예: 모순" 
                    value={newPost.book}
                    onChange={(e) => setNewPost({...newPost, book: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2">저자</label>
                  <input 
                    type="text" 
                    placeholder="예: 양귀자" 
                    value={newPost.author}
                    onChange={(e) => setNewPost({...newPost, author: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">텍스트 테마 선택</label>
                <div className="grid grid-cols-3 gap-3">
                  <button type="button" onClick={() => setNewPost({...newPost, style: 'bg-white text-gray-900 border-gray-200'})} className="h-10 rounded-xl border bg-white text-xs font-bold">순백</button>
                  <button type="button" onClick={() => setNewPost({...newPost, style: 'bg-gray-900 text-white border-gray-900'})} className="h-10 rounded-xl border bg-gray-900 text-white text-xs font-bold">심연</button>
                  <button type="button" onClick={() => setNewPost({...newPost, style: 'bg-[#FDFBF7] text-gray-800 border-orange-100'})} className="h-10 rounded-xl border bg-[#FDFBF7] text-xs font-bold">미색</button>
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition tracking-widest">전시하기</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}