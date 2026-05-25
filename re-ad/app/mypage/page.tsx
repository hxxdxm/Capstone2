"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';
import Header from '@/components/Header';
import './mypage.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function MyPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const [myQuotes, setMyQuotes] = useState<any[]>([]);

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState({ text: '', book: '', author: '' });
  const cardRef = useRef<HTMLDivElement>(null);

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    password: '',
    passwordConfirm: ''
  });

  const [receipt, setReceipt] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [mbtiResult, setMbtiResult] = useState<any>(null);
  const [isMbtiModalOpen, setIsMbtiModalOpen] = useState(false);
  const [mbtiAnswers, setMbtiAnswers] = useState<number[]>([]);

  const mbtiQuestions = [
    { q: "책을 고를 때 더 끌리는 것은?", a: ["베스트셀러", "누군가의 숨은 추천", "끌리는 표지"] },
    { q: "독서할 때 선호하는 환경은?", a: ["백색소음이 있는 카페", "조용하고 아늑한 내 방", "이동하는 지하철 안"] },
    { q: "마음에 드는 문장을 발견하면?", a: ["노트에 정성껏 필사한다", "폰으로 찍어둔다", "마음속에 깊이 간직한다"] },
    { q: "책을 다 읽고 난 후 나는?", a: ["바로 다음 책을 고른다", "깊은 여운에 빠져 사색한다", "친구에게 리뷰를 공유한다"] }
  ];

  const getSafeToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null' || token.split('.').length !== 3) return null;
    return token;
  };

  const getStoredUserName = () => typeof window !== 'undefined' ? localStorage.getItem('userName') || sessionStorage.getItem('userName') : null;

  // 영수증과 통계 불러오기 (페이지 접속할 때마다 최신화)
  const fetchReadingData = async (token: string) => {
    const headers = { 'Authorization': `Bearer ${token}` };

    fetch(`${API_BASE_URL}/reading-logs/receipt?year=${new Date().getFullYear()}&month=${String(new Date().getMonth() + 1).padStart(2, '0')}`, { headers })
      .then(res => res.json())
      .then(data => setReceipt(data))
      .catch(err => console.error("영수증 로드 실패:", err));

    fetch(`${API_BASE_URL}/reading-logs/stats`, { headers })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error("통계 로드 실패:", err));
  };

  useEffect(() => {
    const token = getSafeToken();
    const storedName = getStoredUserName();

    if (!token) {
      router.push('/login');
      return;
    }

    setIsLoggedIn(true);
    if (storedName && storedName !== 'undefined') {
      setUserName(storedName);
    }

    // localStorage에 저장된 MBTI 결과 먼저 복원
    const savedMbti = localStorage.getItem('mbtiResult');
    if (savedMbti) {
      try { setMbtiResult(JSON.parse(savedMbti)); } catch { }
    }

    if (token) {
      const headers = { 'Authorization': `Bearer ${token}` };

      // 내 userId 추출 (좋아요 필터링용)
      let myUserId: string | null = null;
      try {
        const payload = JSON.parse(window.atob(token.split('.')[1]));
        myUserId = payload.id || payload.userId || payload._id || null;
      } catch { }

      // 1) 내가 직접 작성한 필사 + 2) 내가 ❤️ 좋아요(수집)한 필사 병합
      Promise.all([
        fetch(`${API_BASE_URL}/annotations/my`, { headers }).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE_URL}/annotations/exhibition`).then(r => r.json()).catch(() => [])
      ]).then(([myData, exhibitionData]) => {
        const myOwn: any[] = Array.isArray(myData) ? myData.map((q: any) => ({ ...q, _source: 'own' })) : [];
        const myOwnIds = new Set(myOwn.map((q: any) => q._id));

        // exhibition에서 내가 좋아요한 것 (본인 글 중복 제외)
        const liked: any[] = Array.isArray(exhibitionData) && myUserId
          ? exhibitionData
              .filter((item: any) =>
                Array.isArray(item.likes) &&
                item.likes.includes(myUserId) &&
                !myOwnIds.has(item._id)
              )
              .map((item: any) => ({ ...item, _source: 'liked' }))
          : [];

        setMyQuotes([...myOwn, ...liked]);
      });


      fetchReadingData(token);

      fetch(`${API_BASE_URL}/users/my-profile`, { headers })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('프로필 API 미구현 또는 에러');
        })
        .then(data => {
          if (data) {
            if (data.nickname) {
              setUserName(data.nickname);
              if (localStorage.getItem('token')) localStorage.setItem('userName', data.nickname);
              else sessionStorage.setItem('userName', data.nickname);
            }
            setFollowers(data.followersCount || 0);
            setFollowing(data.followingCount || 0);
            // 서버 MBTI가 있으면 서버 값 우선 적용 + 로컬에도 저장
            if (data.mbti) {
              const serverMbti = { mbti: data.mbti };
              setMbtiResult(serverMbti);
              localStorage.setItem('mbtiResult', JSON.stringify(serverMbti));
            }
          }
        })
        .catch(() => { });
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('userName');
      alert("성공적으로 로그아웃 되었습니다.");
      router.push('/');
    }
  };

  const handleWithdraw = async () => {
    const token = getSafeToken();
    if (!token) return alert("로그인이 만료되었습니다.");

    if (window.confirm("정말 탈퇴하시겠습니까? 기록된 모든 독서 데이터가 삭제되며 복구할 수 없습니다.")) {
      try {
        await fetch(`${API_BASE_URL}/users/withdraw`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('userName');
        alert("그동안 교환독서를 이용해주셔서 감사합니다. 탈퇴 처리되었습니다.");
        router.push('/');
      } catch (error) {
        alert("탈퇴 처리 중 에러가 발생했습니다.");
      }
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getSafeToken();

    if (!token) {
      alert("로그인이 만료되었습니다. 다시 로그인 후 시도해주세요.");
      router.push('/login');
      return;
    }

    if (editFormData.password && editFormData.password !== editFormData.passwordConfirm) {
      return alert("새 비밀번호가 일치하지 않습니다. 다시 확인해주세요.");
    }

    if (!editFormData.name.trim()) {
      return alert("닉네임을 입력해주세요.");
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ nickname: editFormData.name, newPassword: editFormData.password || undefined })
      });

      if (response.ok) {
        if (localStorage.getItem('userName')) localStorage.setItem('userName', editFormData.name);
        if (sessionStorage.getItem('userName')) sessionStorage.setItem('userName', editFormData.name);
        setUserName(editFormData.name);
        setIsEditProfileOpen(false);
        setEditFormData(prev => ({ ...prev, password: '', passwordConfirm: '' }));
        alert("프로필 정보가 성공적으로 수정되었습니다!");
      } else {
        alert("프로필 수정에 실패했습니다.");
      }
    } catch (error) {
      alert("서버 오류가 발생했습니다.");
    }
  };

  const handleMbtiSubmit = async () => {
    if (mbtiAnswers.filter(Boolean).length < 4) return alert("모든 질문에 답해주세요!");
    const token = getSafeToken();

    if (!token) return alert("로그인이 만료되었습니다.");

    try {
      const res = await fetch(`${API_BASE_URL}/users/mbti`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ answers: mbtiAnswers })
      });
      if (res.ok) {
        const data = await res.json();
        setMbtiResult(data);
        // 결과를 localStorage에 저장해 페이지 재진입 시에도 유지
        localStorage.setItem('mbtiResult', JSON.stringify(data));
        setIsMbtiModalOpen(false);
        setMbtiAnswers([]);
      }
    } catch (error) {
      alert("MBTI 분석 중 오류가 발생했습니다.");
    }
  };

  const openExportModal = (text: string, book: string, author: string) => {
    setSelectedQuote({ text, book, author });
    setIsExportModalOpen(true);
  };

  const handleDownloadCard = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2
      });
      const link = document.createElement('a');
      link.download = 'my_text_hip.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      alert("이미지가 갤러리에 저장되었습니다!");
      setIsExportModalOpen(false);
    } catch (err) {
      console.error("다운로드 에러:", err);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  return (
    <div className="mypage-container">
      <Header />

      <section className="mypage-hero">
        <span className="mypage-hero-badge">MY SPACE</span>
        <h2 className="mypage-hero-title">나의 독서 서재</h2>
      </section>

      <main className="mypage-content">
        {/* 프로필 섹션 */}
        <section className="mypage-card mypage-profile-card">
          <div className="profile-info-group">
            <div className="profile-avatar">
              {userName ? userName[0] : '👤'}
            </div>
            <div className="profile-details">
              <h2>
                {userName}님
                {mbtiResult && <span className="profile-mbti-badge">{mbtiResult.mbti}</span>}
              </h2>
              <div className="profile-stats">
                <span>팔로워 <strong>{followers}</strong></span>
                <span>팔로잉 <strong>{following}</strong></span>
              </div>
              <p className="profile-desc">이번 달은 <u>{receipt?.totalReadBooks || 0}권</u>의 책과 만났어요.</p>
            </div>
          </div>

          <div className="profile-summary-stats hidden md:flex">
            <div className="profile-summary-item">
              <p>{myQuotes.length}</p>
              <p>Quotes</p>
            </div>
            <div className="profile-summary-item">
              <p>{receipt?.totalReadPages || 0}</p>
              <p>Pages</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="btn-edit-profile" onClick={() => {
              setEditFormData({ name: userName, password: '', passwordConfirm: '' });
              setIsEditProfileOpen(true);
            }}>
              프로필 수정
            </button>
            <Link href="/record" className="btn-record">+ 기록하기</Link>
          </div>
        </section>

        {/* 독서 영수증 & 차트 */}
        <div className="stats-grid">
          <section className="mypage-card">
            <div className="mypage-card-title">이번 달 독서 현황</div>
            {receipt ? (
              <div className="receipt-wrapper">
                <div className="receipt-header">
                  <h4>RECEIPT</h4>
                  <p>{receipt.receiptDate}</p>
                </div>
                <div className="receipt-items">
                  <div className="receipt-items-header">
                    <span>ITEM</span><span>PAGES</span>
                  </div>
                  {receipt.books?.map((book: any, idx: number) => (
                    <div key={idx} className="receipt-item">
                      <div>
                        <div className="receipt-item-title">{book.title || '알 수 없는 책'}</div>
                        <span className="receipt-item-author">{book.author || '작자 미상'}</span>
                      </div>
                      <span className="receipt-item-pages">{book.totalReadPages}p</span>
                    </div>
                  ))}
                  {(!receipt.books || receipt.books.length === 0) && (
                    <div className="receipt-empty">기록된 내역이 없습니다.</div>
                  )}
                </div>
                <div className="receipt-footer">
                  <span>총 읽은 페이지</span>
                  <span>{receipt.totalReadPages || 0} P</span>
                </div>
              </div>
            ) : (
              <div className="receipt-empty">아직 영수증이 발급되지 않았습니다.</div>
            )}
          </section>

          <section className="mypage-card">
            <div className="mypage-card-title">월간 독서량 추이 <span className="mypage-card-subtitle">Unit: Page</span></div>
            <div className="chart-container">
              {stats?.monthlyStats ? Object.entries(stats.monthlyStats).map(([month, pages]: [string, any], idx) => {
                const heightPercent = Math.min((pages / 500) * 100, 100);
                return (
                  <div key={idx} className="chart-bar-group">
                    <span className="chart-tooltip">{pages}p</span>
                    <div className="chart-bar" style={{ height: `${heightPercent}%` }}></div>
                    <span className="chart-label">{month.split('-')[1]}월</span>
                  </div>
                );
              }) : (
                <div style={{width:'100%', textAlign:'center', color:'#8A7A60', fontSize:'13px'}}>통계 데이터가 없습니다.</div>
              )}
            </div>
          </section>
        </div>

        {/* 독서 MBTI */}
        <section className="mypage-card">
          <div className="mypage-card-title">
            나의 독서 성향 (MBTI)
            {mbtiResult && (
              <button className="btn-mbti-retry" onClick={() => { setMbtiAnswers([]); setIsMbtiModalOpen(true); }}>
                다시 테스트하기
              </button>
            )}
          </div>
          {mbtiResult ? (
            <div className="mbti-content">
              <div className="mbti-badge">
                <strong>{mbtiResult.mbti}</strong>
                <span>독서 유형</span>
              </div>
              <div className="mbti-desc">
                <h4>{mbtiResult.title || mbtiResult.mbti} 독서가</h4>
                <p>{mbtiResult.description || '당신만의 독서 스타일이 분석되었습니다. 더 많은 책과 함께 성장해나가세요!'}</p>
              </div>
            </div>
          ) : (
            <div className="mbti-empty">
              <p style={{color:'#8A7A60', fontSize:'13px', marginBottom:'10px'}}>아직 독서 성향 테스트를 하지 않으셨어요.<br/>나의 독서 MBTI를 알아보세요!</p>
              <button className="btn-mbti-start" onClick={() => { setMbtiAnswers([]); setIsMbtiModalOpen(true); }}>테스트 시작하기</button>
            </div>
          )}
        </section>

        {/* 나의 문집 */}
        <section className="mypage-card">
          <div className="mypage-card-title">
            나의 문집 수집 (My Collection)
            <span className="mypage-card-subtitle">{myQuotes.length} Quotes</span>
          </div>

          {myQuotes.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px 0'}}>
              <div style={{fontSize:'40px', marginBottom:'10px'}}>✍️</div>
              <p style={{color:'#8A7A60', fontSize:'14px', marginBottom:'20px'}}>아직 수집한 영감 문장이 없습니다.</p>
              <Link href="/annotations" className="btn-record">필사 갤러리 구경가기</Link>
            </div>
          ) : (
            <div className="collection-grid">
              {myQuotes.map((q) => (
                <div key={q._id} className="collection-card">
                  <span className={`collection-source-badge ${q._source === 'liked' ? 'badge-liked' : 'badge-own'}`}>
                    {q._source === 'liked' ? '❤️ 수집' : '✍️ 작성'}
                  </span>
                  
                  <div>
                    <div className="collection-quote-icon">“</div>
                    <div className="collection-quote-text">{q.quote || q.content}</div>
                  </div>
                  <div>
                    <div className="collection-book-title">{q.bookId?.title || q.bookTitle || 'Unknown Book'}</div>
                    <button className="btn-share" onClick={() => openExportModal(q.quote || q.content, q.bookId?.title || q.bookTitle || '책', q.author || q.authorName || q.bookId?.author || '작자 미상')}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      이미지로 공유하기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 푸터 */}
        <footer className="mypage-footer">
          <button onClick={handleLogout} className="btn-logout">로그아웃</button>
          
          <div className="danger-zone">
            <h4>Danger Zone</h4>
            <p>회원 탈퇴 시 모든 독서 기록과 수집한 문장이 즉시 삭제되며 복구할 수 없습니다.</p>
            <button onClick={handleWithdraw} className="btn-withdraw">회원 탈퇴</button>
          </div>
        </footer>
      </main>

      {/* 모달들 (디자인 유지하면서 CSS 클래스로 변경) */}
      
      {/* 프로필 수정 모달 */}
      {isEditProfileOpen && (
        <div className="mypage-modal-backdrop">
          <div className="mypage-modal">
            <div className="mypage-modal-header">
              <h3>프로필 수정</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="mypage-modal-close">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mypage-modal-body">
              <form onSubmit={handleEditProfile}>
                <div style={{display:'flex', justifyContent:'center', marginBottom:'24px'}}>
                  <div className="profile-avatar">
                    {editFormData.name ? editFormData.name[0] : (userName ? userName[0] : '👤')}
                  </div>
                </div>
                
                <div className="mypage-form-group">
                  <label className="mypage-form-label">닉네임</label>
                  <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="mypage-form-input" />
                </div>

                <div className="mypage-form-group">
                  <label className="mypage-form-label">새 비밀번호 (선택)</label>
                  <input type="password" value={editFormData.password} placeholder="변경할 경우에만 입력" onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} className="mypage-form-input" />
                </div>

                <div className="mypage-form-group">
                  <label className="mypage-form-label">새 비밀번호 확인</label>
                  <input type="password" value={editFormData.passwordConfirm} placeholder="비밀번호 재입력" onChange={(e) => setEditFormData({ ...editFormData, passwordConfirm: e.target.value })} className="mypage-form-input" />
                </div>

                <button type="submit" className="btn-submit">저장하기</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MBTI 테스트 모달 */}
      {isMbtiModalOpen && (
        <div className="mypage-modal-backdrop">
          <div className="mypage-modal" style={{maxWidth:'500px'}}>
            <div className="mypage-modal-header">
              <h3>독서 성향 테스트</h3>
              <button onClick={() => setIsMbtiModalOpen(false)} className="mypage-modal-close">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="mypage-modal-body">
              <div style={{display:'flex', flexDirection:'column', gap:'20px'}}>
                {mbtiQuestions.map((q, qIdx) => (
                  <div key={qIdx}>
                    <p style={{fontSize:'13px', fontWeight:700, color:'#3B3224', marginBottom:'10px'}}>Q{qIdx + 1}. {q.q}</p>
                    <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                      {q.a.map((answer, aIdx) => (
                        <button
                          key={aIdx}
                          onClick={() => {
                            const newAnswers = [...mbtiAnswers];
                            newAnswers[qIdx] = aIdx + 1;
                            setMbtiAnswers(newAnswers);
                          }}
                          style={{
                            textAlign:'left', padding:'12px 16px', borderRadius:'12px', fontSize:'12px', fontWeight:600,
                            border: mbtiAnswers[qIdx] === aIdx + 1 ? '1.5px solid #7BA05B' : '1px solid #D9CDB8',
                            background: mbtiAnswers[qIdx] === aIdx + 1 ? 'rgba(123,160,91,0.1)' : '#fff',
                            color: mbtiAnswers[qIdx] === aIdx + 1 ? '#5E8542' : '#8A7A60',
                            cursor:'pointer'
                          }}
                        >
                          {answer}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={handleMbtiSubmit}
                disabled={mbtiAnswers.filter(Boolean).length < 4}
                className="btn-submit"
                style={{marginTop:'24px', opacity: mbtiAnswers.filter(Boolean).length < 4 ? 0.5 : 1, cursor: mbtiAnswers.filter(Boolean).length < 4 ? 'not-allowed' : 'pointer'}}
              >
                결과 확인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공유 모달 (이미지 다운로드) */}
      {isExportModalOpen && (
        <div className="mypage-modal-backdrop" style={{background:'rgba(25,15,5,0.85)'}}>
          <button className="mypage-modal-close" style={{position:'absolute', top:'24px', right:'24px', color:'#F2EDE4'}} onClick={() => setIsExportModalOpen(false)}>
            <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
            <div ref={cardRef} style={{
              width:'300px', height:'533px', background:'#2C2218', borderRadius:'24px', padding:'32px',
              position:'relative', display:'flex', flexDirection:'column', justifyContent:'center',
              boxShadow:'0 20px 40px rgba(0,0,0,0.5)', overflow:'hidden', backgroundImage:'radial-gradient(circle at 10% 20%, rgba(139,175,116,0.15) 0%, transparent 50%)'
            }}>
              <div style={{position:'relative', zIndex:10}}>
                <div style={{fontFamily:"'Noto Serif KR', serif", fontSize:'60px', color:'rgba(255,255,255,0.1)', lineHeight:0.5, marginBottom:'10px'}}>“</div>
                <p style={{fontFamily:"'Noto Serif KR', serif", fontSize:'18px', color:'#F2EDE4', lineHeight:1.8, fontStyle:'italic', wordBreak:'keep-all', marginBottom:'40px'}}>
                  {selectedQuote.text}
                </p>
                <div style={{textAlign:'right', borderRight:'2px solid rgba(255,255,255,0.2)', paddingRight:'12px'}}>
                  <div style={{fontSize:'12px', fontWeight:700, color:'#fff'}}>{selectedQuote.book}</div>
                  <div style={{fontSize:'10px', color:'rgba(255,255,255,0.6)', marginTop:'4px'}}>{selectedQuote.author}</div>
                </div>
              </div>
              <div style={{position:'absolute', bottom:'24px', left:'0', width:'100%', textAlign:'center'}}>
                <span style={{fontSize:'9px', fontWeight:700, color:'rgba(255,255,255,0.3)', letterSpacing:'0.2em'}}>TEXT HIP ARCHIVE</span>
              </div>
            </div>

            <button onClick={handleDownloadCard} style={{
              marginTop:'24px', background:'#fff', color:'#3B3224', padding:'14px 24px', borderRadius:'50px',
              border:'none', fontSize:'12px', fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:'8px',
              boxShadow:'0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              이미지 저장하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}