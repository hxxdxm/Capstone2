"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function SignupPage() {
  // 1. 입력 데이터를 하나의 객체로 관리 (백엔드 전달용)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // 2. 비즈니스 로직 (데이터 연결 담당자가 작업할 공간)
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // 프론트엔드 1차 검증
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    /** * @TODO : 백엔드 회원가입 API 연결 지점
     * 예: const response = await fetch('/api/signup', { method: 'POST', body: JSON.stringify(formData) });
     */
    console.log("백엔드로 보낼 데이터:", formData);
    
    alert("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
    window.location.href = "/login";
  };

  // 3. 입력값 변경 함수 (공통 사용)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 text-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-10 shadow-xl ring-1 ring-gray-100">
        
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight">
            <span className="text-green-600">교환</span>
            <span className="text-orange-500">독서</span>
            <span className="ml-2 text-gray-800">시작하기</span>
          </h1>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSignup}>
          {/* 각 Input에 'name' 속성을 부여하여 데이터 매핑을 쉽게 만듭니다 */}
          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold text-gray-600">이름</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:border-green-500 focus:bg-white outline-none transition"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold text-gray-600">이메일</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:border-green-500 focus:bg-white outline-none transition"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold text-gray-600">비밀번호</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:border-orange-500 focus:bg-white outline-none transition"
              placeholder="8자 이상 입력"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-1">
            <label className="ml-1 text-xs font-bold text-gray-600">비밀번호 확인</label>
            <input
              name="confirmPassword"
              type="password"
              required
              className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm focus:border-orange-500 focus:bg-white outline-none transition"
              placeholder="다시 한 번 입력"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="mt-4 w-full rounded-2xl bg-green-600 py-4 font-bold text-white shadow-lg transition hover:bg-green-700 active:scale-[0.98]"
          >
            가입 완료
          </button>
        </form>

        <div className="pt-4 text-center text-sm font-medium text-gray-500">
          이미 계정이 있으신가요?{' '}
          <Link href="/login" className="font-bold text-orange-500 hover:underline">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
}