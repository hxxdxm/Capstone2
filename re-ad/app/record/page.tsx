"use client";

import React, { useState } from 'react';
import Header from '@/components/Header';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RecordPage() {
    // 📍 1. 내 독서 기록 데이터 상태
    const [recordData, setRecordData] = useState({
        title: '',
        author: '',
        coverImage: '',
        status: 'READING', // READING, COMPLETED, PAUSED
        rating: 5,
        review: '',
        isPublic: true // 공개 여부 (경험 공유의 핵심!)
    });

    // 📍 2. 책 검색 모달 상태
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // 📍 3. 책 검색 API 호출 함수 (임시로 프론트에서 카카오 API를 바로 찌르거나, 백엔드를 거칩니다)
    const handleSearchBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return alert("책 제목을 입력해주세요.");

        setIsSearching(true);
        try {
            // 🚨 주의: 원래는 백엔드 팀원분이 /api/books/search 를 만들어주시는 게 가장 안전합니다!
            // 아래는 백엔드 API가 완성되었다고 가정한 호출 코드입니다.
            const res = await fetch(`${API_BASE_URL}/books/search?query=${encodeURIComponent(searchQuery)}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });

            if (res.ok) {
                const data = await res.json();
                setSearchResults(data.documents || data); // 카카오 API 기준으로는 data.documents 에 배열이 들어옵니다.
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error("검색 실패:", error);
        } finally {
            setIsSearching(false);
        }
    };

    // 📍 4. 검색 결과에서 책을 선택했을 때 (자동 완성!)
    const handleSelectBook = (book: any) => {
        setRecordData({
            ...recordData,
            title: book.title,
            author: book.authors?.join(', ') || book.author,
            coverImage: book.thumbnail || book.cover
        });
        setIsSearchModalOpen(false); // 모달 닫기
        setSearchResults([]); // 검색 결과 초기화
        setSearchQuery('');
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 pb-24 font-sans">
            <Header />

            <main className="mx-auto max-w-3xl px-6 mt-12">
                <h2 className="text-3xl font-black mb-8 tracking-tighter">나의 독서 기록</h2>

                <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">

                    {/* 📖 책 기본 정보 영역 (자동 완성) */}
                    <div className="flex flex-col md:flex-row gap-8 mb-10 pb-10 border-b border-gray-100">
                        <div
                            onClick={() => setIsSearchModalOpen(true)}
                            className="w-32 h-48 bg-gray-100 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition overflow-hidden border border-gray-200 shadow-sm flex-shrink-0 relative group"
                        >
                            {recordData.coverImage ? (
                                <>
                                    <img src={recordData.coverImage} alt="책 표지" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                        <span className="text-white text-xs font-bold">책 변경하기</span>
                                    </div>
                                </>
                            ) : (
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">
                                    +<br />Find Book
                                </span>
                            )}
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                            {recordData.title ? (
                                <>
                                    <h3 className="text-2xl font-black mb-2">{recordData.title}</h3>
                                    <p className="text-sm font-bold text-gray-500 mb-6">{recordData.author}</p>
                                    <button onClick={() => setIsSearchModalOpen(true)} className="self-start text-xs font-bold text-blue-500 hover:underline">
                                        다른 책 검색하기
                                    </button>
                                </>
                            ) : (
                                <div className="text-center md:text-left">
                                    <p className="text-gray-400 font-bold mb-4">아직 책을 선택하지 않았습니다.</p>
                                    <button onClick={() => setIsSearchModalOpen(true)} className="bg-black text-white px-6 py-3 rounded-full text-sm font-black hover:bg-gray-800 transition">
                                        책 검색해서 불러오기 🔍
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ✍️ 감상 및 상태 기록 영역 */}
                    <form className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">독서 상태</label>
                                <select
                                    value={recordData.status}
                                    onChange={(e) => setRecordData({ ...recordData, status: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    <option value="READING">📖 읽는 중</option>
                                    <option value="COMPLETED">✅ 완독</option>
                                    <option value="PAUSED">⏸️ 잠시 멈춤</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">나의 별점</label>
                                <select
                                    value={recordData.rating}
                                    onChange={(e) => setRecordData({ ...recordData, rating: Number(e.target.value) })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-black"
                                >
                                    <option value={5}>⭐⭐⭐⭐⭐ (최고예요)</option>
                                    <option value={4}>⭐⭐⭐⭐ (좋았어요)</option>
                                    <option value={3}>⭐⭐⭐ (보통이에요)</option>
                                    <option value={2}>⭐⭐ (아쉬워요)</option>
                                    <option value={1}>⭐ (별로예요)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-2">나의 감상 (다른 멤버들과 공유해보세요!)</label>
                            <textarea
                                rows={5}
                                placeholder="이 책을 읽으며 어떤 생각과 영감을 얻으셨나요?"
                                value={recordData.review}
                                onChange={(e) => setRecordData({ ...recordData, review: e.target.value })}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-bold focus:outline-none focus:border-black resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={recordData.isPublic}
                                    onChange={(e) => setRecordData({ ...recordData, isPublic: e.target.checked })}
                                    className="w-4 h-4 accent-black rounded"
                                />
                                <span className="text-sm font-bold text-gray-600">내 피드에 공개하기</span>
                            </label>

                            <button type="button" className="bg-black text-white px-8 py-4 rounded-xl font-black text-sm hover:bg-gray-800 transition shadow-lg">
                                기록 저장하기
                            </button>
                        </div>
                    </form>

                </div>
            </main>

            {/* 🔍 책 검색 모달창 */}
            {isSearchModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col h-[80vh] overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white z-10">
                            <h3 className="text-lg font-black tracking-tight">도서 검색</h3>
                            <button onClick={() => setIsSearchModalOpen(false)} className="text-gray-400 hover:text-black transition">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-6 bg-gray-50">
                            <form onSubmit={handleSearchBook} className="relative">
                                <input
                                    type="text"
                                    placeholder="책 제목이나 저자를 검색하세요"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white border border-gray-200 rounded-full py-4 pl-6 pr-14 text-sm font-bold focus:outline-none focus:border-black shadow-sm"
                                />
                                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white p-2.5 rounded-full hover:scale-105 transition">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 bg-white space-y-4">
                            {isSearching ? (
                                <div className="text-center py-10 text-gray-400 font-bold text-sm">검색 중입니다...</div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((book, idx) => (
                                    <div
                                        key={idx}
                                        onClick={() => handleSelectBook(book)}
                                        className="flex items-center space-x-4 p-4 border border-gray-100 rounded-2xl hover:border-black hover:shadow-md cursor-pointer transition group"
                                    >
                                        <div className="w-16 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                                            {book.thumbnail || book.cover ? (
                                                <img src={book.thumbnail || book.cover} alt="표지" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="flex h-full items-center justify-center text-[8px] text-gray-400">No Image</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-sm mb-1 group-hover:text-blue-600 transition line-clamp-2">{book.title}</h4>
                                            <p className="text-xs font-bold text-gray-500 line-clamp-1">{book.authors?.join(', ') || book.author}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 text-gray-400 font-bold text-sm">
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