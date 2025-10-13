import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UnauthorizedError } from 'express-jwt';

const errorHandler = (err, req, res, next) => {
  let statusCode = 500;
  let message = '서버 내부 오류가 발생했습니다.';
  let details = undefined;
  // express-jwt에서 발생하는 UnauthorizedError 처리 로직 추가
  if (err instanceof UnauthorizedError) {
    if (err.code === 'credentials_required') {
      // 토큰이 제공되지 않은 경우
      statusCode = 401;
      message = '액세스 토큰이 제공되지 않았습니다.';
    } else if (err.code === 'invalid_token' && err.inner && err.inner.name === 'TokenExpiredError') {
      statusCode = 401;
      message = '액세스 토큰이 만료되었습니다. 리프레시 토큰으로 재발급해주세요.';
    } else {
      // 그 외 유효하지 않은 토큰 (변조, 서명 오류 등)
      statusCode = 401;
      message = '액세스 토큰이 유효하지 않습니다.';
    }
  }
  else if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        message = err.message || '요청하신 데이터가 이미 존재합니다.';
        
        if (err.meta && Array.isArray(err.meta.target)) {
          details = `중복된 필드: ${err.meta.target.join(', ')}`;
        }
        break;

      case 'P2025':
        statusCode = 404;
        message = err.message || err.meta?.cause || '요청한 데이터를 찾을 수 없습니다.';
        break;

      default:
        statusCode = 500;
        message = err.message || '데이터베이스 관련 오류가 발생했습니다.';
    }
  } else if (err.message === '유효성 검사 오류' && Array.isArray(err.details)) {
    statusCode = 400;
    message = err.message;
    details = err.details;
  } else {
    // 그 외 예측하지 못한 오류 또는 사용자 정의 오류
    statusCode = err.statusCode || 500;
    message = err.message || '서버 내부 오류가 발생했습니다.';
  }

  res.status(statusCode).json({
    message: message,
    ...(details && { details: details }),
  });
};

export default errorHandler;