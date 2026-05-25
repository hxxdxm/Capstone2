"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import './profile.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function OtherUserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const targetUserId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // 팔로워/팔로잌 목록 모달
  const [followModal, setFollowModal] = useState<{
    open: boolean;
    type: 'followers' | 'following';
    list: any[];
    loading: boolean;
  }>({ open: false, type: 'followers', list: [], loading: false });

  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return null;
    if (token.split('.').length !== 3) return null;
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

  const getHeaders = () => {
    const token = getSafeToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    if (targetUserId) {
      fetchAllProfileData();
    }
  }, [targetUserId]);

  const fetchAllProfileData = async () => {
    const headers = getHeaders();
    const myId = getMyId();

    try {
      const profileRes = await fetch(`${API_BASE_URL}/users/${targetUserId}/profile`, { headers });
      if (profileRes.ok) {
        setProfileData(await profileRes.json());
      } else {
        alert("존재하지 않는 유저입니다.");
        router.push('/');
        return;
      }

      const followersRes = await fetch(`${API_BASE_URL}/users/${targetUserId}/followers`, { headers });
      if (followersRes.ok) {
        const followersList = await followersRes.json();
        setFollowersCount(followersList.length);
        if (myId) {
          const amIFollowing = followersList.some((user: any) => user._id === myId);
          setIsFollowing(amIFollowing);
        }
      }

      const followingRes = await fetch(`${API_BASE_URL}/users/${targetUserId}/following`, { headers });
      if (followingRes.ok) {
        const followingList = await followingRes.json();
        setFollowingCount(followingList.length);
      }
    } catch (error) {
      console.error("프로필 데이터 로드 에러:", error);
    } finally {
      setIsLoading(false);
    }
  };
  // 팔로워/팔로잉 목록 열기
  const openFollowModal = async (type: 'followers' | 'following') => {
    setFollowModal({ open: true, type, list: [], loading: true });
    const headers = getHeaders();
    try {
      const res = await fetch(`${API_BASE_URL}/users/${targetUserId}/${type}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setFollowModal(prev => ({ ...prev, list: Array.isArray(data) ? data : [], loading: false }));
      } else {
        setFollowModal(prev => ({ ...prev, loading: false }));
      }
    } catch {
      setFollowModal(prev => ({ ...prev, loading: false }));
    }
  };

  const handleToggleFollow = async () => {
    const token = getSafeToken();
    if (!token) {
      alert("로그인 후 팔로우할 수 있습니다.");
      return router.push('/login');
    }

    const prevIsFollowing = isFollowing;
    const prevCount = followersCount;

    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? prevCount - 1 : prevCount + 1);

    try {
      const res = await fetch(`${API_BASE_URL}/users/${targetUserId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        setIsFollowing(data.isFollowing);
      } else {
        setIsFollowing(prevIsFollowing);
        setFollowersCount(prevCount);
        alert("팔로우 처리에 실패했습니다.");
      }
    } catch (error) {
      setIsFollowing(prevIsFollowing);
      setFollowersCount(prevCount);
      alert("서버와 통신할 수 없습니다.");
    }
  };

  const handleDm = () => {
    const token = getSafeToken();
    if (!token) {
      alert("로그인 후 이용할 수 있습니다.");
      return router.push('/login');
    }
    router.push(`/dms/${targetUserId}`);
  };

  if (isLoading) return (
    <div className="profile-loading">
      <div>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(123,160,91,0.3)', borderTopColor: '#7BA05B', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p>프로필을 불러오는 중...</p>
      </div>
    </div>
  );
  if (!profileData) return null;

  // 📍 닉네임/이름 필드 다중 대응 (백엔드 응답 필드명 차이 해결)
  const displayName =
    profileData.nickname ||
    profileData.username ||
    profileData.name ||
    profileData.user?.nickname ||
    profileData.user?.username ||
    '알 수 없음';

  const avatarChar = displayName !== '알 수 없음' ? displayName[0] : '👤';

  return (
    <div className="profile-container">
      <Header />

      <main className="profile-main">
        {/* ── 프로필 카드 ── */}
        <section className="profile-card">
          <div className="profile-info">
            <div className="profile-avatar">
              {avatarChar}
            </div>
            <div>
              <div className="profile-name-row">
                <span className="profile-name">{displayName}</span>
                {profileData.readingMbti && (
                  <span className="profile-mbti-badge">
                    {profileData.readingMbti}
                  </span>
                )}
              </div>
              <div className="profile-stats">
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline dotted' }}
                  onClick={() => openFollowModal('followers')}
                >
                  팔로워 <strong>{followersCount}</strong>
                </span>
                <span
                  style={{ cursor: 'pointer', textDecoration: 'underline dotted', marginLeft: '15px' }}
                  onClick={() => openFollowModal('following')}
                >
                  팔로잉 <strong>{followingCount}</strong>
                </span>
              </div>
            </div>
          </div>

          {getMyId() !== targetUserId && (
            <div className="profile-action-btns">
              <button
                onClick={handleToggleFollow}
                className={`btn-follow ${isFollowing ? 'following' : 'not-following'}`}
              >
                {isFollowing ? '팔로잉 ✓' : '팔로우하기'}
              </button>
              <button onClick={handleDm} className="btn-dm">
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                메시지
              </button>
            </div>
          )}
        </section>

        {/* ── 컬렉션 ── */}
        <section className="profile-collection">
          <div className="profile-collection-header">
            <h3 className="profile-collection-title">Collection</h3>
            <span className="profile-collection-count">
              {profileData.quotes?.length || 0} Quotes
            </span>
          </div>

          {profileData.quotes && profileData.quotes.length > 0 ? (
            <div className="profile-quotes-grid">
              {profileData.quotes.map((q: any) => (
                <div key={q._id} className="profile-quote-card">
                  <div>
                    <div className="profile-quote-mark">"</div>
                    <p className="profile-quote-text">
                      {q.quote || q.content}
                    </p>
                  </div>
                  <p className="profile-quote-book">
                    {q.bookId?.title || q.bookTitle || 'Unknown Book'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-empty-collection">
              <p>아직 수집한 문장이 없습니다.</p>
              <p>이 독자가 마음에 드는 문장을 모으면 여기에 표시됩니다.</p>
            </div>
          )}
        </section>
      </main>

      {/* ── 팔로워/팔로잉 목록 모달 ── */}
      {followModal.open && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(59,50,36,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
          }}
          onClick={() => setFollowModal(prev => ({ ...prev, open: false }))}
        >
          <div
            style={{
              background: '#FDFAF5', borderRadius: '28px', width: '100%', maxWidth: '400px',
              border: '1.5px solid #D9CDB8', boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
              maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid #EDE7DA', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: "'Noto Serif KR', serif", fontSize: '20px', fontWeight: 900, color: '#3B3224', margin: 0 }}>
                {followModal.type === 'followers' ? '팔로워' : '팔로잉'}
              </h3>
              <button
                onClick={() => setFollowModal(prev => ({ ...prev, open: false }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8A7A60', fontSize: '20px', lineHeight: 1 }}
              >✕</button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 16px' }}>
              {followModal.loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                  <div style={{ width: '32px', height: '32px', border: '3px solid rgba(123,160,91,0.3)', borderTopColor: '#7BA05B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
              ) : followModal.list.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '40px 0', color: '#8A7A60', fontSize: '14px', fontWeight: 600 }}>
                  {followModal.type === 'followers' ? '팔로워가 없습니다.' : '팔로잉하는 사용자가 없습니다.'}
                </p>
              ) : (
                followModal.list.map((user: any) => {
                  const displayName = user.nickname || user.username || user.name || '알 수 없음';
                  const userId = user._id || user.id;
                  return (
                    <div
                      key={userId}
                      onClick={() => { router.push(`/profile/${userId}`); setFollowModal(prev => ({ ...prev, open: false })); }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 8px', borderRadius: '14px', cursor: 'pointer', transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#F2EDE4')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                        background: 'linear-gradient(135deg, #3B3224, #5A4A36)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#F2EDE4', fontWeight: 900, fontSize: '16px', fontFamily: "'Noto Serif KR', serif"
                      }}>
                        {displayName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#3B3224' }}>{displayName}</div>
                        {user.readingMbti && (
                          <div style={{ fontSize: '10px', color: '#7BA05B', fontWeight: 700, marginTop: '2px' }}>{user.readingMbti}</div>
                        )}
                      </div>
                      <svg style={{ marginLeft: 'auto', color: '#BDB09A' }} width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}