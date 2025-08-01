export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  productCount: number;
  isActive: boolean;
  order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isPopular: boolean;
  productCount: number;
  isActive: boolean;
}
