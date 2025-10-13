import { ArticleComment } from '@prisma/client';

// 댓글 생성에 필요한 데이터 타입
interface CreateCommentArgs {
  articleId: string;
  content: string;
  userId: string;
}

// 댓글 목록 조회에 필요한 데이터 타입
interface FindAllCommentsArgs {
  articleId: string;
  cursor?: string;
  limit?: string;
}

// 댓글 수정에 필요한 데이터 타입
interface UpdateCommentArgs {
  content?: string;
  userId: string;
}

// findAllCommentsRp 함수의 인자로 사용될 타입
interface FindCommentsRepoArgs {
  where: {
    articleId: string;
  };
  cursor?: { id: string };
  take?: number;
  skip?: number;
}

// 댓글 작성자 정보를 포함하는 최종 반환 데이터 타입
interface ArticleCommentWithUser extends ArticleComment {
  user: {
    username: string;
  };
}

export { CreateCommentArgs, UpdateCommentArgs, FindAllCommentsArgs, FindCommentsRepoArgs, ArticleCommentWithUser };