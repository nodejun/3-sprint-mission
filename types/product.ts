import { Product, ProductTag } from '@prisma/client';
import { Request } from 'express';

// 상품 생성에 필요한 데이터 타입 (req.body)
interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  userId: string;
  isSold?: boolean;
  tags?: ProductTag[];
  stock?: number;
  imageUrl?: string | null;
}

// 상품 수정에 필요한 데이터 타입 (req.body)
interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  userId?: string;
  isSold?: boolean;
  tags?: ProductTag[];
  stock?: number;
  imageUrl?: string | null;
}

// 목록 조회와 상세 조회에 필요한 모든 정보를 포함하는 타입
interface ProductWithDetails extends Product {
  user: {
    username: string;
  };
  _count: {
    ProductLike: number;
  };
  isLiked?: boolean; // 상세 조회 시에만 존재하는 필드
}

// Express Request 객체에 라우트 파라미터가 포함된 타입
interface ProductParamsRequest extends Request {
  params: {
    productId: string;
  };
}

export {
  CreateProductData,
  UpdateProductData,
  ProductWithDetails,
  ProductParamsRequest,
};