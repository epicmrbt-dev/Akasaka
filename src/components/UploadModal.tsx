import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, Image as ImageIcon, Star, HelpCircle, Loader2 } from 'lucide-react';
import { CATEGORIES } from '../data';
import { CollectionItem } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<CollectionItem, 'id' | 'createdAt'>) => void;
}

export default function UploadModal({ isOpen, onClose, onSave }: UploadModalProps) {
  const [name, setName] = useState('');
  const [rarity, setRarity] = useState<number>(3);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [acquiredDate, setAcquiredDate] = useState('');
  const [memo, setMemo] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset fields on open
  useEffect(() => {
    if (isOpen) {
      setName('');
      setRarity(3);
      setCategory(CATEGORIES[0]);
      // Set to today's date in local time
      const today = new Date().toISOString().split('T')[0];
      setAcquiredDate(today);
      setMemo('');
      setImageSrc(null);
      setIsDragging(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Process the file with Canvas compression
  const processFile = (file: File) => {
    if (!file.type.match(/image.*/)) {
      alert('画像ファイル（PNG、JPEG、WebP）のみアップロードできます。');
      return;
    }

    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 500; // Limit size to save localstorage quota
        const MAX_HEIGHT = 500;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.8 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          setImageSrc(compressedDataUrl);
        } else {
          setImageSrc(e.target?.result as string);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        setIsProcessing(false);
        alert('画像の読み込みに失敗しました。');
      };
    };
    reader.onerror = () => {
      setIsProcessing(false);
      alert('ファイルの読み込みに失敗しました。');
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('コレクションの名前を入力してください。');
      return;
    }
    if (!imageSrc) {
      alert('画像をアップロードしてください。');
      return;
    }

    onSave({
      name: name.trim(),
      rarity,
      category,
      acquiredDate: acquiredDate || new Date().toISOString().split('T')[0],
      memo: memo.trim(),
      imageUrl: imageSrc,
      isFavorite: false,
    });
  };

  return (
    <AnimatePresence>
      <div
        id="upload-modal-backdrop"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          id="upload-modal-container"
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border-4 border-[#87CEEB]/30 dark:border-[#FFB6C1]/30 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div id="upload-modal-header" className="p-6 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between bg-gradient-to-r from-sky-50 to-pink-50 dark:from-sky-950/10 dark:to-pink-950/10">
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#87CEEB]" />
                コレクションに追加する
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                画像を選択、またはドラッグ＆ドロップして新しく登録します。
              </p>
            </div>
            <button
              id="upload-close-btn"
              onClick={onClose}
              className="p-2 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full shadow-sm text-slate-400 dark:text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5" id="upload-form">
            {/* Image Upload Area */}
            <div id="upload-dropzone-container">
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-2">
                コレクションの画像 <span className="text-rose-500">*</span>
              </label>

              <div
                id="upload-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border-3 border-dashed rounded-2xl h-52 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#FFB6C1] bg-pink-50/40 dark:bg-pink-950/10 scale-[0.99]'
                    : imageSrc
                    ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/10 dark:bg-emerald-950/5'
                    : 'border-slate-200 dark:border-slate-700 hover:border-[#87CEEB] hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                {isProcessing ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">画像を圧縮しています...</p>
                  </div>
                ) : imageSrc ? (
                  <div className="relative w-full h-full p-2 flex items-center justify-center group">
                    <img
                      src={imageSrc}
                      alt="プレビュー"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <p className="text-white text-xs font-bold flex items-center gap-1">
                        <ImageIcon className="w-4 h-4" />
                        画像を変更する
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="mx-auto w-12 h-12 bg-[#87CEEB]/10 rounded-full flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6 text-[#87CEEB]" />
                    </div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      ドラッグ＆ドロップ、またはここをクリック
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      PNG、JPEG、WebPに対応 (自動で最適化されます)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields row 1: Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="upload-name-input" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  アイテム名 <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  id="upload-name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: あかさか (ドットアート)"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#87CEEB] focus:ring-1 focus:ring-[#87CEEB] rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="upload-category-select" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  カテゴリー <span className="text-rose-500">*</span>
                </label>
                <select
                  id="upload-category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#87CEEB] rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Form Fields row 2: Rarity & Acquired Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  レア度 (レアリティ)
                </label>
                <div className="flex items-center gap-1.5 h-10 px-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setRarity(i + 1)}
                      className="p-0.5 hover:scale-115 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          i < rarity
                            ? 'fill-amber-400 stroke-amber-400'
                            : 'stroke-slate-300 dark:stroke-slate-600 fill-none'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-auto font-mono">
                    ★{rarity}
                  </span>
                </div>
              </div>

              <div>
                <label htmlFor="upload-date-input" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                  入手日
                </label>
                <input
                  type="date"
                  id="upload-date-input"
                  value={acquiredDate}
                  onChange={(e) => setAcquiredDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#87CEEB] rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Memo */}
            <div>
              <label htmlFor="upload-memo-textarea" className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
                メモ
              </label>
              <textarea
                id="upload-memo-textarea"
                rows={3}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="入手した時の状況、お気に入りポイント、キャラクターの紹介などを書きましょう！"
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-[#87CEEB] focus:ring-1 focus:ring-[#87CEEB] rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 outline-none transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Bottom Actions */}
            <div id="upload-form-actions" className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
              <button
                type="button"
                id="upload-cancel-btn"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-250 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                id="upload-submit-btn"
                disabled={isProcessing}
                className="flex-1 py-3 bg-gradient-to-r from-[#87CEEB] to-[#FFB6C1] hover:from-[#76bddc] hover:to-[#efa5b0] text-white rounded-xl font-black text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <span>コレクションに追加</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
