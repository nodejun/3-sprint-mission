import { Request } from 'express';
import { File } from 'multer';

// JWT 페이로드에 담길 사용자 정보의 타입을 정의합니다.
interface UserPayload {
  userId: string;
}

// express 모듈을 확장합니다.
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
      };
      cookies: {
        refreshToken: string;
      };
      uploadPath?: string;
      file?: File;
      files?: { [fieldname: string]: File[] } | File[];
    }

    namespace Multer {
      interface File {
        location?: string;
      }
    }
  }
}

export { }