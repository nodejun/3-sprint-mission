import { expressjwt } from 'express-jwt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('환경 변수 ACCESS_TOKEN_SECRET이 설정되지 않았습니다.');
}
if (!REFRESH_TOKEN_SECRET) {
  throw new Error('환경 변수 REFRESH_TOKEN_SECRET이 설정되지 않았습니다.');
}

// Access Token 검증 미들웨어
export const verifyAccessToken = expressjwt({
  secret: ACCESS_TOKEN_SECRET,
  algorithms: ['HS256'],
  requestProperty: 'user',
});

// Refresh Token 검증 미들웨어
export const verifyRefreshToken = expressjwt({
  secret: REFRESH_TOKEN_SECRET,
  algorithms: ['HS256'],
  getToken: (req: Request) => {
    if (req.cookies && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return null;
  },
  requestProperty: 'user',
});

export const optionalVerifyAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.headers.authorization) {
    // Authorization 헤더가 있으면 Access Token 검증 미들웨어 실행
    verifyAccessToken(req, res, (err) => {
      if (err) {
        // 토큰이 있지만 유효하지 않은 경우, req.user를 초기화하고 다음으로 진행
        req.user = undefined;
      }
      next(); // 오류가 있든 없든 다음 미들웨어로 넘어감
    });
  } else {
    // Authorization 헤더가 없으면 req.user를 초기화하고 바로 다음으로 진행
    req.user = undefined;
    next();
  }
};

export const verifySocketToken = (token: string): { userId: string } => {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET, {
      algorithms: ['HS256'],
    }) as { userId: string };
    return decoded;
  } catch (error) {
    console.error('WebSocket token verification failed:', error);
    throw new Error('Invalid token');
  }
};
