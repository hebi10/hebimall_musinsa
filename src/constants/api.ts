export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  SIGNUP: '/api/auth/signup',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  
  // Products
  PRODUCTS: '/api/products',
  PRODUCT_DETAIL: (id: string) => `/api/products/${id}`,
  PRODUCT_REVIEWS: (id: string) => `/api/products/${id}/reviews`,
  
  // Users
  USER_PROFILE: '/api/user/profile',
  USER_ORDERS: '/api/user/orders',
  USER_WISHLIST: '/api/user/wishlist',
  
  // Orders
  ORDERS: '/api/orders',
  ORDER_DETAIL: (id: string) => `/api/orders/${id}`,
  
  // Cart
  CART: '/api/cart',
  CART_ADD: '/api/cart/add',
  CART_UPDATE: '/api/cart/update',
  CART_REMOVE: '/api/cart/remove',
  
  // Categories
  CATEGORIES: '/api/categories',
  CATEGORY_PRODUCTS: (id: string) => `/api/categories/${id}/products`,
  
  // Search
  SEARCH: '/api/search',
  SEARCH_SUGGESTIONS: '/api/search/suggestions',
} as const;

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  PRODUCTS: '/products',
  CART: '/orders/cart',
  MYPAGE: '/mypage',
  SEARCH: '/search',
} as const;
