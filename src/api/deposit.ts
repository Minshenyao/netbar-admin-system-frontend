import request from '../utils/request'

// 支付方式枚举
export enum PaymentMethod {
  CASH = 1,      // 现金
  ALIPAY = 2,    // 支付宝
  WECHAT = 3,    // 微信
  BANK_CARD = 4  // 银行卡
}

// 充值记录接口
export interface DepositRecord {
  id: number
  user: {
    id: number
    username: string
    identity?: string
    phone?: string
    balance?: number
    status?: number
    permission?: number
  }
  amount: number
  paymentMethod: PaymentMethod
  operatorId: number
  orderNumber: string
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

// 创建充值记录
export const createDepositRecord = (data: {
  userId: number
  amount: number
  paymentMethod: PaymentMethod
  remark?: string
}) => {
  return request({
    url: '/api/deposit-records',
    method: 'post',
    data
  })
}

// 获取指定ID的充值记录
export const getDepositRecordById = (id: number) => {
  return request({
    url: `/api/deposit-records/${id}`,
    method: 'get'
  })
}

// 获取当前用户的充值记录
export const getMyDepositRecords = (params?: {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}) => {
  return request<PageResponse<DepositRecord>>({
    url: '/api/deposit-records/my',
    method: 'get',
    params
  })
}

// 获取指定用户的充值记录
export const getUserDepositRecords = (userId: number, params?: {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}) => {
  return request<PageResponse<DepositRecord>>({
    url: `/api/deposit-records/user/${userId}`,
    method: 'get',
    params
  })
}

// 获取所有充值记录（需要管理员权限）
export const getAllDepositRecords = (params?: {
  page?: number
  size?: number
  sortBy?: string
  direction?: 'asc' | 'desc'
}) => {
  return request<PageResponse<DepositRecord>>({
    url: '/api/deposit-records',
    method: 'get',
    params
  })
} 