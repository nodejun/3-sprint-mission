import { Request, Response, NextFunction } from 'express';
import {
  findAllProducts,
  createProduct,
  findProductById,
  updateProduct,
  deleteProduct,
  toggleProductLike,
  findLikedProductByUserId,
} from '../services/productService';
import { PaginationAndSearchRequest } from '../../types/pagenation';
import {
  CreateProductData,
  UpdateProductData,
  ProductParamsRequest
} from '../../types/product';

// 상품 목록 조회
export const getAllProducts = async (
  req: PaginationAndSearchRequest,
  res: Response,
  next: NextFunction
) => {
  const products = await findAllProducts(req.query);
  res.status(200).json({
    message: '상품 목록 조회 성공!',
    data: products
  });
};

// 상품 생성
export const createProductController = async (
  req: Request<{}, {}, CreateProductData>,
  res: Response, next: NextFunction
) => {
  const imageUrl = req.file ? req.file.location : null;
  const { userId } = req.user!;
  const { name, description, price, isSold, tags, stock } = req.body;

  const newProduct = await createProduct({
    name,
    description,
    price,
    isSold,
    tags,
    stock,
    imageUrl,
    userId,
  });

  res.status(201).json({
    message: '상품 등록 성공!',
    data: newProduct
  });
};

// 특정 상품 조회
export const getProductById = async (
  req: ProductParamsRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const currentUserId = req.user?.userId;

  const product = await findProductById(productId, currentUserId);
  res.status(200).json({
    message: '상품 상세 조회 성공!',
    data: product
  });
};

// 상품 수정
export const updateProductController = async (
  req: ProductParamsRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const { userId } = req.user!;
  const updateData = req.body as UpdateProductData;

  if (req.file) {
    updateData.imageUrl = req.file.location;
  }

  const updatedProduct = await updateProduct(productId, userId, updateData);
  res.status(200).json({
    message: '상품 정보 수정 성공!',
    data: updatedProduct
  });
};

// 상품 삭제
export const deleteProductController = async (
  req: ProductParamsRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const { userId } = req.user!;

  await deleteProduct(productId, userId);
  res.status(204).end();
};

// 좋아요 토글
export const toggleProductLikeController = async (
  req: ProductParamsRequest,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const { userId } = req.user!;
  const result = await toggleProductLike(productId, userId);
  res.status(200).json(result);
};

// 좋아요한 게시글 목록
export const getLikedProduct = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  const { userId } = req.user!;
  const products = await findLikedProductByUserId(userId);
  res.status(200).json({
    message: '좋아요 상품 조회 성공!',
    data: products
  });
};