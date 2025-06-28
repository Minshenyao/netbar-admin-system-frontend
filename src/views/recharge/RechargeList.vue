<template>
  <div class="recharge-container">
    <!-- 页面标题 -->
    <div class="header" v-motion-slide-visible-once-top>
      <h1 class="title">
        <el-icon class="title-icon"><Money /></el-icon>
        充值记录中心
      </h1>
      <p class="subtitle">查看和管理网吧用户的充值记录</p>
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

    <!-- 充值记录表格 -->
    <div class="recharge-grid" v-motion-slide-visible-once-bottom>
      <div class="section-header">
        <h2 class="section-title">充值记录列表</h2>
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
          <el-button 
            type="success" 
            @click="handleAddRecharge"
            class="add-btn"
          >
            <el-icon><Plus /></el-icon>
            新增充值
          </el-button>
        </div>
      </div>

      <div v-if="loading" class="table-loading">
        <el-skeleton :rows="5" animated />
      </div>

      <el-table
        v-else
        :data="rechargeList"
        border
        stripe
        style="width: 100%"
        class="recharge-table"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="orderNumber" label="订单号" width="200" />
        <el-table-column label="用户" width="120">
          <template #default="{ row }">
            {{ row.user.username }}
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">
            <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="paymentMethod" label="支付方式" width="120">
          <template #default="{ row }">
            <el-tag :type="getPaymentMethodTagType(row.paymentMethod)">
              {{ getPaymentMethodText(row.paymentMethod) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作员" width="120">
          <template #default="{ row }">
            {{ row.operatorId || '管理员' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="充值时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
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

    <!-- 充值详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="充值详情"
      width="500px"
      class="recharge-dialog"
      destroy-on-close
    >
      <div v-if="selectedRecharge" class="recharge-detail">
        <div class="detail-item">
          <span class="label">订单号：</span>
          <span class="value">{{ selectedRecharge.orderNumber }}</span>
        </div>
        <div class="detail-item">
          <span class="label">用户：</span>
          <span class="value">{{ selectedRecharge.user.username }}</span>
        </div>
        <div class="detail-item">
          <span class="label">金额：</span>
          <span class="value amount">¥{{ selectedRecharge.amount.toFixed(2) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">支付方式：</span>
          <span class="value">
            <el-tag :type="getPaymentMethodTagType(selectedRecharge.paymentMethod)">
              {{ getPaymentMethodText(selectedRecharge.paymentMethod) }}
            </el-tag>
          </span>
        </div>
        <div class="detail-item">
          <span class="label">操作员：</span>
          <span class="value">{{ selectedRecharge.operatorId || '管理员' }}</span>
        </div>
        <div class="detail-item">
          <span class="label">充值时间：</span>
          <span class="value">{{ formatTime(selectedRecharge.createdAt) }}</span>
        </div>
        <div class="detail-item">
          <span class="label">备注：</span>
          <span class="value">{{ selectedRecharge.remark || '无' }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 新增充值对话框 -->
    <el-dialog
      v-model="rechargeDialogVisible"
      title="新增充值"
      width="500px"
      class="recharge-dialog"
      destroy-on-close
    >
      <div class="dialog-header">
        <div class="dialog-icon">
          <el-icon><Money /></el-icon>
        </div>
        <h3 class="dialog-title">创建新充值</h3>
        <p class="dialog-subtitle">填写以下信息以添加新的充值记录</p>
      </div>

      <el-form 
        ref="rechargeForm" 
        :model="rechargeForm" 
        :rules="rechargeRules" 
        label-width="100px"
        class="recharge-form"
      >
        <el-form-item label="用户" prop="userId">
          <el-select 
            v-model="rechargeForm.userId" 
            filterable 
            remote 
            placeholder="请输入用户名搜索"
            :remote-method="searchUsers"
            :loading="userSearchLoading"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="user.username"
              :value="user.id"
            >
              <div class="user-option">
                <span>{{ user.username }}</span>
                <span class="user-balance">余额: ¥{{ user.balance }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="充值金额" prop="amount">
          <el-input-number 
            v-model="rechargeForm.amount" 
            :min="1" 
            :precision="2" 
            :step="10"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="支付方式" prop="paymentMethod">
          <el-select v-model="rechargeForm.paymentMethod" placeholder="请选择支付方式">
            <el-option
              v-for="method in paymentMethods"
              :key="method.value"
              :label="method.label"
              :value="method.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="rechargeForm.remark" type="textarea" rows="3" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rechargeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitRechargeForm" :loading="saveLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Money, Refresh, Plus, Search,
  User, Timer, Connection, Wallet
} from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { 
  createDepositRecord,
  getAllDepositRecords,
  getDepositRecordById,
  type DepositRecord,
  type PageResponse,
  PaymentMethod
} from '../../api/deposit'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const userSearchLoading = ref(false)
const rechargeList = ref<DepositRecord[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const detailDialogVisible = ref(false)
const rechargeDialogVisible = ref(false)
const selectedRecharge = ref<DepositRecord | null>(null)
const userOptions = ref<Array<{ id: number; username: string; balance: number }>>([])

// 支付方式选项
const paymentMethods = [
  { label: '现金', value: PaymentMethod.CASH },
  { label: '支付宝', value: PaymentMethod.ALIPAY },
  { label: '微信', value: PaymentMethod.WECHAT },
  { label: '银行卡', value: PaymentMethod.BANK_CARD }
]

// 充值表单
const rechargeForm = ref({
  userId: undefined as number | undefined,
  amount: 100,
  paymentMethod: PaymentMethod.CASH,
  remark: ''
})

// 表单校验规则
const rechargeRules = {
  userId: [
    { required: true, message: '请选择用户', trigger: 'change' }
  ],
  amount: [
    { required: true, message: '请输入充值金额', trigger: 'blur' },
    { type: 'number', min: 1, message: '充值金额必须大于0', trigger: 'blur' }
  ],
  paymentMethod: [
    { required: true, message: '请选择支付方式', trigger: 'change' }
  ]
}

// 统计卡片数据
const stats = computed(() => {
  const totalRecharges = rechargeList.value.length
  const totalUsers = new Set(rechargeList.value.map(r => r.user.id)).size
  const totalAmount = rechargeList.value.reduce((sum, r) => sum + r.amount, 0)
  const avgAmount = totalRecharges ? (totalAmount / totalRecharges).toFixed(2) : '0.00'

  return [
    { label: '充值总数', value: totalRecharges, type: 'total', icon: Connection },
    { label: '涉及用户', value: totalUsers, type: 'users', icon: User },
    { label: '总金额', value: `¥${totalAmount.toFixed(2)}`, type: 'amount', icon: Money },
    { label: '平均金额', value: `¥${avgAmount}`, type: 'avg', icon: Wallet }
  ]
})

// 获取支付方式文本
const getPaymentMethodText = (method: PaymentMethod) => {
  const found = paymentMethods.find(m => m.value === method)
  return found ? found.label : '未知'
}

// 获取支付方式标签类型
const getPaymentMethodTagType = (method: PaymentMethod) => {
  switch (method) {
    case PaymentMethod.CASH: return 'success'
    case PaymentMethod.ALIPAY: return 'primary'
    case PaymentMethod.WECHAT: return 'success'
    case PaymentMethod.BANK_CARD: return 'info'
    default: return ''
  }
}

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString()
}

// 获取充值记录
const fetchRechargeList = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      sortBy: 'createdAt',
      direction: 'desc' as const
    }

    const response = await getAllDepositRecords(params)
    rechargeList.value = response.data.content
    total.value = response.data.totalElements
  } catch (error) {
    console.error('获取充值记录失败:', error)
    ElMessage.error('获取充值记录失败')
  } finally {
    loading.value = false
  }
}

// 刷新数据
const refreshData = async () => {
  await fetchRechargeList()
  ElMessage.success('数据刷新成功')
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchRechargeList()
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  fetchRechargeList()
}

const handleViewDetail = (row: DepositRecord) => {
  selectedRecharge.value = row
  detailDialogVisible.value = true
}

const handleAddRecharge = () => {
  rechargeForm.value = {
    userId: undefined,
    amount: 100,
    paymentMethod: PaymentMethod.CASH,
    remark: ''
  }
  rechargeDialogVisible.value = true
}

// 搜索用户
const searchUsers = async (query: string) => {
  if (query === '') {
    return
  }
  
  try {
    userSearchLoading.value = true
    // TODO: 实现用户搜索API
    // const response = await searchUsersApi(query)
    // userOptions.value = response.data
  } catch (error) {
    console.error('搜索用户失败:', error)
    ElMessage.error('搜索用户失败')
  } finally {
    userSearchLoading.value = false
  }
}

// 提交充值表单
const submitRechargeForm = async () => {
  if (!rechargeForm.value.userId) {
    ElMessage.warning('请选择用户')
    return
  }
  
  try {
    saveLoading.value = true
    await createDepositRecord({
      userId: rechargeForm.value.userId,
      amount: rechargeForm.value.amount,
      paymentMethod: rechargeForm.value.paymentMethod,
      remark: rechargeForm.value.remark
    })

    ElMessage.success('充值成功')
    rechargeDialogVisible.value = false
    fetchRechargeList()
  } catch (error) {
    console.error('充值失败:', error)
    ElMessage.error('充值失败')
  } finally {
    saveLoading.value = false
  }
}

// 监听对话框关闭
watch(detailDialogVisible, (newVal) => {
  if (!newVal) {
    selectedRecharge.value = null
  }
})

watch(rechargeDialogVisible, (newVal) => {
  if (!newVal) {
    rechargeForm.value = {
      userId: undefined,
      amount: 100,
      paymentMethod: PaymentMethod.CASH,
      remark: ''
    }
  }
})

// 页面加载时获取数据
onMounted(() => {
  fetchRechargeList()
})
</script>

<style scoped>
.recharge-container {
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
.stat-amount { background: linear-gradient(45deg, #e6a23c, #ebb563); }
.stat-avg { background: linear-gradient(45deg, #f56c6c, #f78989); }

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

.recharge-grid {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.5rem;
  margin: 0;
  color: #2c3e50;
  border-left: 4px solid #409eff;
  padding-left: 15px;
  line-height: 1.2;
}

.action-group {
  display: flex;
  gap: 12px;
}

.refresh-btn,
.add-btn {
  min-width: 100px;
}

.recharge-table {
  margin-bottom: 20px;
}

.amount {
  font-weight: 600;
  color: #f56c6c;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.recharge-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.recharge-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #f5f7fa;
}

.recharge-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.dialog-header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 30px 20px;
  text-align: center;
  color: white;
}

.dialog-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 15px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-icon .el-icon {
  font-size: 36px;
}

.dialog-title {
  font-size: 20px;
  margin: 0 0 8px;
  font-weight: 600;
}

.dialog-subtitle {
  font-size: 14px;
  margin: 0;
  opacity: 0.9;
}

.recharge-form {
  padding: 20px;
}

.recharge-detail {
  .detail-item {
    margin-bottom: 16px;
    display: flex;
    
    .label {
      width: 100px;
      color: #606266;
    }
    
    .value {
      flex: 1;
      font-weight: 500;
    }
  }
}

.user-option {
  display: flex;
  justify-content: space-between;
  
  .user-balance {
    color: #f56c6c;
    font-size: 12px;
  }
}

/* 动画 */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .action-group {
    width: 100%;
    justify-content: flex-end;
  }
  
  .refresh-btn,
  .add-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .recharge-container {
    padding: 16px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .action-group {
    width: 100%;
  }
  
  .refresh-btn,
  .add-btn {
    width: 100%;
  }
}
</style> 