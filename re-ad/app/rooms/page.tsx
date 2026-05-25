"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import './rooms.css';

const API_BASE_URL = 'http://13.124.191.57:5000/api';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeFilter, setActiveFilter] = useState('전체');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState({
    roomName: '',
    roomType: '온라인', 
    maxMembers: 10,
    roomPassword: '',
    roomDesc: '',
    tags: '' 
  });

  const getToken = () => typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
  const getMyId = () => {
    const token = getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
      return payload.id || payload.userId;
    } catch (e) { return null; }
  };

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/rooms`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setRooms(data);
      } else if (data.rooms && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      }
    } catch (error) {
      console.error("모임방 목록 로드 실패:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    const myId = getMyId();

    if (!token || !myId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!newRoom.roomName.trim()) {
      alert("모임방 이름을 입력해주세요.");
      return;
    }

    const tagArray = newRoom.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

    // 📍 핵심 수정: 방을 처음 만들 때도 백엔드 명세에 맞춰 description 키값을 추가로 보냅니다.
    const roomPayload = {
      ...newRoom,
      description: newRoom.roomDesc, 
      hostId: myId,
      tags: tagArray
    };

    try {
      const res = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(roomPayload)
      });

      if (res.ok) {
        alert("모임방이 성공적으로 개설되었습니다!");
        setIsCreateModalOpen(false);
        setNewRoom({ roomName: '', roomType: '온라인', maxMembers: 10, roomPassword: '', roomDesc: '', tags: '' });
        fetchRooms(); // 목록 새로고침
      } else {
        alert("방 생성에 실패했습니다.");
      }
    } catch (error) {
      alert("서버와 연결할 수 없습니다.");
    }
  };

  const getRoomTypeLabel = (roomType: string) => {
    if (roomType === 'ONLINE') return '온라인';
    if (roomType === 'LOCAL') return '오프라인';
    return roomType;
  };

  const filteredRooms = rooms.filter(room => {
    if (activeFilter === '전체') return true;
    if (activeFilter === '온라인') return room.roomType === 'ONLINE';
    if (activeFilter === '오프라인') return room.roomType === 'LOCAL';
    return true;
  });

  return (
    <div className="rooms-container">
      <Header />

      <main className="rooms-content">
        <section className="rooms-hero">
          <span className="rooms-hero-badge">READING LOUNGE</span>
          <h2 className="rooms-hero-title">Rooms</h2>
          <p className="rooms-hero-desc">함께 읽고, 나누고, 성장하는 공간</p>
          
          <button 
            onClick={() => {
              if (!getToken()) return alert("로그인 후 이용 가능합니다.");
              setIsCreateModalOpen(true);
            }}
            className="btn-create-room"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            방 만들기
          </button>
        </section>

        <div className="rooms-filter-group">
          {['전체', '온라인', '오프라인'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`btn-filter ${activeFilter === filter ? 'active' : ''}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(123,160,91,0.3)', borderTopColor: '#7BA05B', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.length === 0 ? (
              <div className="rooms-empty">
                <p>해당하는 모임방이 없습니다.</p>
                <p>조건을 바꾸거나 새 모임방을 개설해 보세요!</p>
              </div>
            ) : (
              filteredRooms.map((room) => (
                <Link 
                  href={`/rooms/${room._id || room.id}`} 
                  key={room._id || room.id}
                  className="room-card"
                >
                  <div>
                    <div className="room-card-header">
                      <span className={`room-type-badge ${room.roomType === 'ONLINE' ? 'type-online' : 'type-local'}`}>
                        {getRoomTypeLabel(room.roomType)}
                      </span>
                      {room.roomPassword && (
                        <span className="room-lock-icon" title="비밀번호 필요">🔒</span>
                      )}
                    </div>
                    
                    <h3 className="room-card-title">
                      {room.roomName}
                    </h3>
                    
                    <p className="room-card-desc">
                      {room.description || room.roomDesc || "모임 소개글이 없습니다."}
                    </p>
                  </div>

                  <div className="room-card-footer">
                    <span className="room-members">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                      인원 <span>{room.members?.length || 0} / {room.maxMembers}</span>
                    </span>
                    <span className="room-host">
                      방장: {room.hostName || "익명"}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </main>

      {isCreateModalOpen && (
        <div className="rooms-modal-backdrop">
          <div className="rooms-modal">
            <button 
              onClick={() => setIsCreateModalOpen(false)} 
              className="rooms-modal-close"
            >
              ✕
            </button>
            
            <h3>새 모임방 개설</h3>
            
            <form onSubmit={handleCreateRoom}>
              <div className="rooms-form-group">
                <label className="rooms-form-label">모임방 이름 *</label>
                <input 
                  type="text" 
                  className="rooms-form-input" 
                  placeholder="예) 금요일 밤 소설 읽기" 
                  value={newRoom.roomName}
                  onChange={(e) => setNewRoom({...newRoom, roomName: e.target.value})}
                  required
                />
              </div>

              <div className="rooms-form-row">
                <div className="rooms-form-group">
                  <label className="rooms-form-label">진행 방식 *</label>
                  <select 
                    className="rooms-form-select"
                    value={newRoom.roomType}
                    onChange={(e) => setNewRoom({...newRoom, roomType: e.target.value})}
                  >
                    <option value="온라인">온라인</option>
                    <option value="오프라인">오프라인</option>
                  </select>
                </div>
                <div className="rooms-form-group">
                  <label className="rooms-form-label">최대 인원 *</label>
                  <input 
                    type="number" 
                    min="2" max="100"
                    className="rooms-form-input" 
                    value={newRoom.maxMembers}
                    onChange={(e) => setNewRoom({...newRoom, maxMembers: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>

              <div className="rooms-form-group">
                <label className="rooms-form-label">비밀번호 (선택)</label>
                <input 
                  type="password" 
                  className="rooms-form-input" 
                  placeholder="입력 시 비공개 방으로 설정됩니다" 
                  value={newRoom.roomPassword}
                  onChange={(e) => setNewRoom({...newRoom, roomPassword: e.target.value})}
                />
              </div>

              <div className="rooms-form-group">
                <label className="rooms-form-label">모임 소개</label>
                <textarea 
                  className="rooms-form-textarea" 
                  placeholder="어떤 모임인지 자세히 적어주세요"
                  value={newRoom.roomDesc}
                  onChange={(e) => setNewRoom({...newRoom, roomDesc: e.target.value})}
                ></textarea>
              </div>

              <div className="rooms-form-group">
                <label className="rooms-form-label">태그 (선택)</label>
                <input 
                  type="text" 
                  className="rooms-form-input" 
                  placeholder="콤마(,)로 구분해 주세요 예) 소설,주말" 
                  value={newRoom.tags}
                  onChange={(e) => setNewRoom({...newRoom, tags: e.target.value})}
                />
              </div>

              <button type="submit" className="btn-submit-room">
                모임방 만들기
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}