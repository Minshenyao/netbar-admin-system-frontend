import request from '../utils/request';

// 用户列表查询参数
export interface UserQueryParams {
  page?: number;
  size?: number;
  sortBy?: string;
  username?: string;
}

// 用户信息
export interface User {
  id: number;
  username: string;
  identity?: string;
  phone?: string;
  status: number;
  permission: number;
  balance: number;
  admin: boolean;
}

// 分页结果
export interface PageResult<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// 权限信息
export interface Permission {
  id: number;
  name: string;
  code: number;
  description: string;
  discount: number;
  createdAt?: string;
  updatedAt?: string;
}

// 用户折扣信息
export interface UserDiscount {
  userId: number;
  username: string;
  permissionCode: number;
  permissionName: string;
  discount: number;
  description: string;
}

/**
 * 获取用户列表
 */
export const getUserList = async (params: UserQueryParams) => {
  try {
    const response = await request.get('/api/users', { params: {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || 'id',
      username: params.username
    }});
    return response.data as PageResult<User>;
  } catch (error) {
    throw error;
  }
};

/**
 * 获取指定用户信息
 */
export const getUser = async (id: number) => {
  try {
    const response = await request.get(`/api/users/${id}`);
    return response.data as User;
  } catch (error) {
    throw error;
  }
};

/**
 * 按用户名查询用户
 */
export const getUserByUsername = async (username: string) => {
  try {
    const response = await request.get(`/api/users/username/${username}`);
    return response.data as User;
  } catch (error) {
    throw error;
  }
};

/**
 * 创建新用户
 */
export const createUser = async (user: {
  username: string;
  password: string;
  identity?: string;
  phone?: string;
  permission?: number;
}) => {
  try {
    const response = await request.post('/api/users/register', user);
    return response.data as User;
  } catch (error) {
    throw error;
  }
};

/**
 * 更新用户信息
 */
export const updateUser = async (id: number, user: {
  phone?: string;
  identity?: string;
}) => {
  try {
    const response = await request.put(`/api/users/${id}`, user);
    return response.data as User;
  } catch (error) {
    throw error;
  }
};

/**
 * 删除用户
 */
export const deleteUser = async (id: number) => {
  try {
    await request.delete(`/api/users/${id}`);
  } catch (error) {
    throw error;
  }
};

/**
 * 启用用户
 */
export const enableUser = async (id: number) => {
  try {
    await request.post(`/api/users/${id}/enable`);
  } catch (error) {
    throw error;
  }
};

/**
 * 禁用用户
 */
export const disableUser = async (id: number) => {
  try {
    await request.post(`/api/users/${id}/disable`);
  } catch (error) {
    throw error;
  }
};

/**
 * 更新用户权限
 */
export const updateUserPermission = async (id: number, permissionCode: number) => {
  try {
    const response = await request.put(`/api/users/${id}/permission`, { permissionCode });
    return response.data as User;
  } catch (error) {
    throw error;
  }
};

/**
 * 更新用户余额
 */
export const updateUserBalance = async (id: number, balance: number) => {
  try {
    await request.put(`/api/users/${id}/balance`, { balance });
  } catch (error) {
    throw error;
  }
};

/**
 * 为用户充值
 */
export const addUserBalance = async (id: number, amount: number) => {
  try {
    await request.post(`/api/users/${id}/balance/add`, { amount });
  } catch (error) {
    throw error;
  }
};

/**
 * 从用户余额中扣款
 */
export const deductUserBalance = async (id: number, amount: number) => {
  try {
    await request.post(`/api/users/${id}/balance/deduct`, { amount });
  } catch (error) {
    throw error;
  }
};

/**
 * 修改用户密码
 */
export const updateUserPassword = async (id: number, oldPassword: string, newPassword: string) => {
  try {
    await request.post(`/api/users/${id}/password`, { oldPassword, newPassword });
  } catch (error) {
    throw error;
  }
};

/**
 * 获取用户折扣信息
 */
export const getUserDiscount = async (id: number) => {
  try {
    const response = await request.get(`/api/users/${id}/discount`);
    return response.data as UserDiscount;
  } catch (error) {
    throw error;
  }
};

/**
 * 增加当前用户余额
 */
export const addCurrentUserBalance = async (amount: number, paymentMethod: number) => {
  try {
    await request.post(`/api/users/balance/add`, { amount, paymentMethod, remark: '用户自助充值' });
  } catch (error) {
    throw error;
  }
};
/**
 * 获取所有权限
 */
export const getPermissions = async () => {
  try {
    const response = await request.get('/api/permissions');
    return response.data as Permission[];
  } catch (error) {
    return [
      {
        id: 1,
        name: '系统管理员',
        code: 99,
        description: '系统管理员，拥有所有权限，上网免费',
        discount: 0
      },
      {
        id: 2,
        name: '普通用户',
        code: 0,
        description: '普通用户，无折扣',
        discount: 1.0
      },
      {
        id: 3,
        name: '包月用户',
        code: 1,
        description: '包月用户，享受9折优惠',
        discount: 0.9
      },
      {
        id: 4,
        name: '包年用户',
        code: 2,
        description: '包年用户，享受7折优惠',
        discount: 0.7
      },
      {
        id: 5,
        name: 'VIP用户',
        code: 3,
        description: 'VIP用户，享受5折优惠',
        discount: 0.5
      }
    ];
  }
}; 