import * as articleRepository from '../repositories/articleRepository';
import { CreateArticleData, UpdateArticleData, ArticleWithDetails } from '../../types/article';
import { PaginationAndSearchRequest } from '../../types/pagenation';
import { processFindManyArgs, processResponse } from '../utils/responseHelpers';
import { checkArticleOwnership } from '../utils/queryHelpers';
import { HttpError } from '../../types/errors';

// 게시글 목록을 조회하는 서비스 (페이지네이션, 정렬, 검색 포함)
export const findAllArticles = async (query: PaginationAndSearchRequest['query']) => {
  const params = processFindManyArgs(query, 'article');

  const articles: ArticleWithDetails[] = await articleRepository.findAllArticlesRp(params);

  return articles.map((article) => processResponse(article, 'ArticleLike'));
};

// 특정 ID의 게시글 상세 정보를 조회하는 서비스
export const findArticleById = async (articleId: string, currentUserId?: string | null) => {
  const article = await articleRepository.findArticleByIdRp(articleId);

  if (!article) {
    throw new HttpError('게시글을 찾을 수 없습니다.', 404);
  }

  let isLiked = false;
  if (currentUserId) {
    const existingLike = await articleRepository.findLikeByUserAndArticleIdRp(
      currentUserId,
      articleId,
    );
    isLiked = !!existingLike;
  }

  const articleWithDetails = { ...article, isLiked };
  return processResponse(articleWithDetails, 'ArticleLike');
};

// 새로운 게시글을 생성하는 서비스
export const createArticle = async (articleData: CreateArticleData) => {
  const newArticle = await articleRepository.createArticleRp(articleData);
  return processResponse(newArticle, 'ArticleLike'); // processResponse 적용
};

// 게시글 정보를 수정하는 서비스
export const updateArticle = async (
  articleId: string,
  userId: string,
  updateData: UpdateArticleData,
) => {
  await checkArticleOwnership(articleId, userId);

  const updatedArticle = await articleRepository.updateArticleRp(articleId, updateData);

  return processResponse(updatedArticle, 'ArticleLike');
};

// 게시글을 삭제하는 서비스
export const deleteArticle = async (articleId: string, userId: string) => {
  await checkArticleOwnership(articleId, userId);

  const deletedArticle = await articleRepository.deleteArticleRp(articleId);
  return deletedArticle;
};

// 좋아요를 토글하는 서비스
export const toggleArticleLike = async (articleId: string, userId: string) => {
  const existingLike = await articleRepository.findLikeByUserAndArticleIdRp(userId, articleId);

  if (existingLike) {
    await articleRepository.deleteLikeRp(existingLike.id);
    return { liked: false, message: '좋아요를 취소하였습니다' };
  } else {
    await articleRepository.createLikeRp(userId, articleId);
    return { liked: true, message: '좋아요가 추가되었습니다' };
  }
};

// 좋아요한 게시글 조회
export const findLikedArticle = async (userId: string) => {
  const likedArticle = await articleRepository.findLikedArticleRp(userId);
  if (likedArticle.length === 0) {
    throw new HttpError('게시글을 찾을 수 없습니다.', 404);
  }
  const articles = likedArticle.map((like) => like.article);
  return articles;
};
