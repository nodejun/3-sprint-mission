import express from 'express';
import {
  verifyAccessToken,
  verifyRefreshToken
} from '../middlewares/auth';
import asyncHandler from '../utils/asyncHandler';
import { uploadImage } from '../middlewares/uploadMiddleware';
import {
  registerUser,
  login,
  logout,
  refreshToken,
  getMe,
  updateMe,
  deleteMe,
} from '../controllers/userController';
import {
  validate,
  createUserSchema,
  updateUserSchema,
  loginSchema
} from '../middlewares/validationMiddleware';

const userRouter = express.Router();

// --- 회원가입 및 전체 사용자 조회 라우트 ---
userRouter.route('/')
  .post(
    uploadImage('users'),
    validate(createUserSchema, 'body'),
    asyncHandler(registerUser)
  );

// --- 로그인 라우트 ---
userRouter.post('/login',
  validate(loginSchema, 'body'),
  asyncHandler(login)
);
// --- 로그아웃 라우트 ---
userRouter.post(
  '/logout',
  verifyAccessToken,
  asyncHandler(logout)
);

// --- 토큰 갱신 라우트 (Refresh Token Rotation 적용) ---
userRouter.post('/refresh-token',
  verifyRefreshToken,
  asyncHandler(refreshToken)
);
// --- 로그인한 사용자 정보 조회, 수정, 삭제 라우트 ---
userRouter.route('/me')
  .get(
    verifyAccessToken,
    asyncHandler(getMe)
  )
  .patch(
    verifyAccessToken,
    uploadImage('users'),
    validate(updateUserSchema, 'body'),
    asyncHandler(updateMe)
  )
  .delete(
    verifyAccessToken,
    asyncHandler(deleteMe)
  );

export default userRouter;