import prisma from '../lib/prisma';
import { CreateProductData, UpdateProductData } from '../../types/product';
import { PrismaFindManyArgs } from '../../types/pagenation';

// N+1 쿼리 문제를 해결하기 위한 함수
export const findAllProductsWithDetailsRp = async (params: PrismaFindManyArgs) => {
  return await prisma.product.findMany({
    ...params,
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ProductLike: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });
};

// 상품 등록
export const createProductRp = async (data: CreateProductData) => {
  return await prisma.product.create({
    data,
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ProductLike: true,
        },
      },
    },
  });
};

// 특정 상품 ID로 조회
export const findProductByIdRp = async (productId: string) => {
  return await prisma.product.findUnique({
    where: { id: productId },
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ProductLike: true,
        },
      },
    },
  });
};

// 상품 정보 수정
export const updateProductRp = async (productId: string, data: UpdateProductData) => {
  return await prisma.product.update({
    where: { id: productId },
    data,
    include: {
      user: {
        select: {
          username: true,
        },
      },
      _count: {
        select: {
          ProductLike: true,
        },
      },
    },
  });
};

// 상품 삭제
export const deleteProductRp = async (productId: string) => {
  return await prisma.product.delete({
    where: { id: productId },
  });
};

// 좋아요가 존재하는지 확인
export const findUniqueProductLikeRp = async (userId: string, productId: string) => {
  return await prisma.productLike.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });
};

// 좋아요 삭제
export const deleteProductLikeRp = async (id: string) => {
  return await prisma.productLike.delete({
    where: { id },
  });
};

// 좋아요 생성
export const createProductLikeRp = async (userId: string, productId: string) => {
  return await prisma.productLike.create({
    data: { userId, productId },
  });
};

// 좋아요한 상품 목록
export const findLikedProductRp = async (userId: string) => {
  const likedProducts = await prisma.productLike.findMany({
    where: {
      userId: userId,
    },
    include: {
      product: true,
    },
  });
  return likedProducts;
};

export const getProductPriceByIdRp = async (productId: string) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { price: true },
  });
  return product?.price || null;
};

export const getLikedUsersByProductId = async (productId: string) => {
  const likedUsers = await prisma.productLike.findMany({
    where: { productId },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  });
  return likedUsers.map((like) => like.user);
};
