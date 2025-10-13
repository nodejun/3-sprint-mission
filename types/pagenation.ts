import { Request } from 'express';

interface PaginationAndSearchRequest extends Request {
  query: {
    offset?: string;
    limit?: string;
    sort?: string;
    search?: string;
  };
}

interface PrismaFindManyArgs {
  skip?: number;
  take?: number;
  orderBy?: any;
  where?: any;
}

export { PaginationAndSearchRequest, PrismaFindManyArgs }