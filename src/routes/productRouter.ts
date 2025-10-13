import express from 'express';
import {
  getAllProducts,
  createProductController,
  getProductById,
  updateProductController,
  deleteProductController,
  toggleProductLikeController,
  getLikedProduct,
} from '../controllers/productController';
import { verifyAccessToken, optionalVerifyAccessToken } from '../middlewares/auth';
import asyncHandler from '../utils/asyncHandler';
import { uploadImage } from '../middlewares/uploadMiddleware';
import {
  validate,
  createProductSchema,
  updateProductSchema,
  getProductByIdSchema,
} from '../middlewares/validationMiddleware';

const productRouter = express.Router();

// 상품 목록 조회 및 생성
productRouter
  .route('/')
  .get(asyncHandler(getAllProducts))
  .post(
    verifyAccessToken,
    uploadImage('products'),
    validate(createProductSchema, 'body'),
    asyncHandler(createProductController),
  );

// 좋아요한 상품 목록 조회
productRouter.route('/liked-products').get(verifyAccessToken, asyncHandler(getLikedProduct));

// 특정 상품 조회, 수정, 삭제
productRouter
  .route('/:productId')
  .get(
    optionalVerifyAccessToken,
    validate(getProductByIdSchema, 'params'),
    asyncHandler(getProductById),
  )
  .patch(
    verifyAccessToken,
    uploadImage('products'),
    validate(getProductByIdSchema, 'params'),
    validate(updateProductSchema, 'body'),
    asyncHandler(updateProductController),
  )
  .delete(
    verifyAccessToken,
    validate(getProductByIdSchema, 'params'),
    asyncHandler(deleteProductController),
  );

// 좋아요 토글
productRouter
  .route('/:productId/like')
  .post(
    verifyAccessToken,
    validate(getProductByIdSchema, 'params'),
    asyncHandler(toggleProductLikeController),
  );

export default productRouter;
