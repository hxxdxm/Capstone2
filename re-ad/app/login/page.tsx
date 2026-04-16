"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      // [NEW] 만약 서버가 뻗어서 JSON이 아닌 에러 페이지(HTML)를 보냈을 때를 대비한 코드
      if (!response.ok) {
        const textData = await response.text(); 
        try {
          const jsonData = JSON.parse(textData);
          alert(jsonData.message); // 정상적인 실패 메시지 (예: 비번 틀림)
          return;
        } catch {
          alert(`서버 내부 에러가 발생했습니다: ${textData.substring(0, 50)}...`);
          return;
        }
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.userName);
      
      alert(`${data.userName}님 환영합니다!`);
      router.push('/'); 
      
    } catch (error: any) {
      // [NEW] 인터넷이 끊겼거나 서버가 아예 꺼져있을 때
      alert(`서버와 연결할 수 없습니다. (에러: ${error.message})`);
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm ring-1 ring-gray-100 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-2"><span className="text-green-600">교환</span><span className="text-orange-500">독서</span></h1>
          <p className="text-gray-500 font-medium">다시 오신 것을 환영합니다!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">이메일</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" placeholder="example@email.com" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1.5">비밀번호</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-green-500 focus:bg-white transition outline-none" placeholder="비밀번호를 입력하세요" />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition shadow-sm mt-4">
            로그인
          </button>
        </form>
        
        <p className="text-center text-sm text-gray-500 mt-6 font-medium">
          아직 계정이 없으신가요? <Link href="/signup" className="text-green-600 hover:underline font-bold">가입하기</Link>
        </p>
      </div>
    </div>
  );
}