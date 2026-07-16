import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Calendar, Heart, Edit, Trash2, Tag, BookOpen } from 'lucide-react';
import { CollectionItem } from '../types';

interface ItemDetailModalProps {
  item: CollectionItem | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onEdit: (item: CollectionItem) => void;
  onDelete: (id: string) => void;
}

export default function ItemDetailModal({
  item,
  onClose,
  onToggleFavorite,
  onEdit,
  onDelete,
}: ItemDetailModalProps) {
  if (!item) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '立ち絵':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300';
      case 'ファンアート':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-300';
      case 'スクリーンショット':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
      case 'グッズ':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
      default:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300';
    }
  };

  return (
    <AnimatePresence>
      <div
        id="detail-modal-backdrop"
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          id="detail-modal-container"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl border-4 border-[#FFB6C1]/30 dark:border-[#87CEEB]/30 relative flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            id="detail-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 z-25 p-2 bg-slate-900/40 hover:bg-slate-900/60 text-white rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image with Favorite Button */}
          <div id="detail-image-section" className="relative w-full md:w-1/2 h-64 md:h-auto bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-contain md:object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Ambient background glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none md:block hidden" />

            {/* Favorite button over image */}
            <button
              id="detail-favorite-toggle"
              onClick={() => onToggleFavorite(item.id)}
              className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-slate-800/95 hover:bg-white text-slate-800 dark:text-white rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer text-sm font-bold border border-slate-100 dark:border-slate-700 transition-transform hover:scale-105"
            >
              <Heart
                className={`w-5 h-5 ${
                  item.isFavorite ? 'fill-rose-500 stroke-rose-500' : 'stroke-slate-500'
                }`}
              />
              <span>{item.isFavorite ? 'お気に入り中' : 'お気に入りに追加'}</span>
            </button>
          </div>

          {/* Right Column: Information Sheet */}
          <div id="detail-info-section" className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category tag & Date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full ${getCategoryColor(item.category)}`}>
                  <Tag className="w-3.5 h-3.5" />
                  {item.category}
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-50 dark:bg-slate-900/60 px-3 py-1 rounded-full">
                  <Calendar className="w-3.5 h-3.5" />
                  入手日: {item.acquiredDate}
                </span>
              </div>

              {/* Card Name */}
              <h2 id="detail-title" className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-snug mb-3">
                {item.name}
              </h2>

              {/* Stars display */}
              <div id="detail-rarity-row" className="flex items-center gap-2 mb-6 bg-amber-500/10 dark:bg-amber-400/5 px-4 py-2 rounded-2xl w-fit">
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">レア度:</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < item.rarity
                          ? 'fill-amber-400 stroke-amber-400'
                          : 'stroke-slate-200 dark:stroke-slate-700 fill-none'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 font-mono">
                  ({item.rarity}/5)
                </span>
              </div>

              {/* Memo/Description */}
              <div id="detail-memo-container" className="mb-6 bg-sky-500/5 dark:bg-sky-400/5 border border-sky-100 dark:border-sky-950/50 rounded-2xl p-4.5">
                <h4 className="text-xs font-bold text-sky-700 dark:text-sky-400 flex items-center gap-1.5 mb-2">
                  <BookOpen className="w-4 h-4" />
                  メモ・紹介
                </h4>
                {item.memo ? (
                  <p id="detail-memo-text" className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                    {item.memo}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                    メモは登録されていません。
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Actions Footer */}
            <div id="detail-actions-footer" className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                id="detail-edit-action-btn"
                onClick={() => onEdit(item)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-300 rounded-2xl font-bold transition-all cursor-pointer text-sm shadow-sm"
              >
                <Edit className="w-4 h-4" />
                情報を編集
              </button>

              <button
                id="detail-delete-action-btn"
                onClick={() => onDelete(item.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 rounded-2xl font-bold transition-all cursor-pointer text-sm shadow-sm"
              >
                <Trash2 className="w-4 h-4" />
                コレクションから削除
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
