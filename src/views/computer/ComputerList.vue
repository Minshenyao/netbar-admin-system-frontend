<template>
  <div class="computer-management">
    <!-- 页面标题 -->
    <div class="header" v-motion-slide-visible-once-top>
      <h1 class="title">
        <el-icon class="title-icon"><Monitor /></el-icon>
        计算机列表
      </h1>
      <p class="subtitle">管理网吧中的所有计算机设备</p>
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
          <component :is="stat.icon" />
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- 区域选择和操作栏 -->
    <div class="toolbar" v-motion-slide-visible-once-right>
      <div class="toolbar-controls">
        <div class="filter-group">
          <el-select 
            v-model="selectedArea" 
            placeholder="选择区域" 
            class="area-select"
            @change="handleAreaChange"
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
            v-model="statusFilter" 
            placeholder="计算机状态" 
            class="status-select"
            @change="handleStatusFilter"
          >
            <el-option label="全部状态" value="" />
            <el-option label="关机" value="0" />
            <el-option label="空闲" value="1" />
            <el-option label="使用中" value="2" />
            <el-option label="维修中" value="3" />
          </el-select>
          
          <el-input
            placeholder="搜索计算机名称/IP"
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
            刷新列表
          </el-button>
          
          <el-button 
            type="success" 
            @click="showAddDialog = true"
            class="add-btn"
          >
            <el-icon><Plus /></el-icon>
            添加计算机
          </el-button>
        </div>
      </div>
    </div>

    <!-- 计算机列表 -->
    <div class="computer-grid" v-motion-slide-visible-once-bottom>
      <h2 class="section-title">计算机列表</h2>
      <div v-if="loading" class="grid-container">
        <div class="skeleton-card" v-for="i in 4" :key="i">
          <el-skeleton animated>
            <template #template>
              <div style="padding: 14px">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px">
                  <el-skeleton-item variant="text" style="width: 40%" />
                  <el-skeleton-item variant="button" style="width: 30%" />
                </div>
                <el-skeleton-item variant="p" style="width: 100%" />
                <el-skeleton-item variant="p" style="width: 100%" />
                <div style="display: flex; justify-content: space-between; margin-top: 16px">
                  <el-skeleton-item variant="button" style="width: 30%" />
                  <el-skeleton-item variant="button" style="width: 30%" />
                </div>
              </div>
            </template>
          </el-skeleton>
        </div>
      </div>

      <transition-group name="computer-card" tag="div" class="grid-container" v-else>
        <div 
          class="computer-card" 
          v-for="computer in displayComputers" 
          :key="computer.id"
          :class="getCardStatusClass(computer)"
          @click="handleComputerClick(computer)"
        >
          <div class="card-header">
            <div class="computer-name">{{ computer.name }}</div>
            <div class="status-badge" :class="getBadgeStatusClass(computer)">
              {{ getStatusText(computer) }}
            </div>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span>区域: {{ computer.area }}区</span>
            </div>
            <div class="info-row">
              <span>IP地址: {{ computer.ipAddress }}</span>
            </div>
            <div class="info-row">
              <span>MAC地址: {{ computer.macAddress }}</span>
            </div>
            <div class="info-row" v-if="computer.userId">
              <span>用户ID: {{ computer.userId }}</span>
            </div>
            <div class="info-row" v-if="computer.startTime">
              <span>开始时间: {{ formatTime(computer.startTime) }}</span>
            </div>
          </div>
          
          <div class="card-actions">
            <el-button 
              v-if="computer.powerOff" 
              type="success" 
              size="small"
              @click.stop="powerOn(computer.id)"
              :loading="actionLoading[computer.id]"
            >
              开机
            </el-button>
            <el-button 
              v-if="computer.idle" 
              type="warning" 
              size="small"
              @click.stop="powerOff(computer.id)"
              :loading="actionLoading[computer.id]"
            >
              关机
            </el-button>
            <el-button 
              v-if="!computer.underMaintenance" 
              type="info" 
              size="small"
              @click.stop="setMaintenance(computer.id)"
              :loading="actionLoading[computer.id]"
            >
              维修
            </el-button>
            <el-button 
              type="primary" 
              size="small"
              @click.stop="editComputer(computer)"
            >
              编辑
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="displayComputers.length === 0" key="empty" class="empty-state">
          <el-empty description="暂无计算机数据，请添加新的计算机或调整筛选条件" />
        </div>
      </transition-group>
    </div>

    <!-- 分页 -->
    <div class="pagination-container" v-if="total > 0" v-motion-slide-visible-once-bottom>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 30, 40]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination"
      />
    </div>

    <!-- 添加/编辑计算机对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingComputer ? '编辑计算机信息' : '添加新计算机'"
      width="500px"
      class="computer-dialog"
      destroy-on-close
    >
      <div class="dialog-header">
        <div class="dialog-icon">
          <el-icon><Monitor /></el-icon>
        </div>
        <h3 class="dialog-title">
          {{ editingComputer ? '编辑 ' + editingComputer.name : '创建新计算机' }}
        </h3>
        <p class="dialog-subtitle">
          {{ editingComputer ? '修改计算机的详细信息' : '填写以下信息以添加新计算机' }}
        </p>
      </div>
      
      <el-form :model="computerForm" :rules="formRules" ref="formRef" label-width="100px" class="computer-form">
        <el-form-item label="计算机名称" prop="name">
          <el-input v-model="computerForm.name" placeholder="不填写将自动生成">
            <template #prefix>
              <el-icon><Monitor /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="MAC地址" prop="macAddress">
          <el-input v-model="computerForm.macAddress" placeholder="不填写将自动生成">
            <template #prefix>
              <el-icon><Desktop /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="IP地址" prop="ipAddress">
          <el-input v-model="computerForm.ipAddress" placeholder="不填写将自动分配">
            <template #prefix>
              <el-icon><Connection /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="区域" prop="area">
          <el-select v-model="computerForm.area" placeholder="请选择区域" style="width: 100%">
            <el-option v-for="area in areas" :key="area" :label="area" :value="area" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveComputer" :loading="saveLoading">
            {{ editingComputer ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 计算机详情对话框 -->
    <el-dialog
      v-model="showDetailsDialog"
      title="计算机详细信息"
      width="500px"
      class="computer-detail-dialog"
      destroy-on-close
    >
      <div class="computer-details" v-if="selectedComputerDetails">
        <div class="details-header" :class="getCardStatusClass(selectedComputerDetails)">
          <div class="details-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <h3>{{ selectedComputerDetails.name }}</h3>
          <span class="status-badge" :class="getBadgeStatusClass(selectedComputerDetails)">
            {{ getStatusText(selectedComputerDetails) }}
          </span>
        </div>
        
        <div class="details-content">
          <div class="detail-item">
            <span class="label">区域:</span>
            <span class="value">{{ selectedComputerDetails.area }}区</span>
          </div>
          <div class="detail-item">
            <span class="label">IP地址:</span>
            <span class="value">{{ selectedComputerDetails.ipAddress }}</span>
          </div>
          <div class="detail-item">
            <span class="label">MAC地址:</span>
            <span class="value">{{ selectedComputerDetails.macAddress }}</span>
          </div>
          <div class="detail-item" v-if="selectedComputerDetails.userId">
            <span class="label">使用用户ID:</span>
            <span class="value">{{ selectedComputerDetails.userId }}</span>
          </div>
          <div class="detail-item" v-if="selectedComputerDetails.startTime">
            <span class="label">开始使用时间:</span>
            <span class="value">{{ formatTime(selectedComputerDetails.startTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">创建时间:</span>
            <span class="value">{{ formatTime(selectedComputerDetails.createdAt) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">更新时间:</span>
            <span class="value">{{ formatTime(selectedComputerDetails.updatedAt) }}</span>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="details-footer">
          <el-button @click="showDetailsDialog = false">关闭</el-button>
          <el-button 
            type="primary" 
            @click="editComputer(selectedComputerDetails)"
          >
            编辑信息
          </el-button>
          <el-button 
            v-if="selectedComputerDetails && selectedComputerDetails.powerOff" 
            type="success" 
            @click="powerOn(selectedComputerDetails.id)"
            :loading="actionLoading[selectedComputerDetails.id]"
          >
            开机
          </el-button>
          <el-button 
            v-if="selectedComputerDetails && selectedComputerDetails.idle" 
            type="warning" 
            @click="powerOff(selectedComputerDetails.id)"
            :loading="actionLoading[selectedComputerDetails.id]"
          >
            关机
          </el-button>
          <el-button 
            v-if="selectedComputerDetails && !selectedComputerDetails.underMaintenance" 
            type="info" 
            @click="setMaintenance(selectedComputerDetails.id)"
            :loading="actionLoading[selectedComputerDetails.id]"
          >
            维修
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Monitor, Refresh, Plus, Location, Connection, User, Clock,
  Connection as Desktop, Cpu, Warning, Tools, Search
} from '@element-plus/icons-vue'
import { 
  getComputerList, 
  createComputer, 
  updateComputer, 
  deleteComputer,
  getAreaCount,
  powerOnComputer,
  powerOffComputer,
  setMaintenanceComputer,
  getComputersByArea,
  getComputersByAreaPaged,
  getComputersByStatus,
  getIdleComputers,
  getInUseComputers,
  getMaintenanceComputers,
  getPowerOffComputers
} from '../../api/computer'

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const actionLoading = ref({})
const showAddDialog = ref(false)
const showDetailsDialog = ref(false)
const editingComputer = ref(null)
const selectedComputerDetails = ref(null)

// 筛选条件
const selectedArea = ref('')
const statusFilter = ref('')
const searchQuery = ref('')

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算机数据
const computers = ref([])
const areaStats = ref({})

// 表单数据
const computerForm = reactive({
  name: '',
  macAddress: '',
  ipAddress: '',
  area: ''
})

const formRules = {
  name: [{ required: false, message: '计算机名称不填将自动生成', trigger: 'blur' }],
  macAddress: [
    { required: false, message: 'MAC地址不填将自动生成', trigger: 'blur' },
    { pattern: /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, message: 'MAC地址格式不正确', trigger: 'blur' }
  ],
  ipAddress: [
    { required: false, message: 'IP地址不填将自动分配', trigger: 'blur' },
    { pattern: /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/, message: 'IP地址格式不正确', trigger: 'blur' }
  ],
  area: [{ required: true, message: '请选择计算机所在区域', trigger: 'change' }]
}

const formRef = ref()

// 计算属性
const areas = computed(() => {
  // 如果有区域统计数据，使用其键作为区域列表
  if (areaStats.value && Object.keys(areaStats.value).length > 0) {
    return Object.keys(areaStats.value);
  }
  
  // 否则从计算机列表中提取区域
  const areaSet = new Set()
  computers.value.forEach(computer => {
    areaSet.add(computer.area)
  })
  return Array.from(areaSet)
})

const displayComputers = computed(() => {
  // 确保computers.value是一个数组
  return Array.isArray(computers.value) ? computers.value : [];
})

const stats = computed(() => {
  // 计算总数和各状态数量
  const totalCount = computers.value.length
  const idleCount = computers.value.filter(c => c.status === 1).length
  const inUseCount = computers.value.filter(c => c.status === 2).length
  const maintenanceCount = computers.value.filter(c => c.status === 3).length

  return [
    { label: '总计算机', value: totalCount, type: 'total', icon: Desktop },
    { label: '空闲计算机', value: idleCount, type: 'idle', icon: Cpu },
    { label: '使用中计算机', value: inUseCount, type: 'inuse', icon: User },
    { label: '维修中计算机', value: maintenanceCount, type: 'maintenance', icon: Tools }
  ]
})

// 方法
const getStatusText = (computer) => {
  // 检查是否有布尔标志
  if (computer.powerOff) return '关机';
  if (computer.idle) return '空闲';
  if (computer.inUse) return '使用中';
  if (computer.underMaintenance) return '维修中';
  
  // 如果没有布尔标志，则检查数字状态
  const statusMap = {
    0: '关机',
    1: '空闲',
    2: '使用中',
    3: '维修中'
  }
  return statusMap[computer.status] || '未知';
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString()
}

const handleAreaChange = () => {
  currentPage.value = 1
  fetchComputers()
}

const handleStatusFilter = () => {
  currentPage.value = 1
  fetchComputers()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchComputers()
}

// 搜索防抖
let searchTimer = null
const debounceSearch = () => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
  searchTimer = setTimeout(() => {
    handleSearch()
  }, 500)
}

const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  fetchComputers()
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  fetchComputers()
}

const fetchComputers = async () => {
  loading.value = true;
  try {
    let response;
    
    // 根据筛选条件选择不同的API
    if (selectedArea.value && statusFilter.value) {
      // 如果同时有区域和状态筛选，先按区域筛选，再在前端按状态筛选
      if (selectedArea.value) {
        // 使用分页获取指定区域的计算机
        const params = {
          page: currentPage.value - 1,
          size: pageSize.value,
          sortBy: 'id'
        };
        
        response = await getComputersByAreaPaged(selectedArea.value, params);
        
        // 如果有状态筛选，在前端进行过滤
        if (statusFilter.value !== '') {
          const statusNum = parseInt(statusFilter.value);
          let filteredComputers;
          
          if (response.code == 0) {
            filteredComputers = response.data.content.filter(computer => {
              if (statusNum === 0 && computer.powerOff) return true;
              if (statusNum === 1 && computer.idle) return true;
              if (statusNum === 2 && computer.inUse) return true;
              if (statusNum === 3 && computer.underMaintenance) return true;
              return computer.status === statusNum;
            });
            
            // 更新数据和总数
            computers.value = filteredComputers;
            total.value = filteredComputers.length;
          }
        } else if (response.code == 0) {
          computers.value = response.data.content;
          total.value = response.data.totalElements;
        }
      }
    } else if (statusFilter.value) {
      // 只有状态筛选
      const statusNum = parseInt(statusFilter.value);
      
      switch (statusNum) {
        case 0:
          response = await getPowerOffComputers();
          break;
        case 1:
          response = await getIdleComputers();
          break;
        case 2:
          response = await getInUseComputers();
          break;
        case 3:
          response = await getMaintenanceComputers();
          break;
        default:
          response = await getComputersByStatus(statusNum);
      }
      
      if (response.code == 0) {
        // 这些API可能不支持分页，所以在前端进行分页处理
        const allComputers = response.data;
        total.value = allComputers.length;
        
        // 手动分页
        const start = (currentPage.value - 1) * pageSize.value;
        const end = start + pageSize.value;
        computers.value = allComputers.slice(start, end);
      }
    } else if (selectedArea.value) {
      // 只有区域筛选
      const params = {
        page: currentPage.value - 1,
        size: pageSize.value,
        sortBy: 'id'
      };
      
      response = await getComputersByAreaPaged(selectedArea.value, params);
      
      if (response.code == 0) {
        computers.value = response.data.content;
        total.value = response.data.totalElements;
      }
    } else {
      // 没有筛选，获取所有计算机
      const params = {
        page: currentPage.value - 1,
        size: pageSize.value,
        sortBy: 'id'
      };
      
      response = await getComputerList(params);
      
      if (response.code == 0) {
        computers.value = response.data.content;
        total.value = response.data.totalElements;
      }

    }
    
    // 如果有搜索关键字，在前端进行过滤
    if (searchQuery.value && computers.value.length > 0) {
      const query = searchQuery.value.toLowerCase();
      const filteredComputers = computers.value.filter(computer => 
        computer.name.toLowerCase().includes(query) || 
        computer.ipAddress.toLowerCase().includes(query)
      );
      
      computers.value = filteredComputers;
      total.value = filteredComputers.length;
    }
    
    // 获取区域统计
    fetchAreaStats();
  } catch (error) {
    ElMessage.error('获取计算机列表失败');
    console.error('获取计算机列表失败:', error);
    computers.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
}

const fetchAreaStats = async () => {
  try {
    const response = await getAreaCount();
    if (response.code == 0) {
      areaStats.value = response.data;
    } else {
      console.error('获取区域统计失败:', response);
      areaStats.value = {};
    }
  } catch (error) {
    console.error('获取区域统计失败:', error);
    areaStats.value = {};
  }
}

const refreshData = async () => {
  await fetchComputers()
  ElMessage.success('计算机列表刷新成功')
}

const handleComputerClick = (computer) => {
  // 显示计算机详情
  selectedComputerDetails.value = computer;
  showDetailsDialog.value = true;
}

const powerOn = async (id) => {
  actionLoading.value[id] = true;
  try {
    const response = await powerOnComputer(id);
    if (response.code == 0) {
      await fetchComputers();
      ElMessage.success('计算机开机操作成功');
      // 关闭详情对话框
      if (showDetailsDialog.value) {
        showDetailsDialog.value = false;
      }
    } else {
      ElMessage.error(response.msg || '开机失败');
    }
  } catch (error) {
    ElMessage.error('开机失败');
    console.error('开机失败:', error);
  } finally {
    actionLoading.value[id] = false;
  }
}

const powerOff = async (id) => {
  actionLoading.value[id] = true;
  try {
    const response = await powerOffComputer(id);
    if (response.code == 0) {
      await fetchComputers();
      ElMessage.success('计算机关机操作成功');
      // 关闭详情对话框
      if (showDetailsDialog.value) {
        showDetailsDialog.value = false;
      }
    } else {
      ElMessage.error(response.msg || '关机失败');
    }
  } catch (error) {
    ElMessage.error('关机失败');
    console.error('关机失败:', error);
  } finally {
    actionLoading.value[id] = false;
  }
}

const setMaintenance = async (id) => {
  actionLoading.value[id] = true;
  try {
    const response = await setMaintenanceComputer(id);
    if (response.code == 0) {
      await fetchComputers();
      ElMessage.success('计算机已设置为维修状态');
      // 关闭详情对话框
      if (showDetailsDialog.value) {
        showDetailsDialog.value = false;
      }
    } else {
      ElMessage.error(response.msg || '设置维修状态失败');
    }
  } catch (error) {
    ElMessage.error('设置维修状态失败');
    console.error('设置维修状态失败:', error);
  } finally {
    actionLoading.value[id] = false;
  }
}

const editComputer = (computer) => {
  editingComputer.value = computer
  computerForm.name = computer.name || ''
  computerForm.macAddress = computer.macAddress || ''
  computerForm.ipAddress = computer.ipAddress || ''
  computerForm.area = computer.area || ''
  showAddDialog.value = true
  // 如果是从详情页打开，关闭详情页
  if (showDetailsDialog.value) {
    showDetailsDialog.value = false
  }
}

const saveComputer = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true;
      try {
        let response;
        
        if (editingComputer.value) {
          // 更新计算机
          response = await updateComputer(editingComputer.value.id, computerForm);
          if (response.code == 0) {
            ElMessage.success('计算机信息更新成功');
            showAddDialog.value = false;
            resetForm();
            fetchComputers();
          } else {
            ElMessage.error(response.msg || '计算机信息更新失败');
          }
        } else {
          // 添加计算机
          response = await createComputer(computerForm);
          if (response.code == 0) {
            ElMessage.success('新计算机添加成功');
            showAddDialog.value = false;
            resetForm();
            fetchComputers();
          } else {
            ElMessage.error(response.msg || '计算机添加失败');
          }
        }
      } catch (error) {
        ElMessage.error(editingComputer.value ? '计算机信息更新失败' : '计算机添加失败');
        console.error(editingComputer.value ? '计算机信息更新失败:' : '计算机添加失败:', error);
      } finally {
        saveLoading.value = false;
      }
    }
  });
}

const resetForm = () => {
  editingComputer.value = null
  computerForm.name = ''
  computerForm.macAddress = ''
  computerForm.ipAddress = ''
  computerForm.area = ''
}

watch(showAddDialog, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

onMounted(() => {
  fetchComputers()
})

const getCardStatusClass = (computer) => {
  if (computer.powerOff) return 'status-off';
  if (computer.idle) return 'status-idle';
  if (computer.inUse) return 'status-in-use';
  if (computer.underMaintenance) return 'status-maintenance';
  
  // 如果没有布尔标志，则检查数字状态
  const statusMap = {
    0: 'status-off',
    1: 'status-idle',
    2: 'status-in-use',
    3: 'status-maintenance'
  };
  return statusMap[computer.status] || '';
}

const getBadgeStatusClass = (computer) => {
  if (computer.powerOff) return 'badge-off';
  if (computer.idle) return 'badge-idle';
  if (computer.inUse) return 'badge-in-use';
  if (computer.underMaintenance) return 'badge-maintenance';
  
  // 如果没有布尔标志，则检查数字状态
  const statusMap = {
    0: 'badge-off',
    1: 'badge-idle',
    2: 'badge-in-use',
    3: 'badge-maintenance'
  };
  return statusMap[computer.status] || '';
}
</script>

<style scoped>
.computer-management {
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
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.stat-total { background: linear-gradient(45deg, #409eff, #66b3ff); }
.stat-idle { background: linear-gradient(45deg, #67c23a, #85ce61); }
.stat-inuse { background: linear-gradient(45deg, #e6a23c, #ebb563); }
.stat-maintenance { background: linear-gradient(45deg, #f56c6c, #f78989); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
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
}

.filter-group :deep(.el-input__wrapper),
.filter-group :deep(.el-select .el-input__wrapper) {
  height: 32px;
  line-height: 32px;
}

.filter-group :deep(.el-input__inner) {
  height: 32px;
  line-height: 32px;
}

.action-group {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-group .el-button {
  height: 32px;
  padding: 0 16px;
}

.area-select, .status-select {
  width: 160px;
}

.search-input {
  width: 300px;
}

.refresh-btn, .add-btn {
  border-radius: 4px;
  font-weight: 500;
}

.computer-grid {
  margin-bottom: 32px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.computer-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-left: 4px solid transparent;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.computer-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.computer-card.status-off { border-left-color: #909399; }
.computer-card.status-idle { border-left-color: #67c23a; }
.computer-card.status-in-use { border-left-color: #e6a23c; }
.computer-card.status-maintenance { border-left-color: #f56c6c; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.computer-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}

.badge-off { background: #909399; }
.badge-idle { background: #67c23a; }
.badge-in-use { background: #e6a23c; }
.badge-maintenance { background: #f56c6c; }

.card-body {
  margin-bottom: 16px;
  flex: 1;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #666;
  font-size: 0.9rem;
}

.info-icon {
  color: #999;
}

.card-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.empty-state {
  grid-column: 1 / -1;
  padding: 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.pagination-container {
  display: flex;
  justify-content: center;
  padding: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.computer-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.computer-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-right: 0;
  background: #f5f7fa;
}

.computer-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

.computer-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.computer-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #f5f7fa;
}

.dialog-header {
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
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

.computer-form {
  padding: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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

.computer-card-enter-active,
.computer-card-leave-active {
  transition: all 0.3s ease;
}

.computer-card-enter-from {
  opacity: 0;
  transform: translateY(30px);

}

.computer-card-leave-to {
  opacity: 0;
  transform: translateY(-30px);
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
    margin-top: 16px;
  }
  
  .search-input {
    max-width: none;
  }
}

@media (max-width: 768px) {
  .computer-management {
    padding: 16px;
  }
  
  .title {
    font-size: 2rem;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .area-select, 
  .status-select,
  .search-input {
    width: 100%;
  }
  
  .action-group {
    flex-direction: column;
  }
  
  .refresh-btn,
  .add-btn {
    width: 100%;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: auto;
  overflow: hidden;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 20px;
  color: #2c3e50;
  border-left: 4px solid #409eff;
  padding-left: 15px;
  line-height: 1.2;
}

/* 计算机详情对话框样式 */
.computer-detail-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.computer-detail-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-right: 0;
  background: #f5f7fa;
}

.computer-detail-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

.computer-detail-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.computer-detail-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #f5f7fa;
}

.computer-details {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
}

.details-header {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 20px;
  color: white;
  text-align: center;
}

.details-header.status-off { 
  background: linear-gradient(135deg, #909399 0%, #606266 100%); 
}
.details-header.status-idle { 
  background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%); 
}
.details-header.status-in-use { 
  background: linear-gradient(135deg, #e6a23c 0%, #cf9236 100%); 
}
.details-header.status-maintenance { 
  background: linear-gradient(135deg, #f56c6c 0%, #e45656 100%); 
}

.details-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  font-size: 40px;
}

.details-header h3 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 600;
}

.status-badge {
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
}

.details-content {
  padding: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  font-size: 14px;
  line-height: 1.5;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item .label {
  width: 110px;
  color: #606266;
  font-weight: 500;
}

.detail-item .value {
  flex: 1;
  color: #303133;
}

.details-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}
</style>