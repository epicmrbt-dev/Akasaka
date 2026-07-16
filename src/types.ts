export interface CollectionItem {
  id: string;
  name: string;
  rarity: number; // 1 to 5 stars
  category: string; // e.g. "立ち絵", "ファンアート", "スクリーンショット", "グッズ", "その他"
  acquiredDate: string; // YYYY-MM-DD
  memo: string;
  imageUrl: string; // base64 dataURL or imported local asset path
  createdAt: number; // timestamp
  isFavorite?: boolean;
}

export type SortOrder = 'newest' | 'oldest' | 'name' | 'rarity';

export interface FilterState {
  searchQuery: string;
  rarity: number | null; // null means "any"
  category: string; // "" means "all"
}
