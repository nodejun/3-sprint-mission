import prisma from '../lib/prisma';
import { CreateUserData, UpdateUserProfileData, UpdateUserTokenData } from '../../types/user';

// 이메일 이름으로 유저 조회
export const findFirstUserRp = async (username: string, email: string) =>
  await prisma.user.findFirst({
    where: {
      OR: [{ username: username }, { email: email }]
    }
  });

// 유저 생성
export const createUserRp = async (userData: CreateUserData) =>
  await prisma.user.create({
    data: userData,
    select: {
      id: true,
      username: true,
      email: true,
      imageUrl: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  });

// 이메일로 유저 조회
export const findUserByEmailRp = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

// 유저 정보 조회 
export const findUserProfileByIdRp = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      address: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUserProfileRp = async (id: string, updateData: UpdateUserProfileData) => {
  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      address: true,
      imageUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

// 유저 정보 업데이트
export const updateUserTokenRp = async (id: string, updateData: UpdateUserTokenData) => {
  return await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
    },
  });
};

// 유저 토큰 정보 조회
export const findUserTokenByIdRp = async (id: string) => {
  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
      refreshToken: true,
    },
  });
};

// 유저 삭제
export const deleteUserRp = async (id: string) => {
  return await prisma.user.delete({
    where: { id },
    select: {
      id: true,
      username: true,
      email: true,
    },
  });
};