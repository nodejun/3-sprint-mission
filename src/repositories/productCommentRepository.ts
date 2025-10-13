import prisma from '../lib/prisma';
import { CreateProductCommentArg, FindCommentsRepoArgs, ProductCommentWithUser } from '../../types/productComment';

// 댓글 생성 레포지토리 함수
export const createProductCommentRp = async (
  data: CreateProductCommentArg
): Promise<ProductCommentWithUser> => {
  return prisma.productComment.create({
    data: {
      productId: data.productId,
      userId: data.userId,
      content: data.content,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
};

// 댓글 목록 조회 레포지토리 함수
export const findAllProductCommentsRp = async (
  args: FindCommentsRepoArgs
): Promise<ProductCommentWithUser[]> => {
  return prisma.productComment.findMany({
    ...args,
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
  });
};

// 특정 댓글 ID로 사용자 ID를 조회하는 함수 (소유권 확인용)
export const findProductCommentByIdRp = async (commentId: string) => {
  return prisma.productComment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
};

// 댓글 수정 레포지토리 함수
export const updateProductCommentRp = async (commentId: string, content: string) => {
  return prisma.productComment.update({
    where: { id: commentId },
    data: { content },
    select: {
      id: true,
      content: true,
      userId: true,
      productId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// 댓글 삭제 레포지토리 함수
export const deleteProductCommentRp = async (commentId: string) => {
  return prisma.productComment.delete({
    where: { id: commentId },
    select: {
      id: true,
      content: true,
      userId: true,
      productId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};