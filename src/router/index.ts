import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import AppLayout from '../components/layout/AppLayout.vue'
import { useUserStore } from '../store/userStore'

// 配置NProgress
NProgress.configure({ 
  easing: 'ease', 
  speed: 500, 
  showSpinner: false 
})

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { requiresAuth: false }
  },
  // 普通用户页面 - 独立于布局
  {
    path: '/common',
    name: 'Common',
    component: () => import('../views/common/index.vue'),
    meta: { 
      title: '用户中心', 
      requiresAuth: true,
      requiresNonAdmin: true // 添加此标记，表示需要非管理员权限
    }
  },
  {
    path: '/',
    component: AppLayout,
    // 移除重定向，完全依赖beforeEach中的处理
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/Dashboard.vue'),
        meta: { title: '首页', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'user',
        name: 'User',
        redirect: '/user/list',
        meta: { title: '用户管理', requiresAuth: true, requiresAdmin: true },
        children: [
          {
            path: 'list',
            name: 'UserList',
            component: () => import('../views/user/UserList.vue'),
            meta: { title: '用户列表', requiresAuth: true, requiresAdmin: true }
          },
          {
            path: 'roles',
            name: 'UserRoles',
            component: () => import('../views/user/UserRoles.vue'),
            meta: { title: '用户权限', requiresAuth: true, requiresAdmin: true }
          }
        ]
      },
      {
        path: 'computer',
        name: 'Computer',
        redirect: '/computer/list',
        meta: { title: '计算机管理', requiresAuth: true, requiresAdmin: true },
        children: [
          {
            path: 'list',
            name: 'ComputerList',
            component: () => import('../views/computer/ComputerList.vue'),
            meta: { title: '计算机列表', requiresAuth: true, requiresAdmin: true }
          },
          {
            path: 'area',
            name: 'ComputerArea',
            component: () => import('../views/computer/ComputerArea.vue'),
            meta: { title: '区域管理', requiresAuth: true, requiresAdmin: true }
          }
        ]
      },
      {
        path: 'recharge',
        name: 'Recharge',
        component: () => import('../views/recharge/RechargeList.vue'),
        meta: { title: '充值记录', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: 'operations',
        name: 'Operations',
        component: () => import('../views/operations/OperationsList.vue'),
        meta: { title: '操作记录', requiresAuth: true, requiresAdmin: true }
      },
      {
        path: ':pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: { title: '页面不存在' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 开始加载进度条
  NProgress.start()

  // 判断是否需要登录权限
  if (to.meta.requiresAuth !== false) {
    const userStore = useUserStore()
    
    // 如果没有token，直接跳转到登录页
    if (!userStore.isLoggedIn) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    // 如果有token但没有用户信息，先获取用户信息
    if (!userStore.userInfo) {
      try {
        await userStore.fetchUserInfo()
      } catch (error) {
        console.error('获取用户信息失败:', error)
        next({ path: '/login', query: { redirect: to.fullPath } })
        return
      }
    }

    // 处理根路径重定向
    if (to.path === '/') {
      if (userStore.isAdmin) {
        next({ path: '/dashboard', replace: true })
      } else {
        next({ path: '/common', replace: true })
      }
      return
    }

    // 判断是否需要管理员权限
    if (to.meta.requiresAdmin && !userStore.isAdmin) {
      next({ path: '/common', replace: true })
      return
    }
    
    // 判断是否需要非管理员权限（普通用户）
    if (to.meta.requiresNonAdmin && userStore.isAdmin) {
      next({ path: '/dashboard', replace: true })
      return
    }
  }
  
  next()
})

router.afterEach(() => {
  // 结束进度条
  NProgress.done()
})

export default router