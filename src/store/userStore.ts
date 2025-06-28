import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getUserInfo } from '../api/user'
import type { UserInfo } from '../api/user'

// 用户权限名称映射
const PERMISSION_NAMES: Record<number, string> = {
  99: '系统管理员',
  0: '普通用户',
  1: '包月用户',
  2: '包年用户',
  3: 'VIP用户'
}

export const useUserStore = defineStore('user', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => userInfo.value?.admin === true)
  const username = computed(() => userInfo.value?.username || '')
  const permissionName = computed(() => {
    const permission = userInfo.value?.permission
    return permission !== undefined ? PERMISSION_NAMES[permission] || '未知' : ''
  })
  const balance = computed(() => userInfo.value?.balance || 0)

  // Actions
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: UserInfo) {
    userInfo.value = info
  }

  function logout() {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
  }

  async function fetchUserInfo() {
    try {
      if (!token.value) return null
      
      // 调用API获取用户信息
      const data = await getUserInfo()
      setUserInfo(data)
      return data
    } catch (error) {
      console.error('获取用户信息失败', error)
      logout() // 如果获取用户信息失败，清除登录状态
      return null
    }
  }

  return {
    // State
    token,
    userInfo,
    
    // Getters
    isLoggedIn,
    isAdmin,
    username,
    permissionName,
    balance,
    
    // Actions
    setToken,
    setUserInfo,
    logout,
    fetchUserInfo
  }
}) 