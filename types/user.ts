import { Request } from 'express';

interface RefreshTokenRequest extends Request {
  cookies: {
    refreshToken: string;
  };
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  address: string;
  imageUrl?: string | null;
}

interface SelectOptions {
  id: true,
  username: true,
  email: true,
  address: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
}

interface UpdateUserProfileData {
  username?: string;
  email?: string;
  address?: string;
  password?: string;
  imageUrl?: string;
}


interface UpdateUserTokenData {
  refreshToken: string | null;
}

interface LoginData {
  email: string;
  password: string;
}

export { CreateUserData, SelectOptions, UpdateUserProfileData, UpdateUserTokenData, LoginData, RefreshTokenRequest }