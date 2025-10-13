import express from 'express';
import asyncHandler from '../src/utils/asyncHandler.js';
import {
  validate,
  createArticleSchema,
  updateArticleSchema,
  getArticleByIdSchema
} from '../src/middlewares/validationMiddleware.js';
import uploadImage from '../src/middlewares/uploadMiddleware.js';
import { verifyAccessToken } from '../src/middlewares/auth.js';
import {
  validate, createArticleSchema,
  updateArticleSchema,
  getArticleByIdSchema
} from '../middlewares/validation.middleware.js';
import {
  findAllArticles,
  createArticle,
  findArticleById,
  updateArticle,
  toggleArticleLike,
  deleteArticle,
} from '../services/articlesService.js';

const articleRouter = express.Router();

articleRouter.route('/')
  .get(
    asyncHandler(async (req, res, next) => {
      const { offset, limit, sort, search } = req.query;
      const articles = await findAllArticles({ offset, limit, sort, search });
      res.status(200).json({
        message: "조회하신 게시글 목록입니다.",
        data: articles
      });
    }))

  .post(
    verifyAccessToken,
    uploadImage.single('image'),
    validate(createArticleSchema, 'body'),
    asyncHandler(async (req, res, next) => {
      const userId = req.user.userId
      const { title, content } = req.body;
      const imageUrl = req.file
        ? `/uploads/articles/${req.file.filename}`
        : null;
      const newArticle = await createArticle({ title, content, userId, imageUrl });
      res.status(201).json({
        message: "게시글 등록 완료",
        data: newArticle,
      });
    }));

articleRouter.route('/:articleId')
  .get(
    validate(getArticleByIdSchema, 'params'),
    asyncHandler(async (req, res, next) => {
      const { articleId } = req.params;
      let currentUserId = null;
      try {
        if (req.headers.authorization) {
          await new Promise((resolve, reject) => {
            // verifyAccessToken 미들웨어를 Promise로 감싸 비동기적으로 실행
            verifyAccessToken(req, res, (err) => {
              if (err) {
                // 토큰 검증 중 에러(만료 등) 발생 시, isLiked 처리를 위해 currentUserId를 null로 유지하고 진행
                currentUserId = null;
                resolve(); // 에러를 던지지 않고 Promise를 성공으로 처리하여 다음 로직 진행
              } else {
                // 토큰이 유효하면 req.user에서 userId를 가져옴
                currentUserId = req.user.userId;
                resolve(); // 성공적으로 사용자 ID를 설정했으므로 Promise 성공 처리
              }
            });
          });
        }
      } catch (error) {
        currentUserId = null; // 에러 발생 시 사용자 ID는 null
      }
      const article = await findArticleById(articleId, currentUserId);
      res.status(200).json({
        message: "조회하신 게시글입니다",
        data: article,
      });
    }))

  .patch(
    verifyAccessToken,
    uploadImage.single('image'),
    validate(getArticleByIdSchema, 'params'),
    validate(updateArticleSchema, 'body'),
    asyncHandler(async (req, res, next) => {
      const userId = req.user.userId
      const { articleId } = req.params;
      const updateData = req.body;

      if (req.file) {
        updateData.imageUrl = `/uploads/articles/${req.file.filename}`;
      }
      const patchArticle = await updateArticle(articleId, userId, updateData);
      res.status(200).json({
        message: "수정하신 게시글입니다",
        data: patchArticle,
      });
    }))

  .delete(
    verifyAccessToken,
    validate(getArticleByIdSchema, 'params'),
    asyncHandler(async (req, res, next) => {
      const userId = req.user.userId
      const { articleId } = req.params;
      await deleteArticle(articleId, userId);
      res.status(204).end();
    })
  );

articleRouter.route('/:articleId/like')
  .post(
    verifyAccessToken,
    validate(getArticleByIdSchema, 'params'),
    asyncHandler(async (req, res, next) => {
      const { articleId } = req.params;
      const loggedInUserId = req.user.userId;
      const result = await toggleArticleLike(loggedInUserId, articleId);
      res.status(200).json(result);
    })
  );

export default articleRouter;