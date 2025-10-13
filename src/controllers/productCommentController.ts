import { Request, Response, NextFunction } from 'express';
import * as productCommentService from '../services/productCommentService';

// 댓글 생성 컨트롤러
export const createCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { productId } = req.params;
  const { content } = req.body;
  const userId = req.user!.userId;
  const newComment = await productCommentService.createProductComment({
    productId,
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
  const productId = req.params.productId;
  const cursor = req.query.cursor as string | undefined;
  const limit = req.query.limit as string | undefined;
  const comments = await productCommentService.findAllProductComments({ productId, cursor, limit });
  res.status(200).json(comments);
};

// 댓글 수정 컨트롤러
export const updateCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId;
  const { content } = req.body;
  const userId = req.user!.userId;
  const updatedComment = await productCommentService.updateProductComment(commentId, { content, userId });
  res.status(200).json(updatedComment);
};

// 댓글 삭제 컨트롤러
export const deleteCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const commentId = req.params.commentId;
  const userId = req.user!.userId;
  await productCommentService.deleteProductComment(commentId, userId);
  res.status(204).send();
};