"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 📍 철벽 방어막 적용!
  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return null;
    if (token.split('.').length !== 3) return null;
    return token;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return alert("검색어를 입력해주세요.");

    setIsLoading(true);
    setHasSearched(true);
    const token = getSafeToken();

    try {
      const res = await fetch(`${API_BASE_URL}/users/search?keyword=${encodeURIComponent(keyword)}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (res.ok) {
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error("검색 중 에러 발생:", error);
      alert("검색 중 서버 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
      <Header />

      <main className="mx-auto max-w-3xl px-6 mt-12">
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 mb-10 text-center">
          <span className="inline-block px-3 py-1 bg-black text-white text-[10px] font-black tracking-[0.3em] mb-6 rounded-full">
            FIND MEMBERS
          </span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-8">
            함께할 독서 메이트 찾기
          </h2>

          <form onSubmit={handleSearch} className="relative w-full max-w-xl mx-auto">
            <input 
              type="text" 
              placeholder="닉네임이나 이메일로 친구를 검색해보세요" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-full py-4 pl-6 pr-16 text-sm font-bold focus:outline-none focus:border-black transition"
            />
            <button 
              type="submit" 
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </form>
        </section>

        <section>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black"></div>
            </div>
          ) : (
            <>
              {hasSearched && (
                <p className="text-xs font-bold text-gray-500 mb-6 pl-2">
                  검색 결과 <span className="text-black font-black">{results.length}</span>건
                </p>
              )}

              {hasSearched && results.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 py-16 text-center">
                  <span className="text-3xl mb-4 block">👀</span>
                  <p className="text-gray-400 font-bold text-sm">일치하는 멤버를 찾을 수 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((user: any) => (
                    <Link href={`/profile/${user._id}`} key={user._id}>
                      <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center text-white text-xl font-black">
                            {user.nickname ? user.nickname[0] : '👤'}
                          </div>
                          <div>
                            <h3 className="font-black text-lg group-hover:underline decoration-2 underline-offset-2">
                              {user.nickname}
                            </h3>
                            {/* 📍 백엔드 명세에 맞춰 readingMbti 로 변경! */}
                            {user.readingMbti && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-purple-100 text-purple-600 text-[9px] uppercase tracking-widest rounded-md border border-purple-200">
                                {user.readingMbti}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}