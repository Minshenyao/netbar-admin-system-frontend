<template>
  <div class="layout-container">
    <!-- 侧边栏 -->
    <aside :class="['sidebar', { collapsed: isCollapse }]" @mouseenter="handleSidebarHover(true)" @mouseleave="handleSidebarHover(false)">
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <transition name="fade-slide">
            <h2 v-show="!isCollapse || isHovered" class="logo-title">
              网吧管理系统
            </h2>
          </transition>
        </div>
        <el-button
          class="collapse-btn"
          circle
          size="small"
          @click="toggleSidebar"
        >
          <el-icon>
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </el-button>
      </div>

      <nav class="sidebar-nav">
        <el-menu
          :default-active="activeRoute"
          :collapse="isCollapse && !isHovered"
          :collapse-transition="false"
          class="sidebar-menu"
          router
          background-color="transparent"
          text-color="#2c3e50"
          active-text-color="#4682b4"
          unique-opened
        >
          <!-- 普通用户和管理员都可见的菜单项 -->
          <el-menu-item v-if="userStore.isAdmin" index="/dashboard" :class="['menu-item', shouldAnimate ? 'animate-delay-0' : '']">
            <el-icon class="menu-icon"><HomeFilled /></el-icon>
            <span class="menu-title">首页</span>
          </el-menu-item>

          <!-- 普通用户菜单项 -->
          <el-menu-item v-if="!userStore.isAdmin" index="/common" :class="['menu-item', shouldAnimate ? 'animate-delay-0' : '']">
            <el-icon class="menu-icon"><HomeFilled /></el-icon>
            <span class="menu-title">用户中心</span>
          </el-menu-item>

          <!-- 仅管理员可见的菜单项 -->
          <template v-if="userStore.isAdmin">
            <el-sub-menu index="/user" :class="['menu-item', shouldAnimate ? 'animate-delay-1' : '']">
              <template #title>
                <el-icon class="menu-icon"><UserFilled /></el-icon>
                <span class="menu-title">用户管理</span>
              </template>
              <el-menu-item index="/user/list">用户列表</el-menu-item>
              <el-menu-item index="/user/roles">用户权限</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="/computer" :class="['menu-item', shouldAnimate ? 'animate-delay-2' : '']">
              <template #title>
                <el-icon class="menu-icon"><Monitor /></el-icon>
                <span class="menu-title">计算机管理</span>
              </template>
              <el-menu-item index="/computer/list">计算机列表</el-menu-item>
              <el-menu-item index="/computer/area">区域管理</el-menu-item>
            </el-sub-menu>
            
            <el-sub-menu index="/recharge" :class="['menu-item', shouldAnimate ? 'animate-delay-3' : '']">
              <template #title>
              <el-icon class="menu-icon"><Money /></el-icon>
              <span class="menu-title">充值管理</span>
            </template>
              <el-menu-item index="/recharge">充值记录</el-menu-item>
              <!-- <el-menu-item index="/recharge/operations">操作记录</el-menu-item> -->
            </el-sub-menu>
            
            <el-sub-menu index="/operations" :class="['menu-item', shouldAnimate ? 'animate-delay-4' : '']">
              <template #title>
              <el-icon class="menu-icon"><Document /></el-icon>
              <span class="menu-title">操作管理</span>
            </template>
              <el-menu-item index="/operations">操作记录</el-menu-item>
              <!-- <el-menu-item index="/operations/operations">操作记录</el-menu-item> -->
            </el-sub-menu>
          </template>
        </el-menu>
      </nav>

      <!-- 侧边栏底部用户信息 -->
      <div class="sidebar-footer">
        <div class="user-info">
          <el-avatar
            :size="isCollapse && !isHovered ? 32 : 35"
            class="user-avatar"
          >
            <el-icon><User /></el-icon>
          </el-avatar>
          <transition name="fade-slide">
            <div v-show="!isCollapse || isHovered" class="user-details">
              <div class="user-name">{{ username }}</div>
              <div class="user-role">{{ userStore.permissionName }}</div>
            </div>
          </transition>
          <transition name="fade">
            <el-tooltip
              v-if="!isCollapse || isHovered"
              content="退出登录"
              placement="top"
            >
              <el-button
                type="danger"
                :icon="SwitchButton"
                circle
                size="small"
                class="logout-btn"
                @click="handleLogout"
              />
            </el-tooltip>
          </transition>
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="main-content">
      <!-- 顶部导航栏 -->
      <header class="main-header">
        <!-- 面包屑导航 -->
        <div class="breadcrumb-wrapper">
          <el-breadcrumb separator="/" class="breadcrumb">
            <transition-group
              name="breadcrumb-item"
              tag="div"
              class="breadcrumb-container"
            >
              <el-breadcrumb-item
                v-for="(item, index) in breadcrumbs"
                :key="item.path"
                :class="{
                  'breadcrumb-current': index === breadcrumbs.length - 1,
                }"
                :style="{ '--delay': index * 0.1 + 's' }"
                :to="item.path"
              >
                <el-icon v-if="index === 0" class="breadcrumb-icon">
                  <HomeFilled />
                </el-icon>
                {{ item.name }}
              </el-breadcrumb-item>
            </transition-group>
          </el-breadcrumb>
          <div class="breadcrumb-actions">
            <el-button circle size="small" class="action-btn" @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </div>
        </div>

        <!-- 状态指示器 -->
        <div v-if="userStore.isAdmin" class="status-indicators">
          <div class="status-item" title="空闲和使用中的计算机总数">
            <div class="status-dot online"></div>
            <span>在线机器: {{ statusData.onlineCount }}</span>
          </div>
          <div class="status-item" title="当前正在使用的计算机数量">
            <div class="status-dot busy"></div>
            <span>使用中: {{ statusData.busyCount }}</span>
          </div>
          <div class="status-item" title="维修中的计算机数量">
            <div class="status-dot maintenance"></div>
            <span>维修中: {{ statusData.maintenanceCount }}</span>
          </div>
          <div class="status-item" title="关机的计算机数量">
            <div class="status-dot offline"></div>
            <span>离线: {{ statusData.offlineCount }}</span>
          </div>
        </div>

        <!-- 普通用户状态指示器 -->
        <div v-else class="status-indicators">
          <div class="status-item" title="当前登录的用户名">
            <div class="status-dot online"></div>
            <span>用户: {{ username }}</span>
          </div>
          <div class="status-item" title="当前用户余额">
            <div class="status-dot busy"></div>
            <span>余额: ¥{{ userStore.balance.toFixed(2) }}</span>
          </div>
        </div>

        <!-- 时间显示 -->
        <div class="time-display">
          <div class="current-time">{{ currentTime }}</div>
          <div class="current-date">{{ currentDate }}</div>
        </div>
      </header>

      <!-- 内容区域 -->
      <div class="content-wrapper">
        <transition name="page" mode="out-in">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </transition>
      </div>
    </main>

    <!-- 浮动操作按钮 -->
    <div class="floating-actions">
      <el-button
        type="primary"
        circle
        size="large"
        class="floating-btn"
        @click="showQuickActions = !showQuickActions"
      >
        <el-icon><Plus /></el-icon>
      </el-button>

      <transition name="quick-actions">
        <div v-show="showQuickActions" class="quick-actions">
          <!-- 管理员快捷操作 -->
          <template v-if="userStore.isAdmin">
            <el-button circle class="quick-action-btn" title="添加用户" @click="goToAddUser">
              <el-icon><UserFilled /></el-icon>
            </el-button>
            <el-button circle class="quick-action-btn" title="开通机器" @click="goToComputers">
              <el-icon><Monitor /></el-icon>
            </el-button>
            <el-button circle class="quick-action-btn" title="充值" @click="goToRecharge">
              <el-icon><Money /></el-icon>
            </el-button>
          </template>
          
          <!-- 普通用户快捷操作 -->
          <template v-else>
            <el-button circle class="quick-action-btn" title="上机" @click="goToUserCenter">
              <el-icon><Monitor /></el-icon>
            </el-button>
            <el-button circle class="quick-action-btn" title="充值" @click="goToUserCenter">
              <el-icon><Money /></el-icon>
            </el-button>
          </template>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
  UserFilled, 
  Monitor, 
  Money, 
  Document, 
  HomeFilled,
  Refresh,
  User,
  Plus,
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '../../store/userStore'
import { logout } from '../../api/user'
import { ElMessageBox } from 'element-plus'
import { getComputerStatusStats, type ComputerStatusStats } from '../../api/computer'

