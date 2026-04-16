"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', nickname: '' });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // [NEW] 서버가 정상적으로 처리하지 못했을 때의 구체적인 에러 잡기
      if (!response.ok) {
        const textData = await response.text(); 
        try {
          const jsonData = JSON.parse(textData);
          alert(`가입 실패: ${jsonData.message}`); // (예: "이미 가입된 이메일입니다.")
          return;
        } catch {
          alert(`서버 내부 에러가 발생했습니다: ${textData.substring(0, 50)}...`);
          return;
        }
      }

      const data = await response.json();
      alert(data.message); // "회원가입이 완료되었습니다!"
      router.push('/login'); 

    } catch (error: any) {
      // 인터넷이 끊겼거나 백엔드 서버가 아예 꺼져있을 때
      alert(`서버와 연결할 수 없습니다. (에러: ${error.message})`);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm ring-1 ring-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2"><span className="text-green-600">교환</span><span className="text-orange-500">독서</span></h1>
          <p className="text-gray-500 font-medium">새로운 독서 모임을 시작해보세요!</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">이메일</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">비밀번호</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" placeholder="비밀번호를 입력하세요" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">닉네임</label>
            <input type="text" required value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" placeholder="모임에서 사용할 이름" />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition shadow-sm mt-4">
            가입하기
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          이미 계정이 있으신가요? <Link href="/login" className="text-green-600 hover:underline font-bold">로그인하기</Link>
        </p>
      </div>
    </div>
  );
}