<template>
  <div class="user-roles-container">
    <!-- 页面头部 -->
    <div class="page-header" v-motion-slide-visible-once-top>
      <div class="header-content">
        <div class="title-section">
          <el-icon class="title-icon"><Setting /></el-icon>
          <h1 class="page-title">权限管理</h1>
          <span class="page-subtitle">管理系统中的用户权限和折扣</span>
          </div>
        <div class="header-actions">
          <el-button
            type="primary"
            @click="openAddRoleDialog"
            class="add-btn"
            :icon="Plus"
          >
            新增权限
          </el-button>
          <el-button
            @click="fetchRolesList"
            :icon="Refresh"
            :loading="loading"
          >
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 权限统计卡片 -->
    <div class="stats-section" v-motion-slide-visible-once-right>
      <div class="stats-grid">
        <el-card class="stat-card total-roles">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Menu /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ roleStats.total }}</div>
              <div class="stat-label">权限类型</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card system-roles">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ roleStats.system }}</div>
              <div class="stat-label">系统权限</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card custom-roles">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ roleStats.custom }}</div>
              <div class="stat-label">自定义权限</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card discount-roles">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><Discount /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ roleStats.discount }}</div>
              <div class="stat-label">折扣权限</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
      
      <!-- 权限列表表格 -->
    <div class="table-section" v-motion-slide-visible-once-bottom>
      <el-card class="table-card">
      <el-table
          :data="rolesList"
        v-loading="loading"
          class="role-table"
          stripe
        border
      >
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column label="权限名称" width="150" align="center">
            <template #default="{ row }">
              <div class="role-name">
                <span :class="{'system-role': isSystemRole(row.code)}">{{ row.name }}</span>
                <el-tag v-if="isSystemRole(row.code)" size="small" type="danger" effect="dark">系统</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="code" label="权限编码" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="getRoleCodeTagType(row.code)" size="small">{{ row.code }}</el-tag>
            </template>
          </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
          <el-table-column label="折扣系数" width="180" align="center">
          <template #default="{ row }">
              <div class="discount-display">
                <div class="discount-tag">
                  <el-tag :type="getDiscountTagType(row.discount)" size="small">
                    {{ formatDiscount(row.discount) }}
              </el-tag>
                </div>
              <el-progress 
                :percentage="(1 - row.discount) * 100" 
                :color="getDiscountColor(row.discount)" 
                :stroke-width="8"
                class="discount-progress"
                  :format="() => ''"
              />
            </div>
          </template>
        </el-table-column>
          <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
                <el-button
                  type="primary"
                  link
                  @click="editRole(row)"
                  :icon="Edit"
                  size="small"
                  :disabled="isSystemRole(row.code)"
                >
                  编辑
                </el-button>
                <el-button 
                  type="danger" 
                  link
                  @click="deleteRole(row)"
                  :icon="Delete"
                  size="small" 
                  :disabled="isSystemRole(row.code)"
                >
                  删除
                </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    </div>

    <!-- 新增/编辑权限对话框 -->
    <el-dialog
      v-model="showRoleDialog"
      :title="isEdit ? '编辑权限' : '新增权限'"
      width="550px"
      class="role-form-dialog"
      :before-close="() => {
        showRoleDialog = false;
        resetRoleForm();
      }"
      destroy-on-close
    >
      <div v-if="isEdit" class="role-edit-header">
        <div class="role-edit-icon">
          <el-icon><Setting /></el-icon>
        </div>
        <h2 class="role-edit-name">{{ roleForm.name }}</h2>
        <div class="role-edit-code">
          <el-tag :type="getRoleCodeTagType(roleForm.code)" effect="dark" size="small">
            权限编码: {{ roleForm.code }}
          </el-tag>
        </div>
      </div>
      
      <div v-else class="role-add-header">
        <div class="add-icon-container">
          <el-icon class="add-role-icon"><Plus /></el-icon>
        </div>
        <h2 class="add-role-title">创建新权限</h2>
        <p class="add-role-subtitle">设置权限名称、编码和折扣系数</p>
      </div>

      <el-form
        ref="roleFormRef"
        :model="roleForm"
        :rules="roleFormRules"
        label-width="100px"
        class="role-form"
      >
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code" v-if="!isEdit">
          <el-input-number v-model="roleForm.code" :min="1" :max="98" />
          <div class="form-tip">权限编码一旦创建不可修改 (1-98)</div>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input 
            v-model="roleForm.description" 
            type="textarea" 
            rows="3" 
            placeholder="请输入权限描述"
          />
        </el-form-item>
        <el-form-item label="折扣系数" prop="discount">
          <div class="discount-slider">
            <el-slider
              v-model="roleForm.discount"
              :min="0"
              :max="1"
              :step="0.1"
              :format-tooltip="formatDiscountTooltip"
              :marks="discountMarks"
              show-stops
              style="width: 100%"
            />
            <div class="discount-preview">
              <span class="discount-label">折扣预览:</span>
              <el-tag :type="getDiscountTagType(roleForm.discount)" size="large">
                {{ formatDiscount(roleForm.discount) }}
              </el-tag>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRoleDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitRoleForm"
            :loading="formLoading"
          >
            {{ isEdit ? "更新" : "创建" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Setting,
  Plus,
  Refresh,
  Edit,
  Delete,
  Menu,
  Lock,
  UserFilled,
  Discount
} from "@element-plus/icons-vue";
import request from "../../utils/request";
import { getPermissions } from '../../api/user-management';

// 响应式数据
const loading = ref(false);
const formLoading = ref(false);
const rolesList = ref([]);
const showRoleDialog = ref(false);
const isEdit = ref(false);
const roleFormRef = ref(null);
const currentRole = ref(null);

// 权限统计
const roleStats = reactive({
  total: 0,
  system: 0,
  custom: 0,
  discount: 0
});

// 折扣标记点
const discountMarks = {
  0: '免费',
  0.5: '5折',
  1: '原价'
};

// 权限表单
const roleForm = reactive({
  id: null,
  name: "",
  code: 4,
  description: "",
  discount: 0.8
});

// 表单验证规则
const roleFormRules = {
  name: [
    { required: true, message: "请输入权限名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  code: [
    { required: true, message: "请输入权限编码", trigger: "blur" }
  ],
  description: [
    { required: true, message: "请输入描述", trigger: "blur" }
  ],
  discount: [
    { required: true, message: "请设置折扣系数", trigger: "blur" }
  ]
};

// 判断是否为系统权限
const isSystemRole = (code) => {
  return code === 0 || code === 99;
};

// 获取权限编码标签类型
const getRoleCodeTagType = (code) => {
  if (code === 99) return "danger";
  if (code === 0) return "info";
  return "success";
};

// 获取折扣标签类型
const getDiscountTagType = (discount) => {
  if (discount === 0) return "danger";
  if (discount <= 0.5) return "success";
  if (discount <= 0.7) return "warning";
  if (discount <= 0.9) return "info";
  return "";
};

// 获取折扣颜色
const getDiscountColor = (discount) => {
  if (discount === 0) return "#F56C6C";
  if (discount <= 0.5) return "#67C23A";
  if (discount <= 0.7) return "#E6A23C";
  if (discount <= 0.9) return "#909399";
  return "#DCDFE6";
};

// 格式化折扣
const formatDiscount = (discount) => {
  if (discount === 0) return "免费";
  if (discount === 1) return "原价";
  return `${Math.round(discount * 10)}折`;
};

// 格式化折扣提示
const formatDiscountTooltip = (val) => {
  return formatDiscount(val);
};

// 获取权限列表
const fetchRolesList = async () => {
  loading.value = true;
  try {
    const response = await request.get("/api/permissions");
    if (response.code === 0) {
      rolesList.value = response.data;
      updateRoleStats();
    } else {
      ElMessage.error(response.message || "获取权限列表失败");
    }
  } catch (error) {
    console.error("获取权限列表失败", error);
    // 使用模拟数据
    const mockData = await getPermissions();
    rolesList.value = mockData;
    updateRoleStats();
  } finally {
    loading.value = false;
  }
};

// 更新权限统计
const updateRoleStats = () => {
  roleStats.total = rolesList.value.length;
  roleStats.system = rolesList.value.filter(role => isSystemRole(role.code)).length;
  roleStats.custom = rolesList.value.length - roleStats.system;
  roleStats.discount = rolesList.value.filter(role => role.discount < 1).length;
};

// 新增权限按钮点击事件
const openAddRoleDialog = () => {
  resetRoleForm();
  isEdit.value = false;
  
  // 找出当前最大的code，避免冲突
  const existingCodes = rolesList.value.map(role => role.code);
  const availableCodes = Array.from({ length: 98 }, (_, i) => i + 1)
    .filter(code => code !== 99 && !existingCodes.includes(code));
  
  roleForm.code = availableCodes.length > 0 ? Math.min(...availableCodes) : 4;
  showRoleDialog.value = true;
};

// 编辑权限
const editRole = (role) => {
  if (isSystemRole(role.code)) {
    ElMessage.warning("系统预设权限不可编辑");
    return;
  }
  
  isEdit.value = true;
  currentRole.value = role;
  Object.assign(roleForm, {
    id: role.id,
    name: role.name,
    code: role.code,
    description: role.description,
    discount: role.discount
  });
  showRoleDialog.value = true;
};

// 删除权限
const deleteRole = async (role) => {
  if (isSystemRole(role.code)) {
    ElMessage.warning("系统预设权限不可删除");
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除权限 "${role.name}" 吗？此操作不可恢复！`,
      "危险操作",
      { type: "warning" }
    );

    formLoading.value = true;
    const response = await request.delete(`/api/permissions/${role.id}`);

    if (response.code === 0) {
      ElMessage.success("删除成功");
      fetchRolesList();
    } else {
      ElMessage.error(response.message || "删除失败");
    }
    } catch (error) {
    if (error !== "cancel") {
      console.error("删除权限失败", error);
      ElMessage.error("删除失败");
    }
  } finally {
    formLoading.value = false;
}
};

// 提交权限表单
const submitRoleForm = async () => {
  try {
    await roleFormRef.value.validate();
    formLoading.value = true;
      
      if (isEdit.value) {
      // 更新权限
      const updateResponse = await request.put(
        `/api/permissions/${roleForm.id}`,
        {
          name: roleForm.name,
          description: roleForm.description,
          discount: roleForm.discount
        }
      );

      if (updateResponse.code === 0) {
        ElMessage.success("更新成功");
        showRoleDialog.value = false;
        resetRoleForm();
        fetchRolesList();
      } else {
        ElMessage.error(updateResponse.message || "更新失败");
      }
    } else {
      // 创建权限
      const createResponse = await request.post("/api/permissions", {
        name: roleForm.name,
        code: roleForm.code,
        description: roleForm.description,
        discount: roleForm.discount
      });

      if (createResponse.code === 0) {
        ElMessage.success("创建成功");
        showRoleDialog.value = false;
        resetRoleForm();
        fetchRolesList();
      } else {
        ElMessage.error(createResponse.message || "创建失败");
      }
    }
  } catch (error) {
    console.error(isEdit.value ? "更新权限失败" : "创建权限失败", error);
    ElMessage.error(isEdit.value ? "更新失败" : "创建失败");
  } finally {
    formLoading.value = false;
  }
};

// 重置表单
const resetRoleForm = () => {
  Object.assign(roleForm, {
    id: null,
    name: "",
    code: 4,
    description: "",
    discount: 0.8
  });
  isEdit.value = false;
  currentRole.value = null;
  roleFormRef.value?.resetFields();
};

// 生命周期
onMounted(() => {
  fetchRolesList();
});
</script>

<style scoped>
.user-roles-container {
  padding: 16px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #409eff;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 24px;
  color: #409eff;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.page-subtitle {
  color: #6c757d;
  font-size: 14px;
  margin-left: 8px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.add-btn {
  background: linear-gradient(45deg, #409eff, #66b3ff);
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-weight: 500;
  box-shadow: 0 3px 8px rgba(64, 158, 255, 0.3);
  transition: all 0.3s ease;
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 12px rgba(64, 158, 255, 0.4);
}

.stats-section {
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.stat-card {
  border-radius: 10px;
  border: none;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.stat-icon {
  width: 46px;
  height: 46px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  color: white;
}

.total-roles .stat-icon {
  background: linear-gradient(45deg, #409eff, #66b3ff);
}

.system-roles .stat-icon {
  background: linear-gradient(45deg, #f56c6c, #f78989);
}

.custom-roles .stat-icon {
  background: linear-gradient(45deg, #67c23a, #85ce61);
}

.discount-roles .stat-icon {
  background: linear-gradient(45deg, #e6a23c, #ebb563);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
  margin-top: 4px;
}

.table-section {
  margin-bottom: 16px;
}

.table-card {
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  border: none;
  overflow: hidden;
}

.role-table {
  background: white;
}

.role-table :deep(.el-table__header) {
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
}

.role-table :deep(.el-table__header th) {
  background: transparent;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
}

.role-table :deep(.el-table__row:hover) {
  background: #f0f8ff;
}

.role-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.system-role {
  font-weight: 600;
}

.discount-display {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.discount-tag {
  margin-bottom: 5px;
}

.discount-progress {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  justify-content: center;
}

.action-buttons .el-button {
  padding: 6px;
  margin: 0;
}

/* 编辑权限头部样式 */
.role-edit-header {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.role-edit-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  margin-bottom: 15px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.role-edit-name {
  margin: 5px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.role-edit-code {
  margin-top: 8px;
}

/* 新增权限头部样式 */
.role-add-header {
  padding: 20px;
  background: linear-gradient(135deg, #409eff 0%, #66b3ff 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: white;
}

.add-icon-container {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
}

.add-role-icon {
  font-size: 36px;
}

.add-role-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.add-role-subtitle {
  margin: 5px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 表单样式 */
.role-form {
  padding: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.discount-slider {
  padding: 10px 0;
  width: 100%;
}

:deep(.el-slider) {
  width: 100%;
  margin: 10px 0;
}

:deep(.el-slider__runway) {
  width: 100%;
}

.discount-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
  gap: 10px;
}

.discount-label {
  font-size: 14px;
  color: #606266;
}

/* 通用对话框样式 */
:deep(.el-dialog) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-right: 0;
}

:deep(.el-dialog__body) {
  padding: 0;
}

:deep(.el-dialog__footer) {
  padding: 10px 20px;
  border-top: 1px solid #f0f0f0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .user-roles-container {
    padding: 12px;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 2px;
  }
}

:deep(.el-slider__marks-text) {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  margin-top: 8px;
}

:deep(.el-slider__button) {
  width: 20px;
  height: 20px;
  border: 2px solid #409eff;
}
</style> 