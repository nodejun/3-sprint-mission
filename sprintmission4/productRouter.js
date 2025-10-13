import express from "express";
import uploadImage from '../middlewares/upload.middleware.js';
import path from 'path';
import asyncHandler from "../utils/asyncHandler.js";
import { convertProductUploadFields } from '../utils/uploadDataConverter.js';
import { verifyAccessToken } from '../middlewares/auth.js';
import {
  findAllProducts,
  createProduct,
  findProductById,
  updateProduct,
  deleteProduct,
  toggleProductLike,
} from "../services/productService.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  validate,
  createProductSchema,
  getProductByIdSchema,
  updateProductSchema,
} from '../middlewares/validationMiddleware.js';
import uploadImage from '../middlewares/uploadMiddleware.js';
import path from 'path';
import { convertProductUploadFields } from '../utils/uploadDataConverter.js';
import { verifyAccessToken } from '../middlewares/auth.js';

const productRouter = express.Router();

productRouter.route('/')
  .get(asyncHandler(async (req, res, next) => {
    const products = await findAllProducts(req.query);
    res.status(200).json({
      message: '상품 목록 조회',
      data: products,
    });
  }))

  .post(
    verifyAccessToken,
    (req, res, next) => {
      req.uploadPath = path.resolve(process.cwd(), 'uploads/products');
      next();
    },
    uploadImage.single('image'),
    convertProductUploadFields,
    validate(createProductSchema, 'body'),
    asyncHandler(async (req, res, next) => {
      const imageUrl = req.file ? req.file.path : null;
      const { name, description, price, isSold, tags, stock } = req.body;
      const userId = req.user.userId;
      const newProduct = await createProduct({
        name,
        description,
        price,
        isSold,
        tags,
        stock,
        userId,
        imageUrl
      });
      res.status(201).json({
        message: '상품 등록 완료',
        data: newProduct,
      });
    })
  );

productRouter.route('/:productId')
  .get(
    validate(getProductByIdSchema, 'params'),
    asyncHandler(async (req, res, next) => {
      const { productId } = req.params;
      let currentUserId = null;
      // 액세스 토큰이 있다면, 이를 검증하여 userId를 가져옴
      try {
        if (req.headers.authorization) {
          await new Promise((resolve, reject) => {
            verifyAccessToken(req, res, (err) => {
              if (err) {
                currentUserId = null;
                resolve(); // 에러를 던지지 않고 resolve하여 다음 로직 진행
              } else {
                currentUserId = req.user.userId;
                resolve();
              }
            });
          });
        }
      } catch (error) {
        currentUserId = null;
      }
      const product = await findProductById(productId, currentUserId);
      res.status(200).json({
        message: '상품 상세 조회',
        data: product,
      });
    })
  )

  .patch(
    verifyAccessToken,
    (req, res, next) => {
      req.uploadPath = path.resolve(process.cwd(), 'uploads/products');
      next();
    },
    uploadImage.single('image'),
    convertProductUploadFields,
    validate(getProductByIdSchema, 'params'),
    validate(updateProductSchema, 'body'),
    asyncHandler(async (req, res, next) => {
      const { productId } = req.params;
      const imageUrl = req.file ? req.file.path : undefined;
      const loggedInUserId = req.user.userId;
      const updateData = req.body;

      if (imageUrl !== undefined) {
        updateData.imageUrl = imageUrl;
      } else if (req.body.imageUrl !== undefined) {
        updateData.imageUrl = req.body.imageUrl;
      }
      const updatedProduct = await updateProduct(productId, loggedInUserId, updateData);
      res.status(200).json({
        message: '상품 수정을 성공하였습니다',
        data: updatedProduct,
      });
    })
  )

  .delete(
    verifyAccessToken,
    validate(getProductByIdSchema, 'params'),
    asyncHandler(async (req, res, next) => {
      const { productId } = req.params;
      const loggedInUserId = req.user.userId;
      await deleteProduct(productId, loggedInUserId);
      res.status(204).end();
    })
  );

productRouter.route('/:productId/like')
  .post(
    verifyAccessToken,
    validate(getProductByIdSchema, 'params'),
    asyncHandler(async (req, res, next) => {
      const { productId } = req.params;
      const loggedInUserId = req.user.userId;
      const result = await toggleProductLike(loggedInUserId, productId);
      res.status(200).json(result)
    })
  );


export default productRouter;