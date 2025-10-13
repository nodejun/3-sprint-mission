import prisma from '../lib/prisma';
import { CreateArticleData, UpdateArticleData } from '../../types/article';
import { PrismaFindManyArgs } from '../../types/pagenation';

// 모든 게시글을 조회하는 레포지토리 함수
export const findAllArticlesRp = async (params: PrismaFindManyArgs) => {
  return prisma.article.findMany({
    ...params,
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ArticleLike: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

// 특정 ID의 게시글을 조회하는 레포지토리 함수
export const findArticleByIdRp = async (articleId: string) => {
  return prisma.article.findUnique({
    where: {
      id: articleId,
    },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ArticleLike: true,
        },
      },
    },
  });
};

// 새로운 게시글을 생성하는 레포지토리 함수
export const createArticleRp = async (data: CreateArticleData) => {
  return prisma.article.create({
    data,
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ArticleLike: true,
        },
      },
    },
  });
};

// 게시글을 수정하는 레포지토리 함수
export const updateArticleRp = async (articleId: string, updateData: UpdateArticleData) => {
  return prisma.article.update({
    where: {
      id: articleId,
    },
    data: updateData,
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ArticleLike: true,
        },
      },
    },
  });
};

// 게시글을 삭제하는 레포지토리 함수
export const deleteArticleRp = async (articleId: string) => {
  return prisma.article.delete({
    where: {
      id: articleId,
    },
  });
};

// 특정 사용자의 좋아요 존재 여부를 확인하는 레포지토리 함수
export const findLikeByUserAndArticleIdRp = async (userId: string, articleId: string) => {
  return prisma.articleLike.findUnique({
    where: {
      userId_articleId: {
        userId,
        articleId,
      },
    },
  });
};

// 좋아요를 생성하는 레포지토리 함수
export const createLikeRp = async (userId: string, articleId: string) => {
  return prisma.articleLike.create({
    data: {
      userId,
      articleId,
    },
  });
};

// 좋아요를 삭제하는 레포지토리 함수
export const deleteLikeRp = async (likeId: string) => {
  return prisma.articleLike.delete({
    where: {
      id: likeId,
    },
  });
};

// 좋아요한 게시글 목록
export const findLikedArticleRp = async (userId: string) => {
  return prisma.articleLike.findMany({
    where: {
      userId: userId,
    },
    include: {
      article: true,
    },
  });
};
