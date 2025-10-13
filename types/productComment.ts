import { ProductComment } from '@prisma/client';

// 댓글 생성에 필요한 데이터 타입
interface CreateProductCommentArg {
  productId: string;
  userId: string;
  content: string;
}

// 댓글 목록 조회에 필요한 데이터 타입
interface FindAllProductCommentsArg {
  productId: string;
  cursor?: string;
  limit?: string;
}

// 댓글 수정에 필요한 데이터 타입
interface UpdateProductCommentArg {
  content: string;
  userId: string;
}

// findAllProductCommentsRp 함수의 인자로 사용될 타입
interface FindCommentsRepoArgs {
  where: {
    productId: string;
  };
  cursor?: { id: string };
  take?: number;
  skip?: number;
}

// 댓글 작성자 정보를 포함하는 최종 반환 데이터 타입
interface ProductCommentWithUser extends ProductComment {
  user: {
    username: string;
  };
}

export {
  CreateProductCommentArg,
  FindAllProductCommentsArg,
  UpdateProductCommentArg,
  FindCommentsRepoArgs,
  ProductCommentWithUser,
};