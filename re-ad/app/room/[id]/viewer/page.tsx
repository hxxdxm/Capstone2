"use client";

import React, { useState, useEffect } from 'react';

export default function ViewerPage() {
  const [seconds, setSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // 독서 타이머 로직
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // 시간을 MM:SS 포맷으로 변환
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="relative min-h-screen bg-[#FDFBF7] text-gray-900 font-serif overflow-hidden">
      
      {/* 플로팅 독서 타이머 (우측 상단 고정) */}
      <div 
        className="fixed top-6 right-6 z-50 flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-gray-200 cursor-pointer"
        onClick={() => setIsTimerRunning(!isTimerRunning)}
      >
        <div className={`w-2 h-2 rounded-full ${isTimerRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-xs font-sans font-bold text-gray-700 tracking-wider">
          {formatTime(seconds)}
        </span>
      </div>

      {/* 뷰어 메인 영역 (Canvas API 및 텍스트 렌더링) */}
      <div className="relative w-full h-[calc(100vh-80px)] px-6 pt-20 pb-24 overflow-y-auto">
        
        {/* Layer 1: 기본 텍스트 및 Canvas 영역 (z-0) */}
        <div className="absolute inset-0 z-0 p-6 pointer-events-auto">
          {/* 실제 뷰어 컴포넌트(Canvas)가 마운트 될 자리 */}
          <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-white/50">
            <span className="font-sans text-gray-400 text-sm font-bold">Canvas API 영역</span>
          </div>
        </div>

        {/* Layer 2: 사용자 메모 및 드로잉 레이어 (z-10) */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* 메모 컨테이너 예시 (pointer-events-auto로 클릭 가능하게 설정) */}
          <div className="absolute top-32 left-10 pointer-events-auto transform rotate-2">
            <div className="bg-yellow-100 px-4 py-3 rounded shadow-md border border-yellow-200 font-sans text-sm text-gray-800 max-w-xs">
              이 문장 진짜 텍스트힙 그 자체다... 나중에 필사해야지!
            </div>
          </div>
        </div>
        
      </div>

      {/* 하단 고정 탭 바 (실용성 툴킷) */}
      <div className="fixed bottom-0 left-0 w-full h-20 bg-white border-t border-gray-200 z-50 flex items-center justify-around px-2 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        
        <button className="flex flex-col items-center justify-center w-16 h-full space-y-1 text-gray-500 hover:text-gray-900 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span className="text-[10px] font-sans font-bold">타이머</span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-full space-y-1 text-gray-500 hover:text-gray-900 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5zM13.5 13.5h-4.5V18a2.25 2.25 0 002.25 2.25h2.25A2.25 2.25 0 0015.75 18v-4.5z" /></svg>
          <span className="text-[10px] font-sans font-bold">텍스트 스캔</span>
        </button>

        <button className="flex flex-col items-center justify-center w-16 h-full space-y-1 text-gray-500 hover:text-gray-900 transition">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
          <span className="text-[10px] font-sans font-bold">이미지 메모</span>
        </button>

      </div>
    </div>
  );
}