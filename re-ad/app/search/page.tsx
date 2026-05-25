"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import './search.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

function SearchPageInner() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<'search' | 'friends'>('search');
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(!!searchParams.get('q'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  // 친구 목록 상태
  const [friends, setFriends] = useState<{ following: any[]; followers: any[]; mutualFriends: any[] }>({
    following: [], followers: [], mutualFriends: []
  });
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendTab, setFriendTab] = useState<'mutual' | 'following' | 'followers'>('mutual');

  useEffect(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    setIsLoggedIn(!!(token && token !== 'undefined' && token !== 'null' && token.split('.').length === 3));
  }, []);

  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return null;
    if (token.split('.').length !== 3) return null;
    return token;
  };

  // 친구 목록 fetch
  const fetchFriends = async () => {
    const token = getSafeToken();
    if (!token) return;
    setFriendsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dms/friends`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFriends({
          following:     Array.isArray(data.following)     ? data.following     : [],
          followers:     Array.isArray(data.followers)     ? data.followers     : [],
          mutualFriends: Array.isArray(data.mutualFriends) ? data.mutualFriends : [],
        });
      }
    } catch (err) {
      console.error('친구 목록 로드 실패:', err);
    } finally {
      setFriendsLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'friends' && isLoggedIn) fetchFriends();
  }, [tab, isLoggedIn]);

  const runSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    const token = getSafeToken();
    try {
      const res = await fetch(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(q)}`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("검색 중 에러 발생:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q && q.trim()) { setKeyword(q); runSearch(q); }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return alert("검색어를 입력해주세요.");
    await runSearch(keyword);
  };

  // 현재 친구 탭에서 보여줄 목록
  const currentFriendList = friendTab === 'mutual'
    ? friends.mutualFriends
    : friendTab === 'following'
    ? friends.following
    : friends.followers;

  return (
    <div className="search-page">
      <Header />

      {isLoggedIn === null ? (
        <div className="search-loading"><div className="spinner" /></div>
      ) : !isLoggedIn ? (
        /* 비로그인 */
        <main className="search-inner">
          <div className="search-login-required">
            <span className="search-lock-icon">🔒</span>
            <h2 className="search-lock-title">로그인이 필요한 기능입니다.</h2>
            <p className="search-lock-sub">독서 메이트를 찾으려면 먼저 로그인해 주세요.</p>
            <div className="search-lock-btns">
              <Link href="/login" className="btn-green">로그인하기</Link>
              <Link href="/signup" className="btn-outline">회원가입</Link>
            </div>
          </div>
        </main>
      ) : (
        <main className="search-inner">
          {/* 상단 탭 */}
          <div className="search-tabs">
            <button
              className={`search-tab${tab === 'search' ? ' active' : ''}`}
              onClick={() => setTab('search')}
            >
              🔍 친구 찾기
            </button>
            <button
              className={`search-tab${tab === 'friends' ? ' active' : ''}`}
              onClick={() => setTab('friends')}
            >
              🌿 내 친구 목록
            </button>
          </div>

          {/* ── 친구 찾기 탭 ── */}
          {tab === 'search' && (
            <>
              <section className="search-hero">
                <span className="search-hero-badge">FIND MEMBERS</span>
                <h2 className="search-hero-title">함께할 독서 메이트 찾기</h2>
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    placeholder="닉네임이나 이메일로 친구를 검색해보세요"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                </form>
              </section>

              <section>
                {isLoading ? (
                  <div className="search-loading"><div className="spinner" /></div>
                ) : (
                  <>
                    {hasSearched && (
                      <p className="search-result-count">
                        검색 결과 <strong>{results.length}</strong>건
                      </p>
                    )}
                    {hasSearched && results.length === 0 ? (
                      <div className="search-empty">
                        <span>👀</span>
                        일치하는 멤버를 찾을 수 없습니다.
                      </div>
                    ) : (
                      <div className="user-grid">
                        {results.map((user: any) => (
                          <Link href={`/profile/${user._id}`} key={user._id} className="user-card">
                            <div className="user-avatar">{user.nickname ? user.nickname[0] : '👤'}</div>
                            <div className="user-info">
                              <div className="user-name">{user.nickname}</div>
                              {user.readingMbti && (
                                <span className="user-mbti">{user.readingMbti}</span>
                              )}
                            </div>
                            <div className="user-arrow">
                              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>
            </>
          )}

          {/* ── 내 친구 목록 탭 ── */}
          {tab === 'friends' && (
            <>
              <div className="friend-tabs">
                <button
                  className={`friend-tab${friendTab === 'mutual' ? ' active' : ''}`}
                  onClick={() => setFriendTab('mutual')}
                >
                  맞팔 친구 <span className="friend-count">{friends.mutualFriends.length}</span>
                </button>
                <button
                  className={`friend-tab${friendTab === 'following' ? ' active' : ''}`}
                  onClick={() => setFriendTab('following')}
                >
                  팔로잉 <span className="friend-count">{friends.following.length}</span>
                </button>
                <button
                  className={`friend-tab${friendTab === 'followers' ? ' active' : ''}`}
                  onClick={() => setFriendTab('followers')}
                >
                  팔로워 <span className="friend-count">{friends.followers.length}</span>
                </button>
              </div>

              {friendsLoading ? (
                <div className="search-loading"><div className="spinner" /></div>
              ) : currentFriendList.length === 0 ? (
                <div className="search-empty">
                  <span>🌿</span>
                  {friendTab === 'mutual' && '아직 맞팔 친구가 없습니다.'}
                  {friendTab === 'following' && '팔로우하는 사람이 없습니다.'}
                  {friendTab === 'followers' && '팔로워가 없습니다.'}
                </div>
              ) : (
                <div className="user-grid">
                  {currentFriendList.map((user: any) => (
                    <div key={user._id} className="user-card" style={{ display: 'flex', alignItems: 'center' }}>
                      <Link href={`/profile/${user._id}`} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '14px', textDecoration: 'none' }}>
                        <div className="user-avatar">{(user.nickname || '?')[0]}</div>
                        <div className="user-info">
                          <div className="user-name">{user.nickname}</div>
                          {user.readingMbti && (
                            <span className="user-mbti">{user.readingMbti}</span>
                          )}
                        </div>
                      </Link>
                      {/* DM 바로가기 버튼 */}
                      <Link href={`/dms/${user._id}`} className="dm-quick-btn">
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        DM
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F2EDE4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #D9CDB8', borderTopColor: '#7BA05B', animation: 'spin 0.8s linear infinite' }} />
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}