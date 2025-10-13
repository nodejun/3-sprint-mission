import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {
  getPaginationParams,
  getSearchParams,
  getSortParams,
  prisma,
  checkProductOwnership
} from '../src/utils/queryHelpers.js';

export const findAllProducts = async ({ offset, limit, sort, search }) => {
  const { skip, take } = getPaginationParams({ offset, limit });
  const orderBy = getSortParams({ sort }, 'createdAt');
  const where = getSearchParams(search, ['name', 'description']);
  try {
    const products = await prisma.product.findMany({
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
            ProductLike: true,
          },
        },
      },
    });
    return products.map(product => ({
      ...product,
      likeCount: product._count.ProductLike,
      _count: undefined,
    }));
  } catch (error) {
    throw error;
  }
};

export const createProduct = async ({
  name,
  description,
  price,
  isSold,
  tags,
  stock,
  userId,
  imageUrl
}) => {
  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        isSold,
        tags,
        stock,
        imageUrl,
        user: {
          connect: {
            id: userId
          }
        }
      }
    });
    return product;
  } catch (error) {
    throw error;
  }
};

export const findProductById = async (productId, currentUserId = null) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
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
        ProductLike: currentUserId
          ? {
            where: { userId: currentUserId }, // 현재 유저가 누른 좋아요만 필터링
            select: { id: true }, // 좋아요 존재 여부만 확인하므로 id 필드만 선택
          }
          : false,
      },
    });

    if (!product) {
      throw new PrismaClientKnownRequestError('상품을 찾을 수 없습니다.', {
        code: 'P2025',
        meta: { modelName: 'Product', cause: 'record not found' },
      });
    }
    // isLiked 필드 계산: currentUserId가 있고, 해당 유저의 좋아요 레코드가 존재하면 true
    const isLiked = currentUserId ? product.ProductLike?.length > 0 : false;
    const likeCount = product._count.ProductLike;
    // 반환 객체에서 ProductLike 속성 제거 후 isLiked 추가
    const { ProductLike, _count, ...productWithoutLikes } = product;
    return { ...productWithoutLikes, isLiked, likeCount };
    // --- 여기까지 추가/수정 ---
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (productId, userId, updateData) => {
  try {
    await checkProductOwnership(productId, userId);
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        isSold: true,
        tags: true,
        stock: true,
        imageUrl: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            username: true
          }
        }
      },
    });
    return updatedProduct;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (productId, userId) => {
  try {
    await checkProductOwnership(productId, userId);
    const deletedProduct = await prisma.product.delete({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        isSold: true,
        tags: true,
        stock: true,
        imageUrl: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return deletedProduct;
  } catch (error) {
    throw error;
  }
};

export const toggleProductLike = async (userId, productId) => {
  try {
    const existinglike = await prisma.productLike.findUnique({
      where: {
        userId_productId: { // @@unique([userId, productId])
          userId: userId,
          productId: productId,
        },
      },
    });

    if (existinglike) {
      await prisma.productLike.delete({
        where: {
          id: existinglike.id
        },
      });
      return { liked: false, message: '좋아요를 취소하였습니다' };
    } else {
      await prisma.productLike.create({
        data: {
          userId: userId,
          productId: productId,
        },
      });
      return { liked: true, message: "좋아요가 추가되었습니다" };
    }
  } catch (error) {
    throw error
  }
};