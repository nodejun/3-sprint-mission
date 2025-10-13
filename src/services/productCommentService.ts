import * as productCommentRepository from '../repositories/productCommentRepository';
import {
  CreateProductCommentArg,
  FindAllProductCommentsArg,
  UpdateProductCommentArg,
} from '../../types/productComment';
import { getCursorPaginationOptions, calculateNextCursor, checkCommentOwnership } from '../utils/queryHelpers';

// 댓글 생성 서비스
export const createProductComment = async (data: CreateProductCommentArg) => {
  const newComment = await productCommentRepository.createProductCommentRp(data);
  return newComment;
};

// 댓글 목록 조회 서비스
export const findAllProductComments = async ({ productId, cursor, limit }: FindAllProductCommentsArg) => {
  const { parsedLimit, ...findManyOptions } = getCursorPaginationOptions({ cursor, limit });
  const comments = await productCommentRepository.findAllProductCommentsRp({
    where: { productId },
    ...findManyOptions,
  });
  const nextCursor = calculateNextCursor(comments, parsedLimit);
  return { comments, nextCursor };
};

// 댓글 수정 서비스
export const updateProductComment = async (commentId: string, { content, userId }: UpdateProductCommentArg) => {
  await checkCommentOwnership(commentId, userId, 'ProductComment');
  const updatedComment = await productCommentRepository.updateProductCommentRp(commentId, content);
  return updatedComment;
};

// 댓글 삭제 서비스
export const deleteProductComment = async (commentId: string, userId: string) => {
  await checkCommentOwnership(commentId, userId, 'ProductComment');
  await productCommentRepository.deleteProductCommentRp(commentId);
};