const isCollapse = ref(false)
const isHovered = ref(false)
const shouldAnimate = ref(false)
const showQuickActions = ref(false)
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 时间相关
const currentTime = ref("")
const currentDate = ref("")
let timeInterval: ReturnType<typeof setInterval>

// 获取用户信息
const username = computed(() => userStore.username || '管理员')

// 状态数据
const statusData = reactive<ComputerStatusStats>({
  onlineCount: 0,
  busyCount: 0,
  offlineCount: 0,
  maintenanceCount: 0,
})

// 获取计算机状态统计
const fetchComputerStats = async () => {
  try {
    const stats = await getComputerStatusStats()
    Object.assign(statusData, stats)
  } catch (error) {
    console.error('获取计算机状态统计失败:', error)
  }
}

// 页面挂载时获取用户信息
onMounted(async () => {
  if (userStore.isLoggedIn && !userStore.userInfo) {
    await userStore.fetchUserInfo()
  }
  
  // 初始动画
  setTimeout(() => {
    shouldAnimate.value = true
    setTimeout(() => {
      shouldAnimate.value = false
    }, 1000)
  }, 300)
  
  // 开始时间更新
  updateTime()
  timeInterval = setInterval(updateTime, 1000)

  // 获取计算机状态统计
  await fetchComputerStats()
  // 每30秒更新一次状态统计
  const statsInterval = setInterval(fetchComputerStats, 30000)

  onUnmounted(() => {
    if (timeInterval) {
      clearInterval(timeInterval)
    }
    if (statsInterval) {
      clearInterval(statsInterval)
    }
  })
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString("zh-CN", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  currentDate.value = now.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

// 侧边栏折叠控制
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
  shouldAnimate.value = true
  setTimeout(() => {
    shouldAnimate.value = false
  }, 600)
}

// 侧边栏悬停
const handleSidebarHover = (hover: boolean) => {
  // 只在移动设备上启用悬停展开功能
  if (window.innerWidth <= 768 && isCollapse.value) {
    isHovered.value = hover
  } else {
    // 在桌面设备上禁用悬停展开功能
    isHovered.value = false
  }
}

// 刷新页面
const handleRefresh = async () => {
  await fetchComputerStats()
  window.location.reload()
}

// 当前激活的路由
const activeRoute = computed(() => route.path)

// 面包屑导航
const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  const result = [{ name: '首页', path: '/' }]
  
  let currentPath = ''
  paths.forEach(path => {
    currentPath += `/${path}`
    
    // 根据路径映射显示名称
    let name = path
    if (path === 'dashboard') name = '首页'
    else if (path === 'user') name = '用户管理'
    else if (path === 'list' && paths.includes('user')) name = '用户列表'
    else if (path === 'roles') name = '用户权限'
    else if (path === 'computer') name = '计算机管理'
    else if (path === 'list' && paths.includes('computer')) name = '计算机列表'
    else if (path === 'area') name = '区域管理'
    else if (path === 'recharge') name = '充值记录'
    else if (path === 'operations') name = '操作记录'
    
    result.push({ name, path: currentPath })
  })
  
  return result
})

// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗?',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    // 确认后调用API登出
    await logout()
    
    // 清除本地状态
    userStore.logout()
    router.push('/login')
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消退出，不做任何操作
      return
    }
    console.error('登出失败', error)
  }
}

// 快捷操作
const goToAddUser = () => {
  router.push('/user/list')
  showQuickActions.value = false
}

const goToComputers = () => {
  router.push('/computer/list')
  showQuickActions.value = false
}

const goToRecharge = () => {
  router.push('/recharge')
  showQuickActions.value = false
}

const goToUserCenter = () => {
  router.push('/common')
  showQuickActions.value = false
}
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 260px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.95) 0%,
    rgba(255, 255, 255, 0.9) 100%
  );
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.sidebar.collapsed {
  width: 64px;
  overflow: visible;
}

.sidebar::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(70, 130, 180, 0.05) 0%,
    rgba(95, 158, 160, 0.05) 100%
  );
  pointer-events: none;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  z-index: 1;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(70, 130, 180, 0.3);
  animation: logoGlow 3s ease-in-out infinite alternate;
  flex-shrink: 0;
}

@keyframes logoGlow {
  0% {
    box-shadow: 0 4px 12px rgba(70, 130, 180, 0.3);
  }
  100% {
    box-shadow: 0 6px 20px rgba(70, 130, 180, 0.5);
  }
}

