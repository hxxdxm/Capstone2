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
                <span className="profile-stat">팔로워 <strong>{followersCount}</strong></span>
                <span className="profile-stat">팔로잉 <strong>{followingCount}</strong></span>
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
    </div>
  );
}