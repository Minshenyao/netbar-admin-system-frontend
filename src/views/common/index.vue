<template>
  <div class="normal-user-container">
    <!-- 顶部导航栏 -->
    <div class="top-navbar">
      <div class="logo">
        <el-icon class="logo-icon"><Monitor /></el-icon>
        <h1 class="logo-text">网吧管理系统</h1>
      </div>
      <div class="nav-actions">
        <span class="welcome-text">欢迎回来，{{ userInfo?.username }}</span>
        <el-button type="danger" @click="handleLogout" :icon="SwitchButton" size="small">
          退出登录
        </el-button>
      </div>
    </div>

    <!-- 顶部信息栏 -->
    <div class="dashboard-header">
      <div class="user-info">
        <el-avatar :size="60" class="user-avatar">
          {{ userInfo?.username?.charAt(0)?.toUpperCase() }}
        </el-avatar>
        <div class="user-details">
          <h2>{{ userInfo?.username }}</h2>
          <div class="user-meta">
            <span class="user-permission">
              <el-tag size="small" effect="dark" type="success">{{ userInfo?.permission === 99 ? '管理员' : '普通用户' }}</el-tag>
            </span>
            <span class="user-balance">
              <el-icon><Wallet /></el-icon>
              余额: ¥{{ (userInfo?.balance || 0).toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 快捷操作按钮 -->
      <div class="header-actions">
        <el-button type="primary" @click="depositDialogVisible = true">
          <el-icon><Document /></el-icon> 充值记录
        </el-button>
        <el-button type="info" @click="operationDialogVisible = true">
          <el-icon><Operation /></el-icon> 上机记录
        </el-button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="dashboard-content">
      <!-- 左侧主要内容 -->
      <div class="main-panel">
        <!-- 上机状态卡片 -->
        <el-card class="status-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon><Monitor /></el-icon> 上机状态</h3>
            </div>
          </template>
          
          <div v-if="currentComputer" class="using-computer">
            <div class="computer-info">
              <h4>当前使用机器: {{ currentComputer.name }}</h4>
              <div class="computer-details">
                <div class="detail-item">
                  <span class="detail-label">状态:</span>
                  <el-tag type="success">使用中</el-tag>
                </div>
                <div class="detail-item">
                  <span class="detail-label">开始时间:</span>
                  <span>{{ formatTime(currentComputer.startTime || undefined) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">已使用:</span>
                  <span class="usage-time">{{ formatDuration(usageDuration) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">区域:</span>
                  <span>{{ currentComputer.area }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">IP地址:</span>
                  <span>{{ currentComputer.ipAddress }}</span>
                </div>
              </div>
            </div>
            <div class="computer-actions">
              <el-button type="danger" size="large" @click="handleStopUsing">
                <el-icon><CircleClose /></el-icon> 下机
              </el-button>
            </div>
          </div>
          
          <div v-else class="no-computer">
            <el-empty description="当前未上机">
              <el-button type="primary" size="large" @click="handleStartUsing" :disabled="(userInfo?.balance || 0) < 0">
                <el-icon><CircleCheck /></el-icon> 开始上机
              </el-button>
              <p v-if="(userInfo?.balance || 0) < 0" class="balance-warning">
                余额不足，请先充值
              </p>
            </el-empty>
          </div>
        </el-card>
      </div>
      
      <!-- 右侧边栏 -->
      <div class="side-panel">
        <!-- 账户充值卡片 -->
        <el-card class="recharge-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon><Wallet /></el-icon> 账户充值</h3>
            </div>
          </template>
          
          <div class="recharge-form">
            <el-form :model="rechargeForm" label-width="80px">
              <el-form-item label="充值金额">
                <el-input-number 
                  v-model="rechargeForm.amount" 
                  :min="10" 
                  :max="1000" 
                  :step="10"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="支付方式">
                <el-radio-group v-model="rechargeForm.paymentMethod">
                  <el-radio :label="1">支付宝</el-radio>
                  <el-radio :label="2">微信</el-radio>
                  <el-radio :label="3">现金</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleRecharge" style="width: 100%">
                  确认充值
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
        
        <!-- 快捷操作卡片 -->
        <el-card class="quick-actions-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <h3><el-icon><Operation /></el-icon> 快捷操作</h3>
            </div>
          </template>
          
          <div class="quick-actions">
            <el-button type="primary" @click="handleStartUsing" :disabled="currentComputer || (userInfo?.balance || 0) < 10">
              <el-icon><Monitor /></el-icon> 上机
            </el-button>
            <el-button type="danger" @click="handleStopUsing" :disabled="!currentComputer">
              <el-icon><CircleClose /></el-icon> 下机
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
    
    <!-- 选择机器对话框 -->
    <el-dialog v-model="computerDialogVisible" title="选择机器" width="700px">
      <div v-loading="computersLoading">
        <el-tabs v-model="activeArea" @tab-click="handleAreaChange">
          <el-tab-pane v-for="area in areas" :key="area" :label="area" :name="area">
            <div class="computers-grid">
              <div 
                v-for="computer in filteredComputers" 
                :key="computer.id" 
                class="computer-item"
                :class="{
                  'computer-idle': computer.idle,
                  'computer-in-use': computer.inUse,
                  'computer-maintenance': computer.underMaintenance,
                  'computer-off': computer.powerOff,
                  'computer-selected': selectedComputer && selectedComputer.id === computer.id
                }"
                @click="selectComputer(computer)"
              >
                <div class="computer-icon">
                  <el-icon v-if="computer.idle"><Monitor /></el-icon>
                  <el-icon v-else-if="computer.inUse"><VideoPlay /></el-icon>
                  <el-icon v-else-if="computer.underMaintenance"><Tools /></el-icon>
                  <el-icon v-else-if="computer.powerOff"><TurnOff /></el-icon>
                </div>
                <div class="computer-name">{{ computer.name }}</div>
                <div class="computer-status">
                  <el-tag 
                    :type="computer.idle ? 'success' : computer.inUse ? 'warning' : computer.underMaintenance ? 'danger' : 'info'"
                    size="small"
                  >
                    {{ 
                      computer.idle ? '空闲' : 
                      computer.inUse ? '使用中' : 
                      computer.underMaintenance ? '维修中' : 
                      '关机' 
                    }}
                  </el-tag>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="computerDialogVisible = false">取消</el-button>
        <el-button 
          type="primary" 
          @click="confirmSelectComputer"
          :disabled="!selectedComputer || !selectedComputer.idle"
        >
          确认选择
        </el-button>
      </template>
    </el-dialog>
    
    <!-- 充值记录对话框 -->
    <el-dialog v-model="depositDialogVisible" title="充值记录" width="800px">
      <div v-loading="depositRecordsLoading">
        <el-empty v-if="depositRecords.length === 0" description="暂无充值记录" />
        <el-table v-else :data="depositRecords" style="width: 100%" border stripe>
          <el-table-column prop="id" label="ID" width="60" />
          <el-table-column prop="amount" label="金额" width="100">
            <template #default="scope">
              <span class="amount-positive">+{{ scope.row.amount.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="paymentMethod" label="支付方式" width="100">
            <template #default="scope">
              {{ formatPaymentMethod(scope.row.paymentMethod) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="时间" width="180">
            <template #default="scope">
              {{ formatTime(scope.row.createdAt) }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container" v-if="depositRecords.length > 0">
          <el-pagination
            v-model:current-page="depositPage"
            v-model:page-size="depositPageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="depositTotal"
            @size-change="handleDepositSizeChange"
            @current-change="handleDepositPageChange"
          />
        </div>
      </div>
    </el-dialog>
    
    <!-- 上机记录对话框 -->
    <el-dialog v-model="operationDialogVisible" title="上机记录" width="900px">
      <div v-loading="operationRecordsLoading">
        <el-empty v-if="operationRecords.length === 0" description="暂无上机记录" />
        <el-table v-else :data="operationRecords" style="width: 100%" border stripe>
          <el-table-column prop="computer.name" label="机器名称" width="100" />
          <el-table-column prop="computer.area" label="区域" width="80" />
          <el-table-column prop="operationType" label="操作类型" width="80">
            <template #default="scope">
              {{ formatOperationType(scope.row.operationType) }}
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="180">
            <template #default="scope">
              {{ formatTime(scope.row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="180">
            <template #default="scope">
              {{ scope.row.endTime ? formatTime(scope.row.endTime) : '进行中' }}
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="使用时长">
            <template #default="scope">
              {{ scope.row.duration ? formatDuration(scope.row.duration) : '进行中' }}
            </template>
          </el-table-column>
          <el-table-column prop="cost" label="费用" width="80">
            <template #default="scope">
              {{ scope.row.cost ? `¥${scope.row.cost.toFixed(2)}` : '-' }}
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-container" v-if="operationRecords.length > 0">
          <el-pagination
            v-model:current-page="operationPage"
            v-model:page-size="operationPageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next"
            :total="operationTotal"
            @size-change="handleOperationSizeChange"
            @current-change="handleOperationPageChange"
          />
        </div>
      </div>
    </el-dialog>

    <!-- 页面底部 -->
    <div class="footer">
      <div class="footer-content">
        <div class="footer-info">
          <p>© {{ new Date().getFullYear() }} 网吧计时管理系统 版权所有</p>
          <p>技术支持: Minshenyao</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { 
  SwitchButton, 
  Wallet, 
  Monitor, 
  CircleClose, 
  CircleCheck,
  Operation,
  Tools,
  VideoPlay,
  TurnOff,
  Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserInfo, type UserInfo } from '../../api/user'
import { 
  getCurrentUserComputer,
  getComputerList,
  startUsingComputer, 
  stopUsingComputer,
  getAreaCount,
  getComputerStatusStats,
  type Computer,
  type ComputerStatusStats
} from '../../api/computer'
import { addCurrentUserBalance } from '../../api/user-management'
import { PaymentMethod, getMyDepositRecords, type DepositRecord, type PageResponse } from '../../api/deposit'
import { getMyOperationRecords, type OperationRecord, OperationType } from '../../api/operation'
import dayjs from 'dayjs'

// 用户信息
const userInfo = ref<UserInfo | null>(null)

// 当前使用的计算机
const currentComputer = ref<Computer | null>(null)

// 使用时长
const usageDuration = ref(0)
const usageTimer = ref<number | null>(null)

// 充值表单
const rechargeForm = reactive({
  amount: 10,
  paymentMethod: PaymentMethod.CASH // 1-现金, 2-支付宝, 3-微信
})

// 计算机选择
const computerDialogVisible = ref(false)
const computersLoading = ref(false)
const areas = ref<string[]>([])
const activeArea = ref('')
const computers = ref<Computer[]>([])
const selectedComputer = ref<Computer | null>(null)

// 计算机状态统计
const computerStats = ref<ComputerStatusStats>({
  onlineCount: 0,
  busyCount: 0,
  offlineCount: 0,
  maintenanceCount: 0
})

// 充值记录
const depositRecords = ref<DepositRecord[]>([])
const depositRecordsLoading = ref(false)
const depositPage = ref(0)
const depositPageSize = ref(5)
const depositTotal = ref(0)
const depositDialogVisible = ref(false)

// 上机记录
const operationRecords = ref<OperationRecord[]>([])
const operationRecordsLoading = ref(false)
const operationPage = ref(0)
const operationPageSize = ref(5)
const operationTotal = ref(0)
const operationDialogVisible = ref(false)

// 计算过滤后的计算机列表
const filteredComputers = computed(() => {
  return computers.value.filter(computer => computer.area === activeArea.value)
})

// 格式化时间
const formatTime = (timestamp?: number) => {
  if (!timestamp) return '未知'
  return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
}

// 格式化使用时长
const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 格式化支付方式
const formatPaymentMethod = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH:
      return '现金'
    case PaymentMethod.ALIPAY:
      return '支付宝'
    case PaymentMethod.WECHAT:
      return '微信'
    case PaymentMethod.BANK_CARD:
      return '银行卡'
    default:
      return '未知'
  }
}

// 格式化操作类型
const formatOperationType = (type: OperationType) => {
  switch (type) {
    case OperationType.START_USE:
      return '上机'
    case OperationType.END_USE:
      return '下机'
    case OperationType.POWER_ON:
      return '开机'
    case OperationType.POWER_OFF:
      return '关机'
    case OperationType.SET_MAINTENANCE:
      return '维修'
    case OperationType.CANCEL_MAINTENANCE:
      return '取消维修'
    default:
      return '未知'
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const response = await getUserInfo()
    userInfo.value = response
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 获取当前使用的计算机
const fetchCurrentComputer = async () => {
  try {
    if (!userInfo.value?.id) return
    
    const response = await getCurrentUserComputer()
    if (response && response.data) {
      currentComputer.value = response.data
      startUsageTimer()
    } else {
      currentComputer.value = null
      stopUsageTimer()
    }
  } catch (error) {
    console.error('获取当前使用计算机失败:', error)
    currentComputer.value = null
    stopUsageTimer()
  }
}

// 获取计算机状态统计
const fetchComputerStats = async () => {
  try {
    const stats = await getComputerStatusStats()
    computerStats.value = stats
  } catch (error) {
    console.error('获取计算机状态统计失败:', error)
  }
}

// 获取充值记录
const fetchDepositRecords = async () => {
  depositRecordsLoading.value = true
  try {
    const response = await getMyDepositRecords({
      page: depositPage.value,
      size: depositPageSize.value,
      sortBy: 'createdAt',
      direction: 'desc'
    })
    
    depositRecords.value = response.data.content
    depositTotal.value = response.data.totalElements
  } catch (error) {
    console.error('获取充值记录失败:', error)
  } finally {
    depositRecordsLoading.value = false
  }
}

// 获取上机记录
const fetchOperationRecords = async () => {
  operationRecordsLoading.value = true
  try {
    const response = await getMyOperationRecords({
      page: operationPage.value,
      size: operationPageSize.value,
      sortBy: 'createdAt',
      direction: 'desc'
    })
    
    operationRecords.value = response.data.content
    operationTotal.value = response.data.totalElements
  } catch (error) {
    console.error('获取上机记录失败:', error)
  } finally {
    operationRecordsLoading.value = false
  }
}

// 开始使用计算机
const handleStartUsing = async () => {
  if ((userInfo.value?.balance || 0) < 0) {
    ElMessage.warning('余额不足，请先充值')
    return
  }
  
  computerDialogVisible.value = true
  await fetchAvailableComputers()
}

// 结束使用计算机
const handleStopUsing = async () => {
  if (!currentComputer.value) return
  
  try {
    await ElMessageBox.confirm(
      '确定要结束使用该计算机吗？',
      '确认下机',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await stopUsingComputer(currentComputer.value.id)
    ElMessage.success('已成功下机')
    
    // 更新用户信息和当前计算机
    await fetchUserInfo()
    currentComputer.value = null
    stopUsageTimer()
    
    // 刷新上机记录
    await fetchOperationRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下机失败:', error)
    }
  }
}

// 获取可用计算机
const fetchAvailableComputers = async () => {
  computersLoading.value = true
  try {
    // 获取所有区域
    const areasResponse = await getAreaCount()
    areas.value = Object.keys(areasResponse.data)
    
    if (areas.value.length > 0) {
      activeArea.value = areas.value[0]
      await handleAreaChange()
    }
  } catch (error) {
    console.error('获取可用计算机失败:', error)
  } finally {
    computersLoading.value = false
  }
}

// 切换区域
const handleAreaChange = async () => {
  computersLoading.value = true
  try {
    const response = await getComputerList({
      page: 0,
      size: 100,
      area: activeArea.value
    })
    computers.value = response.data.content
  } catch (error) {
    console.error('获取区域计算机失败:', error)
  } finally {
    computersLoading.value = false
  }
}

// 选择计算机
const selectComputer = (computer: Computer) => {
  if (computer.idle) {
    selectedComputer.value = computer
  }
}

// 确认选择计算机
const confirmSelectComputer = async () => {
  if (!selectedComputer.value) return
  
  try {
    await startUsingComputer(selectedComputer.value.id)
    ElMessage.success('已成功上机')
    computerDialogVisible.value = false
    
    // 更新用户信息和当前计算机
    await fetchUserInfo()
    currentComputer.value = selectedComputer.value
    startUsageTimer()
    
    // 刷新上机记录
    await fetchOperationRecords()
  } catch (error) {
    console.error('上机失败:', error)
  }
}

// 开始计时器
const startUsageTimer = () => {
  if (currentComputer.value?.startTime) {
    const startTime = currentComputer.value.startTime
    const updateDuration = () => {
      const now = Date.now()
      usageDuration.value = Math.floor((now - startTime) / 1000)
    }
    
    // 初始更新
    updateDuration()
    
    // 每秒更新
    usageTimer.value = window.setInterval(updateDuration, 1000)
  }
}

// 停止计时器
const stopUsageTimer = () => {
  if (usageTimer.value) {
    clearInterval(usageTimer.value)
    usageTimer.value = null
  }
  usageDuration.value = 0
}

// 处理充值
const handleRecharge = async () => {
  if (rechargeForm.amount < 10) {
    ElMessage.warning('充值金额不能低于10元')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要充值${rechargeForm.amount}元吗？`,
      '确认充值',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    await addCurrentUserBalance(rechargeForm.amount, rechargeForm.paymentMethod)
    
    ElMessage.success('充值成功')
    
    // 更新用户信息
    await fetchUserInfo()
    
    // 刷新充值记录
    await fetchDepositRecords()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('充值失败:', error)
    }
  }
}

// 处理充值记录分页变化
const handleDepositPageChange = (page: number) => {
  depositPage.value = page - 1
  fetchDepositRecords()
}

// 处理充值记录每页条数变化
const handleDepositSizeChange = (size: number) => {
  depositPageSize.value = size
  depositPage.value = 0
  fetchDepositRecords()
}

// 处理上机记录分页变化
const handleOperationPageChange = (page: number) => {
  operationPage.value = page - 1
  fetchOperationRecords()
}

// 处理上机记录每页条数变化
const handleOperationSizeChange = (size: number) => {
  operationPageSize.value = size
  operationPage.value = 0
  fetchOperationRecords()
}

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    '确定要退出登录吗？',
    '确认退出',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    // 清除用户信息和token
    localStorage.removeItem('token')
    localStorage.removeItem('userName')
    
    // 跳转到登录页
    window.location.href = '/login'
  }).catch(() => {})
}

// 页面加载时获取数据
onMounted(async () => {
  await fetchUserInfo()
  
  // 不再检查管理员身份，允许管理员在需要时访问普通用户页面
  
  await fetchCurrentComputer()
  await fetchComputerStats()
  await fetchDepositRecords()
  await fetchOperationRecords()
})

// 页面卸载时清理
onUnmounted(() => {
  stopUsageTimer()
})
</script>

<style scoped>
.normal-user-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* 顶部导航栏样式 */
.top-navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #409EFF;
  color: white;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  align-items: center;
}

.logo-icon {
  font-size: 24px;
  margin-right: 10px;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.nav-actions {
  display: flex;
  align-items: center;
}

.welcome-text {
  margin-right: 15px;
  font-size: 14px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  background-color: #409EFF;
  color: white;
  font-weight: bold;
  font-size: 24px;
  margin-right: 16px;
}

.user-details h2 {
  margin: 0 0 8px 0;
  font-size: 20px;
}

.user-meta {
  display: flex;
  align-items: center;
}

.user-permission {
  margin-right: 10px;
}

.user-balance {
  display: flex;
  align-items: center;
  color: #67C23A;
  font-weight: bold;
}

.user-balance .el-icon {
  margin-right: 4px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.dashboard-content {
  display: flex;
  gap: 20px;
}

.main-panel {
  flex: 1.5;
}

.side-panel {
  flex: 1;
}

.status-card, .records-card, .recharge-card, .quick-actions-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.status-card:hover, .records-card:hover, .recharge-card:hover, .quick-actions-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  display: flex;
  align-items: center;
}

.card-header h3 .el-icon {
  margin-right: 8px;
}

.using-computer {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.computer-info {
  margin-bottom: 20px;
}

.computer-info h4 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #303133;
}

.computer-details {
  display: flex;
  flex-wrap: wrap;
  background-color: #f8f8f8;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.detail-item {
  width: 50%;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.detail-label {
  font-weight: bold;
  color: #606266;
  margin-right: 8px;
  min-width: 80px;
}

.usage-time {
  font-family: monospace;
  font-size: 16px;
  color: #409EFF;
  font-weight: bold;
}

.computer-actions {
  display: flex;
  justify-content: center;
}

.no-computer {
  padding: 40px 0;
  text-align: center;
}

.balance-warning {
  color: #F56C6C;
  margin-top: 10px;
}

.recharge-form {
  padding: 10px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
}

.quick-actions .el-button {
  margin-left: 0;
  width: 100%;
  height: 50px;
  font-size: 16px;
}

.computers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 15px;
  padding: 15px;
}

.computer-item {
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.computer-item:hover {
  transform: scale(1.05);
}

.computer-idle {
  border-color: #67C23A;
}

.computer-in-use {
  border-color: #E6A23C;
  background-color: rgba(230, 162, 60, 0.1);
}

.computer-maintenance {
  border-color: #F56C6C;
  background-color: rgba(245, 108, 108, 0.1);
}

.computer-off {
  border-color: #909399;
  background-color: rgba(144, 147, 153, 0.1);
}

.computer-selected {
  background-color: #e6f7ff;
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.computer-icon {
  font-size: 24px;
  margin-bottom: 10px;
}

.computer-name {
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.computer-status {
  width: 100%;
  display: flex;
  justify-content: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.amount-positive {
  color: #67C23A;
  font-weight: bold;
}

/* 对话框样式优化 */
:deep(.el-dialog__header) {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 15px;
  margin-bottom: 0;
}

:deep(.el-dialog__body) {
  padding-top: 20px;
}

:deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

/* 页脚样式 */
.footer {
  margin-top: 40px;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 -2px 12px 0 rgba(0, 0, 0, 0.05);
}

.footer-content {
  text-align: center;
}

.footer-info p {
  margin: 5px 0;
  color: #606266;
  font-size: 14px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .dashboard-content {
    flex-direction: column;
  }
  
  .main-panel, .side-panel {
    width: 100%;
  }
  
  .detail-item {
    width: 100%;
  }
  
  .dashboard-header {
    flex-direction: column;
    text-align: center;
  }
  
  .user-info {
    flex-direction: column;
    margin-bottom: 15px;
  }
  
  .user-avatar {
    margin-right: 0;
    margin-bottom: 10px;
  }
  
  .action-buttons {
    width: 100%;
  }
  s
  .action-buttons .el-button {
    width: 100%;
  }
}

.computer-stats {
  display: flex;
  justify-content: space-around;
  padding: 20px 0;
}

.stat-item {
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

.stat-value.online {
  color: #67C23A;
}

.stat-value.busy {
  color: #E6A23C;
}

.stat-value.offline {
  color: #909399;
}

.stat-value.maintenance {
  color: #F56C6C;
}

.stats-card {
  margin-bottom: 20px;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}
</style>