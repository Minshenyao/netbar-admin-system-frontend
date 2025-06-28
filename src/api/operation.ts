import request from '../utils/request'

// 操作类型枚举
export enum OperationType {
  POWER_ON = 1,      // 开机
  POWER_OFF = 2,     // 关机
  START_USE = 3,     // 开始使用
  END_USE = 4,       // 结束使用
  SET_MAINTENANCE = 5, // 设为维修
  CANCEL_MAINTENANCE = 6 // 取消维修
}

// 操作记录接口
export interface OperationRecord {
  id: number
  user: {
    id: number
    username: string
  }
  computer: {
    id: number
    name: string
    area: string
  }
  operationType: OperationType
  startTime: number
  endTime: number | null
  duration: number | null
  cost: number | null
  remark?: string
  createdAt: number
  updatedAt: number
}

// 分页响应接口
export interface PageResponse<T> {
  content: T[]
  pageable: {
    sort: {
      sorted: boolean
      unsorted: boolean
      empty: boolean
    }
    pageNumber: number
    pageSize: number
    offset: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  totalElements: number
  last: boolean
  first: boolean
  sort: {
    sorted: boolean
    unsorted: boolean
    empty: boolean
  }
  size: number
  number: number
  numberOfElements: number
  empty: boolean
}

// 分页查询参数接口
export interface PageParams {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}

// 获取指定ID的操作记录
export const getOperationRecordById = (id: number) => {
  return request<OperationRecord>({
    url: `/api/operation-records/${id}`,
    method: 'get'
  })
}

// 获取当前用户的操作记录
export const getMyOperationRecords = (params?: PageParams) => {
  return request<PageResponse<OperationRecord>>({
    url: '/api/operation-records/my',
    method: 'get',
    params
  })
}

// 获取指定用户的操作记录
export const getUserOperationRecords = (userId: number, params?: PageParams) => {
  return request<PageResponse<OperationRecord>>({
    url: `/api/operation-records/user/${userId}`,
    method: 'get',
    params
  })
}

// 获取指定计算机的操作记录
export const getComputerOperationRecords = (computerId: number, params?: PageParams) => {
  return request<PageResponse<OperationRecord>>({
    url: `/api/operation-records/computer/${computerId}`,
    method: 'get',
    params
  })
}

// 获取指定用户在指定计算机上的操作记录
export const getUserComputerOperationRecords = (
  userId: number,
  computerId: number,
  params?: PageParams
) => {
  return request<PageResponse<OperationRecord>>({
    url: `/api/operation-records/user/${userId}/computer/${computerId}`,
    method: 'get',
    params
  })
}

// 获取所有操作记录（需要管理员权限）
export const getAllOperationRecords = (params?: PageParams) => {
  return request<PageResponse<OperationRecord>>({
    url: '/api/operation-records',
    method: 'get',
    params
  })
} 