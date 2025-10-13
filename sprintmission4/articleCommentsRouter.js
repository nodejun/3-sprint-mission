
import express from 'express';
import { verifyAccessToken } from '../src/middlewares/auth.js';
import {
  validate,
  CommentBaseSchema,
  UpdateCommentBaseSchema,
  getArticleByIdSchema,
  updateArticleCommentParamsSchema,
} from '../src/middlewares/validationMiddleware.js';
import * as articleCommentsService from '../src/services/articleCommentService.js';
import asyncHandler from '../src/utils/asyncHandler.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(validate(getArticleByIdSchema, 'params'),
    asyncHandler(async (req, res) => {
      const { articleId } = req.params;
      const { cursor, limit } = req.query;
      const { comments, nextCursor } = await articleCommentsService.findAllArticleComments({ articleId, cursor, limit });
      res.status(200).json({ comments, nextCursor });
    }))

  .post(
    verifyAccessToken,
    validate(getArticleByIdSchema, 'params'),
    validate(CommentBaseSchema, 'body'),
    asyncHandler(async (req, res) => {
      const userId = req.user.userId
      const { articleId } = req.params;
      const { content } = req.body;
      const newComment = await articleCommentsService.createArticleComment({
        articleId,
        content,
        userId,
      });
      res.status(201).json(newComment);
    })
  );

router.route('/:id')
  .patch(
    verifyAccessToken,
    validate(updateArticleCommentParamsSchema, 'params'),
    validate(UpdateCommentBaseSchema, 'body'),
    asyncHandler(async (req, res) => {
      const userId = req.user.userId
      const { id } = req.params;
      const { content } = req.body;
      const updatedComment = await articleCommentsService.updateArticleComment(id, { content, userId });
      res.status(200).json(updatedComment);
    })
  )

  .delete(
    verifyAccessToken,
    validate(updateArticleCommentParamsSchema, 'params'),
    asyncHandler(async (req, res) => {
      const userId = req.user.userId
      const { id } = req.params;
      await articleCommentsService.deleteArticleComment(id, userId);
      res.status(204).send();
    })
  );

export default router;