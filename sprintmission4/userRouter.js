import express from 'express';
import path from 'path';
import { verifyAccessToken, verifyRefreshToken } from '../src/middlewares/auth.js';
import asyncHandler from '../src/utils/asyncHandler.js';
import uploadImage from '../middlewares/upload.middleware.js';
import {
  createUser,
  // findAllUsers,
  findUserById,
  updateUser,
  deleteUser,
  loginUser,
  createToken
} from '../src/services/userService.js';
import { verifyAccessToken, verifyRefreshToken } from '../src/middlewares/auth.js';
import {
  validate,
  createUserSchema,
  updateUserSchema,
  loginSchema
} from '../src/middlewares/validationMiddleware.js';
import asyncHandler from '../src/utils/asyncHandler.js';
import uploadImage from '../src/middlewares/uploadMiddleware.js';
import path from 'path';

const userRouter = express.Router();

// --- 회원가입 및 전체 사용자 조회 라우트 ---
userRouter.route('/')
  .post(
    (req, res, next) => {
      req.uploadPath = path.resolve(process.cwd(), 'uploads', 'users');
      next();
    },
    uploadImage.single('image'),
    validate(createUserSchema, 'body'),
    asyncHandler(async (req, res, next) => {
      const imageUrl = req.file ? `/uploads/users/${req.file.filename}` : null;
      const { username, email, password, address } = req.body;
      const newUser = await createUser(username, email, password, address, imageUrl);
      res.status(201).json({
        message: '회원가입이 성공적으로 완료되었습니다.',
        user: newUser,
      });
    }))

// .get( // GET /api/users (모든 사용자 조회) 라우트
//   asyncHandler(async (req, res, next) => {
//     // 이 라우트를 활성화하려면 verifyAccessToken 또는 관리자 권한 미들웨어를 추가하는 것이 좋습니다.
//     const users = await findAllUsers();
//     res.status(200).json({
//       message: '검색하신 회원목록입니다.',
//       data: users,
//     });
//   })
// );

// --- 로그인 라우트 ---
userRouter.post('/login',
  validate(loginSchema, 'body'),
  asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await loginUser(email, password);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 * 2 // 2주 (2 weeks)
    });
    res.status(200).json({
      message: '로그인 성공!',
      accessToken: accessToken,
      user: user,
    });
  })
);

userRouter.post(
  '/logout',
  verifyAccessToken,
  asyncHandler(async (req, res, next) => {
    const userId = req.user.userId;
    await logoutUser(userId);
    // 클라이언트 측 쿠키에서 리프레시 토큰을 제거하도록 지시
    res.clearCookie('refreshToken', {
      httpOnly: true, // HTTP Only 쿠키
      secure: true,
      path: '/api/users/refresh-token',
    });
    res.status(200).json({
      message: '로그아웃이 성공적으로 완료되었습니다.',
    });
  })
);

// --- 토큰 갱신 라우트 (Refresh Token Rotation 적용) ---
userRouter.post('/refresh-token',
  verifyRefreshToken,
  asyncHandler(async (req, res, next) => {
    const { userId } = req.user;
    const oldRefreshToken = req.cookies.refreshToken;
    const user = await findUserById(userId, {
      id: true,
      refreshToken: true,
    });


    if (!user) {
      return res.status(401).json({ message: '인증 정보와 일치하는 사용자가 없습니다.' });
    }


    if (user.refreshToken !== oldRefreshToken) {
      await updateUser(user.id, { refreshToken: null });
      return res.status(401).json({ message: '유효하지 않거나 이미 사용된 리프레시 토큰입니다. 다시 로그인 해주세요.' });
    }
    const newAccessToken = createToken(user, 'access');
    const newRefreshToken = createToken(user, 'refresh');
    await updateUser(user.id, { refreshToken: newRefreshToken });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 * 7 * 2 // 2주 (2 weeks)
    });
    res.status(200).json({
      message: '새로운 액세스 토큰이 발급되었습니다.',
      accessToken: newAccessToken,
    });
  })
);
// --- 로그인한 사용자 정보 조회, 수정, 삭제 라우트 ---
userRouter.route('/me')
  .get(
    verifyAccessToken,
    asyncHandler(async (req, res, next) => {
      const { userId } = req.user;
      console.log(req.user)
      // findUserById 호출 시 refreshToken을 제외하도록 selectOptions 명시
      const user = await findUserById(userId, {
        id: true,
        username: true,
        email: true,
        address: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
      });
      res.status(200).json({
        message: '내 정보 조회 성공!',
        user: user,
      });
    })
  )

  .patch(
    verifyAccessToken,
    (req, res, next) => {
      req.uploadPath = path.resolve(process.cwd(), 'uploads', 'users');
      next();
    },
    uploadImage.single('image'),
    validate(updateUserSchema, 'body'),
    asyncHandler(async (req, res, next) => {
      const userId = req.user.userId;
      const updateData = req.body;

      if (req.file) {
        updateData.imageUrl = `/uploads/users/${req.file.filename}`;
      }
      const updatedUser = await updateUser(userId, updateData);
      res.status(200).json({
        message: '회원 정보가 성공적으로 업데이트되었습니다.',
        data: updatedUser,
      });
    })
  )

  .delete(
    verifyAccessToken,
    asyncHandler(async (req, res, next) => {
      const userId = req.user.userId;
      await updateUser(userId, { refreshToken: null });
      await deleteUser(userId);
      res.status(204).end();
    })
  );

export default userRouter;