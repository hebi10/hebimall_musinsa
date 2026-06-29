'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditProductForm from '../_components/EditProductForm';
import { useProduct } from '@/context/productProvider';
import { Product } from '@/shared/types/product';
import { generateId } from '@/shared/utils/common';

function createDraftProduct(): Product {
  const now = new Date();

  return {
    id: generateId(),
    name: '',
    description: '',
    price: 0,
    brand: '',
    category: '',
    images: [],
    sizes: [],
    colors: [],
    stock: 0,
    rating: 0,
    reviewCount: 0,
    isNew: false,
    isSale: false,
    tags: [],
    createdAt: now,
    updatedAt: now,
    status: 'draft',
    details: {
      material: '',
      origin: '',
      manufacturer: '',
      precautions: '',
      sizes: {},
    },
  };
}

export default function AddProductModal() {
  const router = useRouter();
  const { createProduct } = useProduct();
  const [draftProduct] = useState(createDraftProduct);

  const handleSave = async (product: Product) => {
    const { id, createdAt, updatedAt, ...createPayload } = product;

    void id;
    void createdAt;
    void updatedAt;

    await createProduct(createPayload);
    alert('상품이 성공적으로 추가되었습니다.');
    router.push('/admin/dashboard/products');
  };

  const handleCancel = () => {
    router.push('/admin/dashboard/products');
  };

  return (
    <EditProductForm
      product={draftProduct}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  );
}
