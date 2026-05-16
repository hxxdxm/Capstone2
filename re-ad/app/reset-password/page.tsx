"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    newPassword: '',
    confirmPassword: '' // 📍 프론트엔드 전용 오타 방지용
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 새 비밀번호 일치 여부 확인
    if (formData.newPassword !== formData.confirmPassword) {
      alert("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);

    // 2. 백엔드 명세에 맞춘 페이로드 조립
    const payload = {
      email: formData.email,
      nickname: formData.nickname,
      newPassword: formData.newPassword
    };

    try {
      const res = await fetch(`${API_BASE_URL}/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("비밀번호가 성공적으로 재설정되었습니다! 새 비밀번호로 로그인해주세요.");
        router.push('/login'); // 성공 시 로그인 페이지로 이동
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`재설정 실패: ${errorData.message || '가입된 이메일 또는 닉네임이 일치하지 않습니다.'}`);
      }
    } catch (error) {
      alert("서버와 통신하는 중 에러가 발생했습니다.");
    } finally {
      setIsLoading(false);
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
              Reset
            </h2>
            <p className="text-gray-500 font-bold text-xs tracking-widest">
              비밀번호 재설정
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-6">
            
            {/* 이메일 입력 */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                가입한 Email
              </label>
              <input 
                type="email" 
                className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" 
                placeholder="예: test@test.com" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
              />
            </div>

            {/* 닉네임 입력 */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                가입한 닉네임
              </label>
              <input 
                type="text" 
                className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" 
                placeholder="예: 독서왕" 
                value={formData.nickname} 
                onChange={(e) => setFormData({...formData, nickname: e.target.value})} 
                required 
              />
            </div>

            {/* 새 비밀번호 입력 */}
            <div className="pt-4">
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                새로운 Password
              </label>
              <input 
                type="password" 
                className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" 
                placeholder="변경할 비밀번호를 입력해주세요" 
                value={formData.newPassword} 
                onChange={(e) => setFormData({...formData, newPassword: e.target.value})} 
                required 
              />
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">
                새로운 Password 확인
              </label>
              <input 
                type="password" 
                className="w-full border-b-2 border-gray-200 py-3 focus:border-black outline-none font-bold text-black transition bg-transparent" 
                placeholder="비밀번호를 한번 더 입력해주세요" 
                value={formData.confirmPassword} 
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                required 
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition shadow-lg mt-8 ${
                isLoading ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {isLoading ? '처리 중...' : '비밀번호 변경하기'}
            </button>
          </form>

          {/* 하단 로그인으로 돌아가기 링크 */}
          <div className="mt-8 text-center pt-6 border-t border-gray-100">
            <Link href="/login" className="text-xs font-bold text-gray-500 hover:text-black transition flex items-center justify-center space-x-1">
              <span>←</span>
              <span>로그인 화면으로 돌아가기</span>
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}