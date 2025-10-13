import prisma from '../lib/prisma';
import { CreateCommentArgs, FindCommentsRepoArgs, ArticleCommentWithUser } from '../../types/articleComment';

// 게시글 댓글 생성
export const createArticleCommentRp = async (
  data: CreateCommentArgs
): Promise<ArticleCommentWithUser> => {
  return prisma.articleComment.create({
    data: {
      articleId: data.articleId,
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

// 게시글 댓글 목록 조회
export const findAllArticleCommentsRp = async (
  args: FindCommentsRepoArgs
): Promise<ArticleCommentWithUser[]> => {
  return prisma.articleComment.findMany({
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

// 특정 댓글 ID로 사용자 ID 조회 (소유권 확인용)
export const findArticleCommentByIdRp = async (commentId: string) => {
  return prisma.articleComment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
};

// 게시글 댓글 수정
export const updateArticleCommentRp = async (commentId: string, content: string) => {
  return prisma.articleComment.update({
    where: { id: commentId },
    data: { content },
    select: {
      id: true,
      content: true,
      userId: true,
      articleId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// 게시글 댓글 삭제
export const deleteArticleCommentRp = async (commentId: string) => {
  return prisma.articleComment.delete({
    where: { id: commentId },
    select: {
      id: true,
      content: true,
      userId: true,
      articleId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const findArticleOwnerByArticleIdRp = async (articleId: string) => {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { userId: true },
  });
  return article?.userId || null;
};
