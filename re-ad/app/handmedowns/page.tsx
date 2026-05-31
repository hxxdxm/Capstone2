"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import './handmedowns.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

// 아이템 카드 내 이미지 슬라이더
function CardImageSlider({ images, title }: { images: string[]; title: string }) {
  const [idx, setIdx] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="item-image-wrapper">
        <img src="https://via.placeholder.com/400x300?text=No+Image" alt={title} className="item-image" />
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIdx(i => (i - 1 + images.length) % images.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIdx(i => (i + 1) % images.length);
  };

  return (
    <div className="item-image-wrapper">
      <img src={images[idx]} alt={`${title} ${idx + 1}`} className="item-image" />
      {images.length > 1 && (
        <>
          <button className="slider-btn slider-btn-prev" onClick={prev}>‹</button>
          <button className="slider-btn slider-btn-next" onClick={next}>›</button>
          <div className="slider-dots">
            {images.map((_, i) => (
              <span
                key={i}
                className={`slider-dot${i === idx ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function HandMeDownsPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('전체');

  // 모달 상태 및 폼 데이터
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: '거의 새 것',
    tradeType: '나눔',
    description: '',
    imagePreviews: [] as string[], // 미리보기 URL 배열
    imageFiles: [] as File[]       // 업로드할 파일 배열
  });
  const [previewIdx, setPreviewIdx] = useState(0); // 미리보기 슬라이더 인덱스

  const getToken = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null' || token.trim() === '') return null;
    return token;
  };

  const getTradeTypeLabel = (tradeType: string) => {
    if (tradeType === 'SHARE') return '나눔';
    if (tradeType === 'EXCHANGE') return '교환';
    return tradeType;
  };

  const getTradeTypeValue = (label: string) => {
    if (label === '나눔') return 'SHARE';
    if (label === '교환') return 'EXCHANGE';
    return label;
  };

  // base64, http, 상대경로 모두 처리
  const resolveImageUrl = (url: string | undefined | null): string | null => {
    if (!url) return null;
    if (url.startsWith('data:')) return url;      // base64 그대로
    if (url.startsWith('http')) return url;       // 절대 URL 그대로
    return `http://43.202.179.130:3000${url}`;    // 상대경로에 서버 주소 붙임
  };

  // 아이템의 이미지 배열을 가져오는 헬퍼
  const getItemImages = (item: any): string[] => {
    // images 배열 우선
    if (item.images && item.images.length > 0) {
      return item.images.map((url: string) => resolveImageUrl(url)).filter(Boolean) as string[];
    }
    // 단일 bookThumbnail 폴백
    const single = resolveImageUrl(item.bookThumbnail || item.imageUrl);
    return single ? [single] : [];
  };

  // 📍 다중 사진 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const totalFiles = formData.imageFiles.length + files.length;
    if (totalFiles > 5) {
      alert('사진은 최대 5장까지 첨부할 수 있습니다.');
      const allowed = files.slice(0, 5 - formData.imageFiles.length);
      const previews = allowed.map(f => URL.createObjectURL(f));
      setFormData(prev => ({
        ...prev,
        imageFiles: [...prev.imageFiles, ...allowed],
        imagePreviews: [...prev.imagePreviews, ...previews]
      }));
      return;
    }

    const previews = files.map(f => URL.createObjectURL(f));
    setFormData(prev => ({
      ...prev,
      imageFiles: [...prev.imageFiles, ...files],
      imagePreviews: [...prev.imagePreviews, ...previews]
    }));
    // 새로 추가된 첫 번째로 슬라이더 이동
    setPreviewIdx(formData.imageFiles.length);
    // input 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = '';
  };

  // 미리보기 사진 삭제
  const removePreviewImage = (idx: number) => {
    setFormData(prev => {
      const newFiles = prev.imageFiles.filter((_, i) => i !== idx);
      const newPreviews = prev.imagePreviews.filter((_, i) => i !== idx);
      return { ...prev, imageFiles: newFiles, imagePreviews: newPreviews };
    });
    setPreviewIdx(i => Math.max(0, i >= idx ? i - 1 : i));
  };

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/handmedowns`);
      if (!res.ok) throw new Error('목록 로드 실패');
      const data = await res.json();
      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error('물려주기 목록 로드 실패:', error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = getToken();
    if (!token) return alert("로그인 후 등록할 수 있습니다. 다시 로그인해주세요.");

    if (!formData.title.trim()) return alert('책 제목을 입력해주세요.');
    if (!formData.author.trim()) return alert('저자명을 입력해주세요.');

    try {
      const commentText = formData.description.trim()
        ? `[${formData.condition}] ${formData.description.trim()}`
        : `${formData.condition} 상태의 책입니다.`;
      const tradeTypeValue = getTradeTypeValue(formData.tradeType);

      // 항상 FormData로 전송 (이미지 유무 무관)
      const payload = new FormData();
      payload.append('bookTitle', formData.title.trim());
      payload.append('bookAuthor', formData.author.trim());
      payload.append('comment', commentText);
      payload.append('tradeType', tradeTypeValue);

      // 이미지 파일들 추가 ('images' 필드명)
      formData.imageFiles.forEach(file => {
        payload.append('images', file);
      });

      const res = await fetch(`${API_BASE_URL}/handmedowns`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: payload
      });

      const responseText = await res.text();

      if (!res.ok) {
        let errorMsg = '도서 등록에 실패했습니다.';
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.message || errorData.error || errorMsg;
        } catch (_) {}
        alert(`등록 실패 (${res.status}): ${errorMsg}`);
        return;
      }

      alert('도서 등록이 완료되었습니다! 🎉');
      setIsModalOpen(false);
      setFormData({
        title: '', author: '', condition: '거의 새 것', tradeType: '나눔',
        description: '', imagePreviews: [], imageFiles: []
      });
      setPreviewIdx(0);
      fetchItems();
    } catch (error) {
      console.error('[나눔등록] 네트워크 에러:', error);
      alert('서버와 통신할 수 없습니다. 네트워크 상태를 확인해주세요.');
    }
  };

  const filteredItems = items.filter(item => {
    if (activeFilter === '전체') return true;
    return getTradeTypeLabel(item.tradeType) === activeFilter;
  });

  return (
    <div className="handmedowns-container">
      <Header />

      <main className="handmedowns-content">
        <section className="handmedowns-hero">
          <span className="handmedowns-hero-badge">BOOK EXCHANGE</span>
          <h2 className="handmedowns-hero-title">물려주기</h2>
          <p className="handmedowns-hero-desc">책 사진을 올리면 거래 확률이 2배 더 높아져요!</p>
          
          <button 
            onClick={() => {
              if (!getToken()) return alert("로그인 후 이용 가능합니다.");
              setIsModalOpen(true);
            }}
            className="btn-register-item"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            책 등록하기
          </button>
        </section>

        {/* 필터 탭 */}
        <div className="handmedowns-filter-group">
          {['전체', '나눔', '교환'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`btn-filter ${activeFilter === filter ? 'active' : ''}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* 책 목록 그리드 */}
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(123,160,91,0.3)', borderTopColor: '#7BA05B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="handmedowns-grid">
            {filteredItems.length === 0 ? (
              <div className="handmedowns-empty">
                <p>등록된 책이 없습니다.</p>
                <p>첫 번째로 나눔/교환할 책을 등록해 보세요!</p>
              </div>
            ) : (
              filteredItems.map((item) => {
                const itemImages = getItemImages(item);
                return (
                  <Link
                    href={`/handmedowns/${item._id || item.id}`}
                    key={item._id || item.id}
                    className="item-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {/* 이미지 슬라이더 */}
                    <CardImageSlider images={itemImages} title={item.bookTitle || item.title || '책'} />
                    <span className={`item-badge ${getTradeTypeLabel(item.tradeType) === '나눔' ? 'badge-share' : 'badge-exchange'}`}>
                      {getTradeTypeLabel(item.tradeType)}
                    </span>
                    <div className="item-details">
                      <h3 className="item-title">{item.bookTitle || item.title}</h3>
                      <p className="item-author">{item.bookAuthor || item.author}</p>
                      <div className="item-footer">
                        <span className="item-desc">{item.comment || item.description || item.condition}</span>
                        <span className="item-owner">By {item.ownerId?.nickname || item.ownerId?.username || item.provider || '익명'}</span>
                      </div>
                      <button
                        className="btn-chat-quick"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const token = getToken();
                          if (!token) { alert('로그인 후 이용 가능합니다.'); return; }
                          const ownerId = item.ownerId?._id || item.ownerId;
                          if (!ownerId) { alert('게시자 정보를 찾을 수 없습니다.'); return; }
                          router.push(`/dms/${ownerId}`);
                        }}
                      >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        채팅하기
                      </button>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        )}
      </main>

      {/* 📍 등록 모달창 */}
      {isModalOpen && (
        <div className="handmedowns-modal-backdrop">
          <div className="handmedowns-modal">
            <button onClick={() => setIsModalOpen(false)} className="handmedowns-modal-close">✕</button>
            <h3>물려줄 책 등록</h3>
            
            <form onSubmit={handleRegister}>
              
              {/* 📍 다중 사진 업로드 영역 */}
              <div className="handmedowns-form-group">
                <label className="handmedowns-form-label">
                  책 상태 사진 (선택, 최대 5장)
                  {formData.imagePreviews.length > 0 && (
                    <span style={{ color: '#7BA05B', marginLeft: 8 }}>{formData.imagePreviews.length}장 선택됨</span>
                  )}
                </label>

                {/* 미리보기 슬라이더 */}
                {formData.imagePreviews.length > 0 ? (
                  <div className="preview-slider-wrap">
                    <div className="preview-slider">
                      <img src={formData.imagePreviews[previewIdx]} alt="미리보기" className="preview-slider-img" />
                      <button
                        type="button"
                        className="preview-remove-btn"
                        onClick={() => removePreviewImage(previewIdx)}
                      >✕</button>
                      {formData.imagePreviews.length > 1 && (
                        <>
                          <button type="button" className="slider-btn slider-btn-prev"
                            onClick={() => setPreviewIdx(i => (i - 1 + formData.imagePreviews.length) % formData.imagePreviews.length)}>‹</button>
                          <button type="button" className="slider-btn slider-btn-next"
                            onClick={() => setPreviewIdx(i => (i + 1) % formData.imagePreviews.length)}>›</button>
                        </>
                      )}
                    </div>
                    <div className="preview-dots">
                      {formData.imagePreviews.map((_, i) => (
                        <span key={i} className={`slider-dot${i === previewIdx ? ' active' : ''}`}
                          onClick={() => setPreviewIdx(i)} />
                      ))}
                    </div>
                    {/* 추가 업로드 버튼 (5장 미만일 때만) */}
                    {formData.imagePreviews.length < 5 && (
                      <label htmlFor="book-image-upload" className="add-more-btn">
                        + 사진 추가 ({formData.imagePreviews.length}/5)
                      </label>
                    )}
                  </div>
                ) : (
                  <label htmlFor="book-image-upload" className="upload-area" style={{ cursor: 'pointer' }}>
                    <div className="upload-placeholder">
                      <span>📸</span>
                      <span>클릭하여 책 사진 올리기</span>
                      <span style={{ fontSize: '10px', color: '#BDB09A' }}>최대 5장 선택 가능</span>
                    </div>
                  </label>
                )}

                <input
                  id="book-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="handmedowns-form-group">
                <label className="handmedowns-form-label">책 제목 *</label>
                <input type="text" className="handmedowns-form-input" placeholder="책 제목을 입력해주세요" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>

              <div className="handmedowns-form-group">
                <label className="handmedowns-form-label">저자명 *</label>
                <input type="text" className="handmedowns-form-input" placeholder="지은이를 입력해주세요" value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} required />
              </div>

              <div className="handmedowns-form-row">
                <div className="handmedowns-form-group">
                  <label className="handmedowns-form-label">책 상태 *</label>
                  <select className="handmedowns-form-select" value={formData.condition} onChange={(e) => setFormData({...formData, condition: e.target.value})}>
                    <option value="거의 새 것">거의 새 것</option>
                    <option value="사용감 있음">사용감 있음</option>
                    <option value="밑줄 많음">밑줄 많음</option>
                  </select>
                </div>
                <div className="handmedowns-form-group">
                  <label className="handmedowns-form-label">거래 방식 *</label>
                  <select className="handmedowns-form-select" value={formData.tradeType} onChange={(e) => setFormData({...formData, tradeType: e.target.value})}>
                    <option value="나눔">나눔 (무료)</option>
                    <option value="교환">교환 (책 맞교환)</option>
                  </select>
                </div>
              </div>

              <div className="handmedowns-form-group">
                <label className="handmedowns-form-label">상세 설명</label>
                <textarea className="handmedowns-form-textarea" placeholder="책 상태에 대해 자유롭게 적어주세요" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <button type="submit" className="btn-submit-item">
                도서 등록 완료
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}