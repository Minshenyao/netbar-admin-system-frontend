import request from '../utils/request';

// 计算机类型定义
export interface Computer {
  id: number;
  name: string;
  macAddress: string;
  ipAddress: string;
  area: string;
  status: number;
  userId: number | null;
  startTime: number | null;
  createdAt: number;
  updatedAt: number;
  // 状态布尔属性
  powerOff?: boolean;
  idle?: boolean;
  inUse?: boolean;
  underMaintenance?: boolean;
}

// 分页响应类型
export interface PageResponse<T> {
  content: T[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

// 区域统计类型
export interface AreaStats {
  [key: string]: number;
}

// API响应类型
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface ComputerStatusStats {
  onlineCount: number
  busyCount: number
  offlineCount: number
  maintenanceCount: number
}

// 基础管理接口
/**
 * 创建计算机
 */
export function createComputer(data: {
  name?: string;
  macAddress?: string;
  ipAddress?: string;
  area: string;
}) {
  return request({
    url: '/api/computers',
    method: 'post',
    data
  });
}

/**
 * 获取计算机详情
 */
export function getComputer(id: number) {
  return request({
    url: `/api/computers/${id}`,
    method: 'get'
  });
}

/**
 * 更新计算机信息
 */
export function updateComputer(id: number, data: {
  name?: string;
  macAddress?: string;
  ipAddress?: string;
  area?: string;
  status?: number;
}) {
  return request({
    url: `/api/computers/${id}`,
    method: 'put',
    data
  });
}

/**
 * 删除计算机
 */
export function deleteComputer(id: number) {
  return request({
    url: `/api/computers/${id}`,
    method: 'delete'
  });
}

/**
 * 分页获取所有计算机
 */
export function getComputerList(params: {
  page?: number;
  size?: number;
  sortBy?: string;
  inUseBy?: number;
  area?: string;
}) {
  return request({
    url: '/api/computers',
    method: 'get',
    params
  });
}

// 区域查询接口
/**
 * 获取指定区域的计算机
 */
export function getComputersByArea(area: string) {
  return request({
    url: `/api/computers/area/${area}`,
    method: 'get'
  });
}

/**
 * 分页获取指定区域的计算机
 */
export function getComputersByAreaPaged(area: string, params: {
  page?: number;
  size?: number;
  sortBy?: string;
}) {
  return request({
    url: `/api/computers/area/${area}/page`,
    method: 'get',
    params
  });
}

/**
 * 统计各区域计算机数量
 */
export function getAreaCount() {
  return request({
    url: '/api/computers/area/count',
    method: 'get'
  });
}

// 状态查询接口
/**
 * 获取指定状态的计算机
 */
export function getComputersByStatus(status: number) {
  return request({
    url: `/api/computers/status/${status}`,
    method: 'get'
  });
}

/**
 * 获取空闲计算机
 */
export function getIdleComputers() {
  return request({
    url: '/api/computers/idle',
    method: 'get'
  });
}

/**
 * 获取使用中的计算机
 */
export function getInUseComputers() {
  return request({
    url: '/api/computers/in-use',
    method: 'get'
  });
}

/**
 * 获取维修中的计算机
 */
export function getMaintenanceComputers() {
  return request({
    url: '/api/computers/maintenance',
    method: 'get'
  });
}

/**
 * 获取关机的计算机
 */
export function getPowerOffComputers() {
  return request({
    url: '/api/computers/power-off',
    method: 'get'
  });
}

// 操作接口
/**
 * 开机
 */
export function powerOnComputer(id: number) {
  return request({
    url: `/api/computers/${id}/power-on`,
    method: 'post'
  });
}

/**
 * 关机
 */
export function powerOffComputer(id: number) {
  return request({
    url: `/api/computers/${id}/power-off`,
    method: 'post'
  });
}

/**
 * 开始使用计算机
 */
export function startUsingComputer(id: number) {
  return request({
    url: `/api/computers/${id}/start-using`,
    method: 'post'
  });
}

/**
 * 停止使用计算机
 */
export function stopUsingComputer(id: number) {
  return request({
    url: `/api/computers/${id}/stop-using`,
    method: 'post'
  });
}

/**
 * 设置为维修状态
 */
export function setMaintenanceComputer(id: number) {
  return request({
    url: `/api/computers/${id}/maintenance`,
    method: 'post'
  });
}

// 特殊查询接口
/**
 * 获取当前用户正在使用的计算机
 */
export function getCurrentUserComputer() {
  return request({
    url: '/api/computers/user/current',
    method: 'get'
  });
}

/**
 * 获取指定用户正在使用的计算机
 */
export function getUserComputer(userId: number) {
  return request({
    url: `/api/computers/user/${userId}`,
    method: 'get'
  });
}

// 获取计算机状态统计
export const getComputerStatusStats = async (): Promise<ComputerStatusStats> => {
  try {
    // 并行获取各种状态的计算机
    const [idleComputers, inUseComputers, maintenanceComputers, powerOffComputers] = await Promise.all([
      getIdleComputers(),
      getInUseComputers(),
      getMaintenanceComputers(),
      getPowerOffComputers()
    ]);

    // 计算统计数据
    const stats: ComputerStatusStats = {
      onlineCount: idleComputers.data.length + inUseComputers.data.length, // 在线 = 空闲 + 使用中
      busyCount: inUseComputers.data.length, // 使用中
      offlineCount: powerOffComputers.data.length, // 离线 = 关机
      maintenanceCount: maintenanceComputers.data.length // 维修中
    };

    return stats;
  } catch (error) {
    console.error('获取计算机状态统计失败:', error);
    return {
      onlineCount: 0,
      busyCount: 0,
      offlineCount: 0,
      maintenanceCount: 0
    };
  }
}

