import { Prisma } from '@prisma/client';
import hash from '../utils/hash';
import {
  findFirstUserRp,
  createUserRp,
  findUserByEmailRp,
  updateUserTokenRp,
  findUserProfileByIdRp,
  findUserTokenByIdRp,
  updateUserProfileRp,
  deleteUserRp,
} from '../repositories/userRepository';
import { createToken } from '../utils/jwt';
import { CreateUserData, UpdateUserProfileData } from '../../types/user';
import { HttpError } from '../../types/errors';

// 유저 생성
export const createUser = async (userData: CreateUserData) => {
  const { username, email, password, address, imageUrl } = userData;
  const existingUser = await findFirstUserRp(username, email);

  if (existingUser) {
    if (existingUser.username === username) {
      throw new Prisma.PrismaClientKnownRequestError('이미 사용 중인 사용자 이름입니다.', {
        code: 'P2002',
        clientVersion: '5.22.0',
      });
    }

    if (existingUser.email === email) {
      throw new Prisma.PrismaClientKnownRequestError('이미 사용 중인 이메일입니다.', {
        code: 'P2002',
        clientVersion: '5.22.0',
      });
    }
  }
  const hashedPassword = await hash.hashingPassword(password);
  const newUser = await createUserRp({
    username,
    email,
    password: hashedPassword,
    imageUrl,
    address,
  });
  return newUser;
};

// 유저 로그인
export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmailRp(email);
  if (!user) {
    throw new Error('이메일 또는 비밀번호를 확인해주세요.');
  }

  const isPasswordValid = await hash.verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw new Error('이메일 또는 비밀번호를 확인해주세요.');
  }

  const accessToken = createToken(user, 'access');
  const refreshToken = createToken(user, 'refresh');
  await updateUserTokenRp(user.id, { refreshToken: refreshToken });

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      address: user.address,
      imageUrl: user.imageUrl,
    },
  };
};

// 유저 로그아웃
export const logoutUser = async (userId: string) => {
  const updatedUser = await updateUserTokenRp(userId, { refreshToken: null });

  if (!updatedUser) {
    throw new Error('로그아웃할 사용자를 찾을 수 없습니다.');
  }

  return { message: '로그아웃 성공', userId: updatedUser.id };
};

// 토큰 재발급
export const refreshUserToken = async (userId: string, oldRefreshToken: string) => {
  const user = await findUserTokenByIdRp(userId);

  if (!user || user.refreshToken !== oldRefreshToken) {
    if (user) {
      await updateUserTokenRp(user.id, { refreshToken: null });
    }
    throw new Error('유효하지 않거나 이미 사용된 토큰입니다.');
  }

  const newAccessToken = createToken(user, 'access');
  const newRefreshToken = createToken(user, 'refresh');

  await updateUserTokenRp(user.id, { refreshToken: newRefreshToken });

  return { newAccessToken, newRefreshToken };
};

// 유저 정보 조회
export const getMyProfile = async (userId: string) => {
  const userProfile = await findUserProfileByIdRp(userId);
  if (!userProfile) {
    throw new Error('사용자 프로필을 찾을 수 없습니다.');
  }
  return userProfile;
};

// 유저 정보 업데이트
export const updateUser = async (id: string, updateData: UpdateUserProfileData) => {
  // 미리 중복 검사
  if (updateData.username) {
    const existingUser = await findFirstUserRp(updateData.username, '');
    if (existingUser && existingUser.username === updateData.username && existingUser.id !== id) {
      throw new HttpError('이미 사용 중인 사용자 이름입니다.', 409);
    }
  }

  if (updateData.email) {
    const existingUser = await findUserByEmailRp(updateData.email);
    if (existingUser && existingUser.id !== id) {
      throw new HttpError('이미 사용 중인 이메일입니다.', 409);
    }
  }

  if (updateData.password) {
    updateData.password = await hash.hashingPassword(updateData.password);
  }

  const updatedUser = await updateUserProfileRp(id, updateData);
  return updatedUser;
};

// 유저 삭제
export const deleteMyProfile = async (userId: string) => {
  const deletedUser = await deleteUserRp(userId);
  return deletedUser;
};
