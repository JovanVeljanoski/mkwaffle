import React from 'react';
import waffleMascot from '../public/waffle.svg';

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStatsClick: () => void;
  onAboutClick: () => void;
  onHelpClick: () => void;
  onOptionsClick: () => void;
}

const MenuPanel: React.FC<MenuPanelProps> = ({
  isOpen,
  onClose,
  onStatsClick,
  onAboutClick,
  onHelpClick,
  onOptionsClick,
}) => {
  const handleItemClick = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-[400] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white dark:bg-gray-900 z-[401] shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-wider">
            Мени
          </h2>
        </div>

        {/* Menu Items */}
        <nav className="py-2">
          {/* Statistics */}
          <button
            onClick={() => handleItemClick(onStatsClick)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/>
            </svg>
            <span className="text-gray-800 dark:text-white font-semibold tracking-wide">
              СТАТИСТИКА
            </span>
          </button>

          {/* About */}
          <button
            onClick={() => handleItemClick(onAboutClick)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-800 dark:text-white font-semibold tracking-wide">
              ЗА ИГРАТА
            </span>
          </button>

          {/* How to Play */}
          <button
            onClick={() => handleItemClick(onHelpClick)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-800 dark:text-white font-semibold tracking-wide">
              КАКО СЕ ИГРА
            </span>
          </button>

          {/* Options */}
          <button
            onClick={() => handleItemClick(onOptionsClick)}
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-800 dark:text-white font-semibold tracking-wide">
              ОПЦИИ
            </span>
          </button>

          {/* Support */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="text-gray-800 dark:text-white font-semibold tracking-wide">
              ПОДДРЖЕТЕ НЕ
            </span>
          </a>
        </nav>

        {/* Cute waffle mascot at bottom */}
        <div className="mt-auto flex justify-end p-4">
          <img src={waffleMascot} alt="Waffle mascot" className="w-40 h-40 opacity-90" />
        </div>
      </div>
    </>
  );
};

export default MenuPanel;
