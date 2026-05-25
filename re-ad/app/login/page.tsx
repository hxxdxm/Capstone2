"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header'; // 공통 헤더
import './login.css';

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
          data.nickname || data.name ||
          user.nickname || user.name || '';

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
    <div className="login-bg">
      <Header />

      <main className="login-main">
        <div className="login-card">
          {/* 모서리 꽃/잎 장식 */}
          <span className="deco-leaf tl">🍃</span>
          <span className="deco-leaf tr">🌸</span>
          <span className="deco-leaf bl">🌿</span>
          <span className="deco-leaf br">🌷</span>

          <div className="login-title-wrap">
            <h2 className="login-title">로그인</h2>
            <p className="login-subtitle">이음에 다시 오신 것을 환영합니다</p>
          </div>

          <div className="divider">
            <span className="divider-icon">✦</span>
          </div>

          <form onSubmit={handleLogin}>
            {/* 이메일 */}
            <div className="form-group">
              <label className="form-label">이메일</label>
              <input
                type="email"
                className="form-input"
                placeholder="example@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>

            {/* 비밀번호 */}
            <div className="form-group">
              <label className="form-label">비밀번호</label>
              <input
                type="password"
                className="form-input"
                placeholder="비밀번호를 입력해주세요"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                required
              />
            </div>

            {/* 로그인 상태 유지 체크박스 */}
            <div className="keep-login-row">
              <input
                type="checkbox"
                id="keepLoggedIn"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="keep-login-checkbox"
              />
              <label htmlFor="keepLoggedIn" className="keep-login-label">
                로그인 상태 유지
              </label>
            </div>

            <button type="submit" className="btn-submit">
              로그인
            </button>
          </form>

          {/* 하단 링크 영역 */}
          <div className="login-footer">
            <div className="signup-link-wrap">
              <span className="signup-link-text">아직 계정이 없으신가요?&nbsp;</span>
              <Link href="/signup" className="signup-link">회원가입</Link>
            </div>

            <div className="help-wrap">
              <span className="help-title">로그인에 문제가 있나요?</span>
              <div className="help-links">
                <Link href="/find-email" className="help-link">이메일 찾기</Link>
                <span className="help-divider">|</span>
                <Link href="/reset-password" className="help-link">비밀번호 재설정</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}