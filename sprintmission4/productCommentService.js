import {
  checkCommentOwnership,
  prepareCommentCreateData,
  getCommentIncludeOptions,
  findCommentsCommon,
  prisma
} from '../utils/queryHelpers.js';

export const createProductComment = async ({ productId, userId, content }) => {
  try {
    const data = prepareCommentCreateData({ parentId: productId, userId, content }, 'product');

    const newComment = await prisma.productComment.create({
      data: data,
      include: getCommentIncludeOptions('name')
    });
    return newComment;
  } catch (error) {
    throw error;
  }
};

export const findAllProductComments = async ({ productId, cursor, limit }) => {
  try {
    return findCommentsCommon('productComment', productId, { cursor, limit }, 'name');
  } catch (error) {
    throw error;
  }
};

export const updateProductComment = async (commentId, { content, userId }) => {
  try {
    await checkCommentOwnership(commentId, userId, 'productComment');
    const updatedComment = await prisma.productComment.update({
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
    return updatedComment;
  } catch (error) {
    throw error;
  }
};

export const deleteProductComment = async (commentId, userId) => {
  try {
    await checkCommentOwnership(commentId, userId, 'productComment');
    const deletedComment = await prisma.productComment.delete({
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
    return deletedComment;
  } catch (error) {
    throw error;
  }
};