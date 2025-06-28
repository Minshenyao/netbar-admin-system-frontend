<template>
  <div class="area-management-container">
    <!-- 页面标题 -->
    <div class="header" v-motion-slide-visible-once-top>
      <h1 class="title">
        <el-icon class="title-icon"><Location /></el-icon>
        区域管理中心
      </h1>
      <p class="subtitle">创建和管理网吧区域，查看各区域计算机分布情况</p>
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
            placeholder="区域状态" 
            class="status-select"
            @change="handleStatusFilter"
          >
            <el-option label="全部状态" value="" />
            <el-option label="高使用率" value="high" />
            <el-option label="中等使用率" value="medium" />
            <el-option label="低使用率" value="low" />
          </el-select>
          
          <el-input
            placeholder="搜索区域名称"
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
          
          <el-button 
            type="success" 
            @click="showAddAreaDialog = true"
            class="add-btn"
          >
            <el-icon><Plus /></el-icon>
            添加区域
          </el-button>
        </div>
      </div>
    </div>

    <!-- 区域卡片列表 -->
    <div class="area-grid" v-motion-slide-visible-once-bottom>
      <h2 class="section-title">区域列表</h2>
      
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

      <transition-group name="area-card" tag="div" class="grid-container" v-else>
        <div 
          class="area-card" 
          v-for="area in displayAreas" 
          :key="area.name"
          :class="getAreaStatusClass(area)"
          @click="handleAreaClick(area)"
        >
          <div class="card-header">
            <div class="area-name">{{ area.name }}</div>
            <div class="status-badge" :class="getAreaBadgeClass(area)">
              {{ getAreaStatusText(area) }}
            </div>
          </div>
          
          <div class="card-body">
            <div class="area-stats">
              <div class="area-stat">
                <span class="stat-label">计算机总数</span>
                <span class="stat-value">{{ area.totalComputers }}</span>
              </div>
              <div class="area-stat">
                <span class="stat-label">空闲</span>
                <span class="stat-value">{{ area.idleComputers }}</span>
              </div>
              <div class="area-stat">
                <span class="stat-label">使用中</span>
                <span class="stat-value">{{ area.inUseComputers }}</span>
              </div>
              <div class="area-stat">
                <span class="stat-label">维修中</span>
                <span class="stat-value">{{ area.maintenanceComputers }}</span>
              </div>
            </div>
            
            <div class="area-progress">
              <span class="progress-label">使用率: {{ calculateUsageRate(area) }}%</span>
              <el-progress 
                :percentage="calculateUsageRate(area)" 
                :status="getProgressStatus(area)"
                :stroke-width="10"
              />
            </div>
          </div>
          
          <div class="card-actions">
            <el-button 
              type="primary" 
              size="small"
              @click.stop="viewAreaComputers(area)"
            >
              查看计算机
            </el-button>
            <el-button 
              type="success" 
              size="small"
              @click.stop="editArea(area)"
            >
              编辑区域
            </el-button>
            <el-button 
              type="danger" 
              size="small"
              @click.stop="confirmDeleteArea(area)"
            >
              删除区域
            </el-button>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="displayAreas.length === 0" key="empty" class="empty-state">
          <el-empty description="暂无区域数据，请添加新的区域" />
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
          
    <!-- 添加/编辑区域对话框 -->
    <el-dialog
      v-model="showAddAreaDialog"
      :title="editingArea ? '编辑区域信息' : '添加新区域'"
      width="500px"
      class="area-dialog"
      destroy-on-close
    >
      <div class="dialog-header">
        <div class="dialog-icon">
          <el-icon><Location /></el-icon>
        </div>
        <h3 class="dialog-title">
          {{ editingArea ? '编辑 ' + editingArea.name : '创建新区域' }}
        </h3>
        <p class="dialog-subtitle">
          {{ editingArea ? '修改区域的详细信息' : '填写以下信息以添加新区域' }}
        </p>
      </div>
      
      <el-form :model="areaForm" :rules="areaRules" ref="areaFormRef" label-width="100px" class="area-form">
        <el-form-item label="区域名称" prop="name">
          <el-input v-model="areaForm.name" placeholder="请输入区域名称">
            <template #prefix>
              <el-icon><Location /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="区域描述" prop="description">
          <el-input 
            type="textarea" 
            v-model="areaForm.description" 
            placeholder="请输入区域描述"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="区域容量" prop="capacity">
          <el-input-number 
            v-model="areaForm.capacity" 
            :min="1" 
            :max="100"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddAreaDialog = false">取消</el-button>
          <el-button type="primary" @click="saveArea" :loading="saveLoading">
            {{ editingArea ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 区域计算机列表对话框 -->
    <el-dialog
      v-model="showAreaComputersDialog"
      :title="selectedArea ? selectedArea + ' 区域计算机' : '区域计算机'"
      width="800px"
      class="computers-dialog"
      destroy-on-close
    >
      <div v-if="loading" class="computers-loading">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else>
        <el-table
          :data="areaComputers"
          style="width: 100%"
          border
          stripe
          v-loading="loading"
        >
          <el-table-column prop="name" label="计算机名称" />
          <el-table-column prop="ipAddress" label="IP地址" />
          <el-table-column prop="macAddress" label="MAC地址" />
          <el-table-column label="状态">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row)">
                {{ getStatusText(scope.row) }}
              </el-tag>
      </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button 
                type="primary" 
                size="small" 
                @click="editComputer(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                type="danger" 
                size="small" 
                @click="confirmDeleteComputer(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="add-computer-btn">
          <el-button 
            type="success" 
            @click="addComputerToArea"
            icon="Plus"
          >
            添加计算机
          </el-button>
        </div>
      </div>
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
const showAddAreaDialog = ref(false)
const showAreaComputersDialog = ref(false)
const editingComputer = ref(null)
const editingArea = ref(null)
const areaComputers = ref([])

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

// 区域数据
const areaList = ref([])
const displayAreas = computed(() => {
  if (!areaList.value || areaList.value.length === 0) {
    return [];
  }
  
  let result = [...areaList.value];
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(area => 
      area.name.toLowerCase().includes(query) || 
      (area.description && area.description.toLowerCase().includes(query))
    );
  }
  
  // 状态过滤
  if (statusFilter.value) {
    switch (statusFilter.value) {
      case 'high':
        result = result.filter(area => calculateUsageRate(area) >= 70);
        break;
      case 'medium':
        result = result.filter(area => calculateUsageRate(area) >= 30 && calculateUsageRate(area) < 70);
        break;
      case 'low':
        result = result.filter(area => calculateUsageRate(area) < 30);
        break;
    }
  }
  
  return result;
})

