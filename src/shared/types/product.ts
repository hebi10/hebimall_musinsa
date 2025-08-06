export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  brand: string;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  rating: number;
  reviewCount: number;
  isNew: boolean;
  isSale: boolean;
  saleRate?: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  status?: 'active' | 'inactive' | 'draft';
  sku?: string;
  details: {
    material: string,
    origin: string,
    manufacturer: string,
    precautions: string,
    sizes: {
      [key: string]: { 
        waist?: number, 
        thigh?: number, 
        chest?: number, 
        length?: number, 
        shoulder?: number,
        width?: number,
        height?: number
      }
    }
  };
}

export interface ProductFilter {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  rating?: number;
  isNew?: boolean;
  isSale?: boolean;
}

export interface ProductSort {
  field: 'price' | 'rating' | 'createdAt' | 'name';
  order: 'asc' | 'desc';
}
