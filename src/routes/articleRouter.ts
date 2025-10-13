import express, { Router } from 'express';
import asyncHandler from '../utils/asyncHandler';
import { uploadImage } from '../middlewares/uploadMiddleware';
import {
  verifyAccessToken,
  optionalVerifyAccessToken,
} from '../middlewares/auth';
import {
  validate,
  createArticleSchema,
  updateArticleSchema,
  getArticleByIdSchema,
  offsetQuerySchema,
} from '../middlewares/validationMiddleware';
import {
  getAllArticles,
  createArticleController,
  getArticleById,
  updateArticleController,
  deleteArticleController,
  toggleArticleLikeController,
  getLikedArticle,
} from '../controllers/articleController';

const articleRouter: Router = express.Router();

// 게시글  조회 생성
articleRouter.route('/')
  .get(
    validate(offsetQuerySchema, 'query'),
    asyncHandler(getAllArticles)
  )
  .post(
    verifyAccessToken,
    uploadImage('article'),
    validate(createArticleSchema, 'body'),
    asyncHandler(createArticleController)
  );

// 좋아요한 게시글 조회
articleRouter.route('/liked-articles')
  .get(
    verifyAccessToken,
    asyncHandler(getLikedArticle)
  )

// 게시글 상세 조회, 수정, 삭제
articleRouter.route('/:articleId')
  .get(
    optionalVerifyAccessToken,
    validate(getArticleByIdSchema, 'params'),
    asyncHandler(getArticleById)
  )
  .patch(
    verifyAccessToken,
    uploadImage('article'),
    validate(getArticleByIdSchema, 'params'),
    validate(updateArticleSchema, 'body'),
    asyncHandler(updateArticleController)
  )
  .delete(
    verifyAccessToken,
    validate(getArticleByIdSchema, 'params'),
    asyncHandler(deleteArticleController)
  );

// 게시글 좋아요
articleRouter.route('/:articleId/like')
  .post(
    verifyAccessToken,
    validate(getArticleByIdSchema, 'params'),
    asyncHandler(toggleArticleLikeController)
  );

export default articleRouter;