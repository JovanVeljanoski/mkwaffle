import React from 'react';
import Tile from './Tile';
import { CellStatus } from '../types';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-black text-gray-800 dark:text-white tracking-wider">КАКО СЕ ИГРА</h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-gray-700 dark:text-gray-300 font-sans leading-relaxed text-base">

          <div className="space-y-3">
            <p>Решете ја <strong>ВАФЛАТА</strong> за 15 потези или помалку.</p>
            <p>Секоја <strong>ВАФЛА</strong> може да се реши во минимум 10 потези.</p>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
            <p className="mb-4">Преместете ги буквите за да ги составите зборовите хоризонтално и вертикално. Повлечете ги буквите каде било на таблата.</p>
            <p>Буквите ќе ја променат бојата за да покажат дали се на вистинската позиција.</p>
          </div>

          {/* Examples */}
          <div className="space-y-4 pt-2">

            {/* Green Example */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Точна позиција</p>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 relative shrink-0">
                    <Tile
                      data={{ char: 'П', status: CellStatus.CORRECT }}
                      row={0} col={0} isDraggingSource={false} onPointerDown={() => {}}
                      style={{ width: '100%', height: '100%', fontSize: '1.75rem', cursor: 'default' }}
                      disabled={true}
                    />
                 </div>
                 <p className="text-sm leading-tight">Буквата <strong className="text-gray-900 dark:text-white">П</strong> е на вистинското место.</p>
              </div>
            </div>

            {/* Yellow Example */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Погрешна позиција</p>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 relative shrink-0">
                    <Tile
                      data={{ char: 'Е', status: CellStatus.PRESENT }}
                      row={0} col={0} isDraggingSource={false} onPointerDown={() => {}}
                      style={{ width: '100%', height: '100%', fontSize: '1.75rem', cursor: 'default' }}
                      disabled={true}
                    />
                 </div>
                 <p className="text-sm leading-tight">Буквата <strong className="text-gray-900 dark:text-white">Е</strong> е во зборот, но на друго место.</p>
              </div>
            </div>

             {/* Corner Example */}
             <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 mb-3 uppercase tracking-widest">Агол</p>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 relative shrink-0">
                    <Tile
                      data={{ char: 'К', status: CellStatus.PRESENT }}
                      row={0} col={0} isDraggingSource={false} onPointerDown={() => {}}
                      style={{ width: '100%', height: '100%', fontSize: '1.75rem', cursor: 'default' }}
                      disabled={true}
                    />
                 </div>
                 <p className="text-sm leading-tight">Оваа буква е на агол, па припаѓа или на вертикалниот или на хоризонталниот збор.</p>
              </div>
            </div>

          </div>

          <div className="text-center pt-4 pb-2">
             <button
                onClick={onClose}
                className="bg-gray-800 dark:bg-gray-600 text-white font-bold py-3 px-8 rounded-full shadow-lg active:scale-95 transition-transform"
             >
                ИГРАЈ
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HelpModal;