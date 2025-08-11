export interface Category {
  id: string;
  name: string;
  slug: string;
  path: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  subCategories?: SubCategory[];
  productCount: number;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  path: string;
  order: number;
  isActive: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  slug: string;
  path: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  order: number;
  parentId?: string;
  subCategories?: Omit<SubCategory, 'id'>[];
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string;
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
