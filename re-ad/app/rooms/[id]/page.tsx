"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id;

  const [roomData, setRoomData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  
  // ⭐️ [NEW] 탭 상태 (info: 모임 소개, feed: 피드)
  const [activeTab, setActiveTab] = useState('info');

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  // ⭐️ [NEW] 피드 데이터 상태 (임시 데이터로 디자인 확인)
  const [posts, setPosts] = useState<any[]>([
    {
      id: 2,
      author: "독서요정",
      content: "오늘 주말 모임 너무 즐거웠습니다! 다음 주에 읽을 책 사진 공유해요 📚",
      media: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600",
      mediaType: "image",
      likes: 5,
      comments: [{ id: 1, author: "책벌레", text: "사진 너무 예쁘게 나왔네요!" }],
      createdAt: new Date(Date.now() - 3600000).toISOString() // 1시간 전
    },
    {
      id: 1,
      author: "방장",
      content: "환영합니다! 가입하신 분들은 가볍게 인사말 남겨주세요~",
      media: null,
      mediaType: null,
      likes: 12,
      comments: [],
      createdAt: new Date(Date.now() - 86400000).toISOString() // 하루 전
    }
  ]);

  // 글쓰기 모달 상태
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{url: string, type: string} | null>(null);

  // 댓글 입력 상태
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});

  const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;

  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.id || payload.userId;
    } catch (e) { return null; }
  };

  const getMyName = () => typeof window !== 'undefined' ? (localStorage.getItem('userName') || sessionStorage.getItem('userName')) : '익명';

  useEffect(() => {
    if (!roomId) return;
    fetchRoomDetail();
  }, [roomId]);

  const fetchRoomDetail = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      const data = await res.json();
      if (!res.ok) throw new Error("방 정보 로드 실패");

      const myId = getMyId();
      const amIIn = data.members?.some((m: any) => m.userId === myId);
      
      setIsJoined(amIIn);
      setRoomData(data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      router.push('/rooms');
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm("정말로 이 모임방을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) return;
    const token = getToken();
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: getMyId() })
      });
      if (res.ok) { alert("모임방이 삭제되었습니다."); router.push('/rooms'); } 
      else { alert("삭제 권한이 없습니다."); }
    } catch (error) { alert("서버 연결 실패"); }
  };

  const executeJoin = async (password: string = '') => {
    const token = getToken();
    if (!token) { alert("로그인이 필요합니다."); router.push('/login'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: getMyId(), roomPassword: password })
      });
      if (res.ok) {
        alert('모임 참여 성공! 🎉');
        setIsPasswordModalOpen(false);
        fetchRoomDetail();
      } else {
        const result = await res.json();
        alert(result.message || '참여 실패');
      }
    } catch (error) { alert('서버 오류'); }
  };

  // ⭐️ [NEW] 미디어 첨부 핸들러 (사진/동영상)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setNewPostMedia({ url, type });
    }
  };

  // ⭐️ [NEW] 피드 게시물 등록
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return alert("내용을 입력해주세요.");

    const newPost = {
      id: Date.now(),
      author: getMyName() || "나",
      content: newPostContent,
      media: newPostMedia?.url || null,
      mediaType: newPostMedia?.type || null,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };

    // 최신순이 되도록 배열 맨 앞에 추가
    setPosts([newPost, ...posts]);
    setIsWriteModalOpen(false);
    setNewPostContent('');
    setNewPostMedia(null);
  };

  // ⭐️ [NEW] 좋아요 토글
  const handleLike = (postId: number) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  };

  // ⭐️ [NEW] 댓글 달기
  const handleAddComment = (postId: number) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;

    setPosts(posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...p.comments, { id: Date.now(), author: getMyName() || "나", text: commentText }]
        };
      }
      return p;
    }));
    setCommentInputs({ ...commentInputs, [postId]: '' }); // 입력창 초기화
  };

  if (isLoading || !roomData) return <div className="p-20 text-center font-black">데이터를 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans">
      <header className="bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-40">
        <Link href="/" className="text-2xl font-black tracking-tighter">교환<span className="text-gray-400">독서</span></Link>
        <Link href="/rooms" className="text-sm font-bold text-gray-400 hover:text-black transition">라운지로</Link>
      </header>

      <main className="mx-auto max-w-5xl px-6 mt-12">
        {/* 모임방 헤더 정보 */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roomData.roomType === '온라인' ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'}`}>
                {roomData.roomType}
              </span>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500">
                {roomData.category === 'READING' ? '독서모임' : '도서교환'}
              </span>
            </div>
            <h2 className="text-4xl font-black mb-2 leading-tight">{roomData.roomName}</h2>
            <p className="text-sm font-bold text-gray-400">참여 멤버 {roomData.members?.length || 0} / {roomData.maxMembers}명</p>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            {roomData.hostId === getMyId() && (
              <button onClick={handleDeleteRoom} className="px-5 py-3 border border-red-200 text-red-500 rounded-2xl text-xs font-bold hover:bg-red-50 transition whitespace-nowrap">
                모임 삭제
              </button>
            )}
            {!isJoined && (
              <button 
                onClick={() => (roomData.roomPassword ? setIsPasswordModalOpen(true) : executeJoin())}
                disabled={roomData.members?.length >= roomData.maxMembers}
                className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition disabled:bg-gray-300"
              >
                {roomData.members?.length >= roomData.maxMembers ? "정원 초과" : "모임 참여하기"}
              </button>
            )}
          </div>
        </section>

        {/* ⭐️ [NEW] 탭 네비게이션 */}
        <nav className="flex space-x-6 border-b-2 border-gray-100 mb-8 px-2">
          <button 
            onClick={() => setActiveTab('info')}
            className={`pb-4 text-lg font-black transition-colors ${activeTab === 'info' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-black'}`}
          >
            모임 소개
          </button>
          <button 
            onClick={() => {
              if(!isJoined) return alert("모임에 참여해야 피드를 볼 수 있습니다.");
              setActiveTab('feed');
            }}
            className={`pb-4 text-lg font-black transition-colors flex items-center space-x-2 ${activeTab === 'feed' ? 'border-b-4 border-black text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <span>피드</span>
            {!isJoined && <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
          </button>
        </nav>

        {/* 탭 콘텐츠 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 중앙 메인 콘텐츠 */}
          <div className="lg:col-span-8">
            
            {/* --- 탭 1: 모임 소개 --- */}
            {activeTab === 'info' && (
              <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm animate-in fade-in duration-300">
                <h3 className="text-xl font-black mb-6">모임 소개</h3>
                <p className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap break-keep">
                  {roomData.roomDesc || "작성된 소개글이 없습니다."}
                </p>
                {roomData.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-50">
                    {roomData.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-gray-50 text-xs font-bold text-gray-400 rounded-lg">#{tag}</span>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* --- ⭐️ 탭 2: 피드 (게시판) --- */}
            {activeTab === 'feed' && isJoined && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* 글쓰기 입력창 (버튼 역할) */}
                <div 
                  onClick={() => setIsWriteModalOpen(true)}
                  className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm cursor-text hover:border-gray-300 transition-colors flex items-center space-x-4"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-black text-gray-500 flex-shrink-0">
                    {getMyName()?.charAt(0) || '나'}
                  </div>
                  <div className="flex-1 bg-gray-50 px-6 py-3.5 rounded-full text-sm font-bold text-gray-400">
                    멤버들과 나누고 싶은 이야기를 적어보세요.
                  </div>
                  <div className="flex space-x-2 text-gray-400">
                    <svg className="w-6 h-6 hover:text-black transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <svg className="w-6 h-6 hover:text-black transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </div>
                </div>

                {/* 피드 게시물 리스트 */}
                {posts.map((post) => (
                  <article key={post.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    {/* 작성자 정보 */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black">{post.author}</p>
                          <p className="text-[10px] text-gray-400 font-bold">{new Date(post.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* 본문 내용 */}
                    <p className="text-gray-800 leading-relaxed mb-6 whitespace-pre-wrap break-keep">{post.content}</p>

                    {/* 첨부 미디어 (사진/동영상) */}
                    {post.media && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                        {post.mediaType === 'video' ? (
                          <video src={post.media} controls className="w-full max-h-[500px] object-contain bg-black" />
                        ) : (
                          <img src={post.media} alt="첨부 이미지" className="w-full max-h-[500px] object-cover" />
                        )}
                      </div>
                    )}

                    {/* 액션 버튼 (좋아요, 댓글 수) */}
                    <div className="flex items-center space-x-6 border-t border-gray-50 pt-4 mb-4">
                      <button onClick={() => handleLike(post.id)} className="flex items-center space-x-2 text-gray-500 hover:text-red-500 transition group">
                        <svg className={`w-5 h-5 ${post.likes > 0 ? 'text-red-500' : 'group-hover:scale-110'}`} fill={post.likes > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                        <span className="text-xs font-bold">{post.likes}</span>
                      </button>
                      <div className="flex items-center space-x-2 text-gray-500">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <span className="text-xs font-bold">{post.comments.length}</span>
                      </div>
                    </div>

                    {/* 댓글 영역 */}
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                      {post.comments.map((comment: any) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500 flex-shrink-0">
                            {comment.author.charAt(0)}
                          </div>
                          <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm text-sm">
                            <span className="font-black mr-2 text-xs">{comment.author}</span>
                            <span className="text-gray-700">{comment.text}</span>
                          </div>
                        </div>
                      ))}
                      
                      {/* 댓글 입력창 */}
                      <div className="flex items-center space-x-2 mt-2">
                        <input 
                          type="text" 
                          placeholder="댓글을 남겨보세요..." 
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs focus:outline-none focus:border-black transition"
                        />
                        <button 
                          onClick={() => handleAddComment(post.id)}
                          className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition"
                        >
                          <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                      </div>
                    </div>

                  </article>
                ))}
              </div>
            )}
          </div>

          {/* 오른쪽 사이드바 (정보란) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm sticky top-24">
              <h4 className="text-sm font-black text-gray-400 mb-6 tracking-widest uppercase">Room Info</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600">
                <li className="flex justify-between border-b border-gray-50 pb-2"><span>진행 방식</span><span className="text-black">{roomData.roomType}</span></li>
                <li className="flex justify-between border-b border-gray-50 pb-2"><span>최대 인원</span><span className="text-black">{roomData.maxMembers}명</span></li>
                <li className="flex justify-between border-b border-gray-50 pb-2"><span>개설일</span><span className="text-black">{new Date(roomData.createdAt).toLocaleDateString()}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* ⭐️ [NEW] 글쓰기 모달창 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <h3 className="text-lg font-black">게시물 작성</h3>
              <button onClick={() => {setIsWriteModalOpen(false); setNewPostMedia(null);}} className="text-gray-400 hover:text-black transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitPost} className="p-8">
              <textarea 
                placeholder="어떤 이야기를 나누고 싶으신가요?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="w-full h-32 bg-transparent text-lg focus:outline-none resize-none placeholder-gray-300"
              ></textarea>

              {/* 미디어 미리보기 */}
              {newPostMedia && (
                <div className="relative mt-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 inline-block">
                  {newPostMedia.type === 'video' ? (
                    <video src={newPostMedia.url} className="h-32 object-contain" />
                  ) : (
                    <img src={newPostMedia.url} alt="preview" className="h-32 object-cover" />
                  )}
                  <button 
                    type="button" 
                    onClick={() => setNewPostMedia(null)}
                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-50">
                <div className="flex space-x-2">
                  {/* 사진/동영상 첨부 버튼 */}
                  <label className="cursor-pointer text-gray-400 hover:text-blue-500 transition p-2 rounded-full hover:bg-blue-50">
                    <input type="file" accept="image/*, video/*" onChange={handleMediaUpload} className="hidden" />
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </label>
                  <label className="cursor-pointer text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50">
                     <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </label>
                </div>
                <button 
                  type="submit" 
                  disabled={!newPostContent.trim()}
                  className="bg-black text-white px-8 py-3 rounded-full font-black text-sm hover:bg-gray-800 transition disabled:bg-gray-200"
                >
                  게시하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 (유지) */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
             {/* ...기존 코드 동일... */}
          </div>
        </div>
      )}
    </div>
  );
}