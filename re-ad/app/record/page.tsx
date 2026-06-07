"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';
import './record.css'; // 새로 만든 css import

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RecordPage() {
    const [recordData, setRecordData] = useState({
        title: '',
        author: '',
        coverImage: '',
        status: '읽는 중',
        rating: 5,
        review: '',
        isPublic: false
    });

    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [selectedBook, setSelectedBook] = useState<any>(null);
    const [readPages, setReadPages] = useState<number>(0);
    const [readDate, setReadDate] = useState<string>(
        new Date().toISOString().slice(0, 10)
    );
    const [isSaving, setIsSaving] = useState(false);

    const getToken = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return token && token !== 'undefined' ? token : null;
    };

    const getUserId = (token: string): string => {
        try {
            const payload = JSON.parse(window.atob(token.split('.')[1]));
            return payload.id || payload.userId || payload._id || '';
        } catch { return ''; }
    };

    const handleSearchBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return alert("책 제목을 입력해주세요.");

        setIsSearching(true);
        try {
            const res = await fetch(`${API_BASE_URL}/books/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });

            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.documents || data);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("검색 실패:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectBook = (book: any) => {
        setSelectedBook(book);
        setRecordData({
            ...recordData,
            title: book.title,
            author: book.authors?.join(', ') || book.author,
            coverImage: book.thumbnail || book.cover
        });
        setIsSearchModalOpen(false);
        setSearchResults([]);
        setSearchQuery('');
    };

    const handleSaveRecord = async () => {
        const token = getToken();
        if (!token) return alert("로그인이 필요합니다.");
        if (!readPages || readPages <= 0) return alert("오늘 읽은 페이지 수를 입력해주세요.");

        setIsSaving(true);
        try {
            let bookId: string | null = null;

            if (selectedBook) {
                try {
                    const bookRes = await fetch(`${API_BASE_URL}/books`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            title: selectedBook.title,
                            author: selectedBook.authors?.join(', ') || selectedBook.author || '',
                            cover: selectedBook.thumbnail || selectedBook.cover || '',
                            isbn: selectedBook.isbn || '',
                            publisher: selectedBook.publisher || '',
                            pubdate: selectedBook.datetime || selectedBook.pubdate || '',
                        })
                    });
                    if (bookRes.ok) {
                        const bookData = await bookRes.json();
                        bookId = bookData.book?._id || bookData._id || null;
                    }
                } catch (e) {}
            }

            const logBody: any = {
                userId: getUserId(token),
                readPages,
                date: readDate, // ✅ 사용자가 달력에서 선택한 날짜 전송 (없으면 백엔드가 오늘로 처리)
                status: recordData.status,
                rating: recordData.rating,
                review: recordData.review,
                isPublic: false, // 필사 자동 등록 방지
            };
            if (bookId) logBody.bookId = bookId;

            const logRes = await fetch(`${API_BASE_URL}/reading-logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(logBody)
            });

            if (logRes.ok) {
                alert(bookId
                    ? `기록이 저장됐습니다! 독서 현황에 "${recordData.title}"이(가) 표시됩니다. 📊`
                    : '기록이 저장됐습니다! (온도/페이지 반영 완료) 📊'
                );
                setRecordData({ title: '', author: '', coverImage: '', status: '읽는 중', rating: 5, review: '', isPublic: false });
                setSelectedBook(null);
                setReadPages(0);
                setReadDate(new Date().toISOString().slice(0, 10));
            } else {
                const err = await logRes.json().catch(() => ({}));
                alert(`저장 실패: ${err.message || '서버 오류가 발생했습니다.'}`);
            }
        } catch (error) {
            alert("서버와 통신할 수 없습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="record-page">
            <Header />

            <main className="record-main">
                <h2 className="record-title">나의 독서 기록</h2>

                <div className="record-card">
                    {/* 📖 책 기본 정보 영역 */}
                    <div className="book-select-section">
                        <div className="book-cover-wrap" onClick={() => setIsSearchModalOpen(true)}>
                            {recordData.coverImage ? (
                                <>
                                    <img src={recordData.coverImage} alt="책 표지" className="book-cover-img" />
                                    <div className="book-cover-overlay">
                                        <span className="book-cover-text">변경하기</span>
                                    </div>
                                </>
                            ) : (
                                <span className="book-cover-empty">
                                    +<br />Find Book
                                </span>
                            )}
                        </div>

                        <div className="book-info-wrap">
                            {recordData.title ? (
                                <>
                                    <h3 className="book-title">{recordData.title}</h3>
                                    <p className="book-author">{recordData.author}</p>
                                    <button onClick={() => setIsSearchModalOpen(true)} className="btn-change-book">
                                        다른 책 검색하기
                                    </button>
                                </>
                            ) : (
                                <div className="book-empty-state">
                                    <p className="book-empty-text">아직 책을 선택하지 않았습니다.</p>
                                    <button onClick={() => setIsSearchModalOpen(true)} className="btn-search-book">
                                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                                        책 검색해서 불러오기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✍️ 입력 폼 */}
                    <form className="record-form" onSubmit={(e) => { e.preventDefault(); handleSaveRecord(); }}>
                        
                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">📄 오늘 읽은 페이지 수 <span className="required">*</span></label>
                                <input
                                    type="number"
                                    min={1}
                                    placeholder="예: 30"
                                    value={readPages || ''}
                                    onChange={(e) => setReadPages(Number(e.target.value))}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">📅 독서 날짜</label>
                                <input
                                    type="date"
                                    value={readDate}
                                    onChange={(e) => setReadDate(e.target.value)}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">독서 상태</label>
                                <select
                                    value={recordData.status}
                                    onChange={(e) => setRecordData({ ...recordData, status: e.target.value })}
                                    className="form-select"
                                >
                                    <option value="READING">📖 읽는 중</option>
                                    <option value="COMPLETED">✅ 완독</option>
                                    <option value="PAUSED">⏸️ 잠시 멈춤</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">나의 별점</label>
                                <select
                                    value={recordData.rating}
                                    onChange={(e) => setRecordData({ ...recordData, rating: Number(e.target.value) })}
                                    className="form-select"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (최고예요)</option>
                                    <option value={4}>⭐⭐⭐⭐ (좋았어요)</option>
                                    <option value={3}>⭐⭐⭐ (보통이에요)</option>
                                    <option value={2}>⭐⭐ (아쉬워요)</option>
                                    <option value={1}>⭐ (별로예요)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">나의 감상</label>
                            <textarea
                                placeholder="이 책을 읽으며 어떤 생각과 영감을 얻으셨나요? (나만 볼 수 있어요)"
                                value={recordData.review}
                                onChange={(e) => setRecordData({ ...recordData, review: e.target.value })}
                                className="form-textarea"
                            />
                        </div>

                        <div className="form-footer" style={{ justifyContent: 'flex-end' }}>
                            <button type="submit" disabled={isSaving} className="btn-submit">
                                {isSaving ? '저장 중...' : '기록 저장하기'}
                            </button>
                        </div>
                    </form>

                </div>
            </main>

            {/* 🔍 검색 모달 */}
            {isSearchModalOpen && (
                <div className="search-modal-backdrop" onClick={() => setIsSearchModalOpen(false)}>
                    <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="search-modal-header">
                            <h3 className="search-modal-title">도서 검색</h3>
                            <button onClick={() => setIsSearchModalOpen(false)} className="btn-close-modal">✕</button>
                        </div>

                        <div className="search-modal-bar">
                            <form onSubmit={handleSearchBook}>
                                <input
                                    type="text"
                                    placeholder="책 제목이나 저자를 검색하세요"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                <button type="submit" className="btn-do-search">
                                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                                </button>
                            </form>
                        </div>

                        <div className="search-modal-results">
                            {isSearching ? (
                                <div className="search-empty-msg">검색 중입니다...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((book, idx) => (
                                    <div key={idx} onClick={() => handleSelectBook(book)} className="search-result-item">
                                        <div className="result-cover">
                                            {book.thumbnail || book.cover ? (
                                                <img src={book.thumbnail || book.cover} alt="표지" />
                                            ) : (
                                                <span className="result-cover-empty">NO IMG</span>
                                            )}
                                        </div>
                                        <div className="result-info">
                                            <h4 className="result-title">{book.title}</h4>
                                            <p className="result-author">{book.authors?.join(', ') || book.author}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="search-empty-msg">
                                    {searchQuery ? "검색 결과가 없습니다." : "검색어를 입력해주세요."}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}