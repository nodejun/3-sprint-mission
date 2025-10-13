import { Request, Response, NextFunction } from 'express';
import {
  createUser,
  loginUser,
  logoutUser,
  refreshUserToken,
  getMyProfile,
  updateUser,
  deleteMyProfile,
} from '../services/userService';
import {
  CreateUserData,
  LoginData,
  RefreshTokenRequest,
  UpdateUserProfileData,
} from '../../types/user';

export const registerUser = async (
  req: Request<{}, {}, CreateUserData>,
  res: Response,
  next: NextFunction
) => {
  const imageUrl = req.file ? req.file.location : null;
  const { username, email, password, address } = req.body;

  const newUser = await createUser({ username, email, password, address, imageUrl });
  res.status(201).json({
    message: '회원가입이 성공적으로 완료되었습니다.',
    user: newUser,
  });
};

export const login = async (
  req: Request<{}, {}, LoginData>,
  res: Response
) => {
  const { email, password } = req.body;

  const { accessToken, refreshToken, user } = await loginUser(email, password);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // 자바스크립트로 접근 불가
    sameSite: 'none',
    secure: true, // HTTPS에서만 전송
    maxAge: 1000 * 60 * 60 * 24 * 7 * 2, // 2주
  });

  res.status(200).json({
    message: '로그인 성공!',
    accessToken: accessToken,
    user: user,
  });
};

export const logout = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.userId;
  await logoutUser(userId);
  // 클라이언트 측 쿠키에서 리프레시 토큰을 제거
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    path: '/api/users/refresh-token',
  });

  res.status(200).json({
    message: '로그아웃이 성공적으로 완료되었습니다.',
  });
};

export const refreshToken = async (
  req: Request,
  res: Response
) => {
  const typedReq = req as RefreshTokenRequest;
  const userId = typedReq.user!.userId;
  const oldRefreshToken = typedReq.cookies.refreshToken;

  const { newAccessToken, newRefreshToken } = await refreshUserToken(userId, oldRefreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    maxAge: 1000 * 60 * 60 * 24 * 7 * 2,
  });

  res.status(200).json({
    message: '새로운 액세스 토큰이 발급되었습니다.',
    accessToken: newAccessToken,
  });
};

export const getMe = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.userId;
  const user = await getMyProfile(userId);

  res.status(200).json({
    message: '내 정보 조회 성공!',
    user: user,
  });
};

export const updateMe = async (
  req: Request<{}, {}, UpdateUserProfileData>,
  res: Response
) => {
  const userId = req.user!.userId;
  const updateData = req.body;

  if (req.file) {
    updateData.imageUrl = req.file.location;
  }

  const updatedUser = await updateUser(userId, updateData);

  res.status(200).json({
    message: '회원 정보가 성공적으로 업데이트되었습니다.',
    user: updatedUser,
  });
};

export const deleteMe = async (
  req: Request,
  res: Response
) => {
  const userId = req.user!.userId;
  await deleteMyProfile(userId);

  res.status(204).end();
};