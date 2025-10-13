import jwt from 'jsonwebtoken';
import { StringValue } from 'ms';

export const createToken = (user: { id: string }, type: 'access' | 'refresh') => {
  const payload = { userId: user.id };
  let secret: string;
  let expiresIn: StringValue;

  if (type === 'access') {
    secret = process.env.ACCESS_TOKEN_SECRET as string;
    expiresIn = '1h'; // 1h
  } else if (type === 'refresh') {
    secret = process.env.REFRESH_TOKEN_SECRET as string;
    expiresIn = '2w'; // 2w
  } else {
    throw new Error('유효하지 않은 토큰 타입입니다.');
  }
  const options = {
    expiresIn: expiresIn,
  };
  return jwt.sign(payload, secret, options);
};