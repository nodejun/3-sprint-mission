import { Request, Response, NextFunction } from 'express';
import * as articleCommentService from '../services/articleCommentService';

// 댓글 생성 컨트롤러
export const createCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { articleId } = req.params;
  const { content } = req.body;
  const userId = req.user!.userId;
  const newComment = await articleCommentService.createArticleComment({
    articleId,
    content,
    userId,
  });
  res.status(201).json(newComment);
};

// 댓글 목록 조회 컨트롤러
export const getCommentsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { articleId } = req.params;
  const { cursor, limit } = req.query as { cursor?: string; limit?: string };
  const { comments, nextCursor } = await articleCommentService.findAllArticleComments({ articleId, cursor, limit });
  res.status(200).json({ comments, nextCursor });
};

// 댓글 수정 컨트롤러
export const updateCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user!.userId;
  const updatedComment = await articleCommentService.updateArticleComment(commentId, { content, userId });
  res.status(200).json(updatedComment);
};

// 댓글 삭제 컨트롤러
export const deleteCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction) => {
  const { commentId } = req.params;
  const userId = req.user!.userId;
  await articleCommentService.deleteArticleComment(commentId, userId);
  res.status(204).send();
};