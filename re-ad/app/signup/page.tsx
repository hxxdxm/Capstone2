"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function SignupPage() {
  const router = useRouter();
  
  // 폼 데이터
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  // 📍 전화번호 인증 관련 상태
  const [authCode, setAuthCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3분 = 180초

  // 📍 타이머 로직
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isCodeSent && !isVerified && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsCodeSent(false); // 시간 초과 시 다시 전송해야 함
    }
    return () => clearInterval(timerId);
  }, [isCodeSent, isVerified, timeLeft]);

  // 타이머 표시 포맷 (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 📍 1. 인증번호 전송 함수
  const handleSendAuthCode = async () => {
    if (!formData.phone || formData.phone.length < 10) {
      alert("올바른 핸드폰 번호를 입력해주세요. (기호 없이 숫자만)");
      return;
    }

    // TODO: 백엔드 API 호출 (`/api/auth/send-sms`)
    /*
    const res = await fetch(`${API_BASE_URL}/auth/send-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formData.phone })
    });
    if(!res.ok) return alert("전송 실패");
    */

    alert("입력하신 번호로 인증번호 6자리가 전송되었습니다. (현재는 UI 테스트 모드입니다)");
    setIsCodeSent(true);
    setIsVerified(false);
    setTimeLeft(180); // 3분 타이머 시작
  };

  // 📍 2. 인증번호 확인 함수
  const handleVerifyCode = async () => {
    if (!authCode) return alert("인증번호를 입력해주세요.");

    // TODO: 백엔드 API 호출 (`/api/auth/verify-sms`)
    /*
    const res = await fetch(`${API_BASE_URL}/auth/verify-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formData.phone, code: authCode })
    });
    if(!res.ok) return alert("인증번호가 일치하지 않습니다.");
    */

    // 임시 테스트용 조건 (아무 번호나 넣어도 성공하게 둠)
    alert("인증이 완료되었습니다!");
    setIsVerified(true);
    setIsCodeSent(false);
  };

  // 📍 3. 최종 회원가입 함수
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      alert("전화번호 인증을 완료해주세요!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    // TODO: 실제 회원가입 API 통신 로직
    alert("회원가입이 완료되었습니다!");
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-black flex flex-col pb-20">
      <Header />

      <main className="flex-1 flex items-center justify-center px-6 py-12 mt-10">
        <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-10 md:p-12 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>

          <div className="text-center mb-10 mt-2">
            <h2 className="text-3xl font-black tracking-tighter uppercase mb-3 text-black">
              Sign Up
            </h2>
            <p className="text-gray-500 font-bold text-xs tracking-widest">
              교환독서의 멤버가 되어보세요
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            
            {/* 이메일 */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Email</label>
              <input type="email" className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" placeholder="이메일 주소" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Nickname</label>
              <input type="text" className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" placeholder="사용할 닉네임 (예: 독서왕)" value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} required />
            </div>

            {/* 📍 전화번호 인증 영역 (핵심!) */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Phone Verification</label>
              <div className="flex space-x-3">
                <input 
                  type="text" 
                  maxLength={11}
                  className="flex-1 border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent disabled:text-gray-400" 
                  placeholder="- 없이 숫자만 입력" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})} 
                  disabled={isVerified}
                  required 
                />
                <button 
                  type="button" 
                  onClick={handleSendAuthCode}
                  disabled={isVerified}
                  className={`px-4 py-2 text-xs font-black rounded-xl transition ${isVerified ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-100 text-black border border-gray-200 hover:border-black hover:bg-white'}`}
                >
                  {isVerified ? '인증완료' : (isCodeSent ? '재전송' : '인증번호 전송')}
                </button>
              </div>
            </div>

            {/* 📍 인증번호 입력 영역 (전송 버튼을 눌렀을 때만 나타남) */}
            {isCodeSent && !isVerified && (
              <div className="flex space-x-3 animate-in fade-in slide-in-from-top-2">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    maxLength={6}
                    className="w-full border-b-2 border-blue-500 py-3 pl-2 pr-12 outline-none font-bold text-black bg-blue-50/30 transition" 
                    placeholder="인증번호 6자리 입력" 
                    value={authCode} 
                    onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))} 
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-red-500">
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={handleVerifyCode}
                  className="px-6 py-2 text-xs font-black rounded-xl bg-black text-white hover:bg-gray-800 transition shadow-md"
                >
                  확인
                </button>
              </div>
            )}

            {/* 비밀번호 */}
            <div className="pt-2">
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Password</label>
              <input type="password" className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" placeholder="비밀번호" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Confirm Password</label>
              <input type="password" className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" placeholder="비밀번호 확인" value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} required />
            </div>

            <button 
              type="submit" 
              className="w-full bg-black text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-800 transition shadow-lg mt-8"
            >
              가입하기
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <span className="text-xs font-bold text-gray-500">이미 계정이 있으신가요? </span>
            <Link href="/login" className="text-black font-black underline underline-offset-4 hover:text-gray-600 transition">
              로그인
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}