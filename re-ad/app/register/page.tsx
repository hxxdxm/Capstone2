"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ⭐️ [백엔드 연동] 가입 완료하기 버튼을 누르면 EC2 서버로 쏩니다!
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); // 기본 전송 방지!
    
    if (formData.password !== formData.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      alert('모든 항목을 입력해주세요.');
      return;
    }

    try {
      // EC2 백엔드 서버의 /register 주소로 데이터(json) 보내기
      const response = await fetch('http://13.124.191.57:5000/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: formData.name, // 프론트의 name 변수를 백엔드의 nickname 변수로 맞춰서 보냄
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // 백엔드에서 201 응답(가입 성공)이 오면 로그인 창으로 이동
        alert('환영합니다! 회원가입이 완료되었습니다.');
        router.push('/login');
      } else {
        // 이미 가입된 이메일이거나 백엔드에서 에러를 튕겨냈을 때
        alert(data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('회원가입 에러:', error);
      alert('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex flex-row-reverse text-gray-900 font-sans bg-white">
      
      {/* 오른쪽: 텍스트힙 감성 이미지 (웹에서만 보임, 로그인과 반대 배치) */}
      <div className="hidden lg:flex w-1/2 bg-gray-100 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-60 mix-blend-multiply"></div>
        <div className="relative z-10 p-12 text-center max-w-lg">
          <h2 className="text-3xl font-serif text-white mb-4 leading-relaxed drop-shadow-lg">
            나만의 문장을 수집하고<br/>새로운 영감을 교환하세요.
          </h2>
          <div className="w-12 h-1 bg-white/50 mx-auto mt-6"></div>
        </div>
      </div>

      {/* 왼쪽: 회원가입 폼 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24">
        
        {/* 뒤로가기 버튼 */}
        <Link href="/login" className="absolute top-8 left-8 text-gray-400 hover:text-gray-900 transition flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span className="text-sm font-bold">로그인으로</span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-10">
            <h1 className="text-2xl font-black mb-2">새로운 독서가님,</h1>
            <p className="text-sm text-gray-500">교환독서의 멤버가 되어주세요.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">닉네임</label>
              <input 
                type="text" 
                name="name"
                placeholder="사용할 닉네임을 입력하세요" 
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition placeholder:text-gray-400" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">이메일</label>
              <input 
                type="email" 
                name="email"
                placeholder="example@email.com" 
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition placeholder:text-gray-400" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">비밀번호</label>
              <input 
                type="password" 
                name="password"
                placeholder="8자 이상 입력해주세요" 
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition placeholder:text-gray-400" 
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1 ml-1">비밀번호 확인</label>
              <input 
                type="password" 
                name="passwordConfirm"
                placeholder="비밀번호를 다시 입력해주세요" 
                value={formData.passwordConfirm}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 transition placeholder:text-gray-400" 
              />
            </div>

            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition shadow-lg mt-6">
              가입 완료하기
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
