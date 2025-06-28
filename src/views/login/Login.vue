<template>
  <div class="login-container">
    <div class="login-left">
      <div class="illustration-wrapper">
        <!-- 网吧场景 -->
        <div class="cybercafe-scene">
          <div class="desk-row">
            <div class="computer-desk" v-for="n in 3" :key="`row1-${n}`">
              <div class="monitor"></div>
              <div class="chair"></div>
            </div>
          </div>
          <div class="desk-row">
            <div class="computer-desk" v-for="n in 4" :key="`row2-${n}`">
              <div class="monitor"></div>
              <div class="chair"></div>
            </div>
          </div>
          <div class="desk-row">
            <div class="computer-desk" v-for="n in 5" :key="`row3-${n}`">
              <div class="monitor"></div>
              <div class="chair"></div>
            </div>
          </div>
        </div>
        
        <!-- 系统标题和功能介绍 -->
        <div class="system-title">网吧管理系统</div>
        <div class="system-subtitle">智能化网吧运营管理平台</div>
        
        <ul class="features-list">
          <li><el-icon class="feature-icon"><Monitor /></el-icon>机器状态实时监控</li>
          <li><el-icon class="feature-icon"><Timer /></el-icon>用户计时管理</li>
          <li><el-icon class="feature-icon"><Money /></el-icon>收费结算系统</li>
          <li><el-icon class="feature-icon"><DataAnalysis /></el-icon>数据统计分析</li>
        </ul>
      </div>
    </div>
    
    <div class="login-right">
      <div class="login-form-container">
        <div class="logo-container">
          <h1 class="title">
            <span class="typewriter"></span>
          </h1>
        </div>
        
        <div class="form-switch">
          <span 
            :class="['switch-item', { active: activeForm === 'login' }]"
            @click="switchForm('login')"
          >
            登录
          </span>
          <span 
            :class="['switch-item', { active: activeForm === 'register' }]"
            @click="switchForm('register')"
          >
            注册
          </span>
        </div>

        <!-- 登录表单 -->
        <el-form
          v-show="activeForm === 'login'"
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          :validate-on-rule-change="false"
          class="login-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入账号"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="captcha">
            <div class="captcha-container">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                clearable
              />
              <canvas 
                id="captchaCanvas" 
                width="120" 
                height="40" 
                class="captcha-image"
                @click="refreshCaptcha"
              ></canvas>
            </div>
          </el-form-item>
          
          <el-button type="primary" class="login-button" @click="handleLogin">登录</el-button>
      
        </el-form>

        <!-- 注册表单 -->
        <el-form
          v-show="activeForm === 'register'"
          ref="registerFormRef"
          :model="registerForm"
          :rules="registerRules"
          :validate-on-rule-change="false"
          class="register-form"
        >
          <el-form-item prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入账号"
              :prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请确认密码"
              :prefix-icon="Lock"
              show-password
              clearable
            />
          </el-form-item>

          <el-form-item prop="identity">
            <el-input
              v-model="registerForm.identity"
              placeholder="请输入身份证号"
              :prefix-icon="IdCard"
              clearable
            />
          </el-form-item>

          <el-form-item prop="phone">
            <el-input
              v-model="registerForm.phone"
              placeholder="请输入手机号"
              :prefix-icon="Phone"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="captcha">
            <div class="captcha-container">
              <el-input
                v-model="registerForm.captcha"
                placeholder="请输入验证码"
                :prefix-icon="Key"
                clearable
              />
              <canvas 
                id="registerCaptchaCanvas" 
                width="120" 
                height="40" 
                class="captcha-image"
                @click="refreshRegisterCaptcha"
              ></canvas>
            </div>
          </el-form-item>

          <el-button type="primary" class="register-button" @click="handleRegister">注册</el-button>
        </el-form>
        
        <div class="copyright">
          Copyright © 2020-{{ new Date().getFullYear() }} 网吧管理系统
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import { User, Lock, Key, Monitor, Timer, Money, DataAnalysis, Iphone as Phone, Collection as IdCard } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { generateCaptcha, drawCaptcha } from './utils/captcha'
import { Typewriter } from './utils/typewriter'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../../store/userStore'
import { getLoginRules, getRegisterRules } from './utils/rule'
import { login, register } from '../../api/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const loginFormRef = ref<FormInstance>()
const captchaText = ref('')
let typewriter: Typewriter

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
})

