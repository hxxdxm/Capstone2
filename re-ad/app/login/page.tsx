"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  // 1. 입력 데이터 상태 관리 (백엔드 전달용 객체)
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // 2. 비즈니스 로직 (데이터 연결 담당자가 작업할 핵심 함수)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    /** * @TODO : 백엔드 로그인 API 및 인증(NextAuth 등) 연결 지점
     * 1. const res = await fetch('/api/login', { ... });
     * 2. 성공 시 쿠키/세션 저장 및 메인 페이지 이동
     */
    console.log("로그인 시도 데이터:", loginData);
    
    // 임시 성공 처리
    alert("로그인에 성공했습니다!");
    window.location.href = "/"; 
  };

  // 3. 소셜 로그인 핸들러 (연결 담당자를 위한 자리)
  const handleSocialLogin = (provider: 'kakao' | 'naver' | 'google') => {
    /** * @TODO : 각 소셜 서비스별 인증 SDK나 API 연결
     * 예: signIn(provider);
     */
    console.log(`${provider} 로그인 시도`);
  };

  // 4. 입력값 변경 공통 함수
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-12 shadow-xl ring-1 ring-gray-100">
        
        {/* 로고 섹션 */}
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tight">
            <span className="text-green-600">교환</span>
            <span className="text-orange-500">독서</span>
          </h1>
          <p className="mt-3 text-sm font-bold text-gray-500">
            다시 읽는 즐거움, 함께 나누는 가치
          </p>
        </div>

        {/* 로그인 폼 */}
        <form className="mt-10 space-y-5" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">이메일</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition focus:border-green-500 focus:bg-white"
              placeholder="이메일을 입력해주세요"
              value={loginData.email}
              onChange={handleChange}
            />
          </div>
          <div className="space-y-2">
            <label className="ml-1 text-sm font-bold text-gray-700">비밀번호</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm outline-none transition focus:border-green-500 focus:bg-white"
              placeholder="비밀번호를 입력해주세요"
              value={loginData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-orange-500 py-4 font-bold text-white shadow-lg shadow-orange-100 transition hover:bg-orange-600 active:scale-[0.98]"
          >
            로그인
          </button>
        </form>

        {/* 간편 로그인 섹션 */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400 font-medium">간편 로그인</span></div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button onClick={() => handleSocialLogin('kakao')} className="flex items-center justify-center rounded-2xl bg-[#FEE500] py-3 transition hover:opacity-90 active:scale-95 text-[10px] font-bold">카카오</button>
          <button onClick={() => handleSocialLogin('naver')} className="flex items-center justify-center rounded-2xl bg-[#03C75A] py-3 transition hover:opacity-90 active:scale-95 text-[10px] font-bold text-white">네이버</button>
          <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center rounded-2xl border border-gray-200 bg-white py-3 transition hover:bg-gray-50 active:scale-95 text-[10px] font-bold text-gray-600">구글</button>
        </div>

        {/* 하단 링크 */}
        <div className="pt-6 text-center text-sm font-medium text-gray-500">
          계정이 없으신가요?{' '}
          <Link href="/signup" className="font-bold text-green-600 hover:underline">
            회원가입
          </Link>
        </div>
      </div>
    </div>
  );
}