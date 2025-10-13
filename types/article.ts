import { Article } from '@prisma/client';
import { Request } from 'express';

// Express Request 객체에 라우트 파라미터가 포함된 타입
interface ArticleParamsRequest extends Request {
  params: {
    articleId: string;
  };
}

// 아티클 생성에 필요한 데이터 타입 (req.body)
interface CreateArticleData {
  title: string;
  content: string;
  userId: string;
  imageUrl?: string | null;
}

// 아티클 수정에 필요한 데이터 타입 (req.body)
interface UpdateArticleData {
  title?: string;
  content?: string;
  imageUrl?: string | null;
}

// 목록 조회와 상세 조회에 필요한 모든 정보를 포함하는 타입
interface ArticleWithDetails extends Article {
  user: {
    username: string;
  };
  _count: {
    ArticleLike: number;
  };
  isLiked?: boolean;
}

export {
  ArticleParamsRequest,
  CreateArticleData,
  UpdateArticleData,
  ArticleWithDetails,
};