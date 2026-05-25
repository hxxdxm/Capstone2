"use client";

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import './handmedowns.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function HandMeDownsPage() {
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
    imagePreview: '', // 📍 사진 미리보기 URL
    imageFile: null as File | null // 📍 실제 서버로 보낼 파일 객체
  });

  const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;

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

  // 📍 사진 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        imageFile: file,
        imagePreview: URL.createObjectURL(file) // 로컬 미리보기 생성
      });
    }
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
    if (!getToken()) return alert("로그인 후 등록할 수 있습니다.");

    if (!formData.imageFile) {
      alert("책 상태를 확인할 수 있는 사진을 등록해주세요!");
      return;
    }

    const token = getToken();
    if (!token) return alert("로그인 토큰이 없습니다. 다시 로그인해주세요.");

    try {
      const payload = new FormData();
      payload.append('bookTitle', formData.title);
      payload.append('bookAuthor', formData.author);
      payload.append('comment', formData.description || `${formData.condition} 상태의 책입니다.`);
      payload.append('tradeType', getTradeTypeValue(formData.tradeType));
      payload.append('image', formData.imageFile);

      const res = await fetch(`${API_BASE_URL}/handmedowns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.message || '도서 등록에 실패했습니다.');
        return;
      }

      const data = await res.json();
      alert(data.message || '도서 등록이 완료되었습니다!');
      setIsModalOpen(false);
      setFormData({ 
        title: '', author: '', condition: '거의 새 것', tradeType: '나눔', 
        description: '', imagePreview: '', imageFile: null 
      });
      fetchItems();
    } catch (error) {
      console.error('등록 중 에러:', error);
      alert('서버와 통신할 수 없습니다. 잠시 후 다시 시도해주세요.');
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
              filteredItems.map((item) => (
                <div key={item._id || item.id} className="item-card">
                  <div className="item-image-wrapper">
                    <img
                      src={item.bookThumbnail || item.imageUrl || 'https://via.placeholder.com/400x300?text=No+Image'}
                      alt={item.bookTitle || item.title || '책 이미지'}
                      className="item-image"
                    />
                    <span className={`item-badge ${getTradeTypeLabel(item.tradeType) === '나눔' ? 'badge-share' : 'badge-exchange'}`}>
                      {getTradeTypeLabel(item.tradeType)}
                    </span>
                  </div>
                  <div className="item-details">
                    <h3 className="item-title">{item.bookTitle || item.title}</h3>
                    <p className="item-author">{item.bookAuthor || item.author}</p>
                    <div className="item-footer">
                      <span className="item-desc">{item.comment || item.description || item.condition}</span>
                      <span className="item-owner">By {item.ownerId?.nickname || item.provider || '익명'}</span>
                    </div>
                  </div>
                </div>
              ))
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
              
              {/* 📍 사진 업로드 영역 */}
              <div className="handmedowns-form-group">
                <label className="handmedowns-form-label">책 상태 사진 *</label>
                <div className="upload-area">
                  {formData.imagePreview ? (
                    <div className="upload-preview">
                      <img src={formData.imagePreview} alt="미리보기" />
                      <div className="upload-overlay">
                        <span>사진 변경하기</span>
                      </div>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <span>📸</span>
                      <span>클릭하여 책 사진 올리기</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="upload-input" 
                  />
                </div>
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