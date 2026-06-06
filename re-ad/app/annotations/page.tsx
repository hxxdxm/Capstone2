"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import './annotations.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://13.124.191.57:5000/api';
// 📍 이미지는 API 서버(5000 포트)의 /uploads 폴더에서 서빙
const IMAGE_BASE_URL = 'http://13.124.191.57:5000';

// base64, 절대URL, /uploads 상대경로 모두 처리
const resolveImageUrl = (url: string | undefined | null): string | null => {
  if (!url) return null;
  if (url.startsWith('data:')) return url;          // base64
  if (url.startsWith('http')) return url;           // 이미 완전한 URL
  return `${IMAGE_BASE_URL}${url}`;                 // /uploads/... → 서버주소 붙임
};

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

  // ── 댓글 관련 상태 ──
  const [commentDrawer, setCommentDrawer] = useState<{
    open: boolean;
    postId: string;
    postQuote: string;
    comments: any[];
    loading: boolean;
  }>({ open: false, postId: '', postQuote: '', comments: [], loading: false });
  const [commentInput, setCommentInput] = useState('');
  const [isSendingComment, setIsSendingComment] = useState(false);
  const commentListRef = useRef<HTMLDivElement>(null);
  const [openMenuPostId, setOpenMenuPostId] = useState<string | null>(null); // ← 점3개 메뉴 상태

  // 게시글 수정 모달
  const [editModal, setEditModal] = useState<{ open: boolean; post: any | null }>({ open: false, post: null });
  const [editForm, setEditForm] = useState({ quote: '', book: '', author: '' });

  /* ── 공통 유틸 ── */
  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  };
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

  /* ── 전시 목록 fetch ── */
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
          const imageUrl = apiItem.imageUrl || apiItem.image_url;

          // 도서명: 커스텀(직접입력) 우선 → bookId populate 폴백
          const bookTitle =
            apiItem.customBookTitle ||
            apiItem.bookTitle ||
            apiItem.book_title ||
            apiItem.bookId?.title ||
            apiItem.title ||
            '';

          // 작가명: 커스텀(직접입력) 우선 → bookId populate 폴백
          const bookAuthor =
            apiItem.customBookAuthor ||
            apiItem.bookAuthor ||
            apiItem.book_author ||
            apiItem.bookId?.author ||
            apiItem.author ||
            '';

          return {
            id: apiItem._id,
            userId: apiItem.userId?._id || apiItem.userId,
            type: imageUrl ? 'image' : 'text',
            image: resolveImageUrl(imageUrl),   // 📍 URL 완성 후 저장
            quote: apiItem.quote || apiItem.content,
            book: bookTitle || '도서',
            author: bookAuthor || '작자미상',
            user: apiItem.userId?.nickname || apiItem.userId?.username || '익명',
            likes: apiItem.likes?.length || 0,
            commentCount: apiItem.comments?.length || 0,
            bg: apiItem.color || 'bg-white text-gray-900 border-gray-200'
          };
        });

        setPosts(formattedData);
        setLikedPostIds(initialLikedIds);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ── 이미지 업로드 ── */
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setNewPost({ ...newPost, imagePreview: imageUrl });
    }
  };

  /* ── 필사 등록 ── */
  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) return alert('로그인이 필요합니다.');

    const formData = new FormData();
    formData.append('quote', newPost.quote);
    // 직접 입력 도서명/작가명: 백엔드 커스텀 필드와 표준 필드 둘 다 전송
    formData.append('customBookTitle', newPost.book);
    formData.append('customBookAuthor', newPost.author);
    formData.append('bookTitle', newPost.book);
    formData.append('bookAuthor', newPost.author);
    formData.append('color', newPost.style);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput?.files?.[0]) {
      formData.append('image', fileInput.files[0]);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/annotations`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        alert('전시회에 문장이 성공적으로 걸렸습니다! 🎉');
        setIsWriteModalOpen(false);
        setNewPost({ quote: '', book: '', author: '', style: 'bg-white text-gray-900 border-gray-200', imagePreview: '' });
        fetchExhibitions();
      } else {
        alert('등록에 실패했습니다.');
      }
    } catch (error) {
      alert('서버 통신 에러');
    }
  };

  /* ── 좋아요 토글 ── */
  const toggleLike = async (postId: string) => {
    const token = getToken();
    if (!token) { alert('로그인 후 이용 가능합니다.'); return; }

    try {
      const res = await fetch(`${API_BASE_URL}/annotations/${postId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const result = await res.json();
        setLikedPostIds((prev) =>
          prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
        );
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, likes: result.likesCount } : post
          )
        );
      }
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  /* ────────────────────────────────────
     댓글 드로어 열기
  ──────────────────────────────────── */
  const openComments = async (post: any) => {
    setCommentDrawer({ open: true, postId: post.id, postQuote: post.quote, comments: [], loading: true });
    setCommentInput('');

    try {
      // 댓글 목록은 전시회 데이터에 포함되어 있을 수 있고,
      // 별도 GET 엔드포인트가 없으므로 전시 전체를 재조회하여 추출합니다.
      const res = await fetch(`${API_BASE_URL}/annotations/exhibition`);
      if (res.ok) {
        const data = await res.json();
        const found = data.find((item: any) => item._id === post.id);
        const comments = (found?.comments || []).map((c: any) => ({
          id: c._id,
          content: c.content,
          author: c.userId?.nickname || '익명',
          authorId: c.userId?._id || c.userId,
          createdAt: c.createdAt,
        }));
        setCommentDrawer(prev => ({ ...prev, comments, loading: false }));
      }
    } catch (err) {
      console.error('댓글 로드 실패:', err);
      setCommentDrawer(prev => ({ ...prev, loading: false }));
    }
  };

  const closeComments = () => {
    setCommentDrawer({ open: false, postId: '', postQuote: '', comments: [], loading: false });
    setCommentInput('');
  };

  /* ── 댓글 작성 ── */
  const submitComment = async () => {
    const text = commentInput.trim();
    if (!text || isSendingComment) return;
    const token = getToken();
    if (!token) return;

    setIsSendingComment(true);
    // 낙관적 업데이트: 전송 전 먼저 로컬에 추가
    const optimisticComment = {
      id: `temp-${Date.now()}`,
      content: text,
      author: userName || '나',
      authorId: getMyId(),
      createdAt: new Date().toISOString(),
    };
    setCommentDrawer(prev => ({ ...prev, comments: [...prev.comments, optimisticComment] }));
    setCommentInput('');
    setTimeout(() => {
      commentListRef.current?.scrollTo({ top: 9999, behavior: 'smooth' });
    }, 80);

    try {
      const res = await fetch(`${API_BASE_URL}/annotations/${commentDrawer.postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: text })
      });

      if (res.ok) {
        const data = await res.json();

        // 백엔드가 전체 댓글 배열을 반환하면 교체, 아니면 낙관적 댓글을 실제 데이터로 교체
        if (Array.isArray(data)) {
          const serverComments = data.map((c: any) => ({
            id: c._id,
            content: c.content,
            author: c.userId?.nickname || '익명',
            authorId: c.userId?._id || c.userId,
            createdAt: c.createdAt,
          }));
          setCommentDrawer(prev => ({ ...prev, comments: serverComments }));
          setPosts(prev => prev.map(p =>
            p.id === commentDrawer.postId ? { ...p, commentCount: serverComments.length } : p
          ));
        } else {
          // 단일 댓글 객체 또는 메시지만 반환하는 경우 — 낙관적 댓글의 임시 id를 실제 id로 교체
          const newComment = data.comment || data;
          if (newComment?._id) {
            setCommentDrawer(prev => ({
              ...prev,
              comments: prev.comments.map(c =>
                c.id === optimisticComment.id
                  ? { id: newComment._id, content: newComment.content, author: newComment.userId?.nickname || userName || '나', authorId: newComment.userId?._id || getMyId(), createdAt: newComment.createdAt }
                  : c
              )
            }));
          }
          setPosts(prev => prev.map(p =>
            p.id === commentDrawer.postId
              ? { ...p, commentCount: (p.commentCount || 0) + 1 }
              : p
          ));
        }
      } else {
        // 실패 시 낙관적 댓글 롤백
        setCommentDrawer(prev => ({
          ...prev,
          comments: prev.comments.filter(c => c.id !== optimisticComment.id)
        }));
        setCommentInput(text);
        alert('댓글 등록에 실패했습니다.');
      }
    } catch (err) {
      setCommentDrawer(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== optimisticComment.id)
      }));
      setCommentInput(text);
      alert('서버 통신 오류');
    } finally {
      setIsSendingComment(false);
    }
  };


  /* ── 댓글 삭제 ── */
  const deleteComment = async (commentId: string) => {
    if (!confirm('댓글을 삭제할까요?')) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/annotations/${commentDrawer.postId}/comments/${commentId}`,
        { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (res.ok) {
        const updated = commentDrawer.comments.filter(c => c.id !== commentId);
        setCommentDrawer(prev => ({ ...prev, comments: updated }));
        setPosts(prev => prev.map(p =>
          p.id === commentDrawer.postId ? { ...p, commentCount: updated.length } : p
        ));
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 통신 오류');
    }
  };

  /* ── 게시글 삭제 ── */
  const deletePost = async (postId: string) => {
    if (!confirm('이 게시글을 삭제할까요?')) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/annotations/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setOpenMenuPostId(null);
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (err) {
      alert('서버 통신 오류');
    }
  };

  /* ── 게시글 수정 ── */
  const openEditModal = (item: any) => {
    setEditForm({ quote: item.quote || '', book: item.book || '', author: item.author || '' });
    setEditModal({ open: true, post: item });
    setOpenMenuPostId(null);
  };

  const submitEditPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.quote.trim()) return alert('문장 내용을 입력해주세요.');
    const token = getToken();
    if (!token || !editModal.post) return;
    try {
      const res = await fetch(`${API_BASE_URL}/annotations/${editModal.post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ quote: editForm.quote, bookTitle: editForm.book, bookAuthor: editForm.author })
      });
      if (res.ok) {
        setPosts(prev => prev.map(p =>
          p.id === editModal.post.id
            ? { ...p, quote: editForm.quote, book: editForm.book || p.book, author: editForm.author || p.author }
            : p
        ));
        setEditModal({ open: false, post: null });
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.message || '수정에 실패했습니다.');
      }
    } catch { alert('서버 통신 오류'); }
  };

  /* ── 시간 포맷 ── */
  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
    if (diff < 1) return '방금';
    if (diff < 60) return `${diff}분 전`;
    if (diff < 1440) return `${Math.floor(diff / 60)}시간 전`;
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const myId = getMyId();

  /* ────────────────────────────────────
     렌더
  ──────────────────────────────────── */
  return (
    <div className="anno-page">
      <Header />

      {/* 히어로 섹션 */}
      <section className="anno-hero">
        <span className="anno-hero-badge">ONLINE EXHIBITION</span>
        <h2 className="anno-hero-title">
          당신의 밑줄,<br />우리의 영감
        </h2>
        <p className="anno-hero-sub">
          이음 멤버들이 직접 남긴 인생 문장들을<br />갤러리처럼 감상해 보세요.
        </p>
      </section>

      {/* 갤러리 */}
      <main className="anno-gallery-wrap">
        {isLoading ? (
          <div className="anno-loading"><div className="spinner" /></div>
        ) : (
          <div className="anno-masonry">
            {posts.length === 0 ? (
              <div className="anno-empty">
                전시된 필사가 없습니다.<br />첫 번째 영감을 기록해 보세요! 🌿
              </div>
            ) : (
              posts.map((item) => {
                const isLiked = likedPostIds.includes(item.id);
                const isMyPost = myId && item.userId === myId;
                const isMenuOpen = openMenuPostId === item.id;

                return (
                  <article key={item.id} className="anno-card" onClick={() => openMenuPostId && setOpenMenuPostId(null)}>

                    {/* 이미지 타입 */}
                    {item.type === 'image' ? (
                      <div className="anno-card-image-wrap">
                        <img
                          src={item.image || ''}
                          alt="annotation"
                          className="anno-card-img"
                        />
                        <div className="anno-card-image-overlay" />
                        <div className="anno-card-image-content">
                          <p className="anno-quote-image">"{item.quote}"</p>
                          <div className="anno-meta-image">
                            <span className="anno-book-title-image">{item.book}</span>
                            <span className="anno-book-author-image">{item.author}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* 텍스트 타입 */
                      <div className="anno-card-text">
                        <p className="anno-quote-text">"{item.quote}"</p>
                        <div className="anno-card-bottom">
                          <div>
                            <div className="anno-book-title-text">{item.book}</div>
                            <div className="anno-book-author-text">{item.author}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 카드 하단 액션바 */}
                    <div className="anno-card-footer">
                      <span className="anno-user-badge">@{item.user}</span>
                      
                      <div className="anno-card-actions">
                        {/* 좋아요 버튼 */}
                        <button onClick={() => toggleLike(item.id)} className={`anno-like-btn ${isLiked ? 'liked' : ''}`}>
                          <svg className={`anno-like-icon ${isLiked ? 'liked' : 'unlike'}`} fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                          <span className="anno-like-count">{item.likes || 0}</span>
                        </button>

                        {/* 댓글 버튼 */}
                        <button
                          className="anno-comment-btn"
                          onClick={() => openComments(item)}
                        >
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          댓글
                          <span className="anno-comment-count">{item.commentCount || 0}</span>
                        </button>

                        {/* 점 3개 메뉴 - 내 게시글만 */}
                        {isMyPost && (
                          <div className="anno-menu-wrap" onClick={e => e.stopPropagation()}>
                            <button
                              className="anno-menu-btn"
                              onClick={() => setOpenMenuPostId(isMenuOpen ? null : item.id)}
                              title="더보기"
                            >
                              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                            {isMenuOpen && (
                              <div className="anno-menu-dropdown">
                                <button
                                  className="anno-menu-item edit"
                                  onClick={() => openEditModal(item)}
                                >
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  수정하기
                                </button>
                                <button
                                  className="anno-menu-item delete"
                                  onClick={() => deletePost(item.id)}
                                >
                                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  삭제하기
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* FAB 글쓰기 버튼 */}
      <button
        onClick={() => {
          if (!isLoggedIn) { alert('로그인이 필요합니다.'); router.push('/login'); return; }
          setIsWriteModalOpen(true);
        }}
        className="anno-fab"
      >
        <svg className="anno-fab-icon" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* 필사 작성 모달 */}
      {isWriteModalOpen && (
        <div className="anno-modal-backdrop">
          <div className="anno-modal">
            <div className="anno-modal-header">
              <h3 className="anno-modal-title">새 문장 기록하기</h3>
              <button onClick={() => setIsWriteModalOpen(false)} className="anno-modal-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitPost} className="anno-modal-form">
              <div>
                <label className="anno-form-label">기억하고 싶은 문장</label>
                <textarea
                  placeholder="당신의 마음에 들었던 문장을 적어주세요."
                  rows={3}
                  value={newPost.quote}
                  onChange={(e) => setNewPost({ ...newPost, quote: e.target.value })}
                  className="anno-form-textarea"
                />
              </div>

              <div className="anno-form-row">
                <div>
                  <label className="anno-form-label">책 제목</label>
                  <input
                    type="text"
                    placeholder="예: 모순"
                    value={newPost.book}
                    onChange={(e) => setNewPost({ ...newPost, book: e.target.value })}
                    className="anno-form-input"
                  />
                </div>
                <div>
                  <label className="anno-form-label">저자</label>
                  <input
                    type="text"
                    placeholder="예: 양귀자"
                    value={newPost.author}
                    onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                    className="anno-form-input"
                  />
                </div>
              </div>

              <div>
                <label className="anno-form-label">이미지 업로드 (선택)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="anno-file-input"
                />
                {newPost.imagePreview && (
                  <img src={newPost.imagePreview} alt="preview" className="anno-img-preview" />
                )}
              </div>

              <button type="submit" className="anno-submit-btn">전시하기</button>
            </form>
          </div>
        </div>
      )}

      {/* 게시글 수정 모달 */}
      {editModal.open && (
        <div className="anno-modal-backdrop" onClick={() => setEditModal({ open: false, post: null })}>
          <div className="anno-modal" onClick={e => e.stopPropagation()}>
            <div className="anno-modal-header">
              <h3 className="anno-modal-title">문장 수정하기</h3>
              <button onClick={() => setEditModal({ open: false, post: null })} className="anno-modal-close">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={submitEditPost} className="anno-modal-form">
              <div>
                <label className="anno-form-label">기억하고 싶은 문장</label>
                <textarea
                  placeholder="문장을 수정하세요."
                  rows={3}
                  value={editForm.quote}
                  onChange={e => setEditForm({ ...editForm, quote: e.target.value })}
                  className="anno-form-textarea"
                />
              </div>
              <div className="anno-form-row">
                <div>
                  <label className="anno-form-label">책 제목</label>
                  <input
                    type="text"
                    value={editForm.book}
                    onChange={e => setEditForm({ ...editForm, book: e.target.value })}
                    className="anno-form-input"
                  />
                </div>
                <div>
                  <label className="anno-form-label">저자</label>
                  <input
                    type="text"
                    value={editForm.author}
                    onChange={e => setEditForm({ ...editForm, author: e.target.value })}
                    className="anno-form-input"
                  />
                </div>
              </div>
              <button type="submit" className="anno-submit-btn" disabled={!editForm.quote.trim()}>저장하기</button>
            </form>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────
          댓글 드로어
      ──────────────────────────────────── */}
      {commentDrawer.open && (
        <>
          {/* 배경 오버레이 — 클릭 시 닫기 */}
          <div className="comment-backdrop" onClick={closeComments} />

          {/* 슬라이드 드로어 */}
          <div className="comment-drawer">
            {/* 헤더 */}
            <div className="comment-drawer-header">
              <span className="comment-drawer-title">💬 댓글</span>
              <button className="comment-close-btn" onClick={closeComments}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 원본 인용구 */}
            {commentDrawer.postQuote && (
              <div className="comment-quote-preview">"{commentDrawer.postQuote}"</div>
            )}

            {/* 댓글 목록 */}
            <div className="comment-list" ref={commentListRef}>
              {commentDrawer.loading ? (
                <div className="comment-loading"><div className="spinner" /></div>
              ) : commentDrawer.comments.length === 0 ? (
                <div className="comment-empty">
                  첫 댓글을 남겨보세요 🌿
                </div>
              ) : (
                commentDrawer.comments.map((c) => {
                  const isMine = myId && (c.authorId === myId || c.authorId?._id === myId);
                  return (
                    <div key={c.id} className="comment-item">
                      <div className="comment-avatar">
                        {(c.author[0] || '?').toUpperCase()}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header-row">
                          <span className="comment-author">{c.author}</span>
                          <span className="comment-time">{formatTime(c.createdAt)}</span>
                        </div>
                        <div className="comment-content">{c.content}</div>
                      </div>
                      {/* 내 댓글만 삭제 버튼 표시 */}
                      {isMine && (
                        <button
                          className="comment-delete-btn"
                          onClick={() => deleteComment(c.id)}
                          title="댓글 삭제"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* 입력 영역 */}
            {isLoggedIn ? (
              <div className="comment-input-bar">
                <textarea
                  className="comment-input"
                  placeholder="따뜻한 댓글을 남겨주세요 🌿"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }
                  }}
                  rows={1}
                />
                <button
                  className="comment-send-btn"
                  onClick={submitComment}
                  disabled={!commentInput.trim() || isSendingComment}
                >
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="comment-login-notice">
                <span
                  className="comment-login-link"
                  onClick={() => router.push('/login')}
                >로그인</span>
                {' '}하면 댓글을 남길 수 있어요.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}