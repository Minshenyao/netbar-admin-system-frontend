<template>
  <div class="operations-container">
    <!-- 页面标题 -->
    <div class="header" v-motion-slide-visible-once-top>
      <h1 class="title">
        <el-icon class="title-icon"><Clock /></el-icon>
        操作记录中心
      </h1>
      <p class="subtitle">查看和管理网吧计算机的所有操作记录</p>
    </div>

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

    <!-- 工具栏 -->
    <div class="toolbar" v-motion-slide-visible-once-right>
      <div class="toolbar-controls">
        <div class="filter-group">
          <el-select 
            v-model="selectedArea" 
            placeholder="选择区域" 
            class="area-select"
            @change="handleAreaChange"
            clearable
          >
            <el-option label="全部区域" value="" />
            <el-option
              v-for="area in areas" 
              :key="area"
              :label="area"
              :value="area"
            />
          </el-select>

          <el-select 
            v-model="typeFilter" 
            placeholder="操作类型" 
            class="type-select"
            @change="handleTypeChange"
            clearable
          >
            <el-option label="全部类型" value="" />
            <el-option
              v-for="type in operationTypes"
              :key="type.value"
              :label="type.label"
              :value="type.value"
            />
          </el-select>

          <el-input
            placeholder="搜索用户名/计算机名称"
            v-model="searchQuery"
            clearable
            @input="debounceSearch"
            @clear="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <div class="action-group">
          <el-button 
            type="primary" 
            @click="refreshData"
            :loading="loading"
            class="refresh-btn"
          >
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
    </div>

    <!-- 操作记录表格 -->
    <div class="operations-grid" v-motion-slide-visible-once-bottom>
      <h2 class="section-title">操作记录列表</h2>

      <div v-if="loading" class="table-loading">
        <el-skeleton :rows="5" animated />
      </div>

      <el-table
        v-else
        :data="paginatedOperations"
        border
        stripe
        style="width: 100%"
        class="operations-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            {{ row.user.username }}
          </template>
        </el-table-column>
        <el-table-column label="计算机" width="120">
          <template #default="{ row }">
            {{ row.computer.name }}
          </template>
        </el-table-column>
        <el-table-column label="区域" width="100">
          <template #default="{ row }">
            {{ row.computer.area }}
          </template>
        </el-table-column>
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTagType(row.operationType)">
              {{ getOperationTypeText(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180">
          <template #default="{ row }">
            {{ row.endTime ? formatTime(row.endTime) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="持续时间" width="120">
          <template #default="{ row }">
            {{ row.duration ? formatDuration(row.duration) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="cost" label="费用" width="100">
          <template #default="{ row }">
            <span v-if="row.cost" class="cost">¥{{ row.cost.toFixed(2) }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="150" />
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleViewDetail(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 操作详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="操作详情"
      width="500px"
      class="operation-dialog"
      destroy-on-close
    >
      <div v-if="selectedOperation" class="operation-detail">
        <div class="detail-header">
          <div class="detail-icon">
            <el-icon :size="32">
              <component :is="getOperationTypeIcon(selectedOperation.operationType)" />
            </el-icon>
          </div>
          <div class="detail-title">
            <h3>{{ getOperationTypeText(selectedOperation.operationType) }}</h3>
            <p class="detail-time">{{ formatTime(selectedOperation.startTime) }}</p>
          </div>
        </div>

        <div class="detail-content">
          <div class="detail-section">
            <h4 class="section-title">基本信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">操作ID</span>
                <span class="value">{{ selectedOperation.id }}</span>
              </div>
              <div class="detail-item">
                <span class="label">用户</span>
                <span class="value">{{ selectedOperation.user.username }}</span>
              </div>
              <div class="detail-item">
                <span class="label">计算机</span>
                <span class="value">{{ selectedOperation.computer.name }}</span>
              </div>
              <div class="detail-item">
                <span class="label">区域</span>
                <span class="value">{{ selectedOperation.computer.area }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">时间信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">开始时间</span>
                <span class="value">{{ formatTime(selectedOperation.startTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">结束时间</span>
                <span class="value">{{ selectedOperation.endTime ? formatTime(selectedOperation.endTime) : '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="label">持续时间</span>
                <span class="value">{{ selectedOperation.duration ? formatDuration(selectedOperation.duration) : '-' }}</span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="section-title">费用信息</h4>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="label">费用</span>
                <span class="value cost" v-if="selectedOperation.cost">¥{{ selectedOperation.cost.toFixed(2) }}</span>
                <span class="value" v-else>-</span>
              </div>
            </div>
          </div>

          <div class="detail-section" v-if="selectedOperation.remark">
            <h4 class="section-title">备注信息</h4>
            <div class="remark-content">
              {{ selectedOperation.remark }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Clock, Refresh, Search, 
  Connection, User, Money, Timer 
} from '@element-plus/icons-vue'
import { 
  getAllOperationRecords,
  getMyOperationRecords,
  OperationType,
  type OperationRecord,
  type PageResponse
} from '../../api/operation'

// 响应式数据
const loading = ref(false)
const operationsList = ref<OperationRecord[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchQuery = ref('')
const typeFilter = ref<OperationType | ''>('')
const selectedArea = ref('')
const detailDialogVisible = ref(false)
const selectedOperation = ref<OperationRecord | null>(null)

// 操作类型选项
const operationTypes = [
  { label: '开机', value: OperationType.POWER_ON },
  { label: '关机', value: OperationType.POWER_OFF },
  { label: '开始使用', value: OperationType.START_USE },
  { label: '结束使用', value: OperationType.END_USE },
  { label: '设为维修', value: OperationType.SET_MAINTENANCE },
  { label: '取消维修', value: OperationType.CANCEL_MAINTENANCE }
]

// 统计卡片数据
const stats = computed(() => {
  const totalOperations = operationsList.value.length
  const totalUsers = new Set(operationsList.value.map(op => op.user.id)).size
  const totalComputers = new Set(operationsList.value.map(op => op.computer.id)).size
  const totalCost = operationsList.value.reduce((sum, op) => sum + (op.cost || 0), 0)

  return [
    { label: '操作总数', value: totalOperations, type: 'total', icon: Connection },
    { label: '涉及用户', value: totalUsers, type: 'users', icon: User },
    { label: '涉及计算机', value: totalComputers, type: 'computers', icon: Connection },
    { label: '总费用', value: `¥${totalCost.toFixed(2)}`, type: 'cost', icon: Money }
  ]
})

// 区域列表
const areas = computed(() => {
  const areaSet = new Set(operationsList.value.map(op => op.computer.area))
  return Array.from(areaSet)
})

// 获取操作类型文本
const getOperationTypeText = (type: OperationType) => {
  const found = operationTypes.find(t => t.value === type)
  return found ? found.label : '未知'
}

// 获取操作类型标签类型
const getOperationTypeTagType = (type: OperationType) => {
  switch (type) {
    case OperationType.POWER_ON: return 'success'
    case OperationType.POWER_OFF: return 'info'
    case OperationType.START_USE: return 'primary'
    case OperationType.END_USE: return 'warning'
    case OperationType.SET_MAINTENANCE: return 'danger'
    case OperationType.CANCEL_MAINTENANCE: return 'success'
    default: return ''
  }
}

// 获取操作类型图标
const getOperationTypeIcon = (type: OperationType) => {
  switch (type) {
    case OperationType.POWER_ON: return 'CircleCheckFilled'
    case OperationType.POWER_OFF: return 'CircleCloseFilled'
    case OperationType.START_USE: return 'Timer'
    case OperationType.END_USE: return 'Timer'
    case OperationType.SET_MAINTENANCE: return 'Tools'
    case OperationType.CANCEL_MAINTENANCE: return 'CircleCheckFilled'
    default: return 'InfoFilled'
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 格式化持续时间
const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }
}

// 搜索防抖
let searchTimer: ReturnType<typeof setTimeout> | null = null
const debounceSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500)
}

// 获取操作记录
const fetchOperations = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      sortBy: 'startTime',
      direction: 'desc' as const
    }

    const response = await getAllOperationRecords(params)
    let filteredData = response.data.content

    // 前端筛选
    if (selectedArea.value) {
      filteredData = filteredData.filter(op => op.computer.area === selectedArea.value)
    }
    
    if (typeFilter.value) {
      filteredData = filteredData.filter(op => op.operationType === typeFilter.value)
    }
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filteredData = filteredData.filter(op => 
        op.user.username.toLowerCase().includes(query) ||
        op.computer.name.toLowerCase().includes(query)
      )
    }

    operationsList.value = filteredData
    total.value = filteredData.length
  } catch (error) {
    console.error('获取操作记录失败:', error)
    ElMessage.error('获取操作记录失败')
    operationsList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  currentPage.value = 1
  await fetchOperations()
  ElMessage.success('数据刷新成功')
}

// 事件处理函数
const handleSearch = () => {
  currentPage.value = 1
  fetchOperations()
}

const handleTypeChange = () => {
  currentPage.value = 1
  fetchOperations()
}

const handleAreaChange = () => {
  currentPage.value = 1
  fetchOperations()
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchOperations()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchOperations()
}

// 分页处理
const paginatedOperations = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return operationsList.value.slice(start, end)
})

const handleViewDetail = (row: OperationRecord) => {
  selectedOperation.value = row
  detailDialogVisible.value = true
}

// 监听对话框关闭
watch(detailDialogVisible, (newVal) => {
  if (!newVal) {
    selectedOperation.value = null
  }
})

// 页面加载时获取数据
onMounted(() => {
  fetchOperations()
})
</script>

<style scoped>
.operations-container {
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

.stat-total { background: linear-gradient(45deg, #409eff, #66b3ff); }
.stat-users { background: linear-gradient(45deg, #67c23a, #85ce61); }
.stat-computers { background: linear-gradient(45deg, #e6a23c, #ebb563); }
.stat-cost { background: linear-gradient(45deg, #f56c6c, #f78989); }

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

.toolbar {
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.toolbar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  flex: 1;
}

.action-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.area-select,
.type-select {
  width: 160px;
}

.search-input {
  width: 300px;
}

.refresh-btn {
  background: linear-gradient(45deg, #409eff, #66b3ff);
  border: none;
  padding: 8px 16px;
  font-weight: 500;
  box-shadow: 0 3px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(64, 158, 255, 0.4);
}

.operations-grid {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c3e50;
  border-left: 4px solid #409eff;
  padding-left: 15px;
  line-height: 1.2;
}

.operations-table {
  margin-bottom: 20px;
}

.cost {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.operation-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.operation-dialog :deep(.el-dialog__header) {
  padding: 20px;
  margin: 0;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  border-bottom: 1px solid #e4e7ed;
}

.operation-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.operation-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.operation-detail {
  display: flex;
  flex-direction: column;
}

.detail-header {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid #e4e7ed;
}

.detail-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.detail-title {
  flex: 1;
}

.detail-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.detail-time {
  margin: 4px 0 0;
  font-size: 14px;
  color: #606266;
}

.detail-content {
  padding: 24px;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 16px;
  padding-left: 12px;
  border-left: 3px solid #409eff;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 13px;
  color: #909399;
}

.detail-item .value {
  font-size: 15px;
  color: #303133;
  font-weight: 500;
}

.detail-item .value.cost {
  color: #f56c6c;
  font-weight: 600;
}

.remark-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

/* 动画效果 */
.operation-dialog :deep(.el-dialog) {
  animation: dialogFadeIn 0.3s ease;
}

@keyframes dialogFadeIn {
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
@media (max-width: 992px) {
  .toolbar-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .action-group {
    width: 100%;
    justify-content: flex-end;
  }
  
  .search-input {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .area-select,
  .type-select,
  .search-input {
    width: 100%;
  }
  
  .action-group {
    flex-direction: column;
  }
  
  .refresh-btn {
    width: 100%;
  }
}
</style> 