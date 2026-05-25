"use client";

import React from 'react';
import Link from 'next/link';
import './footer.css';

export default function Footer() {
  return (
    <footer className="footer-wrap">
      <div className="footer-inner">
        
        {/* 좌측 브랜드 정보 */}
        <div className="footer-brand">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h2 className="footer-logo">이음</h2>
          </Link>
          <p className="footer-slogan">당신의 밑줄, 우리의 영감<br />교환독서 커뮤니티 플랫폼</p>
        </div>

        {/* 우측 링크 모음 */}
        <div className="footer-links-wrap">
          <div className="footer-col">
            <h3 className="footer-col-title">Service</h3>
            <Link href="/annotations" className="footer-link">필사 전시회</Link>
            <Link href="/rooms" className="footer-link">모임방</Link>
            <Link href="/handmedowns" className="footer-link">물려주기</Link>
            <Link href="/record" className="footer-link">독서 기록</Link>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">My Page</h3>
            <Link href="/mypage" className="footer-link">내 피드</Link>
            <Link href="/login" className="footer-link">로그인</Link>
            <Link href="/signup" className="footer-link">회원가입</Link>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Project</h3>
            <span className="footer-link">2026 Capstone Design</span>
            <span className="footer-link">Team: 이음 (re-ad)</span>
            <a href="https://github.com/hxxdxm/Capstone2" target="_blank" rel="noopener noreferrer" className="footer-link">GitHub Repository</a>
          </div>
        </div>

      </div>

      {/* 하단 카피라이트 및 소셜 */}
      <div className="footer-inner">
        <div className="footer-bottom">
          <div className="footer-copyright">
            © 2026 이음(re-ad). All rights reserved. 
            <span style={{ margin: '0 8px', color: '#D9CDB8' }}>|</span> 
            <Link href="#" className="footer-link" style={{ fontSize: '12px', color: '#8A7A60' }}>이용약관</Link>
            <span style={{ margin: '0 8px', color: '#D9CDB8' }}>|</span> 
            <Link href="#" className="footer-link" style={{ fontSize: '12px', color: '#8A7A60', fontWeight: '700' }}>개인정보처리방침</Link>
          </div>
          
          <div className="footer-socials">
            <a href="#" className="footer-social-link" aria-label="Instagram">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
            </a>
            <a href="https://github.com/hxxdxm/Capstone2" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="GitHub">
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
