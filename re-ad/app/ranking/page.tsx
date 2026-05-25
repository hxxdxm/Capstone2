"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header'; // 📍 공통 헤더 불러오기
import './ranking.css';

const GENRES = [
  { name: '전체', value: '' },
  { name: '소설', value: '소설' },
  { name: '자연과학', value: '자연과학' },
  { name: '에세이', value: '에세이' },
  { name: '인문학', value: '인문학' },
  { name: '경제경영', value: '경제경영' },
];

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RankingPage() {
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [books, setBooks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRanking = async (genreValue: string) => {
    setIsLoading(true);
    try {
      const API_URL = `${API_BASE_URL}/books/public-ranking?genre=${encodeURIComponent(genreValue)}`;
      const res = await fetch(API_URL);
      const data = await res.json();

      if (Array.isArray(data)) {
        setBooks(data);
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("데이터 로드 실패:", error);
      setBooks([]); 
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking(selectedGenre.value);
  }, [selectedGenre]);

  const getRankClass = (index: number) => {
    if (index === 0) return 'rank-1';
    if (index === 1) return 'rank-2';
    if (index === 2) return 'rank-3';
    return 'rank-other';
  };

  return (
    <div className="ranking-page">
      <Header />

      <main className="ranking-inner">
        {/* 헤더 섹션 */}
        <section className="ranking-hero">
          <span className="ranking-hero-badge">TRENDING NOW</span>
          <h2 className="ranking-hero-title">📚 도서 랭킹</h2>
          <p className="ranking-hero-sub">실시간 베스트셀러 순위</p>
        </section>

        {/* 장르 탭 */}
        <nav className="genre-nav">
          {GENRES.map((genre) => (
            <button
              key={genre.name}
              onClick={() => setSelectedGenre(genre)}
              className={`genre-tab${selectedGenre.name === genre.name ? ' active' : ''}`}
            >
              {genre.name}
            </button>
          ))}
        </nav>

        {/* 로딩 / 리스트 */}
        {isLoading ? (
          <div className="ranking-loading">
            <div className="spinner" />
          </div>
        ) : (
          <div className="books-grid">
            {books.length === 0 ? (
              <div className="books-empty">
                현재 랭킹 데이터를 불러올 수 없습니다.<br />
                다시 시도하거나 잠시만 기다려 주세요.
              </div>
            ) : (
              books.map((book, index) => (
                <div key={book.isbn || index} className="book-card">
                  {/* 순위 뱃지 */}
                  <div className={`book-rank ${getRankClass(index)}`}>
                    {index + 1}
                  </div>

                  {/* 책 표지 */}
                  <div className="book-cover-wrap">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="book-cover"
                    />
                  </div>

                  {/* 책 정보 */}
                  <div className="book-info">
                    <h4 className="book-title">{book.title}</h4>
                    <p className="book-author">{book.author}</p>
                    <span className="book-genre-badge">
                      {selectedGenre.name === '전체' ? '베스트셀러' : selectedGenre.name}
                    </span>
                    <br />
                    <a
                      href={book.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="book-detail-link"
                    >
                      상세 정보 보기 →
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}