import { PaginationAndSearchRequest } from '../../types/pagenation';
import { getPaginationParams, getSortParams, getSearchParams } from './queryHelpers';

type ModelNameForSearch = 'product' | 'article';
type LikeCountField = 'ProductLike' | 'ArticleLike';

// 범용적인 FindMany 인자를 처리하는 공통 함수
export const processFindManyArgs = (
  query: PaginationAndSearchRequest['query'],
  modelName: ModelNameForSearch
) => {
  const { skip, take } = getPaginationParams({ offset: query.offset, limit: query.limit });
  const orderBy = getSortParams({ sort: query.sort }, 'createdAt');

  let searchFields: string[];
  if (modelName === 'product') {
    searchFields = ['name', 'description'];
  } else {
    searchFields = ['title', 'content'];
  }
  const where = getSearchParams(query.search, searchFields);

  return { skip, take, orderBy, where };
};

// 응답 데이터를 가공하는 범용 함수
export const processResponse = <T extends {
  _count: { [key: string]: number };
  user: { username: string };
  isLiked?: boolean;
}>(
  data: T,
  likeCountField: LikeCountField
) => {
  const { _count, user, ...restOfData } = data;
  return {
    ...restOfData,
    username: user.username,
    likeCount: _count[likeCountField],
    ...(data.hasOwnProperty('isLiked') ? { isLiked: data.isLiked } : {}),
  };
};