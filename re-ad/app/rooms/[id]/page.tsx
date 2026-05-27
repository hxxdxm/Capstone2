"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io, Socket } from 'socket.io-client';
import Header from '@/components/Header';
import './room-detail.css';

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

  const [posts, setPosts] = useState<any[]>([
    { id: 2, author: "독서요정", content: "오늘 주말 모임 너무 즐거웠습니다! 다음 주에 읽을 책 사진 공유해요 📚", media: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600", mediaType: "image", likes: 5, likedByMe: false, comments: [{ id: 1, author: "책벌레", text: "사진 너무 예쁘게 나왔네요!" }], createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 1, author: "방장", content: "환영합니다! 가입하신 분들은 가볍게 인사말 남겨주세요~", media: null, mediaType: null, likes: 12, likedByMe: true, comments: [], createdAt: new Date(Date.now() - 86400000).toISOString() }
  ]);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{ url: string; type: string } | null>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});

  const [socket, setSocket] = useState<Socket | null>(null);
  const [chats, setChats] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);

  const [isMemberListOpen, setIsMemberListOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [memberDetails, setMemberDetails] = useState<Record<string, any>>({});

  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return null;
    return token;
  };
  const getMyId = () => {
    const token = getSafeToken();
    if (!token) return null;
    try { const p = JSON.parse(window.atob(token.split('.')[1])); return p.id || p.userId; } catch { return null; }
  };
  const getMyName = () => typeof window !== 'undefined' ? (localStorage.getItem('userName') || sessionStorage.getItem('userName')) : '익명';

  useEffect(() => { if (roomId) fetchRoomDetail(); }, [roomId]);

  const fetchRoomDetail = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`);
      const data = await res.json();
      if (!res.ok) throw new Error("방 정보 로드 실패");
      setIsJoined(data.members?.some((m: any) => m.userId === getMyId() || m.userId?._id === getMyId()));
      setRoomData(data);
      setEditRoomDesc(data.description || data.roomDesc || '');
      setIsLoading(false);

      // 멤버 주에서 userId가 순수 ID 문자열일 때 프로필 조회
      if (Array.isArray(data.members)) {
        const details: Record<string, any> = {};
        await Promise.all(
          data.members.map(async (m: any) => {
            // populate된 객체면 니코네임이 이미 있음
            if (m.userId && typeof m.userId === 'object' && (m.userId.nickname || m.userId.username)) {
              const uid = m.userId._id || m.userId.id || String(m.userId);
              details[uid] = { nickname: m.userId.nickname || m.userId.username, _id: uid };
              return;
            }
            // 순수 ID 문자열이면 API 호출
            const uid = typeof m.userId === 'string' ? m.userId : (m.userId?._id || m._id);
            if (!uid) return;
            try {
              const r = await fetch(`${API_BASE_URL}/users/${uid}/profile`);
              if (r.ok) {
                const u = await r.json();
                details[uid] = { nickname: u.nickname || u.username || u.name, _id: uid, ...u };
              }
            } catch {}
          })
        );
        setMemberDetails(details);
      }
    } catch { router.push('/rooms'); }
  };

  const handleDeleteRoom = async () => {
    if (!confirm("정말로 이 모임방을 삭제하시겠습니까?")) return;
    const token = getSafeToken();
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ userId: getMyId() }) });
      if (res.ok) { alert("모임방이 삭제되었습니다."); router.push('/rooms'); }
      else alert("삭제 권한이 없습니다.");
    } catch { alert("서버 연결 실패"); }
  };

  const handleLeaveRoom = async () => {
    if (!confirm("모임방을 나가시겠습니까? 다시 참여하려면 다시 신청해야 합니다.")) return;
    const token = getSafeToken();
    if (!token) return alert("로그인이 필요합니다.");
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("모임방에서 나갔습니다.");
        router.push('/rooms');
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || "모임방 나가기에 실패했습니다.");
      }
    } catch { alert("서버 연결 실패"); }
  };

  const executeJoin = async (password = '') => {
    const token = getSafeToken();
    if (!token) { alert("로그인이 필요합니다."); router.push('/login'); return; }
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ userId: getMyId(), roomPassword: password }) });
      if (res.ok) { alert('모임 참여 성공! 🎉'); setIsPasswordModalOpen(false); fetchRoomDetail(); }
      else { const r = await res.json(); alert(r.message || '참여 실패'); }
    } catch { alert('서버 오류'); }
  };

  const handleUpdateDesc = async () => {
    const token = getSafeToken();
    if (!token) return alert("로그인이 필요합니다.");
    try {
      const res = await fetch(`${API_BASE_URL}/rooms/${roomId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ description: editRoomDesc }) });
      if (res.ok) { setRoomData({ ...roomData, description: editRoomDesc, roomDesc: editRoomDesc }); setIsEditingInfo(false); }
      else alert("수정 실패: 방장 권한이 없거나 서버 오류입니다.");
    } catch { alert("서버와 연결할 수 없습니다."); }
  };

  const handleInvite = async () => {
    const inviteUrl = `${window.location.origin}/rooms/${roomId}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      alert(`초대 링크: ${inviteUrl}`);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const url = URL.createObjectURL(file); setNewPostMedia({ url, type: file.type.startsWith('video/') ? 'video' : 'image' }); }
  };

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return alert("내용을 입력해주세요.");
    setPosts([{ id: Date.now(), author: getMyName() || "나", content: newPostContent, media: newPostMedia?.url || null, mediaType: newPostMedia?.type || null, likes: 0, likedByMe: false, comments: [], createdAt: new Date().toISOString() }, ...posts]);
    setIsWriteModalOpen(false); setNewPostContent(''); setNewPostMedia(null);
  };

  const handleLike = (postId: number) => setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.likedByMe ? p.likes - 1 : p.likes + 1, likedByMe: !p.likedByMe } : p));

  const handleAddComment = (postId: number) => {
    const t = commentInputs[postId];
    if (!t?.trim()) return;
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: Date.now(), author: getMyName() || "나", text: t }] } : p));
    setCommentInputs({ ...commentInputs, [postId]: '' });
  };

  const handleChatScroll = () => {
    const el = chatContainerRef.current;
    if (!el) return;
    isAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };
  const scrollToBottom = (smooth = false) => { chatContainerRef.current?.scrollTo({ top: 999999, behavior: smooth ? 'smooth' : 'auto' }); };

  useEffect(() => {
    if (!isJoined || activeTab !== 'chat') return;
    const token = getSafeToken();
    if (!token) return;
    fetch(`${API_BASE_URL}/chats/${roomId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.json()).then(data => { if (Array.isArray(data)) { setChats(data); setTimeout(() => scrollToBottom(false), 0); } })
      .catch(err => console.error(err));
    const s = io(SOCKET_URL, { transports: ['websocket'], auth: { token }, extraHeaders: { Authorization: `Bearer ${token}` } });
    setSocket(s);
    s.emit('joinRoom', roomId);
    s.on('receiveMessage', (d: any) => setChats(prev => [...prev, d]));
    return () => { s.disconnect(); };
  }, [isJoined, activeTab, roomId]);

  useEffect(() => { if (chats.length > 0 && isAtBottomRef.current) scrollToBottom(true); }, [chats]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const myId = getMyId();
    if (!socket || !currentMessage.trim() || !myId) return;
    socket.emit('sendMessage', { roomId, userId: myId, message: currentMessage });
    setCurrentMessage('');
  };

  if (isLoading || !roomData) return (
    <div className="room-loading">
      <div>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(123,160,91,0.3)', borderTopColor: '#7BA05B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p>모임방을 불러오는 중...</p>
      </div>
    </div>
  );

  const isHost = roomData.hostId === getMyId();
  const isFull = roomData.members?.length >= roomData.maxMembers;

  return (
    <div className="room-detail-page">
      <Header />
      <main className="room-main">

        {/* ── 헤더 카드 ── */}
        <section className="room-header-card">
          <div>
            <span className={`room-type-badge ${roomData.roomType === '온라인' ? 'badge-online' : 'badge-offline'}`}>
              {roomData.roomType}
            </span>
            <h2 className="room-title">{roomData.roomName}</h2>
            <p className="room-member-count">참여 멤버 {roomData.members?.length || 0} / {roomData.maxMembers}명</p>
          </div>
          <div className="room-header-actions">
            {isHost && <button onClick={handleDeleteRoom} className="btn-delete-room">모임 삭제</button>}
            {isJoined && !isHost && (
              <button onClick={handleLeaveRoom} className="btn-leave-room">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                모임 나가기
              </button>
            )}
            {!isJoined && (
              <button
                onClick={() => roomData.roomPassword ? setIsPasswordModalOpen(true) : executeJoin()}
                disabled={isFull}
                className="btn-join-room"
              >
                {isFull ? '정원 초과' : '모임 참여하기'}
              </button>
            )}
          </div>
        </section>

        {/* ── 탭 네비 ── */}
        <nav className="room-tab-nav">
          {[
            { key: 'info', label: '모임 소개' },
            { key: 'feed', label: '피드', locked: !isJoined },
            { key: 'chat', label: '실시간 채팅', locked: !isJoined },
          ].map(tab => (
            <button
              key={tab.key}
              className={`room-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => {
                if (tab.locked) return alert("모임에 참여해야 이용할 수 있습니다.");
                setActiveTab(tab.key);
              }}
            >
              {tab.label}
              {tab.locked && (
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </nav>

        <div className="room-grid">
          <div>
            {/* ── 탭 1: 모임 소개 ── */}
            {activeTab === 'info' && (
              <div className="room-card">
                <div className="room-info-header">
                  <h3 className="room-info-title">모임 소개</h3>
                  {isHost && !isEditingInfo && (
                    <button className="btn-edit-desc" onClick={() => setIsEditingInfo(true)}>수정하기</button>
                  )}
                </div>
                {isEditingInfo ? (
                  <>
                    <textarea className="room-desc-textarea" value={editRoomDesc} onChange={e => setEditRoomDesc(e.target.value)} />
                    <div className="room-desc-btn-row">
                      <button className="btn-cancel-edit" onClick={() => setIsEditingInfo(false)}>취소</button>
                      <button className="btn-save-edit" onClick={handleUpdateDesc}>저장</button>
                    </div>
                  </>
                ) : (
                  <p className="room-desc-text">{roomData.description || roomData.roomDesc || '작성된 소개글이 없습니다.'}</p>
                )}
                {roomData.tags?.length > 0 && (
                  <div className="room-tags">
                    {roomData.tags.map((tag: string, i: number) => <span key={i} className="room-tag">#{tag}</span>)}
                  </div>
                )}
              </div>
            )}

            {/* ── 탭 2: 피드 ── */}
            {activeTab === 'feed' && isJoined && (
              <div>
                <div className="feed-write-card" onClick={() => setIsWriteModalOpen(true)}>
                  <div className="feed-write-avatar">{getMyName()?.charAt(0) || '나'}</div>
                  <span className="feed-write-placeholder">멤버들과 나누고 싶은 이야기를 적어보세요.</span>
                  <span className="feed-write-btn">게시글 쓰기 +</span>
                </div>
                {posts.map(post => (
                  <article key={post.id} className="feed-post-card">
                    <div className="feed-post-header">
                      <div className="feed-post-avatar">{post.author.charAt(0)}</div>
                      <div>
                        <div className="feed-post-author">{post.author}</div>
                        <div className="feed-post-time">{new Date(post.createdAt).toLocaleString()}</div>
                      </div>
                    </div>
                    <p className="feed-post-content">{post.content}</p>
                    {post.media && (
                      <div className="feed-post-media">
                        {post.mediaType === 'video' ? <video src={post.media} controls /> : <img src={post.media} alt="첨부" />}
                      </div>
                    )}
                    <div className="feed-post-actions">
                      <button className={`feed-action-btn ${post.likedByMe ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                        {post.likedByMe ? '❤️' : '🤍'} 좋아요 {post.likes}
                      </button>
                      <span className="feed-action-btn">💬 댓글 {post.comments.length}</span>
                    </div>
                    <div className="feed-comments">
                      {post.comments.map((c: any) => (
                        <div key={c.id} className="feed-comment">
                          <div className="feed-comment-avatar">{c.author.charAt(0)}</div>
                          <div className="feed-comment-bubble">
                            <span className="feed-comment-author">{c.author}</span>
                            <span className="feed-comment-text">{c.text}</span>
                          </div>
                        </div>
                      ))}
                      <div className="feed-comment-input-row">
                        <input className="feed-comment-input" placeholder="댓글을 남겨보세요..." value={commentInputs[post.id] || ''} onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })} onKeyDown={e => e.key === 'Enter' && handleAddComment(post.id)} />
                        <button className="feed-comment-send" onClick={() => handleAddComment(post.id)}>
                          <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* ── 탭 3: 채팅 ── */}
            {activeTab === 'chat' && isJoined && (
              <div className="chat-container">
                <div className="chat-header">
                  <div className="chat-header-dot" />
                  <span className="chat-header-title">실시간 모임방 채팅</span>
                </div>
                <div className="chat-messages" ref={chatContainerRef} onScroll={handleChatScroll}>
                  {chats.length === 0 ? (
                    <div className="chat-empty">
                      <span className="chat-empty-icon">💬</span>
                      <p className="chat-empty-text">아직 채팅 내역이 없습니다.</p>
                      <p style={{ fontSize: '12px', color: '#BDB09A' }}>첫 번째 메시지를 보내보세요!</p>
                    </div>
                  ) : chats.map((chat, idx) => {
                    const isMe = chat.userId?._id === getMyId() || chat.userId === getMyId();
                    const nickname = chat.userId?.nickname || chat.userId?.username || '멤버';

                    const currentDate = new Date(chat.createdAt || Date.now()).toLocaleDateString();
                    const previousDate = idx > 0 ? new Date(chats[idx - 1].createdAt || Date.now()).toLocaleDateString() : null;
                    const showDateDivider = currentDate !== previousDate;

                    return (
                      <React.Fragment key={idx}>
                        {showDateDivider && (
                          <div className="chat-date-divider">
                            <span className="chat-date-text">
                              {new Date(chat.createdAt || Date.now()).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
                            </span>
                          </div>
                        )}
                        <div className={`chat-bubble-wrap ${isMe ? 'me' : 'other'}`}>
                          {!isMe && <span className="chat-sender-name">{nickname}</span>}
                          <div className={`chat-bubble ${isMe ? 'me' : 'other'}`}>{chat.message}</div>
                          <span className="chat-time">{new Date(chat.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>
                <form className="chat-input-bar" onSubmit={handleSendMessage}>
                  <input className="chat-input" value={currentMessage} onChange={e => setCurrentMessage(e.target.value)} placeholder="메시지를 입력하세요..." />
                  <button type="submit" className="chat-send-btn" disabled={!currentMessage.trim()}>
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ transform: 'rotate(90deg)' }}><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* ── 사이드바 ── */}
          <aside>
            <div className="room-sidebar-card">
              <div className="room-sidebar-title">Room Info</div>
              <div className="room-sidebar-row">
                <span className="room-sidebar-label">진행 방식</span>
                <span className="room-sidebar-value">{roomData.roomType}</span>
              </div>
              <div className="room-sidebar-row">
                <span className="room-sidebar-label">최대 인원</span>
                <span className="room-sidebar-value">{roomData.maxMembers}명</span>
              </div>
              <div className="room-sidebar-row">
                <span className="room-sidebar-label">현재 인원</span>
                <span className="room-sidebar-value">{roomData.members?.length || 0}명</span>
              </div>
              <div className="room-sidebar-row">
                <span className="room-sidebar-label">개설일</span>
                <span className="room-sidebar-value">{new Date(roomData.createdAt).toLocaleDateString()}</span>
              </div>

              {/* 멤버 목록 버튼 */}
              <button className="sidebar-action-btn" onClick={() => setIsMemberListOpen(true)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                멤버 보기 ({roomData.members?.length || 0})
              </button>

              {/* 초대 링크 복사 버튼 */}
              {isJoined && (
                <button className={`sidebar-action-btn invite ${isCopied ? 'copied' : ''}`} onClick={handleInvite}>
                  {isCopied ? (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      복사 완료!
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      친구 초대하기
                    </>
                  )}
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* ── 멤버 목록 모달 ── */}
      {isMemberListOpen && (
        <div className="member-modal-backdrop" onClick={() => setIsMemberListOpen(false)}>
          <div className="member-modal" onClick={e => e.stopPropagation()}>
            <div className="member-modal-header">
              <h3>모임 멤버 ({roomData.members?.length || 0}명)</h3>
              <button className="member-modal-close" onClick={() => setIsMemberListOpen(false)}>✕</button>
            </div>
            <div className="member-modal-body">
              {roomData.members?.length > 0 ? (
                roomData.members.map((member: any, idx: number) => {
                  const rawId = typeof member.userId === 'string'
                    ? member.userId
                    : (member.userId?._id || member._id || '');
                  const detail = memberDetails[rawId];
                  const nickname =
                    detail?.nickname ||
                    member.userId?.nickname || member.userId?.username ||
                    member.nickname ||
                    rawId.slice(-4) || `멤버 ${idx + 1}`;
                  const isThisHost = roomData.hostId === rawId || roomData.hostId === member.userId?._id;
                  return (
                    <div key={idx} className="member-item">
                      <div className="member-avatar">{nickname[0]}</div>
                      <div className="member-info">
                        <span className="member-name">{nickname}</span>
                        {isThisHost && <span className="member-host-badge">👑 방장</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ textAlign: 'center', color: '#8A7A60', fontSize: '13px', padding: '20px 0' }}>멤버 정보를 불러올 수 없습니다.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 피드 작성 모달 ── */}
      {isWriteModalOpen && (
        <div className="feed-modal-backdrop" onClick={() => { setIsWriteModalOpen(false); setNewPostMedia(null); }}>
          <div className="feed-modal" onClick={e => e.stopPropagation()}>
            <div className="feed-modal-header">
              <span className="feed-modal-title">게시물 작성</span>
              <button className="feed-modal-close" onClick={() => { setIsWriteModalOpen(false); setNewPostMedia(null); }}>✕</button>
            </div>
            <div className="feed-modal-body">
              <form onSubmit={handleSubmitPost}>
                <textarea className="feed-modal-textarea" placeholder="어떤 이야기를 나누고 싶으신가요?" value={newPostContent} onChange={e => setNewPostContent(e.target.value)} />
                {newPostMedia && (
                  <div className="feed-modal-media-preview">
                    {newPostMedia.type === 'video' ? <video src={newPostMedia.url} /> : <img src={newPostMedia.url} alt="preview" />}
                    <button type="button" className="feed-modal-media-remove" onClick={() => setNewPostMedia(null)}>✕</button>
                  </div>
                )}
                <div className="feed-modal-footer">
                  <div className="feed-modal-media-btns">
                    <label className="feed-modal-media-btn" title="이미지 첨부">
                      <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </label>
                  </div>
                  <button type="submit" className="feed-modal-submit" disabled={!newPostContent.trim()}>게시하기</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── 비밀번호 모달 ── */}
      {isPasswordModalOpen && (
        <div className="pw-modal-backdrop" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="pw-modal" onClick={e => e.stopPropagation()}>
            <p className="pw-modal-title">🔒 비밀번호 입력</p>
            <input type="password" className="pw-modal-input" value={inputPassword} onChange={e => setInputPassword(e.target.value)} placeholder="비밀번호를 입력하세요" onKeyDown={e => e.key === 'Enter' && executeJoin(inputPassword)} />
            <div className="pw-modal-btn-row">
              <button className="pw-modal-cancel" onClick={() => setIsPasswordModalOpen(false)}>취소</button>
              <button className="pw-modal-confirm" onClick={() => executeJoin(inputPassword)}>확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}