// 表单数据
const computerForm = reactive({
  name: '',
  macAddress: '',
  ipAddress: '',
  area: ''
})

// 区域表单数据
const areaForm = reactive({
  name: '',
  description: '',
  capacity: 20
})

const formRules = {
  area: [{ required: true, message: '请选择区域', trigger: 'change' }]
}

const areaRules = {
  name: [{ required: true, message: '请输入区域名称', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入区域容量', trigger: 'change' }]
}

const formRef = ref()
const areaFormRef = ref()

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
  // 计算区域总数和各状态计算机分布
  const totalAreas = areas.value.length
  const totalComputers = computers.value.length
  const avgComputersPerArea = totalAreas ? Math.round(totalComputers / totalAreas) : 0
  
  // 计算区域使用率 (使用中+维修中计算机占比)
  const inUseCount = computers.value.filter(c => c.status === 2 || c.inUse).length
  const maintenanceCount = computers.value.filter(c => c.status === 3 || c.underMaintenance).length
  const usageRate = totalComputers ? Math.round(((inUseCount + maintenanceCount) / totalComputers) * 100) : 0

  return [
    { label: '区域总数', value: totalAreas, type: 'areas', icon: Location },
    { label: '计算机总数', value: totalComputers, type: 'computers', icon: Desktop },
    { label: '平均密度', value: avgComputersPerArea + '台/区', type: 'density', icon: Cpu },
    { label: '使用率', value: usageRate + '%', type: 'usage', icon: User }
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
    
    // 获取所有计算机数据，不分页
    const params = {
      page: 0,
      size: 1000,  // 获取足够多的数据以便统计
      sortBy: 'id'
    };
    
    if (selectedArea.value) {
      response = await getComputersByAreaPaged(selectedArea.value, params);
    } else {
      response = await getComputerList(params);
    }
    
    if (response.code === 0) {
      computers.value = response.data.content;
      total.value = response.data.totalElements;
      
      // 获取区域统计
      const areaResponse = await getAreaCount();
      if (areaResponse.code === 0) {
        areaStats.value = areaResponse.data;
      }
      
      // 生成区域列表
      generateAreaList();
    }
  } catch (error) {
    ElMessage.error('获取数据失败');
    console.error('获取数据失败:', error);
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
  ElMessage.success('区域数据刷新成功')
}

const handleComputerClick = (computer) => {
  // 显示计算机详情
  ElMessageBox.alert(
    `计算机: ${computer.name}<br/>
     区域: ${computer.area}<br/>
     IP地址: ${computer.ipAddress}<br/>
     状态: ${getStatusText(computer)}`,
    '计算机详情',
    { dangerouslyUseHTMLString: true }
  )
}

const powerOn = async (id) => {
  actionLoading.value[id] = true;
  try {
    const response = await powerOnComputer(id);
    if (response.code == 0) {
      await fetchComputers();
      ElMessage.success('开机成功');
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
      ElMessage.success('关机成功');
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
      ElMessage.success('已设置为维修状态');
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
            ElMessage.success('更新成功');
            showAddDialog.value = false;
            resetForm();
            fetchComputers();
          } else {
            ElMessage.error(response.msg || '更新失败');
          }
        } else {
          // 添加计算机
          response = await createComputer(computerForm);
          if (response.code == 0) {
            ElMessage.success('添加成功');
            showAddDialog.value = false;
            resetForm();
            fetchComputers();
          } else {
            ElMessage.error(response.msg || '添加失败');
          }
        }
      } catch (error) {
        ElMessage.error(editingComputer.value ? '更新失败' : '添加失败');
        console.error(editingComputer.value ? '更新失败:' : '添加失败:', error);
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

watch(showAddAreaDialog, (newVal) => {
  if (!newVal) {
    resetAreaForm()
  }
})

watch(showAddDialog, (newVal) => {
  if (!newVal) {
    resetForm()
  }
})

watch(showAreaComputersDialog, (newVal) => {
  if (!newVal && selectedArea.value) {
    // 当关闭区域计算机列表对话框时，重新获取数据以更新区域列表
    fetchComputers()
  }
})

onMounted(() => {
  fetchComputers()
})

const getCardStatusClass = (computer) => {
  if (computer.powerOff) return 'status-0';
  if (computer.idle) return 'status-1';
  if (computer.inUse) return 'status-2';
  if (computer.underMaintenance) return 'status-3';
  return `status-${computer.status}`;
}

const getBadgeStatusClass = (computer) => {
  if (computer.powerOff) return 'badge-0';
  if (computer.idle) return 'badge-1';
  if (computer.inUse) return 'badge-2';
  if (computer.underMaintenance) return 'badge-3';
  return `badge-${computer.status}`;
}

// 区域相关函数
const generateAreaList = () => {
  const areaMap = {};
  
  // 从计算机数据中提取区域信息
  computers.value.forEach(computer => {
    if (!areaMap[computer.area]) {
      areaMap[computer.area] = {
        name: computer.area,
        description: '',
        capacity: 20,
        totalComputers: 0,
        idleComputers: 0,
        inUseComputers: 0,
        maintenanceComputers: 0,
        powerOffComputers: 0
      };
    }
    
    areaMap[computer.area].totalComputers++;
    
    if (computer.status === 0 || computer.powerOff) {
      areaMap[computer.area].powerOffComputers++;
    } else if (computer.status === 1 || computer.idle) {
      areaMap[computer.area].idleComputers++;
    } else if (computer.status === 2 || computer.inUse) {
      areaMap[computer.area].inUseComputers++;
    } else if (computer.status === 3 || computer.underMaintenance) {
      areaMap[computer.area].maintenanceComputers++;
    }
  });
  
  // 转换为数组
  areaList.value = Object.values(areaMap);
}

const calculateUsageRate = (area) => {
  if (!area || area.totalComputers === 0) return 0;
  return Math.round(((area.inUseComputers + area.maintenanceComputers) / area.totalComputers) * 100);
}

const getAreaStatusClass = (area) => {
  const usageRate = calculateUsageRate(area);
  if (usageRate >= 70) return 'status-high';
  if (usageRate >= 30) return 'status-medium';
  return 'status-low';
}

const getAreaBadgeClass = (area) => {
  const usageRate = calculateUsageRate(area);
  if (usageRate >= 70) return 'badge-high';
  if (usageRate >= 30) return 'badge-medium';
  return 'badge-low';
}

const getAreaStatusText = (area) => {
  const usageRate = calculateUsageRate(area);
  if (usageRate >= 70) return '高使用率';
  if (usageRate >= 30) return '中等使用率';
  return '低使用率';
}

const getProgressStatus = (area) => {
  const usageRate = calculateUsageRate(area);
  if (usageRate >= 70) return 'exception';
  if (usageRate >= 30) return 'warning';
  return 'success';
}

const handleAreaClick = (area) => {
  // 显示区域详情
  ElMessageBox.alert(
    `<div class="area-details">
      <h3>${area.name} 区域详情</h3>
      <div class="detail-item">
        <span class="label">计算机总数:</span>
        <span class="value">${area.totalComputers}</span>
      </div>
      <div class="detail-item">
        <span class="label">空闲计算机:</span>
        <span class="value">${area.idleComputers}</span>
      </div>
      <div class="detail-item">
        <span class="label">使用中计算机:</span>
        <span class="value">${area.inUseComputers}</span>
      </div>
      <div class="detail-item">
        <span class="label">维修中计算机:</span>
        <span class="value">${area.maintenanceComputers}</span>
      </div>
      <div class="detail-item">
        <span class="label">关机计算机:</span>
        <span class="value">${area.powerOffComputers}</span>
      </div>
      <div class="detail-item">
        <span class="label">使用率:</span>
        <span class="value">${calculateUsageRate(area)}%</span>
      </div>
    </div>`,
    '区域详情',
    { 
      dangerouslyUseHTMLString: true,
      confirmButtonText: '关闭'
    }
  );
}

const viewAreaComputers = async (area) => {
  selectedArea.value = area.name;
  showAreaComputersDialog.value = true;
  
  // 获取该区域的计算机
  loading.value = true;
  try {
    const response = await getComputersByArea(area.name);
    if (response.code === 0) {
      areaComputers.value = response.data;
    } else {
      ElMessage.error('获取区域计算机失败');
      areaComputers.value = [];
    }
  } catch (error) {
    console.error('获取区域计算机失败:', error);
    ElMessage.error('获取区域计算机失败');
    areaComputers.value = [];
  } finally {
    loading.value = false;
  }
}

const editArea = (area) => {
  editingArea.value = area;
  areaForm.name = area.name;
  areaForm.description = area.description || '';
  areaForm.capacity = area.capacity || 20;
  showAddAreaDialog.value = true;
}

const confirmDeleteArea = (area) => {
  ElMessageBox.confirm(
    `确定要删除 ${area.name} 区域吗？该操作会影响该区域下的所有计算机。`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteArea(area);
  }).catch(() => {
    // 用户取消删除
  });
}

const deleteArea = (area) => {
  // 模拟删除区域
  ElMessage.success(`成功删除 ${area.name} 区域`);
  areaList.value = areaList.value.filter(a => a.name !== area.name);
  
  // 实际项目中应该调用API删除区域
  // const response = await deleteAreaApi(area.name);
}

const saveArea = async () => {
  if (!areaFormRef.value) return;
  
  await areaFormRef.value.validate(async (valid) => {
    if (valid) {
      saveLoading.value = true;
      try {
        if (editingArea.value) {
          // 更新区域
          // 实际项目中应该调用API更新区域
          // const response = await updateAreaApi(editingArea.value.name, areaForm);
          
          // 模拟更新
          const index = areaList.value.findIndex(a => a.name === editingArea.value.name);
    if (index !== -1) {
            areaList.value[index] = {
              ...areaList.value[index],
              name: areaForm.name,
              description: areaForm.description,
              capacity: areaForm.capacity
            };
          }
          
          ElMessage.success('区域信息更新成功');
        } else {
          // 添加区域
          // 实际项目中应该调用API添加区域
          // const response = await createAreaApi(areaForm);
          
          // 模拟添加
          areaList.value.push({
            name: areaForm.name,
            description: areaForm.description,
            capacity: areaForm.capacity,
            totalComputers: 0,
            idleComputers: 0,
            inUseComputers: 0,
            maintenanceComputers: 0,
            powerOffComputers: 0
          });
          
          ElMessage.success('新区域添加成功');
        }
        
        showAddAreaDialog.value = false;
        resetAreaForm();
  } catch (error) {
        console.error('保存区域失败:', error);
        ElMessage.error('保存区域失败');
      } finally {
        saveLoading.value = false;
      }
    }
  });
}

const resetAreaForm = () => {
  editingArea.value = null;
  areaForm.name = '';
  areaForm.description = '';
  areaForm.capacity = 20;
}

const addComputerToArea = () => {
  // 重置计算机表单
  computerForm.name = '';
  computerForm.macAddress = '';
  computerForm.ipAddress = '';
  computerForm.area = selectedArea.value;
  
  // 关闭计算机列表对话框，打开添加计算机对话框
  showAreaComputersDialog.value = false;
  showAddDialog.value = true;
}

const getStatusTagType = (computer) => {
  if (computer.powerOff || computer.status === 0) return 'info';
  if (computer.idle || computer.status === 1) return 'success';
  if (computer.inUse || computer.status === 2) return 'warning';
  if (computer.underMaintenance || computer.status === 3) return 'danger';
  return 'info';
}

const confirmDeleteComputer = (computer) => {
  ElMessageBox.confirm(
    `确定要删除计算机 ${computer.name} 吗？`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const response = await deleteComputer(computer.id);
      if (response.code === 0) {
        ElMessage.success('计算机删除成功');
        // 刷新区域计算机列表
        viewAreaComputers({ name: selectedArea.value });
      } else {
        ElMessage.error(response.message || '删除计算机失败');
      }
    } catch (error) {
      console.error('删除计算机失败:', error);
      ElMessage.error('删除计算机失败');
    }
  }).catch(() => {
    // 用户取消删除
  });
}
</script>

