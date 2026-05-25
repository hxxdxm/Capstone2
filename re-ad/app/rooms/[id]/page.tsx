"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';
const SOCKET_URL = 'http://13.124.191.57:5000';

export default function RoomDetailPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string;

  const [roomData, setRoomData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoined, setIsJoined] = useState(false);
  
  const [activeTab, setActiveTab] = useState('info');

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [inputPassword, setInputPassword] = useState('');

  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editRoomDesc, setEditRoomDesc] = useState('');

  // --- 피드 관련 상태 ---
  const [posts, setPosts] = useState<any[]>([
    {
      id: 2, author: "독서요정", content: "오늘 주말 모임 너무 즐거웠습니다! 다음 주에 읽을 책 사진 공유해요 📚",
      media: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600", mediaType: "image", likes: 5, likedByMe: false,
      comments: [{ id: 1, author: "책벌레", text: "사진 너무 예쁘게 나왔네요!" }], createdAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 1, author: "방장", content: "환영합니다! 가입하신 분들은 가볍게 인사말 남겨주세요~",
      media: null, mediaType: null, likes: 12, likedByMe: true, comments: [], createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{url: string, type: string} | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});

  // --- 채팅 관련 상태 ---
  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true); // 사용자가 맨 아래를 보고 있는지 여부

  // ⭐️ 안전한 토큰 추출 함수 (유지)
  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  };
  
  // ⭐️ 백엔드와 통신할 때 getSafeToken을 사용하도록 변경
  const getMyId = () => {
    const token = getSafeToken();
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
      
      setEditRoomDesc(data.description || data.roomDesc || ''); 
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      router.push('/rooms');
    }
  };

  const handleDeleteRoom = async () => {
    if (!confirm("정말로 이 모임방을 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.")) return;
    const token = getSafeToken(); // 📍 적용
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
    const token = getSafeToken(); // 📍 적용
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

  const handleUpdateDesc = async () => {
    const token = getSafeToken(); // 📍 적용
    if (!token) return alert("로그인이 필요합니다.");
    
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ description: editRoomDesc })
      });
      
      if (res.ok) {
        setRoomData({ ...roomData, description: editRoomDesc, roomDesc: editRoomDesc });
        setIsEditingInfo(false);
      } else {
        alert("수정 실패: 방장 권한이 없거나 서버 오류입니다.");
      }
    } catch (error) {
      alert("서버와 연결할 수 없습니다.");
    }
  };

  // --- 피드 핸들러 (유지) ---
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const type = file.type.startsWith('video/') ? 'video' : 'image';
      setNewPostMedia({ url, type });
    }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return alert("내용을 입력해주세요.");
    const newPost = {
      id: Date.now(), author: getMyName() || "나", content: newPostContent,
      media: newPostMedia?.url || null, mediaType: newPostMedia?.type || null,
      likes: 0, likedByMe: false, comments: [], createdAt: new Date().toISOString()
    };
    setPosts([newPost, ...posts]);
    setIsWriteModalOpen(false); setNewPostContent(''); setNewPostMedia(null);
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        const isLiked = p.likedByMe;
        return { 
          ...p, 
          likes: isLiked ? p.likes - 1 : p.likes + 1,
          likedByMe: !isLiked 
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: number) => {
    const commentText = commentInputs[postId];
    if (!commentText?.trim()) return;
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...p.comments, { id: Date.now(), author: getMyName() || "나", text: commentText }] };
      }
      return p;
    }));
    setCommentInputs({ ...commentInputs, [postId]: '' }); 
  };

  // --- 채팅 핸들러 및 useEffect ---

  // 스크롤 위치 감지: 맨 아래인지 체크
  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    const threshold = 80; // 아래에서 80px 이내면 "맨 아래" 로 간주
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  // 맨 아래로 즉시 이동
  const scrollToBottom = (smooth = false) => {
    const el = chatContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  };

  useEffect(() => {
    if (!isJoined || activeTab !== 'chat') return;
    
    const token = getSafeToken();
    if (!token) {
      console.warn("토큰이 없어 과거 채팅을 불러오지 못했습니다.");
      return;
    }

    fetch(`${API_BASE_URL}/chats/${roomId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setChats(data);
          // 과거 채팅 로드 후 맨 아래로 즉시 이동 (애니메이션 없이)
          setTimeout(() => scrollToBottom(false), 0);
        }
      })
      .catch(err => console.error("과거 채팅 로드 실패:", err));

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { token: token },
      extraHeaders: { Authorization: `Bearer ${token}` }
    });
    setSocket(newSocket);

    newSocket.emit('joinRoom', roomId);

    newSocket.on('receiveMessage', (chatData: any) => {
      setChats((prev) => [...prev, chatData]);
    });

    return () => { newSocket.disconnect(); };
  }, [isJoined, activeTab, roomId]);

  // 새 메시지 도착 시: 사용자가 맨 아래를 보고 있을 때만 자동 스크롤
  useEffect(() => {
    if (chats.length === 0) return;
    if (isAtBottomRef.current) {
      scrollToBottom(true);
    }
  }, [chats]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const myId = getMyId();
    if (!socket || !currentMessage.trim() || !myId) return;

    socket.emit('sendMessage', {
      roomId: roomId,
      userId: myId,
      message: currentMessage
    });

    setCurrentMessage(''); 
  };

  if (isLoading || !roomData) return <div className="p-20 text-center font-black text-black">데이터를 불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      <Header />

      <main className="mx-auto max-w-5xl px-6 mt-12">
        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${roomData.roomType === '온라인' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                {roomData.roomType}
              </span>
            </div>
            <h2 className="text-4xl font-black mb-2 leading-tight text-black">{roomData.roomName}</h2>
            <p className="text-sm font-bold text-gray-500">참여 멤버 {roomData.members?.length || 0} / {roomData.maxMembers}명</p>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            {roomData.hostId === getMyId() && (
              <button onClick={handleDeleteRoom} className="px-5 py-3 border border-red-200 text-red-600 rounded-2xl text-xs font-bold hover:bg-red-50 transition whitespace-nowrap">
                모임 삭제
              </button>
            )}
            {!isJoined && (
              <button 
                onClick={() => (roomData.roomPassword ? setIsPasswordModalOpen(true) : executeJoin())}
                disabled={roomData.members?.length >= roomData.maxMembers}
                className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-2xl text-sm font-black hover:bg-gray-800 transition disabled:bg-gray-400"
              >
                {roomData.members?.length >= roomData.maxMembers ? "정원 초과" : "모임 참여하기"}
              </button>
            )}
          </div>
        </section>

        <nav className="flex space-x-8 border-b-2 border-gray-200 mb-8 px-2">
          <button onClick={() => setActiveTab('info')} className={`pb-4 text-lg font-black transition-colors ${activeTab === 'info' ? 'border-b-4 border-black text-black' : 'text-gray-500 hover:text-black'}`}>
            모임 소개
          </button>
          <button 
            onClick={() => { if(!isJoined) return alert("모임에 참여해야 피드를 볼 수 있습니다."); setActiveTab('feed'); }}
            className={`pb-4 text-lg font-black transition-colors flex items-center space-x-2 ${activeTab === 'feed' ? 'border-b-4 border-black text-black' : 'text-gray-500 hover:text-black'}`}
          >
            <span>피드</span>{!isJoined && <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
          </button>
          <button 
            onClick={() => { if(!isJoined) return alert("모임에 참여해야 채팅이 가능합니다."); setActiveTab('chat'); }}
            className={`pb-4 text-lg font-black transition-colors flex items-center space-x-2 ${activeTab === 'chat' ? 'border-b-4 border-black text-black' : 'text-gray-500 hover:text-black'}`}
          >
            <span>실시간 채팅</span>{!isJoined && <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 flex flex-col">
            {/* --- 탭 1: 모임 소개 --- */}
            {activeTab === 'info' && (
              <section className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm animate-in fade-in duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black text-black">모임 소개</h3>
                  {roomData.hostId === getMyId() && !isEditingInfo && (
                    <button onClick={() => setIsEditingInfo(true)} className="text-xs font-bold text-gray-500 hover:text-black underline">수정하기</button>
                  )}
                </div>

                {isEditingInfo ? (
                  <div className="space-y-4">
                    <textarea 
                      className="w-full border-2 border-gray-200 rounded-xl p-4 text-gray-800 font-bold focus:border-black outline-none h-40 resize-none"
                      value={editRoomDesc}
                      onChange={(e) => setEditRoomDesc(e.target.value)}
                    />
                    <div className="flex justify-end space-x-2">
                      <button onClick={() => setIsEditingInfo(false)} className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-lg">취소</button>
                      <button onClick={handleUpdateDesc} className="px-4 py-2 bg-black text-white text-sm font-black rounded-lg">저장</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 font-bold leading-relaxed text-lg whitespace-pre-wrap break-keep">
                    {roomData.description || roomData.roomDesc || "작성된 소개글이 없습니다."}
                  </p>
                )}

                {roomData.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-100">
                    {roomData.tags.map((tag: string, i: number) => <span key={i} className="px-3 py-1.5 bg-gray-100 text-xs font-bold text-gray-600 rounded-lg">#{tag}</span>)}
                  </div>
                )}
              </section>
            )}

            {/* --- 탭 2: 피드 --- */}
            {activeTab === 'feed' && isJoined && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div onClick={() => setIsWriteModalOpen(true)} className="bg-black p-4 rounded-[2rem] shadow-md cursor-pointer hover:bg-gray-800 transition-colors flex items-center justify-between group">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-black text-white flex-shrink-0">{getMyName()?.charAt(0) || '나'}</div>
                    <span className="text-sm font-bold text-white/80 group-hover:text-white">멤버들과 나누고 싶은 이야기를 적어보세요.</span>
                  </div>
                  <span className="bg-white text-black text-xs font-black px-4 py-2 rounded-full">게시글 쓰기 +</span>
                </div>

                {posts.map((post) => (
                  <article key={post.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black text-lg">{post.author.charAt(0)}</div>
                        <div><p className="font-black text-black">{post.author}</p><p className="text-[10px] text-gray-500 font-bold">{new Date(post.createdAt).toLocaleString()}</p></div>
                      </div>
                    </div>
                    <p className="text-gray-800 font-bold leading-relaxed mb-6 whitespace-pre-wrap break-keep">{post.content}</p>
                    {post.media && (
                      <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                        {post.mediaType === 'video' ? <video src={post.media} controls className="w-full max-h-[500px] object-contain bg-black" /> : <img src={post.media} alt="첨부 이미지" className="w-full max-h-[500px] object-cover" />}
                      </div>
                    )}
                    <div className="flex items-center space-x-6 border-t border-gray-100 pt-4 mb-4">
                      <button onClick={() => handleLike(post.id)} className={`flex items-center space-x-2 transition font-bold group ${post.likedByMe ? 'text-red-500' : 'text-gray-500 hover:text-black'}`}>
                        <span>{post.likedByMe ? '❤️' : '🤍'}</span>
                        <span className="text-sm">좋아요 {post.likes}</span>
                      </button>
                      <div className="flex items-center space-x-2 text-gray-500"><span className="text-sm font-bold">💬 댓글 {post.comments.length}</span></div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
                      {post.comments.map((comment: any) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[10px] font-black text-gray-600 flex-shrink-0">{comment.author.charAt(0)}</div>
                          <div className="bg-white px-4 py-2 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm text-sm"><span className="font-black mr-2 text-xs text-black">{comment.author}</span><span className="text-gray-800 font-bold">{comment.text}</span></div>
                        </div>
                      ))}
                      <div className="flex items-center space-x-2 mt-2">
                        <input type="text" placeholder="댓글을 남겨보세요..." value={commentInputs[post.id] || ''} onChange={(e) => setCommentInputs({...commentInputs, [post.id]: e.target.value})} onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)} className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-xs font-bold focus:outline-none focus:border-black transition" />
                        <button onClick={() => handleAddComment(post.id)} className="bg-black text-white p-2 rounded-full hover:bg-gray-800 transition"><svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* --- 탭 3: 실시간 채팅 --- */}
            {activeTab === 'chat' && isJoined && (
              <div className="bg-white border border-gray-200 shadow-sm rounded-[2.5rem] flex flex-col flex-1 h-[600px] animate-in fade-in duration-300 overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h3 className="font-black text-lg text-black">실시간 모임방 채팅 💬</h3>
                </div>

                <div
                  ref={chatContainerRef}
                  onScroll={handleChatScroll}
                  className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50"
                >
                  {chats.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <span className="text-4xl mb-3">💬</span>
                      <p className="text-sm font-bold">아직 채팅 내역이 없습니다.</p>
                      <p className="text-xs mt-1">첫 번째 메시지를 보내보세요!</p>
                    </div>
                  )}
                  {chats.map((chat, idx) => {
                    const isMe = chat.userId?._id === getMyId() || chat.userId === getMyId();
                    const nickname = chat.userId?.nickname || chat.userId?.username || '멤버';

                    return (
                      <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {!isMe && <span className="text-[10px] font-black text-gray-500 mb-1 ml-1">{nickname}</span>}
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-bold shadow-sm ${
                          isMe ? 'bg-black text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
                        }`}>
                          {chat.message}
                        </div>
                        <span className="text-[8px] text-gray-400 mt-1">{new Date(chat.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 flex items-center space-x-3">
                  <input 
                    type="text" 
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 bg-gray-100 border-none rounded-full px-6 py-3 text-sm font-bold text-black focus:ring-2 focus:ring-black outline-none transition"
                  />
                  <button type="submit" disabled={!currentMessage.trim()} className="bg-black text-white p-3 rounded-full hover:scale-105 active:scale-95 transition shadow-lg disabled:bg-gray-300">
                    <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </form>
              </div>
            )}
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm sticky top-24">
              <h4 className="text-sm font-black text-gray-500 mb-6 tracking-widest uppercase">Room Info</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-600">
                <li className="flex justify-between border-b border-gray-100 pb-2"><span>진행 방식</span><span className="text-black">{roomData.roomType}</span></li>
                <li className="flex justify-between border-b border-gray-100 pb-2"><span>최대 인원</span><span className="text-black">{roomData.maxMembers}명</span></li>
                <li className="flex justify-between border-b border-gray-100 pb-2"><span>개설일</span><span className="text-black">{new Date(roomData.createdAt).toLocaleDateString()}</span></li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* 글쓰기 모달창 */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
              <h3 className="text-lg font-black text-black">게시물 작성</h3>
              <button onClick={() => {setIsWriteModalOpen(false); setNewPostMedia(null);}} className="text-gray-400 hover:text-black transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmitPost} className="p-8">
              <textarea placeholder="어떤 이야기를 나누고 싶으신가요?" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} className="w-full h-32 bg-transparent text-lg font-bold text-black focus:outline-none resize-none placeholder-gray-400"></textarea>

              {newPostMedia && (
                <div className="relative mt-4 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 inline-block">
                  {newPostMedia.type === 'video' ? <video src={newPostMedia.url} className="h-32 object-contain" /> : <img src={newPostMedia.url} alt="preview" className="h-32 object-cover" />}
                  <button type="button" onClick={() => setNewPostMedia(null)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black transition"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                </div>
              )}

              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-100">
                <div className="flex space-x-2">
                  <label className="cursor-pointer text-gray-500 hover:text-blue-500 transition p-2 rounded-full hover:bg-blue-50">
                    <input type="file" accept="image/*, video/*" onChange={handleMediaUpload} className="hidden" />
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </label>
                  <label className="cursor-pointer text-gray-500 hover:text-red-500 transition p-2 rounded-full hover:bg-red-50">
                     <input type="file" accept="video/*" onChange={handleMediaUpload} className="hidden" />
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </label>
                </div>
                <button type="submit" disabled={!newPostContent.trim()} className="bg-black text-white px-8 py-3 rounded-full font-black text-sm hover:bg-gray-800 transition disabled:bg-gray-300">게시하기</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 비밀번호 입력 모달 */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl">
            <h3 className="text-center font-black mb-6 text-black">비밀번호 입력</h3>
            <input type="password" value={inputPassword} onChange={(e) => setInputPassword(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 focus:outline-none text-black font-bold" />
            <div className="flex space-x-3">
              <button onClick={() => setIsPasswordModalOpen(false)} className="flex-1 text-gray-500 font-bold text-sm hover:bg-gray-100 rounded-xl">취소</button>
              <button onClick={() => executeJoin(inputPassword)} className="flex-1 bg-black text-white py-3 rounded-xl font-black text-sm hover:bg-gray-800">확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}