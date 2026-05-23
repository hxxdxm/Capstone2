"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import html2canvas from 'html2canvas';

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
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans relative">
      <header className="bg-white px-6 py-4 flex items-center justify-between border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/" className="text-gray-400 hover:text-gray-900 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-xl font-black tracking-tighter uppercase">Library</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 mt-8 space-y-10">

        {/* 프로필 & 요약 섹션 */}
        <section className="flex flex-col md:flex-row items-center justify-between bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group gap-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>

          <button
            onClick={() => {
              setEditFormData(prev => ({ ...prev, name: userName, password: '', passwordConfirm: '' }));
              setIsEditProfileOpen(true);
            }}
            className="absolute top-6 right-6 text-[10px] font-black tracking-widest text-gray-400 hover:text-black transition flex items-center space-x-1 z-10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
            <span className="underline decoration-transparent hover:decoration-black pb-0.5 transition-colors uppercase">Edit Profile</span>
          </button>

          <div className="flex items-center space-x-6 relative z-10 w-full md:w-auto">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-lg flex-shrink-0">
              {userName ? userName[0] : '👤'}
            </div>
            <div>
              <h2 className="text-2xl font-black mb-1 flex items-center space-x-2">
                <span>{userName}님,</span>
                {mbtiResult && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-600 text-[9px] uppercase tracking-widest rounded-md border border-purple-200">
                    {mbtiResult.mbti}
                  </span>
                )}
              </h2>

              <div className="flex space-x-4 mb-2 text-xs font-bold text-gray-500">
                <span>팔로워 <strong className="text-black">{followers}</strong></span>
                <span>팔로잉 <strong className="text-black">{following}</strong></span>
              </div>

              <p className="text-gray-500 text-xs">이번 달은 총 <span className="text-gray-900 font-bold underline">{receipt?.totalReadBooks || 0}권</span>의 책과 만났어요.</p>

              {/* 📍 모달 띄우던 부분을 없애고 새 페이지로 부드럽게 넘겨주는 Link 태그로 변경! */}
              <Link
                href="/record"
                className="inline-block mt-3 px-4 py-2 bg-black text-white text-xs font-black rounded-full shadow-md hover:bg-gray-800 transition transform hover:-translate-y-0.5"
              >
                + 오늘의 독서 기록하기
              </Link>
            </div>
          </div>

          <div className="hidden md:flex space-x-12 text-center relative z-10">
            <div>
              <p className="text-3xl font-black text-gray-900">{myQuotes.length}</p>
              <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-tighter">Quotes</p>
            </div>
            <div>
              <p className="text-3xl font-black text-gray-900">{receipt?.totalReadPages || 0}</p>
              <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-tighter">Total Pages</p>
            </div>
          </div>
        </section>

        {/* 독서 영수증 & 통계 대시보드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden flex flex-col items-center">
            <h3 className="text-lg font-black tracking-tight mb-6 self-start w-full">🧾 이번 달 독서 영수증</h3>
            {receipt ? (
              <div className="w-full max-w-xs bg-white border border-gray-200 shadow-md p-6 relative" style={{ backgroundImage: 'radial-gradient(circle at 10px 0, transparent 10px, #f9fafb 11px)', backgroundSize: '100% 20px', backgroundRepeat: 'no-repeat', backgroundPosition: 'top' }}>
                <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4 mt-2">
                  <h4 className="text-xl font-black tracking-widest font-mono">RECEIPT</h4>
                  <p className="text-[10px] text-gray-500 font-mono mt-1">{receipt.receiptDate}</p>
                </div>

                <div className="space-y-3 mb-4 font-mono text-xs min-h-[60px]">
                  <div className="flex justify-between text-gray-400 border-b border-gray-200 pb-2">
                    <span>ITEM</span><span>PAGES</span>
                  </div>
                  {receipt.books?.map((book: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex flex-col pr-2">
                        <span className="font-bold text-gray-800 truncate w-32">{book.title || '알 수 없는 책'}</span>
                        <span className="text-[9px] text-gray-400">{book.author || '작자 미상'}</span>
                      </div>
                      <span className="font-bold">{book.totalReadPages}p</span>
                    </div>
                  ))}
                  {(!receipt.books || receipt.books.length === 0) && (
                    <div className="text-center text-gray-400 py-2">기록된 내역이 없습니다.</div>
                  )}
                </div>

                <div className="border-t-2 border-dashed border-gray-300 pt-4 font-mono">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-500">총 읽은 페이지</span>
                    <span className="text-lg font-black">{receipt.totalReadPages || 0} P</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-sm font-bold text-gray-400">아직 영수증이 발급되지 않았습니다.</div>
            )}
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-lg font-black mb-1 tracking-tight">📊 월간 독서량 추이</h3>
            <p className="text-[10px] text-gray-400 font-black mb-8 uppercase tracking-widest">Unit: Page</p>

            <div className="flex-1 flex items-end justify-between gap-4 h-40 mt-auto">
              {stats?.monthlyStats ? Object.entries(stats.monthlyStats).map(([month, pages]: [string, any], idx) => {
                const heightPercent = Math.min((pages / 500) * 100, 100);
                return (
                  <div key={idx} className="flex flex-col items-center w-full group cursor-pointer">
                    <span className="text-[10px] font-bold text-gray-400 mb-2 opacity-0 group-hover:opacity-100 transition">{pages}p</span>
                    <div className="relative w-full flex justify-center">
                      <div
                        className="w-full max-w-[30px] rounded-t-xl transition-all duration-700 bg-gray-100 group-hover:bg-black"
                        style={{ height: `${heightPercent}%`, minHeight: '10px' }}
                      ></div>
                    </div>
                    <span className="text-[10px] mt-3 font-black text-gray-500">{month.split('-')[1]}월</span>
                  </div>
                );
              }) : (
                <div className="w-full flex items-center justify-center text-sm text-gray-400 font-bold h-full">통계 데이터가 없습니다.</div>
              )}
            </div>
          </section>
        </div>

        {/* 독서 MBTI 섹션 */}
        <section className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-black tracking-tight">🧠 나의 독서 MBTI</h3>
              <p className="text-[10px] text-gray-400 font-black mt-1 uppercase tracking-widest">Reading Personality Type</p>
            </div>
            {mbtiResult && (
              <button
                onClick={() => { setMbtiAnswers([]); setIsMbtiModalOpen(true); }}
                className="text-[10px] font-black text-gray-400 hover:text-black border border-gray-200 hover:border-black px-4 py-2 rounded-full transition uppercase tracking-widest"
              >
                다시 테스트하기
              </button>
            )}
          </div>

          {mbtiResult ? (
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* 결과 배지 */}
              <div className="flex-shrink-0 w-32 h-32 rounded-[2rem] bg-gradient-to-br from-purple-100 to-purple-200 border border-purple-200 flex flex-col items-center justify-center shadow-inner">
                <span className="text-3xl font-black text-purple-700 tracking-tight">{mbtiResult.mbti}</span>
                <span className="text-[9px] font-black text-purple-400 mt-1 uppercase tracking-widest">독서 유형</span>
              </div>
              {/* 설명 */}
              <div className="flex-1">
                <p className="text-sm font-black text-gray-800 mb-2">{mbtiResult.title || mbtiResult.mbti} 독서가</p>
                <p className="text-xs text-gray-500 leading-relaxed break-keep">
                  {mbtiResult.description || '당신만의 독서 스타일이 분석되었습니다. 더 많은 책과 함께 성장해나가세요!'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 gap-4">
              <p className="text-sm font-bold text-gray-400 text-center break-keep">
                아직 독서 성향 테스트를 하지 않으셨어요.<br />나의 독서 MBTI를 알아보세요!
              </p>
              <button
                onClick={() => { setMbtiAnswers([]); setIsMbtiModalOpen(true); }}
                className="px-8 py-3 bg-black text-white text-[11px] font-black rounded-full hover:bg-gray-800 transition shadow-md uppercase tracking-widest"
              >
                테스트 시작하기
              </button>
            </div>
          )}
        </section>

        {/* 나의 문집 수집 */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black italic tracking-tighter">My Collection</h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{myQuotes.length} Quotes</span>
          </div>

          {myQuotes.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] border border-gray-100 py-20 text-center flex flex-col items-center">
              <span className="text-4xl mb-4">✍️</span>
              <p className="text-gray-400 font-bold">아직 수집한 영감 문장이 없습니다.</p>
              <Link href="/annotations" className="mt-4 px-6 py-2 bg-black text-white text-xs font-black rounded-full hover:bg-gray-800 transition shadow-md">
                필사 갤러리 구경가기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {myQuotes.map((q) => (
                <div key={q._id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative group flex flex-col justify-between h-[320px]">
                  {/* 출처 뱃지 */}
                  <span className={`absolute top-4 right-4 text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest ${
                    q._source === 'liked'
                      ? 'bg-red-50 text-red-400 border border-red-100'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}>
                    {q._source === 'liked' ? '❤️ 수집' : '✍️ 작성'}
                  </span>

                  <div>
                    <div className="text-3xl font-serif text-gray-100 absolute top-4 left-6">"</div>
                    <p className="font-serif text-gray-800 leading-relaxed mb-4 line-clamp-6 relative z-10 break-keep pt-4">
                      {q.quote || q.content}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-black font-black mb-6 uppercase tracking-tight truncate border-l-2 border-black pl-3">
                      {q.bookId?.title || q.bookTitle || 'Unknown Book'}
                    </p>
                    <button
                      onClick={() => openExportModal(q.quote || q.content, q.bookId?.title || q.bookTitle || '책', q.author || q.authorName || q.bookId?.author || '작자 미상')}
                      className="w-full py-3.5 bg-gray-50 text-gray-900 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                      <span>Share Story</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-24 pt-12 border-t border-gray-100 flex flex-col items-center">
          <button onClick={handleLogout} className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-widest transition-colors mb-12">Sign Out</button>

          <div className="bg-red-50 p-8 rounded-[2rem] w-full max-w-lg text-center">
            <h4 className="text-red-500 font-black text-sm mb-2 uppercase">Danger Zone</h4>
            <p className="text-[10px] text-red-400 font-bold mb-6 break-keep">회원 탈퇴 시 모든 독서 기록과 수집한 문장이 즉시 삭제되며 복구할 수 없습니다.</p>
            <button onClick={handleWithdraw} className="px-8 py-3 bg-red-500 text-white text-[10px] font-black rounded-full hover:bg-red-600 transition shadow-lg shadow-red-200 uppercase tracking-widest">
              Delete Account
            </button>
          </div>
        </footer>
      </main>

      {/* 프로필 수정 모달 */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
              <h3 className="text-lg font-black tracking-tighter uppercase">Edit Profile</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-gray-400 hover:text-black transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleEditProfile} className="p-8 space-y-5">
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white text-2xl font-black shadow-xl">
                  {editFormData.name ? editFormData.name[0] : (userName ? userName[0] : '👤')}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Nickname</label>
                <input type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black font-bold transition" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">New Password <span className="text-gray-300 font-normal lowercase">(선택)</span></label>
                <input type="password" value={editFormData.password} placeholder="변경할 경우에만 입력" onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition" />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1 uppercase">Confirm Password</label>
                <input type="password" value={editFormData.passwordConfirm} placeholder="비밀번호 재입력" onChange={(e) => setEditFormData({ ...editFormData, passwordConfirm: e.target.value })} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black transition" />
              </div>

              <button type="submit" className="w-full mt-6 bg-black text-white font-black py-4 rounded-xl hover:bg-gray-800 transition shadow-lg uppercase tracking-widest text-xs">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* MBTI 모달 */}
      {isMbtiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8">
            <h3 className="text-2xl font-black mb-6 text-center tracking-tight">📚 독서 성향 테스트</h3>

            <div className="space-y-6">
              {mbtiQuestions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <p className="text-sm font-black text-gray-800">Q{qIdx + 1}. {q.q}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.a.map((answer, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          const newAnswers = [...mbtiAnswers];
                          newAnswers[qIdx] = aIdx + 1;
                          setMbtiAnswers(newAnswers);
                        }}
                        className={`text-left px-4 py-3 rounded-xl text-xs font-bold transition-all border ${mbtiAnswers[qIdx] === aIdx + 1 ? 'bg-black text-white border-black shadow-md' : 'bg-white border-gray-200 text-gray-500 hover:border-black'
                          }`}
                      >
                        {answer}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex space-x-3">
              <button onClick={() => setIsMbtiModalOpen(false)} className="flex-1 py-4 text-gray-500 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm">취소</button>
              <button
                onClick={handleMbtiSubmit}
                disabled={mbtiAnswers.filter(Boolean).length < 4}
                className="flex-[2] bg-black text-white py-4 rounded-xl font-black hover:bg-gray-800 transition disabled:bg-gray-300 shadow-lg text-sm"
              >
                결과 확인하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 공유 모달 */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in zoom-in duration-300">
          <button className="absolute top-8 right-8 text-white/50 hover:text-white transition" onClick={() => setIsExportModalOpen(false)}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div ref={cardRef} className="relative w-full max-w-[320px] aspect-[9/16] bg-[#0A0A0A] rounded-[3rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] flex flex-col items-center justify-center p-8 overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/20 via-transparent to-black"></div>
            <div className="relative z-10 w-full bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[2rem] shadow-2xl">
              <span className="text-6xl text-white/10 font-serif absolute -top-4 -left-2 select-none">“</span>
              <p className="font-serif text-white text-xl leading-relaxed mb-10 relative z-10 break-keep italic">
                {selectedQuote.text}
              </p>
              <div className="flex flex-col items-end border-r-2 border-white/20 pr-4">
                <span className="text-xs font-black text-white uppercase tracking-tight">{selectedQuote.book}</span>
                <span className="text-[10px] text-gray-500 mt-1 uppercase font-bold">{selectedQuote.author}</span>
              </div>
            </div>
            <div className="absolute bottom-12 left-0 w-full text-center z-10">
              <span className="text-[9px] font-black text-white/20 tracking-[0.4em] uppercase">Text Hip Archive</span>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center space-y-4 w-full max-w-[320px]">
            <button
              className="w-full bg-white text-black font-black py-5 rounded-full hover:scale-105 transition-all shadow-2xl flex items-center justify-center space-x-3"
              onClick={handleDownloadCard}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
              <span className="uppercase text-[11px] tracking-widest">Save to Gallery</span>
            </button>
            <p className="text-[10px] text-white/30 font-bold uppercase tracking-tighter italic">Share your taste on Instagram</p>
          </div>
        </div>
      )}
    </div>
  );
}