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

  const [posts, setPosts] = useState<any[]>([]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{url: string, type: string} | null>(null);
  const [commentInputs, setCommentInputs] = useState<{[key: number]: string}>({});

  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null' || token.split('.').length !== 3) return null;
    return token;
  };
  
  const getMyId = () => {
    const token = getSafeToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.id || payload.userId || payload._id || payload.user_id;
    } catch (e) { return null; }
  };

  const getMyName = () => typeof window !== 'undefined' ? (localStorage.getItem('userName') || sessionStorage.getItem('userName')) : '익명';

  const fetchPosts = async () => {
    const token = getSafeToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPosts(await res.json());
    } catch (err) { console.error("게시글 로드 실패:", err); }
  };

  const fetchRoomDetail = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      const data = await res.json();
      const myId = getMyId();
      setIsJoined(data.members?.some((m: any) => m.userId === myId));
      setRoomData(data);
      setEditRoomDesc(data.description || data.roomDesc || ''); 
    } catch (err) { router.push('/rooms'); }
  };

  useEffect(() => {
    if (!roomId) return;
    const loadData = async () => {
      await fetchRoomDetail();
      await fetchPosts();
      setIsLoading(false);
    };
    loadData();
  }, [roomId]);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getSafeToken();
    if (!token) return alert("로그인 후 작성해주세요.");

    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ content: newPostContent })
      });
      if (res.ok) {
        alert("게시글이 등록되었습니다!");
        fetchPosts();
        setIsWriteModalOpen(false);
        setNewPostContent('');
      } else { alert("등록 실패"); }
    } catch (error) { alert("서버 오류"); }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const myId = getMyId();
    if (!socket) return alert("소켓 연결 확인 중입니다.");
    if (!currentMessage.trim()) return;
    socket.emit('sendMessage', { roomId, userId: myId, message: currentMessage });
    setCurrentMessage(''); 
  };

  // 채팅 소켓 연결 (이전과 동일)
  useEffect(() => {
    if (!isJoined || activeTab !== 'chat') return;
    const token = getSafeToken();
    const newSocket = io(SOCKET_URL, { transports: ['websocket'], auth: { token }, extraHeaders: { Authorization: `Bearer ${token}` } });
    setSocket(newSocket);
    newSocket.emit('joinRoom', roomId);
    newSocket.on('receiveMessage', (chatData:any) => setChats((prev) => [...prev, chatData]));
    return () => { newSocket.disconnect(); };
  }, [isJoined, activeTab, roomId]);

  if (isLoading || !roomData) return <div className="p-20 text-center font-black">로딩중...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-24 font-sans text-black">
      <Header />
      <main className="mx-auto max-w-5xl px-6 mt-12">
        <section className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm mb-8">
            <h2 className="text-4xl font-black mb-2">{roomData.roomName}</h2>
            <p className="text-sm font-bold text-gray-500">멤버 {roomData.members?.length || 0} / {roomData.maxMembers}명</p>
        </section>

        <nav className="flex space-x-8 border-b-2 border-gray-200 mb-8 px-2">
          {['info', 'feed', 'chat'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-4 text-lg font-black ${activeTab === tab ? 'border-b-4 border-black' : 'text-gray-400'}`}>
              {tab === 'info' ? '모임 소개' : tab === 'feed' ? '피드' : '실시간 채팅'}
            </button>
          ))}
        </nav>

        {activeTab === 'feed' && (
          <div className="space-y-6">
            <button onClick={() => setIsWriteModalOpen(true)} className="w-full bg-black text-white py-4 rounded-2xl font-black">글쓰기</button>
            {posts.map(post => (
              <div key={post.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <p className="font-bold">{post.author}</p>
                <p className="mt-2">{post.content}</p>
              </div>
            ))}
          </div>
        )}

        {/* 채팅/소개 탭 UI 생략 (이전 코드 활용) */}
      </main>

      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={handleSubmitPost} className="bg-white p-8 rounded-[2rem] w-full max-w-lg">
            <textarea className="w-full h-32 border-2 rounded-xl p-4 mb-4" value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} />
            <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black">게시하기</button>
          </form>
        </div>
      )}
    </div>
  );
}