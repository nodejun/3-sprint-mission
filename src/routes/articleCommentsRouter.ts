import express from 'express';
import asyncHandler from '../utils/asyncHandler';
import { verifyAccessToken } from '../middlewares/auth';
import {
  validate,
  getArticleByIdSchema,
  updateArticleCommentParamsSchema,
  CommentBaseSchema,
  paginationQuerySchema,
} from '../middlewares/validationMiddleware';
import {
  createCommentController,
  getCommentsController,
  updateCommentController,
  deleteCommentController,
} from '../controllers/articleCommentController';

const articleCommentRouter = express.Router({ mergeParams: true });

// 게시글 댓글 생성 및 목록 조회 라우트
articleCommentRouter
  .route('/')
  .post(
    verifyAccessToken,
    validate(getArticleByIdSchema, 'params'),
    validate(CommentBaseSchema, 'body'),
    asyncHandler(createCommentController)
  )
  .get(
    validate(getArticleByIdSchema, 'params'),
    validate(paginationQuerySchema, 'query'),
    asyncHandler(getCommentsController)
  );

// 특정 댓글 수정 및 삭제 라우트
articleCommentRouter
  .route('/:commentId')
  .patch(
    verifyAccessToken,
    validate(updateArticleCommentParamsSchema, 'params'),
    validate(CommentBaseSchema, 'body'),
    asyncHandler(updateCommentController)
  )
  .delete(
    verifyAccessToken,
    validate(updateArticleCommentParamsSchema, 'params'),
    asyncHandler(deleteCommentController)
  );

export default articleCommentRouter;