const activeForm = ref('login')
const registerFormRef = ref<FormInstance>()
const registerCaptchaText = ref('')

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  identity: '',
  phone: '',
  captcha: ''
})

// 使用导入的验证规则
const loginRules = computed(() => getLoginRules(captchaText.value))
const registerRules = computed(() => getRegisterRules(registerForm, registerCaptchaText.value))

const switchForm = (form: 'login' | 'register') => {
  activeForm.value = form
  if (form === 'register') {
    refreshRegisterCaptcha()
  } else {
    refreshCaptcha()
  }
}

// 刷新验证码
const refreshCaptcha = () => {
  captchaText.value = generateCaptcha()
}

// 刷新注册验证码
const refreshRegisterCaptcha = () => {
  registerCaptchaText.value = generateCaptcha()
}

// 监听验证码变化并重新绘制
watch(captchaText, () => {
  nextTick(() => {
    const canvas = document.getElementById('captchaCanvas') as HTMLCanvasElement
    if (canvas) {
      drawCaptcha(canvas, captchaText.value)
    }
  })
})

// 监听注册验证码变化并重新绘制
watch(registerCaptchaText, () => {
  nextTick(() => {
    const canvas = document.getElementById('registerCaptchaCanvas') as HTMLCanvasElement
    if (canvas) {
      drawCaptcha(canvas, registerCaptchaText.value)
    }
  })
})

onMounted(() => {
  refreshCaptcha()
  refreshRegisterCaptcha()
  // 初始化并启动打字机效果
  typewriter = new Typewriter('.typewriter', '网吧管理系统')
  typewriter.start()
})

const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        const result = await login({
          username: loginForm.username,
          password: loginForm.password,
        })
        
        // 保存token和用户信息
        userStore.setToken(result.token)
        userStore.setUserInfo(result.user)
        
        // 设置用户名到localStorage以便在重新加载时保持状态
        localStorage.setItem('userName', loginForm.username)
        console.log(userStore)
        ElMessage.success('登录成功')
        
        // 根据用户权限跳转到不同页面
        if (result.user.admin) {
          // 管理员跳转到管理页面
          router.push('/dashboard')
        } else {
          // 普通用户跳转到普通用户页面
          router.push('/common')
        }
      } catch (error: any) {
        ElMessage.error(error.message || '登录失败')
      }
    } else {
      // 获取第一个错误字段的第一个错误信息
      const firstField = Object.keys(fields || {})[0]
      const firstMessage = firstField ? fields![firstField][0].message : '请填写完整的登录信息'
      
      // 如果是验证码错误，自动刷新验证码
      if (firstField === 'captcha') {
        refreshCaptcha()
        loginForm.captcha = '' // 清空验证码输入
      }
      
      ElMessage.error(firstMessage)
    }
  })
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      try {
        await register({
          username: registerForm.username,
          password: registerForm.password,
          identity: registerForm.identity,
          phone: registerForm.phone
        })
        
        ElMessage.success('注册成功，请登录')
        switchForm('login')
      } catch (error: any) {
        ElMessage.error(error.message || '注册失败')
      }
    } else {
      // 获取第一个错误字段的第一个错误信息
      const firstField = Object.keys(fields || {})[0]
      const firstMessage = firstField ? fields![firstField][0].message : '请填写完整的注册信息'
      
      // 如果是验证码错误，自动刷新验证码
      if (firstField === 'captcha') {
        refreshRegisterCaptcha()
        registerForm.captcha = '' // 清空验证码输入
      }
      
      ElMessage.error(firstMessage)
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  /* 让左侧背景铺满整个页面 */
  background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 50%, #87ceeb 100%);
}

