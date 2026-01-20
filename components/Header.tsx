import React from 'react';
import { getDailySeed } from '../utils/daily';

interface HeaderProps {
  onHelpClick: () => void;
  onStatsClick: () => void;
  onAboutClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onHelpClick, onStatsClick, onAboutClick, onMenuClick }) => {
  const dailyId = getDailySeed();

  return (
    <header className="w-full max-w-[600px] mx-auto px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 mb-6">
      {/* Left Icons */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Menu Icon */}
        <button
          onClick={onMenuClick}
          aria-label="Отвори мени"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {/* Heart Icon (Support) - opens about panel */}
        <button
          onClick={onAboutClick}
          aria-label="За играта"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>

      {/* Title */}
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-black tracking-[0.2em] text-[#333333] dark:text-white font-sans">
          ВАФЛА
        </h1>
        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold tracking-widest mt-0 uppercase">
          Дневна Вафла #{dailyId}
        </p>
      </div>

      {/* Right Icons */}
      <div className="flex items-center gap-1 sm:gap-3">
        {/* Stats Icon */}
        <button
          onClick={onStatsClick}
          aria-label="Статистика"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/>
          </svg>
        </button>
        {/* Help Icon (?) - Right Most */}
        <button
           onClick={onHelpClick}
           aria-label="Како се игра"
           className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;