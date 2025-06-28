<template>
    <!-- 统计卡片 -->
    <div class="stats-grid" v-motion-slide-visible-once-bottom>
      <div 
        class="stat-card" 
        v-for="(stat, index) in stats" 
        :key="stat.label"
        :style="{ animationDelay: `${index * 0.1}s` }"
        v-motion-slide-visible-once-left
      >
        <div class="stat-icon" :class="`stat-${stat.type}`">
          <el-icon>
            <component :is="stat.icon" />
          </el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧区域 -->
      <div class="left-section">
        <!-- 区域分布 -->
        <div class="card area-distribution" v-motion-slide-visible-once-left>
          <div class="card-header">
            <h3>区域分布</h3>
            <el-button type="primary" link @click="refreshAreaStats">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="area-list">
            <div v-for="(count, area) in areaStats" :key="area" class="area-item">
              <div class="area-info">
                <span class="area-name">{{ area }}</span>
                <span class="area-count">{{ count }}台</span>
              </div>
              <el-progress 
                :percentage="(count / totalComputers) * 100" 
                :color="getAreaColor(String(area))"
                :show-text="false"
              />
            </div>
          </div>
        </div>

        <!-- 最近操作记录 -->
        <div class="card recent-operations" v-motion-slide-visible-once-left>
          <div class="card-header">
            <h3>最近操作记录</h3>
            <el-button type="primary" link @click="goToOperations">
              查看更多
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <el-table :data="recentOperations" style="width: 100%" :max-height="300">
            <el-table-column prop="user.username" label="用户" width="100" />
            <el-table-column prop="computer.name" label="计算机" width="100" />
            <el-table-column prop="operationType" label="操作类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getOperationTypeTagType(row.operationType)">
                  {{ getOperationTypeText(row.operationType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="startTime" label="时间" width="180">
              <template #default="{ row }">
                {{ formatTime(row.startTime) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 右侧区域 -->
      <div class="right-section">
        <!-- 充值统计 -->
        <div class="card recharge-stats" v-motion-slide-visible-once-right>
          <div class="card-header">
            <h3>充值统计</h3>
            <el-button type="primary" link @click="goToRecharge">
              查看更多
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="recharge-summary">
            <div class="summary-item">
              <div class="summary-value">¥{{ todayRecharge.toFixed(2) }}</div>
              <div class="summary-label">今日充值</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">¥{{ monthRecharge.toFixed(2) }}</div>
              <div class="summary-label">本月充值</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">{{ rechargeCount }}</div>
              <div class="summary-label">充值次数</div>
            </div>
          </div>
        </div>

        <!-- 系统状态 -->
        <div class="card system-status" v-motion-slide-visible-once-right>
          <div class="card-header">
            <h3>系统状态</h3>
            <el-button type="primary" link @click="refreshSystemStatus">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
          </div>
          <div class="status-list">
            <div class="status-item">
              <div class="status-info">
                <span class="status-label">CPU使用率</span>
                <span class="status-value">{{ systemStatus.cpu }}%</span>
              </div>
              <el-progress 
                :percentage="systemStatus.cpu" 
                :color="getStatusColor(systemStatus.cpu)"
              />
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-label">内存使用率</span>
                <span class="status-value">{{ systemStatus.memory }}%</span>
              </div>
              <el-progress 
                :percentage="systemStatus.memory" 
                :color="getStatusColor(systemStatus.memory)"
              />
            </div>
            <div class="status-item">
              <div class="status-info">
                <span class="status-label">磁盘使用率</span>
                <span class="status-value">{{ systemStatus.disk }}%</span>
              </div>
              <el-progress 
                :percentage="systemStatus.disk" 
                :color="getStatusColor(systemStatus.disk)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  HomeFilled, 
  Monitor, 
  User, 
  Money, 
  Timer,
  Refresh,
  ArrowRight,
  ChatDotRound
} from '@element-plus/icons-vue'
import { 
  getComputerStatusStats,
  getAreaCount,
  type ComputerStatusStats,
  type AreaStats
} from '../../api/computer'
import { 
  getAllOperationRecords,
  type OperationRecord,
  OperationType
} from '../../api/operation'
import { getMyDepositRecords } from '../../api/deposit'

const router = useRouter()

// 统计数据
const statusData = reactive<ComputerStatusStats>({
  onlineCount: 0,
  busyCount: 0,
  offlineCount: 0,
  maintenanceCount: 0
})

const areaStats = ref<AreaStats>({})
const recentOperations = ref<OperationRecord[]>([])
const systemStatus = reactive({
  cpu: 0,
  memory: 0,
  disk: 0
})

// 计算总计算机数
const totalComputers = computed(() => {
  return Object.values(areaStats.value).reduce((sum, count) => sum + count, 0)
})

// 统计卡片数据
const stats = computed(() => [
  { 
    label: '在线机器', 
    value: statusData.onlineCount, 
    type: 'online', 
    icon: Monitor 
  },
  { 
    label: '使用中', 
    value: statusData.busyCount, 
    type: 'busy', 
    icon: Timer 
  },
  { 
    label: '维修中', 
    value: statusData.maintenanceCount, 
    type: 'maintenance', 
    icon: Monitor 
  },
  { 
    label: '离线', 
    value: statusData.offlineCount, 
    type: 'offline', 
    icon: Monitor 
  }
])

// 充值统计
const todayRecharge = ref(0)
const monthRecharge = ref(0)
const rechargeCount = ref(0)

// 获取区域颜色
const getAreaColor = (area: string) => {
  const colors = [
    '#409EFF',
    '#67C23A',
    '#E6A23C',
    '#F56C6C',
    '#909399'
  ]
  const index = area.charCodeAt(0) % colors.length
  return colors[index]
}

// 获取状态颜色
const getStatusColor = (value: number) => {
  if (value < 60) return '#67C23A'
  if (value < 80) return '#E6A23C'
  return '#F56C6C'
}

// 获取操作类型文本
const getOperationTypeText = (type: OperationType) => {
  const types: Record<OperationType, string> = {
    [OperationType.POWER_ON]: '开机',
    [OperationType.POWER_OFF]: '关机',
    [OperationType.START_USE]: '开始使用',
    [OperationType.END_USE]: '结束使用',
    [OperationType.SET_MAINTENANCE]: '设为维修',
    [OperationType.CANCEL_MAINTENANCE]: '取消维修'
  }
  return types[type] || '未知'
}

// 获取操作类型标签类型
const getOperationTypeTagType = (type: OperationType) => {
  const types: Record<OperationType, string> = {
    [OperationType.POWER_ON]: 'success',
    [OperationType.POWER_OFF]: 'info',
    [OperationType.START_USE]: 'primary',
    [OperationType.END_USE]: 'warning',
    [OperationType.SET_MAINTENANCE]: 'danger',
    [OperationType.CANCEL_MAINTENANCE]: 'success'
  }
  return types[type] || ''
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 刷新区域统计
const refreshAreaStats = async () => {
  try {
    const response = await getAreaCount()
    areaStats.value = response.data
  } catch (error) {
    console.error('获取区域统计失败:', error)
  }
}

// 刷新系统状态
const refreshSystemStatus = () => {
  // 模拟系统状态数据
  systemStatus.cpu = Math.floor(Math.random() * 100)
  systemStatus.memory = Math.floor(Math.random() * 100)
  systemStatus.disk = Math.floor(Math.random() * 100)
}

// 获取最近操作记录
const fetchRecentOperations = async () => {
  try {
    const response = await getAllOperationRecords({
      page: 0,
      size: 5,
      sortBy: 'startTime',
      direction: 'desc'
    })
    recentOperations.value = response.data.content
  } catch (error) {
    console.error('获取最近操作记录失败:', error)
  }
}

// 获取充值统计
const fetchRechargeStats = async () => {
  try {
    const response = await getMyDepositRecords()
    const records = response.data.content
    
    // 计算今日充值
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    todayRecharge.value = records
      .filter(record => new Date(record.createdAt) >= today)
      .reduce((sum, record) => sum + record.amount, 0)
    
    // 计算本月充值
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    monthRecharge.value = records
      .filter(record => new Date(record.createdAt) >= firstDayOfMonth)
      .reduce((sum, record) => sum + record.amount, 0)
    
    // 充值次数
    rechargeCount.value = records.length
  } catch (error) {
    console.error('获取充值统计失败:', error)
  }
}

// 页面跳转
const goToOperations = () => {
  router.push('/operations')
}

const goToRecharge = () => {
  router.push('/recharge')
}

// 页面加载时获取数据
onMounted(async () => {
  // 获取计算机状态统计
  const stats = await getComputerStatusStats()
  Object.assign(statusData, stats)
  
  // 获取区域统计
  await refreshAreaStats()
  
  // 获取最近操作记录
  await fetchRecentOperations()
  
  // 获取充值统计
  await fetchRechargeStats()
  
  // 获取系统状态
  refreshSystemStatus()
  
  // 定时刷新数据
  setInterval(async () => {
    const stats = await getComputerStatusStats()
    Object.assign(statusData, stats)
    refreshSystemStatus()
  }, 30000)
})
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.header {
  text-align: center;
  margin-bottom: 32px;
  color: #2c3e50;
}

.title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.title-icon {
  font-size: 3rem;
  color: #409eff;
}

.subtitle {
  font-size: 1.2rem;
  margin: 8px 0 0 0;
  opacity: 0.9;
  color: #5a6d7e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  animation: slideInUp 0.6s ease forwards;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  min-width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon :deep(.el-icon) {
  font-size: 28px;
}

.stat-online { background: linear-gradient(45deg, #67c23a, #85ce61); }
.stat-busy { background: linear-gradient(45deg, #e6a23c, #ebb563); }
.stat-maintenance { background: linear-gradient(45deg, #909399, #a6a9ad); }
.stat-offline { background: linear-gradient(45deg, #f56c6c, #f78989); }

.stat-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 1rem;
  color: #666;
  margin-top: 4px;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.card-header h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.area-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.area-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.area-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.area-name {
  font-weight: 500;
  color: #2c3e50;
}

.area-count {
  color: #666;
}

.recharge-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  text-align: center;
}

.summary-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.summary-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.summary-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #409eff;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 0.9rem;
  color: #666;
}

.status-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-weight: 500;
  color: #2c3e50;
}

.status-value {
  color: #666;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .recharge-summary {
    grid-template-columns: 1fr;
  }
}

.daily-message-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.daily-message-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.message-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.message-icon {
  font-size: 24px;
  color: #409eff;
  margin-top: 4px;
}

.message-text {
  font-size: 1.1rem;
  line-height: 1.6;
  color: #2c3e50;
  font-style: italic;
  flex: 1;
}
</style> 