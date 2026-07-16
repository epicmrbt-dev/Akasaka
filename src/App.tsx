import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Search,
  Filter,
  Grid,
  Heart,
  TrendingUp,
  Moon,
  Sun,
  Award,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Check,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';

import { CollectionItem, SortOrder, FilterState } from './types';
import { INITIAL_COLLECTION, CATEGORIES, BANNER_IMAGE } from './data';
import ItemCard from './components/ItemCard';
import ItemDetailModal from './components/ItemDetailModal';
import UploadModal from './components/UploadModal';
import EditModal from './components/EditModal';
import Loader from './components/Loader';

export default function App() {
  // --- STATE DECLARATIONS ---
  const [items, setItems] = useState<CollectionItem[]>(() => {
    const saved = localStorage.getItem('akasaka_collection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out initial default items to delete them entirely
          return parsed.filter(
            (item: any) =>
              item.id !== '1' &&
              item.id !== '2' &&
              item.id !== '3' &&
              item.id !== '4'
          );
        }
      } catch (e) {
        console.error('Failed to load local storage:', e);
      }
    }
    return INITIAL_COLLECTION;
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('akasaka_darkMode');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(''); // "" means All
  const [selectedRarity, setSelectedRarity] = useState<number | null>(null); // null means All
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  // Modals Visibility
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);

  // App-level loading simulation for visual polish
  const [isLoading, setIsLoading] = useState(true);

  // Sync with LocalStorage whenever items list changes
  useEffect(() => {
    localStorage.setItem('akasaka_collection', JSON.stringify(items));
  }, [items]);

  // Sync Dark Mode state with Document Element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('akasaka_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Show loading animation on mount to look premium
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // --- ACTIONS ---

  // Handle addition of a new collection item
  const handleAddNewItem = (newItemData: Omit<CollectionItem, 'id' | 'createdAt'>) => {
    const newItem: CollectionItem = {
      ...newItemData,
      id: `item-${Date.now()}`,
      createdAt: Date.now(),
    };
    setItems((prev) => [newItem, ...prev]);
    setIsUploadOpen(false);
  };

  // Handle saving edits on an item
  const handleSaveEditItem = (updatedItem: CollectionItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
    // Sync the item if it was currently viewed in detail modal
    if (selectedItem?.id === updatedItem.id) {
      setSelectedItem(updatedItem);
    }
    setEditingItem(null);
  };

  // Toggle favorite tag
  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
    // Sync detailed modal item if currently open
    if (selectedItem?.id === id) {
      setSelectedItem((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Delete an item from the collection
  const handleDeleteItem = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const confirmed = window.confirm('このアイテムをコレクションから削除してもよろしいですか？');
    if (!confirmed) return;

    setItems((prev) => prev.filter((item) => item.id !== id));
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  // Reset all search parameters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedRarity(null);
    setOnlyFavorites(false);
  };

  // --- DERIVED STATES (MEMOIZED) ---

  // Filtered and Sorted Collection
  const filteredAndSortedItems = useMemo(() => {
    let result = [...items];

    // 1. Search Query filter (matches Name or Memo)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.memo.toLowerCase().includes(q)
      );
    }

    // 2. Category filter
    if (selectedCategory) {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 3. Rarity filter
    if (selectedRarity !== null) {
      result = result.filter((item) => item.rarity === selectedRarity);
    }

    // 4. Favorites filter
    if (onlyFavorites) {
      result = result.filter((item) => item.isFavorite);
    }

    // 5. Sorting
    result.sort((a, b) => {
      switch (sortOrder) {
        case 'name':
          return a.name.localeCompare(b.name, 'ja');
        case 'rarity':
          return b.rarity - a.rarity; // Higher rarity first
        case 'oldest':
          return a.createdAt - b.createdAt; // Earliest first
        case 'newest':
        default:
          return b.createdAt - a.createdAt; // Latest first
      }
    });

    return result;
  }, [items, searchQuery, selectedCategory, selectedRarity, onlyFavorites, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const total = items.length;
    const favorites = items.filter((item) => item.isFavorite).length;
    const urCardsCount = items.filter((item) => item.rarity === 5).length;
    return { total, favorites, urCardsCount };
  }, [items]);

  // Newest 3 additions shown in the "Latest Additions" bar
  const latestAdditions = useMemo(() => {
    return [...items]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 3);
  }, [items]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#87CEEB]/10 via-white to-[#FFB6C1]/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors duration-300">
      
      {/* 🌸 BACKGROUND GLOW BLOBS */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#87CEEB]/20 dark:bg-[#87CEEB]/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#FFB6C1]/20 dark:bg-[#FFB6C1]/5 rounded-full blur-[120px] animate-pulse-slow" />
      </div>

      {/* --- FLOATING ACCENT DECORATION --- */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Add floating action button */}
        <motion.button
          id="float-add-btn"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsUploadOpen(true)}
          className="p-4 bg-gradient-to-r from-[#87CEEB] to-[#FFB6C1] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer border-3 border-white dark:border-slate-800"
          title="新規追加"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </motion.button>
      </div>

      {/* --- APP HEADER RAIL --- */}
      <header className="sticky top-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Title */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-tr from-[#87CEEB] to-[#FFB6C1] rounded-xl flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5.5 h-5.5 fill-white" />
            </div>
            <div>
              <h1 id="app-logo-title" className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">
                あかさかの箱
              </h1>
              <p className="text-[10px] font-bold text-[#FFB6C1] dark:text-[#87CEEB] -mt-1 tracking-wider uppercase">
                Collection Hub
              </p>
            </div>
          </div>

          {/* Quick Stats Summary & Theme Toggle */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-xs bg-slate-50 dark:bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1 font-bold">
                <span className="text-slate-400">総数:</span>
                <span className="text-[#87CEEB] font-mono">{stats.total}</span>
              </div>
              <div className="w-px h-3 bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center gap-1 font-bold">
                <span className="text-slate-400">お気に入り:</span>
                <span className="text-rose-400 font-mono">{stats.favorites}</span>
              </div>
            </div>

            {/* Dark Mode Switcher */}
            <button
              id="theme-toggle-btn"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-600 dark:text-amber-400 transition-all cursor-pointer shadow-sm border border-slate-100 dark:border-slate-700"
              title={darkMode ? 'ライトモードに切替' : 'ダークモードに切替'}
            >
              {darkMode ? <Sun className="w-5 h-5 animate-spin-slow" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN HERO BANNER & STATS --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2" id="hero-banner-section">
        <div className="relative bg-gradient-to-tr from-[#87CEEB] via-sky-300 to-[#FFB6C1] rounded-3xl overflow-hidden shadow-lg h-44 sm:h-56 md:h-64 flex items-center p-6 sm:p-10 text-white">
          {/* Cover image backdrop */}
          {BANNER_IMAGE && (
            <img
              src={BANNER_IMAGE}
              alt="あかさかの箱"
              className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
              referrerPolicy="no-referrer"
            />
          )}

          {/* Banner content */}
          <div className="relative z-10 max-w-lg space-y-2">
            <span className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              あかさかの箱公認ファン
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              あかさかの箱 コレクション
            </h2>
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
              大人気ゲーム実況者グループ「あかさかの箱」の可愛いイラストやスクリーンショットを自由にコレクション・管理できる空間です。
            </p>
          </div>

          {/* Floating glowing sparkles design */}
          <div className="absolute top-4 right-8 w-12 h-12 bg-white/10 rounded-full blur-xl animate-float" />
          <div className="absolute bottom-6 right-16 w-16 h-16 bg-pink-300/20 rounded-full blur-xl animate-pulse-slow" />
        </div>
      </div>

      {/* --- STATISTICS GRID --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4" id="dashboard-widgets">
        
        {/* Total stats card */}
        <div id="stat-card-total" className="bg-white dark:bg-slate-800/90 rounded-2xl p-4.5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-sky-100 dark:bg-sky-950/40 text-sky-500 flex items-center justify-center shadow-inner">
            <Layers className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500">コレクション総数</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">
              {stats.total} <span className="text-xs text-slate-400">枚</span>
            </p>
          </div>
        </div>

        {/* Favorite stats card */}
        <div id="stat-card-favs" className="bg-white dark:bg-slate-800/90 rounded-2xl p-4.5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-pink-100 dark:bg-pink-950/40 text-[#FFB6C1] flex items-center justify-center shadow-inner">
            <Heart className="w-5.5 h-5.5 fill-[#FFB6C1]" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500">お気に入り登録</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">
              {stats.favorites} <span className="text-xs text-slate-400">枚</span>
            </p>
          </div>
        </div>

        {/* UR count card */}
        <div id="stat-card-ur" className="bg-white dark:bg-slate-800/90 rounded-2xl p-4.5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center shadow-inner">
            <Award className="w-5.5 h-5.5" />
          </div>
          <div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500">最高レア (UR ★5)</p>
            <p className="text-2xl font-black text-slate-800 dark:text-slate-100 font-mono mt-0.5">
              {stats.urCardsCount} <span className="text-xs text-slate-400">枚</span>
            </p>
          </div>
        </div>
      </div>

      {/* --- SEARCH, FILTER & SORT PANEL (検索機能・絞り込み機能) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3" id="filters-section">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800/50 space-y-4">
          
          {/* Row 1: Search Input */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                id="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="コレクションから検索 (アイテム名やメモの単語で検索)..."
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-700 focus:border-[#87CEEB] focus:ring-1 focus:ring-[#87CEEB] rounded-2xl text-sm font-medium text-slate-800 dark:text-slate-100 outline-none transition-colors"
              />
            </div>

            {/* Quick Actions & Sorting Selector */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-700 rounded-2xl px-3 py-2.5 h-[46px]">
                <ArrowUpDown className="w-4 h-4 text-slate-400" />
                <select
                  id="sort-select"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="bg-transparent text-xs font-bold text-slate-600 dark:text-slate-300 outline-none cursor-pointer pr-1"
                >
                  <option value="newest">新しい順 (追加日)</option>
                  <option value="oldest">古い順 (追加日)</option>
                  <option value="name">名前順 (50音)</option>
                  <option value="rarity">レア度順 (高い順)</option>
                </select>
              </div>

              {/* Reset filter trigger */}
              {(searchQuery || selectedCategory || selectedRarity !== null || onlyFavorites) && (
                <button
                  id="reset-filters-btn"
                  onClick={handleResetFilters}
                  className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100/60 dark:hover:bg-rose-950/40 px-3.5 py-3 h-[46px] rounded-2xl cursor-pointer transition-all"
                  title="絞り込み解除"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>クリア</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Category Badges & Stars selector */}
          <div className="flex flex-wrap items-center gap-y-3.5 gap-x-5 pt-1 border-t border-slate-50 dark:border-slate-700/40">
            
            {/* Category selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                カテゴリー:
              </span>
              <div className="flex flex-wrap gap-1.5" id="category-badges-container">
                <button
                  id="cat-badge-all"
                  onClick={() => setSelectedCategory('')}
                  className={`text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                    selectedCategory === ''
                      ? 'bg-gradient-to-r from-[#87CEEB] to-[#FFB6C1] text-white shadow-sm font-extrabold scale-102'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-750'
                  }`}
                >
                  すべて
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    id={`cat-badge-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs font-bold px-3.5 py-1.5 rounded-xl cursor-pointer transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-[#87CEEB] to-[#FFB6C1] text-white shadow-sm font-extrabold scale-102'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-750'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Rarity Star selection */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                レア度:
              </span>
              <div className="flex gap-1" id="rarity-badges-container">
                <button
                  id="rarity-badge-all"
                  onClick={() => setSelectedRarity(null)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all ${
                    selectedRarity === null
                      ? 'bg-gradient-to-r from-[#87CEEB] to-[#FFB6C1] text-white font-extrabold shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-750'
                  }`}
                >
                  すべて
                </button>
                {[5, 4, 3, 2, 1].map((starsCount) => (
                  <button
                    key={starsCount}
                    id={`rarity-badge-${starsCount}`}
                    onClick={() => setSelectedRarity(starsCount)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all ${
                      selectedRarity === starsCount
                        ? 'bg-gradient-to-r from-[#87CEEB] to-[#FFB6C1] text-white font-extrabold shadow-sm'
                        : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-750'
                    }`}
                  >
                    <span className="font-mono">{starsCount}</span>
                    <span className="text-[10px]">★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Favorite switch badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                お気に入りのみ:
              </span>
              <button
                id="fav-toggle-filter"
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-all ${
                  onlyFavorites
                    ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-150 dark:border-slate-750'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${onlyFavorites ? 'fill-white stroke-rose-500' : ''}`} />
                <span>表示</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* --- GRID GALLERY VIEW (コレクションページ) --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="gallery-container">
        
        {isLoading ? (
          // Playful premium loader
          <div className="py-20">
            <Loader />
          </div>
        ) : (
          <div>
            {/* Grid display or Empty screen */}
            {filteredAndSortedItems.length > 0 ? (
              <div
                id="collection-cards-grid"
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredAndSortedItems.map((item) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onClick={(item) => setSelectedItem(item)}
                      onToggleFavorite={(id, e) => handleToggleFavorite(id, e)}
                      onEdit={(item, e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                      }}
                      onDelete={(id, e) => {
                        e.stopPropagation();
                        handleDeleteItem(id, e);
                      }}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              // Empty collection placeholder card
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/70 dark:bg-slate-800/70 rounded-3xl p-12 text-center shadow-sm border border-dashed border-slate-200 dark:border-slate-700 max-w-lg mx-auto mt-8"
                id="empty-placeholder-card"
              >
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-[#FFB6C1]" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">
                  該当するコレクションがありません
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  検索条件を変更するか、右下の「＋」ボタンから新しい「あかさかの箱」画像やお気に入りカードをアップロードしてみましょう！
                </p>
                <button
                  id="empty-add-btn"
                  onClick={() => setIsUploadOpen(true)}
                  className="mt-6 inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#87CEEB] to-[#FFB6C1] hover:from-[#76bddc] hover:to-[#efa5b0] text-white text-sm font-black rounded-2xl shadow-md transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  画像を追加する
                </button>
              </motion.div>
            )}
          </div>
        )}
      </main>

      {/* --- FOOTER SUMMARY --- */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800/60 mt-12 bg-white/40 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4 text-[#87CEEB]" />
            <span className="text-sm font-black text-slate-700 dark:text-slate-300">
              あかさかの箱 コレクション
            </span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-md mx-auto leading-relaxed">
            このウェブサイトはファンのためのコレクション管理プラットフォームです。
            データはすべてブラウザのLocalStorageに保存され、サーバーへ送信されることはありません。
          </p>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
            &copy; 2026 あかさかの箱 コレクション. Designed with Love.
          </div>
        </div>
      </footer>

      {/* --- MODALS CONTROLLERS --- */}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSave={handleAddNewItem}
      />

      {/* Detail Modal */}
      <ItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onToggleFavorite={handleToggleFavorite}
        onEdit={(item) => {
          setSelectedItem(null);
          setEditingItem(item);
        }}
        onDelete={(id) => {
          setSelectedItem(null);
          handleDeleteItem(id);
        }}
      />

      {/* Edit Modal */}
      <EditModal
        item={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEditItem}
      />
    </div>
  );
}
