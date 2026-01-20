import React from 'react';

interface AboutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onHelpClick: () => void;
  onStatsClick: () => void;
}

const AboutPanel: React.FC<AboutPanelProps> = ({ isOpen, onClose, onHelpClick, onStatsClick }) => {
  return (
    <div
      className={`fixed inset-0 z-[300] bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Header - same style as main header */}
      <header className="w-full max-w-[600px] mx-auto px-4 py-3 flex items-center justify-between border-b border-gray-100 dark:border-gray-700 mb-6">
        {/* Left Icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Back Arrow */}
          <button
            onClick={onClose}
            aria-label="Назад"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          {/* Heart Icon (Active) */}
          <button aria-label="За играта" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        {/* Title - no daily number */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-black tracking-[0.2em] text-[#333333] dark:text-white font-sans">
            ВАФЛА
          </h1>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Stats Icon */}
          <button
            onClick={() => { onClose(); onStatsClick(); }}
            aria-label="Статистика"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M10 20h4V4h-4v16zm-6 0h4v-8H4v8zM16 9v11h4V9h-4z"/>
            </svg>
          </button>
          {/* Help Icon */}
          <button
            onClick={() => { onClose(); onHelpClick(); }}
            aria-label="Како се игра"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="w-full max-w-[500px] mx-auto px-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
        {/* Section: About the game */}
        <h3 className="text-xl font-black text-gray-800 dark:text-white mb-4 text-center">За играта</h3>

        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-6" />

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-center">
          Ова е Македонска верзија на играта{' '}
          <a
            href="https://wafflegame.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6aaa64] font-semibold hover:underline"
          >
            wafflegame.net
          </a>
          .
        </p>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-center">
          Кодот на оваа игра е јавен и можете да го видите{' '}
          <a
            href="https://github.com/JovanVeljanoski/mkwaffle"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#6aaa64] font-semibold hover:underline"
          >
            овде
          </a>
          .
        </p>

        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-6" />

        {/* Section: Other word games */}
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">
          Други игри со зборови:
        </h4>

        <ul className="space-y-3 mb-6 max-w-[350px] mx-auto">
          <li className="flex items-start gap-2">
            <span className="text-[#6aaa64] mt-0.5">•</span>
            <span className="text-gray-700 dark:text-gray-300">
              <a
                href="https://pcelka.mk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6aaa64] font-semibold hover:underline"
              >
                пчелка
              </a>
            </span>
          </li>
        </ul>

        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-6" />

        {/* Section: Other projects */}
        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 text-center">
          Оригинални проекти од истиот автор:
        </h4>

        <ul className="space-y-3 mb-6 max-w-[350px] mx-auto">
          <li className="flex items-start gap-2">
            <span className="text-[#6aaa64] mt-0.5">•</span>
            <span className="text-gray-700 dark:text-gray-300">
              Учете странски јазици со{' '}
              <a
                href="https://www.mylexilingo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6aaa64] font-semibold hover:underline"
              >
                mylexilingo.com
              </a>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#6aaa64] mt-0.5">•</span>
            <span className="text-gray-700 dark:text-gray-300">
              Слушајте сказни за мали деца со{' '}
              <a
                href="https://storytime.mylexilingo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6aaa64] font-semibold hover:underline"
              >
                storytime
              </a>
            </span>
          </li>
        </ul>

        <div className="w-full h-[1px] bg-gray-200 dark:bg-gray-700 mb-6" />

        {/* Support section */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-5 border border-red-100 dark:border-gray-700 mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="font-bold text-gray-800 dark:text-white">Поддржи го проектот</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
            Поддржете го развитокот и одржувањето на проектите:
          </p>
          <div className="flex justify-center">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#6aaa64] hover:bg-[#5a9a54] text-white font-bold py-2 px-6 rounded-lg shadow-md active:scale-95 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Донирај
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPanel;
