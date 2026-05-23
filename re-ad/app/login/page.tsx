"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // 공통 헤더

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  // 📍 로그인 유지 체크박스 상태 추가
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      alert("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      // 1. 📍 백엔드 로그인 API로 이메일과 비밀번호 전송
      const res = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // 📍 응답 구조 확인용 (브라우저 콘솔 F12 > Console 탭에서 확인)
        console.log('🔑 로그인 API 응답 전체:', data);

        const token = data.token || data.accessToken || data.access_token;
        // 가능한 모든 닉네임 필드명 시도 + 중첩 객체(data.user) 내부도 확인
        const user = data.user || data.data || {};
        const userName =
          data.username || data.nickname || data.name ||
          user.username || user.nickname || user.name || '';

        console.log('👤 추출된 닉네임:', userName);

        if (!token) {
          alert("서버 통신은 성공했으나 토큰을 찾을 수 없습니다. (백엔드 응답 키값 확인 필요)");
          return;
        }

        // 3. 📍 로그인 유지 체크 여부에 따라 브라우저 창고에 안전하게 저장
        if (keepLoggedIn) {
          // 체크 O: 브라우저를 꺼도 유지되는 localStorage에 저장
          localStorage.setItem('token', token);
          localStorage.setItem('userName', userName);
        } else {
          // 체크 X: 브라우저 끄면 날아가는 sessionStorage에 저장
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('userName', userName);
        }

        alert("로그인 성공! 환영합니다.");
        
        // 4. 📍 헤더 상태 업데이트를 위해 강제 이동 (새로고침)
        window.location.href = '/';
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`로그인 실패: ${errorData.message || '이메일 또는 비밀번호를 다시 확인해주세요.'}`);
      }
    } catch (error) {
      alert("서버와 통신할 수 없습니다.");
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
                placeholder="example@company.com" 
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

            {/* 로그인 상태 유지 체크박스 영역 */}
            <div className="flex items-center pt-2">
              <input 
                type="checkbox" 
                id="keepLoggedIn" 
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="w-4 h-4 accent-black cursor-pointer rounded-sm border-gray-300"
              />
              <label htmlFor="keepLoggedIn" className="ml-2 text-xs font-bold text-gray-500 cursor-pointer select-none hover:text-black transition">
                로그인 상태 유지
              </label>
            </div>

            <button 
              type="submit" 
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-lg mt-8"
            >
              로그인
            </button>
          </form>

          {/* 하단 텍스트 링크 영역 */}
          <div className="mt-10 flex flex-col text-center">
            
            <div className="text-xs font-bold text-gray-500 pb-8">
              <span>아직 기록을 시작하지 않으셨나요? </span>
              <Link href="/signup" className="text-black font-black underline underline-offset-4 hover:text-gray-600 transition">
                회원가입
              </Link>
            </div>

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