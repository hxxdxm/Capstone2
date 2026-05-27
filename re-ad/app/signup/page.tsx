"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import './signup.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    nickname: '',
    password: '',
    confirmPassword: '',
    phone: '' // 선택 항목
  });

  // 📍 이메일 인증 관련 상태
  const [authCode, setAuthCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 📍 5분 = 300초

  useEffect(() => {
    let timerId: NodeJS.Timeout;
    if (isCodeSent && !isVerified && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsCodeSent(false);
    }
    return () => clearInterval(timerId);
  }, [isCodeSent, isVerified, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 📍 1. 인증번호 전송 함수 (이메일로 변경)
  const handleSendAuthCode = async () => {
    if (!formData.email.includes('@')) {
      alert("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    try {
      // 📍 백엔드 명세대로 호출 (주소는 sms지만 내용은 email)
      const res = await fetch(`${API_BASE_URL}/auth/send-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      if (res.ok) {
        alert("입력하신 이메일로 인증번호 6자리가 발송되었습니다. 메일함을 확인해주세요!");
        setIsCodeSent(true);
        setIsVerified(false);
        setTimeLeft(300); // 5분 타이머 시작
      } else {
        alert("인증번호 발송에 실패했습니다. 이미 가입된 이메일인지 확인해주세요.");
      }
    } catch (error) {
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  // 📍 2. 인증번호 확인 함수
  const handleVerifyCode = async () => {
    if (!authCode) return alert("인증번호를 입력해주세요.");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-sms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, code: authCode })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          alert("이메일 인증이 완료되었습니다!");
          setIsVerified(true);
          setIsCodeSent(false);
        }
      } else {
        alert("인증번호가 일치하지 않거나 만료되었습니다.");
      }
    } catch (error) {
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  // 📍 3. 최종 회원가입 함수
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isVerified) {
      alert("이메일 인증을 먼저 완료해주세요!");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      // 📍 백엔드 회원가입 API 호출 (경로는 백엔드 명세에 맞춰 수정하세요)
      const res = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          nickname: formData.nickname,
          password: formData.password,
          phone: formData.phone
        })
      });

      if (res.ok) {
        alert("회원가입이 완료되었습니다! 로그인해주세요.");
        router.push('/login');
      } else {
        const data = await res.json();
        alert(`회원가입 실패: ${data.message || '다시 시도해주세요.'}`);
      }
    } catch (error) {
      alert("서버와 통신할 수 없습니다.");
    }
  };

  return (
    <div className="signup-bg">
      <Header />

      <main className="signup-main">
        <div className="signup-card">
          <div className="deco-leaf tl">🌿</div>
          <div className="deco-leaf tr">🌿</div>
          <div className="deco-leaf bl">🌿</div>
          <div className="deco-leaf br">🌿</div>

          <div className="signup-title-wrap">
            <h2 className="signup-title">Sign Up</h2>
            <p className="signup-subtitle">교환독서의 멤버가 되어보세요</p>
          </div>

          <div className="divider">
            <span className="divider-icon">✿</span>
          </div>

          <form onSubmit={handleSignup}>
            {/* 이메일 */}
            <div className="form-group">
              <label className="form-label">Email Verification</label>
              <div className="email-row">
                <input
                  type="email"
                  className="form-input"
                  placeholder="인증받을 이메일 주소"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isVerified}
                  required
                />
                <button
                  type="button"
                  onClick={handleSendAuthCode}
                  disabled={isVerified}
                  className="btn-send"
                >
                  {isVerified ? '인증완료' : (isCodeSent ? '재전송' : '인증번호 전송')}
                </button>
              </div>
              {isVerified && (
                <div className="verified-badge">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  인증완료
                </div>
              )}
            </div>

            {/* 인증번호 입력 */}
            {isCodeSent && !isVerified && (
              <div className="form-group verify-row">
                <div className="verify-input-wrap">
                  <input
                    type="text"
                    maxLength={6}
                    className="form-input"
                    placeholder="인증번호 6자리"
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                  <span className="timer-badge">{formatTime(timeLeft)}</span>
                </div>
                <button type="button" onClick={handleVerifyCode} className="btn-verify">확인</button>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Nickname</label>
              <input type="text" className="form-input" placeholder="사용할 닉네임 (예: 독서왕)" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="비밀번호" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="비밀번호 확인" value={formData.confirmPassword} onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
            </div>

            <div className="form-group">
              <label className="form-label">Phone <span className="optional-badge">(선택)</span></label>
              <input type="text" maxLength={11} className="form-input" placeholder="- 없이 숫자만 입력 (예: 01012345678)" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })} />
            </div>

            <button type="submit" className="btn-submit">가입하기</button>
          </form>

          <div className="login-link-wrap">
            <span className="login-link-text">이미 계정이 있으신가요? </span>
            <Link href="/login" className="login-link">로그인</Link>
          </div>
        </div>
      </main>
    </div>
  );
}