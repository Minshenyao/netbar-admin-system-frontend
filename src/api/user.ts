/**
 * 用户相关API
 */
import request from '../utils/request';

// 开发环境标志
const IS_DEV = import.meta.env.DEV || import.meta.env.MODE === 'development';

// 用户信息类型
export interface UserInfo {
  id: number;
  username: string;
  identity?: string;
  phone?: string;
  status: number;
  permission: number;
  balance: number;
  admin: boolean;
}

// 登录参数类型
export interface LoginParams {
  username: string;
  password: string;
}

// 登录结果类型
export interface LoginResult {
  user: UserInfo;
  token: string;
}

// 注册参数类型
export interface RegisterParams {
  username: string;
  password: string;
  identity?: string;
  phone?: string;
}

/**
 * 登录请求
 * @param params 登录参数
 * @returns 登录结果
 */
export const login = async (params: LoginParams): Promise<LoginResult> => {
  try {
    const response = await request.post('/api/users/login', params);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * 注册请求
 * @param params 注册参数
 * @returns 注册结果
 */
export const register = async (params: RegisterParams): Promise<UserInfo> => {
  try {
    const response = await request.post('/api/users/register', params);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

/**
 * 登出请求
 */
export const logout = async (): Promise<void> => {
  try {
    await request.post('/api/users/logout');
  } catch (error) {
    console.error('登出失败', error);
    // 即使API请求失败，也清除本地存储的用户信息
  }
};

/**
 * 获取当前用户信息
 */
export const getUserInfo = async (): Promise<UserInfo> => {
  try {
    const response = await request.get('/api/users/profile');
    return response.data;
  } catch (error: any) {
    throw error;
  }
}; 