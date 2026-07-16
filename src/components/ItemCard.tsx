import React from 'react';
import { motion } from 'motion/react';
import { Star, Calendar, Heart, ZoomIn, Edit, Trash2 } from 'lucide-react';
import { CollectionItem } from '../types';

interface ItemCardProps {
  key?: React.Key;
  item: CollectionItem;
  onClick: (item: CollectionItem) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onEdit: (item: CollectionItem, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export default function ItemCard({
  item,
  onClick,
  onToggleFavorite,
  onEdit,
  onDelete,
}: ItemCardProps) {
  // Map category to nice pastel Tailwind classes
  const getCategoryColor = (category: string) => {
    switch (category) {
      case '立ち絵':
        return 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800';
      case 'ファンアート':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border-pink-200 dark:border-pink-800';
      case 'スクリーンショット':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'グッズ':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <motion.div
      id={`collection-item-card-${item.id}`}
      className="group relative bg-white dark:bg-slate-800/90 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border-4 border-transparent hover:border-[#FFB6C1]/40 dark:hover:border-[#87CEEB]/40 transition-all duration-300"
      whileHover={{ y: -6, scale: 1.02 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* Favorite Button Overlay */}
      <button
        id={`fav-btn-${item.id}`}
        onClick={(e) => onToggleFavorite(item.id, e)}
        className="absolute top-3 right-3 z-10 p-2 bg-white/85 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-900 rounded-full shadow-md transition-colors group/fav cursor-pointer"
        title="お気に入り"
      >
        <Heart
          className={`w-5 h-5 transition-transform group-hover/fav:scale-110 ${
            item.isFavorite
              ? 'fill-rose-500 stroke-rose-500'
              : 'stroke-slate-400 dark:stroke-slate-500 hover:stroke-rose-400'
          }`}
        />
      </button>

      {/* Action buttons reveal on hover */}
      <div className="absolute top-3 left-3 z-10 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          id={`edit-btn-${item.id}`}
          onClick={(e) => onEdit(item, e)}
          className="p-2 bg-white/85 dark:bg-slate-900/80 hover:bg-sky-50 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 rounded-full shadow-md cursor-pointer"
          title="編集"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          id={`delete-btn-${item.id}`}
          onClick={(e) => onDelete(item.id, e)}
          className="p-2 bg-white/85 dark:bg-slate-900/80 hover:bg-rose-50 dark:hover:bg-slate-700 text-rose-600 dark:text-rose-400 rounded-full shadow-md cursor-pointer"
          title="削除"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Image Container with scale and overlay on hover */}
      <div
        id={`img-container-${item.id}`}
        className="relative h-56 w-full overflow-hidden bg-slate-100 dark:bg-slate-900/50 cursor-pointer"
        onClick={() => onClick(item)}
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {/* Soft elegant overlay on hover */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="bg-white/95 dark:bg-slate-900/95 p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <ZoomIn className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </div>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-5 flex flex-col justify-between" id={`details-container-${item.id}`}>
        {/* Category & Date Row */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${getCategoryColor(
              item.category
            )}`}
          >
            {item.category}
          </span>
          <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 gap-1 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            <span>{item.acquiredDate}</span>
          </div>
        </div>

        {/* Title */}
        <h3
          id={`item-title-${item.id}`}
          className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1 text-base group-hover:text-[#FFB6C1] dark:group-hover:text-[#87CEEB] transition-colors cursor-pointer mb-2"
          onClick={() => onClick(item)}
        >
          {item.name}
        </h3>

        {/* Rarity & Star Ratings */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex gap-0.5" id={`rarity-stars-${item.id}`}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < item.rarity
                    ? 'fill-amber-400 stroke-amber-400 animate-sparkle'
                    : 'stroke-slate-200 dark:stroke-slate-700 fill-none'
                }`}
              />
            ))}
          </div>

          <span className="text-xs bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md font-mono">
            {item.rarity === 5
              ? 'UR ★5'
              : item.rarity === 4
              ? 'SSR ★4'
              : item.rarity === 3
              ? 'SR ★3'
              : item.rarity === 2
              ? 'R ★2'
              : 'N ★1'}
          </span>
        </div>

        {/* Subtle truncated Memo */}
        {item.memo && (
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed border-t border-slate-50 dark:border-slate-800/50 pt-2.5 italic">
            {item.memo}
          </p>
        )}
      </div>
    </motion.div>
  );
}