/* 添加动态背景效果 */
.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(135, 206, 235, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(95, 158, 160, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(70, 130, 180, 0.2) 0%, transparent 50%);
  animation: backgroundShift 15s ease-in-out infinite;
  z-index: 0;
}

@keyframes backgroundShift {
  0%, 100% { opacity: 1; }
  33% { opacity: 0.8; }
  66% { opacity: 0.9; }
}

.login-left {
  flex: 1.2;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1;
}

.illustration-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  z-index: 2;
  color: white;
}

.cybercafe-scene {
  position: relative;
  width: 100%;
  max-width: 500px;
  height: 350px;
  margin-bottom: 2rem;
  animation: float 6s ease-in-out infinite, fadeIn 1s ease-out forwards;
  opacity: 0;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateX(-30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0) translateX(0); 
  }
  25% { 
    transform: translateY(-8px) translateX(3px); 
  }
  75% { 
    transform: translateY(8px) translateX(-3px); 
  }
}

.desk-row {
  position: absolute;
  width: 100%;
  height: 70px;
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.desk-row:nth-child(1) { 
  top: 40px; 
  transform: scale(0.7); 
}
.desk-row:nth-child(2) { 
  top: 130px; 
  transform: scale(0.85); 
}
.desk-row:nth-child(3) { 
  top: 220px; 
  transform: scale(1); 
}

.computer-desk {
  position: relative;
  width: 50px;
  height: 40px;
  background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%);
  border-radius: 6px;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  animation: computerGlow 3s ease-in-out infinite alternate;
}

@keyframes computerGlow {
  0% { box-shadow: 0 3px 6px rgba(0,0,0,0.2), 0 0 0 rgba(135, 206, 235, 0); }
  100% { box-shadow: 0 3px 6px rgba(0,0,0,0.2), 0 0 12px rgba(135, 206, 235, 0.6); }
}

.monitor {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 24px;
  background: linear-gradient(145deg, #2c3e50 0%, #34495e 100%);
  border-radius: 3px;
  border: 1px solid #ecf0f1;
}

.monitor::before {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
  border-radius: 2px;
  animation: screenFlicker 4s ease-in-out infinite;
}

@keyframes screenFlicker {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.chair {
  position: absolute;
  bottom: -12px;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 12px;
  background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
  border-radius: 10px;
}

.system-title {
  font-size: 2.2rem;
  font-weight: bold;
  text-align: center;
  margin-bottom: 0.8rem;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  background: linear-gradient(135deg, #ffffff 0%, #e6f3ff 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.system-subtitle {
  font-size: 1.1rem;
  text-align: center;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
  margin-bottom: 1.5rem;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
  max-width: 280px;
}

.features-list li {
  font-size: 0.95rem;
  margin: 1rem 0;
  opacity: 0.85;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  animation: slideInLeft 0.6s ease-out forwards;
  animation-delay: calc(var(--index) * 0.2s);
}

.features-list li:nth-child(1) { --index: 0; }
.features-list li:nth-child(2) { --index: 1; }
.features-list li:nth-child(3) { --index: 2; }
.features-list li:nth-child(4) { --index: 3; }

@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 0.85;
    transform: translateX(0);
  }
}

.feature-icon {
  font-size: 16px;
  color: #87ceeb;
  min-width: 16px;
}

.login-right {
  flex: 0.8;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 1;
  background: transparent;
}

.login-form-container {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
  /* 增强玻璃形态效果 */
  background: rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.15),
    inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  animation: formAppear 0.8s ease-out;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes formAppear {
  0% {
    opacity: 0;
    transform: translateX(30px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

.login-form-container:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.5);
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
  transform: translateY(0);
  transition: transform 0.5s ease;
}

.title {
  font-size: 28px;
  color: #fff;
  margin-top: 16px;
  font-weight: 600;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.typewriter {
  border-right: 2px solid #fff;
  animation: blink 0.75s step-end infinite;
  padding-right: 4px;
}

@keyframes blink {
  from, to { border-color: transparent }
  50% { border-color: #fff }
}

.login-form, .register-form {
  width: 80%;
  margin: 0 auto;
  animation: fadeIn 0.5s ease;
}

.el-form-item {
  margin-bottom: 25px;
}

.captcha-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.captcha-container .el-input {
  flex: 1;
}

.captcha-image {
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.captcha-image:hover {
  transform: scale(1.05);
}

.login-button, .register-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  margin: 20px 0;
  border-radius: 22px;
  font-weight: 600;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.3) 100%);
  border: 1px solid rgba(255, 255, 255, 0.4);
  color: white;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.login-button:hover, .register-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.2);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0.4) 100%);
}

