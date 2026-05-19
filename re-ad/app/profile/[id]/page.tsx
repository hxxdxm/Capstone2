"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';

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

  // 📍 [핵심 수정] 헤더 객체를 안전하게 만드는 함수
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

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">프로필을 불러오는 중...</div>;
  if (!profileData) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      <Header />

      <main className="mx-auto max-w-4xl px-6 mt-12">
        <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          
          <div className="flex items-center space-x-6 relative z-10">
            <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {profileData.nickname ? profileData.nickname[0] : '👤'}
            </div>
            <div>
              <h2 className="text-3xl font-black mb-2 flex items-center space-x-3">
                <span>{profileData.nickname}</span>
                {profileData.readingMbti && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-600 text-[10px] uppercase tracking-widest rounded-md border border-purple-200">
                    {profileData.readingMbti}
                  </span>
                )}
              </h2>
              <div className="flex space-x-4 text-sm font-bold text-gray-500">
                <span>팔로워 <strong className="text-black">{followersCount}</strong></span>
                <span>팔로잉 <strong className="text-black">{followingCount}</strong></span>
              </div>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto">
            {getMyId() !== targetUserId && (
              <button 
                onClick={handleToggleFollow}
                className={`w-full md:w-auto px-10 py-4 rounded-full font-black text-sm transition-all duration-300 shadow-md ${
                  isFollowing 
                    ? 'bg-white text-black border-2 border-black hover:bg-gray-50'
                    : 'bg-black text-white border-2 border-black hover:bg-gray-800'
                }`}
              >
                {isFollowing ? '팔로잉' : '팔로우하기'}
              </button>
            )}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic tracking-tighter">Collection</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              {profileData.quotes?.length || 0} Quotes
            </span>
          </div>

          {profileData.quotes && profileData.quotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {profileData.quotes.map((q: any) => (
                <div key={q._id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between h-[280px]">
                  <div>
                    <div className="text-3xl font-serif text-gray-100 mb-2">"</div>
                    <p className="font-serif text-gray-800 leading-relaxed line-clamp-4 break-keep">
                      {q.quote || q.content}
                    </p>
                  </div>
                  <p className="text-[10px] text-black font-black uppercase tracking-tight truncate border-l-2 border-black pl-3 mt-4">
                    {q.bookId?.title || q.bookTitle || 'Unknown Book'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-[2rem] border border-gray-100 text-center text-gray-400 font-bold">
              아직 수집한 문장이 없습니다.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}