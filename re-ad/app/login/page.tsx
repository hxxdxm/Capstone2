"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // ⭐️ 1. 오류 메시지를 화면에 띄우기 위한 상태 추가
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setErrorMsg(''); // 요청을 보낼 때 기존 에러 메시지 초기화
    
    if (!email || !password) {
      setErrorMsg('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*?_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    setErrorMsg('비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.');
    return; // 조건에 안 맞으면 여기서 함수 종료 (서버로 요청 안 보냄)
  }
  
    try {
      const response = await fetch('http://13.124.191.57:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user?.nickname || email.split('@')[0]); 
        
        // alert 대신 조용히 홈으로 이동 (사용자 경험 향상)
        router.push('/'); 
      } else {
        // ⭐️ 2. 실패 시 화면에 에러 메시지 표시
        setErrorMsg(data.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
      }
    } catch (error) {
      console.error('로그인 에러:', error);
      // 백엔드 통신 실패(CORS 에러 등) 시 표시할 메시지
      setErrorMsg('서버와 통신할 수 없습니다. 서버 상태나 CORS 설정을 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 font-sans bg-white">
      
      {/* 왼쪽: 텍스트힙 감성 이미지 & 명언 (웹에서만 보임) */}
      <div className="hidden lg:flex w-1/2 bg-gray-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1455390582262-044cdead27d8?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/90"></div>
        <div className="relative z-10 p-12 text-center max-w-lg">
          <span className="text-4xl text-gray-500 font-serif mb-4 block">"</span>
          <h2 className="text-3xl font-serif text-white mb-6 leading-relaxed break-keep">
            우리가 읽어야 할 것은<br/>오직 영혼을 흔드는 책뿐이다.
          </h2>
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">프란츠 카프카</p>
        </div>
      </div>

      {/* 오른쪽: 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24">
        
        {/* 뒤로가기 버튼 */}
        <Link href="/" className="absolute top-8 left-8 lg:left-1/2 lg:ml-8 text-gray-400 hover:text-gray-900 transition flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-sm font-bold">홈으로</span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          {/* ⭐️ 3. 로고 영역에 Link 태그 적용 (클릭 시 홈으로 이동) */}
          <div className="text-center mb-10">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-black tracking-tighter mb-2 cursor-pointer hover:opacity-80 transition">
                교환<span className="text-gray-400">독서</span>
              </h1>
            </Link>
            <p className="text-sm text-gray-500">당신의 밑줄이 예술이 되는 공간</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="email" 
                placeholder="이메일" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition placeholder:text-gray-400" 
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="비밀번호" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition placeholder:text-gray-400" 
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                <span className="text-xs text-gray-500 font-bold">로그인 유지</span>
              </label>
              <Link href="#" className="text-xs font-bold text-gray-400 hover:text-gray-900 transition underline">비밀번호 찾기</Link>
            </div>

            {/* ⭐️ 4. 에러 메시지가 있을 때만 빨간색으로 출력되는 영역 추가 */}
            {errorMsg && (
              <div className="text-red-500 text-sm font-bold text-center py-1">
                {errorMsg}
              </div>
            )}

            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg mt-2">
              로그인
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            아직 기록을 시작하지 않으셨나요? <br className="sm:hidden" />
            <Link href="/register" className="font-bold text-gray-900 underline ml-1 hover:text-gray-600 transition">회원가입</Link>
          </p>
        </div>
      </div>
    </div>
  );
}