// components/Header.tsx
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white/90 backdrop-blur-md px-8 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-200">
      {/* 1. 로고 (좌측) */}
      <Link href="/" className="flex items-center space-x-2">
        <h1 className="text-2xl font-black tracking-tighter text-black">교환<span className="text-gray-400">독서</span></h1>
      </Link>

      {/* 2. 내비게이션 (중앙) */}
      <nav className="flex space-x-8 items-center">
        <Link href="/ranking" className="text-sm font-bold text-gray-600 hover:text-black transition">북랭킹</Link>
        <Link href="/exhibition" className="text-sm font-bold text-black border-b-2 border-black">필사전시</Link>
        <Link href="/rooms" className="text-sm font-bold text-gray-600 hover:text-black transition">라운지</Link>
        <Link href="/handmedowns" className="text-sm font-bold text-gray-600 hover:text-black transition">물려주기</Link>
      </nav>

      {/* 3. 유틸리티 (우측) */}
      <div className="flex items-center space-x-4">
        <Link href="/mypage" className="text-xs font-black bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 transition">MY</Link>
      </div>
    </header>
  );
}