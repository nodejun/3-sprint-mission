import {
  checkCommentOwnership,
  prepareCommentCreateData,
  getCommentIncludeOptions,
  findCommentsCommon,
  prisma
} from '../utils/queryHelpers.js';

export const createArticleComment = async ({ articleId, userId, content }) => {
  const data = prepareCommentCreateData({ parentId: articleId, userId, content }, 'article');
  const newComment = await prisma.articleComment.create({
    data: data,
    include: getCommentIncludeOptions('title')
  });
  return newComment;
};

export const findAllArticleComments = async ({ articleId, cursor, limit }) => {
  return findCommentsCommon('articleComment', articleId, { cursor, limit }, 'title');
};

export const updateArticleComment = async (commentId, { content, userId }) => {
  await checkCommentOwnership(commentId, userId, 'articleComment');
  const updatedComment = await prisma.articleComment.update({
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
  return updatedComment;
};

export const deleteArticleComment = async (commentId, userId) => {
  await checkCommentOwnership(commentId, userId, 'articleComment');
  const deletedComment = await prisma.articleComment.delete({
    where: { id: commentId },
    select: {
      id: true,
      content: true,
      userId: true,
      articleId: true,
    },
  });
  return deletedComment;
};