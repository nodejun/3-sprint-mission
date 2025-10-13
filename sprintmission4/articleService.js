
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  getPaginationParams,
  getSearchParams,
  getSortParams,
  prisma,
  checkArticleOwnership
} from '../utils/queryHelpers.js';

export const findAllArticles = async ({ offset, limit, sort, search }) => {
  try {
    const { skip, take } = getPaginationParams({ offset, limit });
    const orderBy = getSortParams({ sort }, 'createdAt');
    const where = getSearchParams(search, ['title', 'content']); s
    const articles = await prisma.article.findMany({
      skip,
      take,
      orderBy,
      where,
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
    return articles.map(article => ({
      ...article,
      likeCount: article._count.ArticleLike,
      _count: undefined,
    }));
  } catch (error) {
    throw error;
  }
};

export const createArticle = async ({ title, content, userId, imageUrl }) => {
  try {
    const newArticle = await prisma.article.create({
      data: {
        title,
        content,
        imageUrl,
        user: {
          connect: {
            id: userId,
          },
        },
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });
    return newArticle;
  } catch (error) {
    throw error;
  }
};

export const findArticleById = async (articleId, currentUserId) => {
  try {
    const article = await prisma.article.findUnique({
      where: {
        id: articleId,
      },
      include: {
        user: {
          select: {
            username: true,
          },
        },
        articleComments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            user: {
              select: {
                username: true,
              },
            },
          },
        },
        _count: {
          select: {
            ArticleLike: true,
          },
        },
        ArticleLike: currentUserId ? {
          where: { userId: currentUserId }, // 현재 유저가 누른 좋아요만 필터링
          select: { id: true }, // 좋아요 존재 여부만 확인하므로 id 필드만 선택
        }
          : false,
      },
    });


    if (!article) {
      throw new PrismaClientKnownRequestError('게시글을 찾을 수 없습니다.', {
        code: 'P2025',
        meta: { modelName: 'Article', cause: 'record not found' },
      });
    }
    const isLiked = currentUserId ? article.ArticleLike?.length > 0 : false;
    const likeCount = article._count.ArticleLike;
    const { ArticleLike, _count, ...articleWithoutLikes } = article;
    return { ...articleWithoutLikes, isLiked, likeCount };
  } catch (error) {
    throw error;
  }
};

export const updateArticle = async (articleId, userId, updateData) => {
  try {
    await checkArticleOwnership(articleId, userId);
    const updatedArticle = await prisma.article.update({
      where: {
        id: articleId,
      },
      data: updateData,
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true
          }
        }
      }
    });
    return updatedArticle;
  } catch (error) {
    throw error;
  }
};

export const deleteArticle = async (articleId, userId) => {
  try {
    await checkArticleOwnership(articleId, userId);
    const deletedArticle = await prisma.article.delete({
      where: {
        id: articleId
      },
      select: {
        id: true,
        title: true,
        content: true,
        imageUrl: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return deletedArticle;
  } catch (error) {
    throw error;
  }
};

export const toggleArticleLike = async (currentUserId, articleId) => {
  const existinglike = await prisma.articleLike.findUnique({
    where: {
      userId_articleId: {
        userId: currentUserId,
        articleId: articleId,
      },
    },
  });

  if (existinglike) {
    await prisma.articleLike.delete({
      where: {
        userId_articleId: {
          userId: currentUserId,
          articleId: articleId,
        },
      },
    });
    return { message: '좋아요가 취소되엇습니다' };
  } else {
    await prisma.articleLike.create({
      data: {
        userId: currentUserId,
        articleId: articleId,
      },
    });
    return { message: '좋아요가 추가되었습니다' }
  }
};