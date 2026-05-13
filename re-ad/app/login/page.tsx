"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header'; // 공통 헤더

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    // 📍 실제 백엔드 로그인 통신 로직이 들어갈 자리입니다.
    // 임시 처리
    if (formData.email && formData.password) {
      alert("로그인 성공!");
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-black flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-12 mt-10">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 md:p-12 relative overflow-hidden">
          
          {/* 상단 장식용 라벨 */}
          <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>

          <div className="text-center mb-10 mt-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-3 text-black">
              Login
            </h2>
            <p className="text-gray-500 font-bold text-xs tracking-widest">
              교환독서에 다시 오신 것을 환영합니다
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                Email
              </label>
              <input 
                type="email" 
                className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" 
                placeholder="이메일을 입력해주세요" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                Password
              </label>
              <input 
                type="password" 
                className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" 
                placeholder="비밀번호를 입력해주세요" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-lg mt-8"
            >
              로그인
            </button>
          </form>

          {/* 📍 요청하신 하단 텍스트 링크 영역 */}
          <div className="mt-10 flex flex-col text-center">
            
            {/* 1. 회원가입 유도 */}
            <div className="text-xs font-bold text-gray-500 pb-8">
              <span>아직 기록을 시작하지 않으셨나요? </span>
              <Link href="/signup" className="text-black font-black underline underline-offset-4 hover:text-gray-600 transition">
                회원가입
              </Link>
            </div>

            {/* 2. 로그인 문제 해결 (이메일 찾기 / 비밀번호 재설정) */}
            <div className="pt-6 border-t border-gray-100 flex flex-col space-y-3">
              <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">
                로그인에 문제가 있나요?
              </span>
              <div className="flex justify-center items-center space-x-3 text-xs font-bold text-gray-500">
                <Link href="/find-email" className="hover:text-black transition">
                  이메일 찾기
                </Link>
                <span className="text-gray-300">|</span>
                <Link href="/reset-password" className="hover:text-black transition">
                  비밀번호 재설정
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}