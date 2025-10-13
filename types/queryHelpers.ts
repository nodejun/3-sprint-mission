import { Prisma } from '@prisma/client';

export interface PaginationQuery {
  offset?: string;
  limit?: string;
}

export interface SortParamsQuery {
  sort?: string;
}

export interface CursorPaginationOptions {
  cursor?: string;
  limit?: string;
}

export interface CursorPaginationReturnOptions {
  take: number;
  cursor?: { id: string };
  skip?: number;
}

export interface CommentCreateArgs {
  parentId: string;
  userId: string;
  content: string;
}

export type ParentModelName = 'product' | 'article';

export type ParentSelectField = 'name' | 'title';

export type CommentModelNameForFind = 'ProductComment' | 'ArticleComment';

// Prisma의 타입들을 미리 정의해두면 가독성이 좋아집니다.
export type ProductCommentWithUser = Prisma.ProductCommentGetPayload<{
  include: {
    user: {
      select: {
        username: true;
      };
    };
    product: {
      select: {
        name: true;
      };
    };
  };
}>;

export type ArticleCommentWithUser = Prisma.ArticleCommentGetPayload<{
  include: {
    user: {
      select: {
        username: true;
      };
    };
    article: {
      select: {
        title: true;
      };
    };
  };
}>;

export type ArticleGetPayload = Prisma.ArticleGetPayload<{
  select: {
    userId: true;
  };
}>;

export type ProductGetPayload = Prisma.ProductGetPayload<{
  select: {
    userId: true;
  };
}>;