<style scoped>
.area-management-container {
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

.stat-areas { background: linear-gradient(45deg, #409eff, #66b3ff); }
.stat-computers { background: linear-gradient(45deg, #67c23a, #85ce61); }
.stat-density { background: linear-gradient(45deg, #e6a23c, #ebb563); }
.stat-usage { background: linear-gradient(45deg, #f56c6c, #f78989); }

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

.area-grid {
  margin-bottom: 32px;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.area-card {
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

.area-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.area-card.status-high { border-left-color: #f56c6c; }
.area-card.status-medium { border-left-color: #e6a23c; }
.area-card.status-low { border-left-color: #67c23a; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
        margin-bottom: 16px;
}
        
        .area-name {
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
        
.badge-high { background: #f56c6c; }
.badge-medium { background: #e6a23c; }
.badge-low { background: #67c23a; }

.card-body {
  margin-bottom: 16px;
  flex: 1;
}

.area-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
  }
  
.area-stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f5f7fa;
  padding: 8px 12px;
  border-radius: 6px;
}

.area-progress {
  margin-top: 16px;
}

.progress-label {
  display: block;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #606266;
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
}

.computer-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-right: 0;
}

.computer-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.computer-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
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

.area-card-enter-active,
.area-card-leave-active {
  transition: all 0.3s ease;
}

.area-card-enter-from {
  opacity: 0;
  transform: translateY(30px);

}

.area-card-leave-to {
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
  .area-management-container {
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

/* 区域对话框样式 */
.area-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.area-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-right: 0;
  background: #f5f7fa;
}

.area-dialog :deep(.el-dialog__title) {
  font-weight: 600;
  color: #303133;
}

.area-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.area-dialog :deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background: #f5f7fa;
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

.area-form {
  padding: 20px;
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
  gap: 10px;
}

/* 计算机列表对话框 */
.computers-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.computers-dialog :deep(.el-dialog__header) {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  background: #f5f7fa;
}

.computers-dialog :deep(.el-dialog__body) {
  padding: 20px;
}

.computers-loading {
  padding: 20px;
}

.add-computer-btn {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 