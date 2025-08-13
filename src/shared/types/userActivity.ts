export interface RecentProduct {
  id: string;
  productId: string;
  userId: string;
  viewedAt: Date;
}

export interface WishlistItem {
  id: string;
  productId: string;
  userId: string;
  addedAt: Date;
}

export interface UserActivity {
  recentProducts: RecentProduct[];
  wishlistItems: WishlistItem[];
}
