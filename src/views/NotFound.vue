<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="error-code">404</h1>
      <p class="error-message">页面不存在</p>
      <el-button type="primary" @click="goHome">返回首页</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/dashboard')
}
</script>

<style scoped lang="scss">
.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 40px;
}

.not-found-content {
  text-align: center;
  padding: 60px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  backdrop-filter: blur(10px);
  max-width: 500px;
  
  .error-code {
    font-size: 120px;
    background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
    -webkit-background-clip: text;
    color: transparent;
    margin: 0;
    line-height: 1;
    font-weight: 700;
  }
  
  .error-message {
    font-size: 24px;
    color: #4b5563;
    margin: 20px 0 40px;
  }
}
</style> 