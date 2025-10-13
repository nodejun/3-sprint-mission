import * as s from 'superstruct';
import { Request, Response, NextFunction } from 'express';
import { Struct } from 'superstruct';
import { ValidationError } from '../types/errors';
import isEmail from 'is-email';
import isUuid from 'is-uuid';

// --- 공통 타입 정의 ---
export const Uuid = s.define < string > ('Uuid', (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }
  return isUuid.v4(value);
});

export const Email = s.define < string > ('Email', (value: unknown) => {
  if (typeof value !== 'string') {
    return false;
  }
  return isEmail(value);
});

export const ProductTagEnum = s.enums([
  'NEW_PRODUCT',
  'UNOPENED',
  'USED',
  'A_GRADE',
  'USED_FEELING',
  'DAMAGED',
  'LIMITED_EDITION',
  'DISCONTINUED',
  'FREE_SHIPPING',
  'DIRECT_DEAL',
  'PRICE_NEGOTIABLE',
  'URGENT_SALE',
  'ELECTRONICS',
  'CLOTHING',
  'BOOKS',
  'FURNITURE',
  'SPORTS_EQUIPMENT',
  'RARE_ITEM',
  'FILM_CAMERA',
  'VINTAGE',
  'IMAGE_UPLOADED'
]);

// --- User 관련 스키마 ---
export const createUserSchema = s.object({
  username: s.size(s.string(), 2, 20),
  email: Email,
  address: s.optional(s.size(s.string(), 5, 100)),
  password: s.refine(s.string(), 'password', (value: string): boolean | string => {
    return /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(value) ||
      '비밀번호는 영문과 숫자 조합으로 8자에서 16자 사이여야 합니다.';
  }),
  imageUrl: s.optional(s.string()),
});

export const updateUserSchema = s.object({
  username: s.optional(s.size(s.string(), 2, 20)),
  email: s.optional(Email),
  address: s.optional(s.size(s.string(), 5, 100)),
  password: s.optional(s.refine(s.string(), 'password', (value: string): boolean | string => {
    return /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,16}$/.test(value) ||
      '비밀번호는 영문과 숫자 조합으로 8자에서 16자 사이여야 합니다.';
  })),
  imageUrl: s.optional(s.string()),
});

export const loginSchema = s.object({
  email: Email,
  password: s.string(), // 로그인 시에는 문자열이기만 하면 됩니다.
});

// --- Product 관련 스키마 --- 
export const createProductSchema = s.object({
  name: s.size(s.string(), 2, 50),
  description: s.optional(s.size(s.string(), 0, 500)),
  price: s.min(s.number(), 1),
  isSold: s.optional(s.boolean()),
  tags: s.optional(s.size(s.array(ProductTagEnum), 1, 5)),
  stock: s.optional(s.min(s.number(), 0)),
  imageUrl: s.optional(s.string()),
});

export const updateProductSchema = s.object({
  name: s.optional(s.size(s.string(), 2, 50)),
  description: s.optional(s.size(s.string(), 0, 500)),
  price: s.optional(s.min(s.number(), 1)),
  isSold: s.optional(s.boolean()),
  tags: s.optional(s.size(s.array(ProductTagEnum), 1, 5)),
  stock: s.optional(s.min(s.number(), 0)),
  imageUrl: s.optional(s.string()),
});

export const getProductByIdSchema = s.object({
  productId: Uuid,
});

// --- Article 관련 스키마 --- 
export const createArticleSchema = s.object({
  title: s.size(s.string(), 5, 100),
  content: s.size(s.string(), 10, 5000),
});

export const updateArticleSchema = s.object({
  title: s.optional(s.size(s.string(), 5, 100)),
  content: s.optional(s.size(s.string(), 10, 5000)),
});

export const getArticleByIdSchema = s.object({
  articleId: Uuid,
});


// --- Comment 관련 스키마 --- 
export const CommentBaseSchema = s.object({
  content: s.size(s.string(), 1, 500),
});

export const productCommentParamsSchema = s.object({
  productId: Uuid,
});

export const updateProductCommentParamsSchema = s.object({
  productId: Uuid,
  commentId: Uuid,
});

export const updateArticleCommentParamsSchema = s.object({
  articleId: Uuid,
  commentId: Uuid, // 'commentId' 필드 추가
});

// --- 쿼리 유효성 검사 ---
export const paginationQuerySchema = s.object({
  cursor: s.optional(s.string()),
  limit: s.optional(s.string()),
});

// -> 이 코드는 '0' 이상의 숫자 문자열만 허용합니다.
export const offsetQuerySchema = s.object({
  offset: s.optional(s.pattern(s.string(), /^\d+$/)),
  limit: s.optional(s.pattern(s.string(), /^\d+$/)),
  sort: s.optional(s.string()),
  search: s.optional(s.string()),
});


// --- 유효성 검사 미들웨어 ---
export const validate = <T>(schema: Struct<T>, type: 'body' | 'query' | 'params') => (req: Request, res: Response, next: NextFunction) => {
  try {
    s.assert(req[type] as unknown, schema);
  next();
  } catch (error) {
    if (error instanceof s.StructError) {
      const validationError = new ValidationError(
  '유효성 검사 오류',
        Array.from(error.failures()).map((failure) => ({
    type: failure.type,
  message: failure.message,
  path: failure.path.join('.'),
  value: failure.value,
        }))
  );
  next(validationError);
    } else {
    next(error);
    }
  }
};