.logo-title {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  white-space: nowrap;
}

.collapse-btn {
  background: rgba(70, 130, 180, 0.1);
  border: 1px solid rgba(70, 130, 180, 0.2);
  color: #4682b4;
  transition: all 0.3s ease;
}

.collapse-btn:hover {
  background: rgba(70, 130, 180, 0.2);
  transform: scale(1.1);
}

.sidebar-nav {
  flex: 1;
  padding: 10px 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.sidebar-menu {
  border: none;
  background: transparent;
  width: 100%;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateX(-20px);
  animation: slideInMenu 0.6s ease forwards;
}

.menu-item.animate-delay-0 {
  animation-delay: 0.1s;
}
.menu-item.animate-delay-1 {
  animation-delay: 0.2s;
}
.menu-item.animate-delay-2 {
  animation-delay: 0.3s;
}
.menu-item.animate-delay-3 {
  animation-delay: 0.4s;
}
.menu-item.animate-delay-4 {
  animation-delay: 0.5s;
}

@keyframes slideInMenu {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.sidebar-menu :deep(.el-menu) {
  padding: 0;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  border-radius: 12px;
  margin: 2px 0;
  padding: 0 20px !important;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  text-align: left;
  box-sizing: border-box;
}

.sidebar.collapsed .sidebar-menu :deep(.el-menu--collapse) {
  width: 64px;
  border-right: none;
}

.sidebar.collapsed .sidebar-menu :deep(.el-menu-item),
.sidebar.collapsed .sidebar-menu :deep(.el-sub-menu__title) {
  padding: 0 !important;
  justify-content: center;
}

.sidebar.collapsed .menu-icon {
  margin: 0 auto;
}

.sidebar.collapsed .menu-title {
  display: none;
}

.sidebar.collapsed .sidebar-menu :deep(.el-sub-menu.is-opened .el-sub-menu__title) {
  background-color: rgba(70, 130, 180, 0.1);
}

.sidebar.collapsed .sidebar-menu :deep(.el-menu--popup) {
  margin-left: 5px;
}

.el-menu--vertical:not(.el-menu--collapse) {
  min-width: 200px;
  border-radius: 4px;
  padding: 5px 0;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: linear-gradient(135deg, rgba(70, 130, 180, 0.1) 0%, rgba(95, 158, 160, 0.1) 100%);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(70, 130, 180, 0.3);
}

.sidebar-menu :deep(.el-menu-item.is-active .menu-icon),
.sidebar-menu :deep(.el-menu-item.is-active .menu-title) {
  color: white;
}

.sidebar-menu :deep(.el-sub-menu) {
  overflow: visible;
}

.sidebar-menu :deep(.el-sub-menu__title) {
  color: #2c3e50;
}

.sidebar-menu :deep(.el-sub-menu.is-active > .el-sub-menu__title) {
  color: #4682b4;
}

.sidebar-menu :deep(.el-menu--popup) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  min-width: 180px;
}

.sidebar-menu :deep(.el-menu--popup .el-menu-item) {
  height: 40px;
  line-height: 40px;
  margin: 4px;
  padding: 0 20px !important;
  border-radius: 8px;
  display: flex;
  align-items: center;
}

.sidebar-menu :deep(.el-menu--popup .el-menu-item:hover) {
  background: rgba(70, 130, 180, 0.1);
}

.sidebar-menu :deep(.el-menu--popup .el-menu-item.is-active) {
  background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(70, 130, 180, 0.3);
}

.menu-icon {
  font-size: 18px;
  margin-right: 12px;
  color: #4682b4;
  transition: all 0.3s ease;
  vertical-align: middle;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.menu-title {
  font-size: 14px;
  font-weight: 500;
  color: #2c3e50;
  transition: all 0.3s ease;
  vertical-align: middle;
  white-space: nowrap;
}

.sidebar-footer {
  padding: 10px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
}

.sidebar.collapsed .sidebar-footer {
  padding: 10px 0;
  display: flex;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(70, 130, 180, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  position: relative;
}

.sidebar.collapsed .user-info {
  width: 44px;
  height: 44px;
  padding: 0;
  justify-content: center;
  border-radius: 50%;
}

.sidebar.collapsed .user-details {
  display: none;
}

.logout-btn {
  position: absolute;
  right: 10px;
  color: #f56c6c;
  transition: all 0.3s ease;
  opacity: 0.8;
  font-size: 16px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  background-color: #f56c6c;
  color: white;
}

.user-avatar {
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
  border-radius: 50%;
}

.sidebar.collapsed .user-avatar {
  margin: 0;
}

.user-details {
  overflow: hidden;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: #7f8c8d;
}

/* 主内容区样式 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.main-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  position: relative;
  z-index: 10;
  animation: headerSlideDown 0.6s ease;
}

@keyframes headerSlideDown {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.breadcrumb-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.breadcrumb-container {
  display: flex;
  align-items: center;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-icon {
  font-size: 14px;
  color: #4682b4;
}

.breadcrumb-current {
  font-weight: 600;
  color: #2c3e50;
}

.breadcrumb-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: rgba(70, 130, 180, 0.1);
  border: 1px solid rgba(70, 130, 180, 0.2);
  color: #4682b4;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: rgba(70, 130, 180, 0.2);
  transform: scale(1.1);
}

.status-indicators {
  display: flex;
  gap: 16px;
  animation: fadeIn 0.6s ease;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  transition: all 0.3s ease;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(4px);
  cursor: help;
}

.status-item:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.status-dot.online {
  background: #67c23a;
  box-shadow: 0 0 8px rgba(103, 194, 58, 0.4);
}

.status-dot.busy {
  background: #e6a23c;
  box-shadow: 0 0 8px rgba(230, 162, 60, 0.4);
}

.status-dot.offline {
  background: #f56c6c;
  box-shadow: 0 0 8px rgba(245, 108, 108, 0.4);
}

.status-dot.maintenance {
  background: #909399;
  box-shadow: 0 0 8px rgba(144, 147, 153, 0.4);
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.8);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.time-display {
  text-align: right;
  color: #2c3e50;
}

.current-time {
  font-size: 18px;
  font-weight: 600;
  font-family: "Courier New", monospace;
}

.current-date {
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 2px;
}

.content-wrapper {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background: transparent;
}

/* 浮动操作按钮 */
.floating-actions {
  position: fixed;
  bottom: 30px;
  right: 30px;
  z-index: 1000;
}

.floating-btn {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
  border: none;
  box-shadow: 0 6px 20px rgba(70, 130, 180, 0.4);
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.floating-btn:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 0 8px 25px rgba(70, 130, 180, 0.5);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.quick-actions {
  position: absolute;
  bottom: 70px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.quick-action-btn {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(70, 130, 180, 0.2);
  color: #4682b4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.quick-action-btn:hover {
  background: rgba(70, 130, 180, 0.1);
  transform: scale(1.1);
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.breadcrumb-item-enter-active {
  animation: breadcrumbSlide 0.4s ease;
  animation-delay: var(--delay);
}

.breadcrumb-item-leave-active {
  animation: breadcrumbSlide 0.4s ease reverse;
}

@keyframes breadcrumbSlide {
  0% {
    opacity: 0;
    transform: translateX(-10px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.quick-actions-enter-active {
  animation: quickActionsSlide 0.4s ease;
}

.quick-actions-leave-active {
  animation: quickActionsSlide 0.4s ease reverse;
}

@keyframes quickActionsSlide {
  0% {
    opacity: 0;
    transform: translateY(20px) scale(0.8);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.page-enter-active,
.page-leave-active {
  transition: all 0.4s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(-100%);
  }

  .sidebar.collapsed {
    width: 260px;
    transform: translateX(0);
  }

  .main-content {
    margin-left: 0;
  }

  .main-header {
    padding: 12px 16px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .status-indicators {
    display: none;
  }

  .time-display {
    display: none;
  }

  .floating-actions {
    bottom: 20px;
    right: 20px;
  }
}

/* 添加淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 