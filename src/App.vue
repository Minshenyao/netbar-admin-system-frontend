<template>
  <router-view />
</template>

<script setup lang="ts">
import { useUserStore } from './store/userStore'
import { onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

// 应用启动时获取用户信息
onMounted(async () => {
  // 如果有token，则获取用户信息
  if (userStore.token) {
    await userStore.fetchUserInfo()
    // 不再自动重定向用户
    // userStore.checkUserTypeAndRedirect()
  }
})

// 监听路由变化，在成功导航后重置重定向标记
watch(() => route.fullPath, () => {
  // 延迟重置，确保导航完成
  setTimeout(() => {
    sessionStorage.removeItem('hasRedirected')
  }, 500)
})

// 页面卸载时清除重定向标记
onBeforeUnmount(() => {
  // 当用户正常导航离开页面时，重置重定向标记
  sessionStorage.removeItem('hasRedirected')
})
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
  color: #2c3e50;
}

#app {
  min-height: 100vh;
}

/* 移除默认的滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