.form-switch {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  gap: 30px;
}

.switch-item {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.switch-item.active {
  color: #fff;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
}

.switch-item.active::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 3px;
  background: #fff;
  border-radius: 3px;
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.copyright {
  text-align: center;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  opacity: 0.7;
  margin-top: 30px;
}

.el-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(8px);
  transition: all 0.3s ease;
}

.el-input :deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateX(2px);
}

.el-input :deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(70, 130, 180, 0.3);
  transform: translateX(4px);
}

.el-input :deep(.el-input__inner) {
  color: white;
  font-weight: 500;
}

.el-input :deep(.el-input__inner::placeholder) {
  color: rgba(255, 255, 255, 0.7);
}

.el-input :deep(.el-icon) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
}

@media (max-width: 1200px) {
  .login-left {
    display: none;
  }

  .login-right {
    flex: 1;
    margin-left: 0;
    padding: 2rem;
  }

  .login-form-container {
    background: rgba(255, 255, 255, 0.9);
    animation: mobileFormAppear 0.8s ease-out;
  }

  .title {
    color: #4682b4;
  }

  .typewriter {
    border-right-color: #4682b4;
  }

  .switch-item {
    color: #666;
  }

  .switch-item.active {
    color: #4682b4;
    background: rgba(70, 130, 180, 0.1);
  }

  .switch-item.active::after {
    background: #4682b4;
  }

  .copyright {
    color: #666;
  }

  .login-button, .register-button {
    background: linear-gradient(135deg, #4682b4 0%, #5f9ea0 100%);
    color: white;
    border: none;
  }

  .login-button:hover, .register-button:hover {
    background: linear-gradient(135deg, #5a8bb8 0%, #6ba8ab 100%);
  }

  .el-input :deep(.el-input__wrapper) {
    background: rgba(70, 130, 180, 0.1);
    border: 1px solid rgba(70, 130, 180, 0.2);
  }

  .el-input :deep(.el-input__wrapper:hover) {
    background: rgba(70, 130, 180, 0.15);
    border-color: rgba(70, 130, 180, 0.3);
  }

  .el-input :deep(.el-input__wrapper.is-focus) {
    background: rgba(70, 130, 180, 0.2);
    border-color: rgba(70, 130, 180, 0.4);
  }

  .el-input :deep(.el-input__inner) {
    color: #2c3e50;
  }

  .el-input :deep(.el-input__inner::placeholder) {
    color: rgba(70, 130, 180, 0.6);
  }

  .el-input :deep(.el-icon) {
    color: rgba(70, 130, 180, 0.7);
  }

  @keyframes mobileFormAppear {
    0% {
      opacity: 0;
      transform: translateY(30px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

@media (max-width: 500px) {
  .login-right {
    padding: 20px;
  }

  .login-form-container {
    padding: 20px;
  }

  .title {
    font-size: 24px;
  }
}
</style> 