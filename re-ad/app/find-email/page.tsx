"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import '../login/login.css'; // 로그인 페이지 스타일 재사용

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function FindEmailPage() {
  const [formData, setFormData] = useState({
    nickname: '',
    phone: ''
  });
  const [foundEmail, setFoundEmail] = useState('');

  const handleFindEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nickname || !formData.phone) {
      alert("닉네임과 전화번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/users/find-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          setFoundEmail(data.email);
        } else {
          alert("입력하신 정보와 일치하는 이메일을 찾을 수 없습니다.");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || '정보와 일치하는 계정을 찾을 수 없습니다.');
      }
    } catch (error) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="login-bg">
      <Header />
      <main className="login-main">
        <div className="login-card">
          <span className="deco-leaf tl">🍃</span>
          <span className="deco-leaf tr">🌸</span>
          <span className="deco-leaf bl">🌿</span>
          <span className="deco-leaf br">🌷</span>

          <div className="login-title-wrap">
            <h2 className="login-title">이메일 찾기</h2>
            <p className="login-subtitle">가입 시 등록한 닉네임과 전화번호를 입력해주세요</p>
          </div>

          <div className="divider">
            <span className="divider-icon">✦</span>
          </div>

          {!foundEmail ? (
            <form onSubmit={handleFindEmail}>
              <div className="form-group">
                <label className="form-label">닉네임</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="예: 독서왕"
                  value={formData.nickname}
                  onChange={(e) => setFormData({...formData, nickname: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">전화번호</label>
                <input
                  type="text"
                  maxLength={11}
                  className="form-input"
                  placeholder="- 없이 숫자만 입력"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/[^0-9]/g, '')})}
                  required
                />
              </div>

              <button type="submit" className="btn-submit">
                이메일 찾기
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '15px', color: '#5A4A36', marginBottom: '16px' }}>회원님의 이메일 주소는 다음과 같습니다.</p>
              <div style={{ background: '#F2EDE4', border: '1.5px solid #7BA05B', borderRadius: '16px', padding: '16px', fontSize: '18px', fontWeight: 700, color: '#3B3224', marginBottom: '24px' }}>
                {foundEmail}
              </div>
              <Link href="/login" style={{ display: 'block', width: '100%', background: '#3B3224', color: '#fff', padding: '14px', borderRadius: '50px', textDecoration: 'none', fontWeight: 700, transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#2C2218'} onMouseLeave={(e) => e.currentTarget.style.background = '#3B3224'}>
                로그인하러 가기
              </Link>
            </div>
          )}

          <div className="login-footer" style={{ marginTop: '24px' }}>
            <div className="signup-link-wrap">
              <Link href="/login" className="signup-link" style={{ fontWeight: 600, color: '#8A7A60', textDecoration: 'underline' }}>로그인 페이지로 돌아가기</Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
