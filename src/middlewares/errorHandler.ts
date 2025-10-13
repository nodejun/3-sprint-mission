import { ErrorRequestHandler } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UnauthorizedError } from 'express-jwt';
import { HttpError, ValidationError } from '../../types/errors';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.error('전역 에러 발생:', err);

  let statusCode = 500;
  let message: string = '서버 내부 오류가 발생했습니다.';
  let details = undefined;

  // express-jwt에서 발생하는 UnauthorizedError 처리 로직 추가
  if (err instanceof UnauthorizedError) {
    if (err.code === 'credentials_required') {
      statusCode = 401;
      message = '액세스 토큰이 제공되지 않았습니다.';
    } else if (
      err.code === 'invalid_token' &&
      err.inner &&
      typeof err.inner === 'object' &&
      'name' in err.inner &&
      err.inner.name === 'TokenExpiredError'
    ) {
      statusCode = 401;
      message = '액세스 토큰이 만료되었습니다. 리프레시 토큰으로 재발급해주세요.';
    } else {
      statusCode = 401;
      message = '액세스 토큰이 유효하지 않습니다.';
    }
  } else if (err instanceof ValidationError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409;
        // 서비스에서 보낸 커스텀 메시지가 있으면 그것을 사용, 없으면 기본 메시지
        message =
          typeof err.message === 'string' &&
          err.message &&
          !err.message.includes('Unique constraint failed')
            ? err.message
            : '요청하신 데이터가 이미 존재합니다.';
        if (
          err.meta &&
          Array.isArray(err.meta.target) &&
          message === '요청하신 데이터가 이미 존재합니다.'
        ) {
          details = `중복된 필드: ${err.meta.target.join(', ')}`;
        }
        break;
      case 'P2003': // Foreign key constraint violated 에러 처리 로직 추가
        statusCode = 400; // 또는 404
        message = '참조하는 데이터가 존재하지 않습니다.';
        if (err.meta?.field_name) {
          details = `오류 필드: ${err.meta.field_name}`;
        } else {
          details = '요청에 유효하지 않은 ID가 포함되어 있습니다.';
        }
        break;
      case 'P2025':
        statusCode = 404;
        message =
          typeof err.message === 'string' && err.message
            ? err.message
            : (err.meta?.cause as string) || '요청한 데이터를 찾을 수 없습니다.';
        break;

      default:
        statusCode = 500;
        message =
          typeof err.message === 'string' && err.message
            ? err.message
            : '데이터베이스 관련 오류가 발생했습니다.';
        break;
    }
  } else {
    statusCode = err.statusCode || 500;
    message =
      typeof err.message === 'string' && err.message
        ? err.message
        : '서버 내부 오류가 발생했습니다.';
  }

  res.status(statusCode).json({
    message: message,
    ...(details && { details: details }),
  });
};

export default errorHandler;
