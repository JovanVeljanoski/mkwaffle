import React from 'react';
import { GameStats } from '../types';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
}

const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  const distribution = stats.distribution;

  // Calculate max for bar scaling
  const maxCount = Math.max(
    distribution.failed,
    distribution.stars0,
    distribution.stars1,
    distribution.stars2,
    distribution.stars3,
    distribution.stars4,
    distribution.stars5,
    1 // Minimum 1 to avoid division by zero
  );

  // Distribution row component
  const DistributionRow = ({
    label,
    count,
    showStar = true
  }: {
    label: string;
    count: number;
    showStar?: boolean;
  }) => {
    const percentage = stats.played > 0 ? Math.round((count / stats.played) * 100) : 0;
    const barWidth = maxCount > 0 ? Math.max((count / maxCount) * 100, count > 0 ? 8 : 0) : 0;

    return (
      <div className="flex items-center gap-2 py-1">
        <div className="w-12 flex items-center justify-end gap-1 text-gray-700 dark:text-gray-300 font-semibold">
          <span>{label}</span>
          {showStar && (
            <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>
        <div className="flex-1 flex items-center gap-2">
          <div
            className={`h-6 rounded flex items-center justify-end px-2 min-w-[28px] ${
              count > 0 ? 'bg-[#6aaa64]' : 'bg-gray-400 dark:bg-gray-600'
            }`}
            style={{ width: `${Math.max(barWidth, 8)}%` }}
          >
            <span className="text-white text-xs font-bold">{count}</span>
          </div>
          {count > 0 && stats.played > 0 && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">{percentage}%</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Header */}
        <div className="flex items-center justify-center px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10 relative">
          <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-wider">СТАТИСТИКА</h2>
          <button
            onClick={onClose}
            className="absolute right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="space-y-0">
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wide">ОДИГРАНИ</span>
              <span className="font-black text-gray-800 dark:text-white">{stats.played}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wide">ВКУПНО ЅВЕЗДИ</span>
              <span className="font-black text-gray-800 dark:text-white">{stats.totalStars}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wide">ТЕКОВНА СЕРИЈА</span>
              <span className="font-black text-gray-800 dark:text-white">{stats.currentStreak}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400 tracking-wide">НАЈДОБРА СЕРИЈА</span>
              <span className="font-black text-gray-800 dark:text-white">{stats.bestStreak}</span>
            </div>
          </div>

          {/* Star Distribution */}
          <div className="mt-6">
            <h3 className="text-center font-black text-gray-800 dark:text-white tracking-wider mb-4">
              ДИСТРИБУЦИЈА НА ЅВЕЗДИ
            </h3>

            <div className="space-y-1">
              <DistributionRow label="X" count={distribution.failed} showStar={false} />
              <DistributionRow label="0" count={distribution.stars0} />
              <DistributionRow label="1" count={distribution.stars1} />
              <DistributionRow label="2" count={distribution.stars2} />
              <DistributionRow label="3" count={distribution.stars3} />
              <DistributionRow label="4" count={distribution.stars4} />
              <DistributionRow label="5" count={distribution.stars5} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
