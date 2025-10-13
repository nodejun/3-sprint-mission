import { Request, Response, NextFunction } from 'express';

// asyncHandler의 타입을 제네릭으로 확장하여 라우트 파라미터 타입을 처리
const asyncHandler = <P = Request['params']>(
  requestHandler: (req: Request<P>, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request<P>, res: Response, next: NextFunction) => {
    try {
      await requestHandler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};

export default asyncHandler;