<template>
  <div class="user-list-container">
    <!-- 页面头部 -->
    <div class="page-header" v-motion-slide-visible-once-top>
      <div class="header-content">
        <div class="title-section">
          <el-icon class="title-icon"><User /></el-icon>
          <h1 class="page-title">用户管理</h1>
          <span class="page-subtitle">管理系统中的所有用户信息</span>
        </div>
        <div class="header-actions">
          <el-button
            type="primary"
            @click="openAddUserDialog"
            class="add-btn"
            :icon="Plus"
          >
            新增用户
          </el-button>
          <el-button
            @click="refreshUserList"
            :icon="Refresh"
            :loading="loading"
          >
            刷新
          </el-button>
        </div>
      </div>
    </div>

    <!-- 用户统计卡片 -->
    <div class="stats-section" v-motion-slide-visible-once-right>
      <div class="stats-grid">
        <el-card class="stat-card total-users">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><UserFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStats.total }}</div>
              <div class="stat-label">总用户数</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card active-users">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><CircleCheckFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStats.active }}</div>
              <div class="stat-label">正常用户</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card disabled-users">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><CircleCloseFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStats.disabled }}</div>
              <div class="stat-label">禁用用户</div>
            </div>
          </div>
        </el-card>
        <el-card class="stat-card vip-users">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon><StarFilled /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ userStats.vip }}</div>
              <div class="stat-label">VIP用户</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 用户列表表格 -->
    <div class="table-section" v-motion-slide-visible-once-bottom>
      <el-card class="table-card">
        <el-table
          :data="userList"
          v-loading="loading"
          class="user-table"
          stripe
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="id" label="ID" width="70" align="center" />
          <el-table-column label="头像" width="70" align="center">
            <template #default="{ row }">
              <div class="avatar-container">
                <el-avatar
                  :size="32"
                  :src="`https://api.dicebear.com/7.x/initials/svg?seed=${row.username}`"
                  class="user-avatar"
                />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="用户名" width="180" align="center">
            <template #default="{ row }">
              <span class="username-text">{{ row.username }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="phone"
            label="手机号"
            width="120"
            align="center"
          />
          <el-table-column
            prop="identity"
            label="身份证号"
            width="180"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            prop="balance"
            label="余额"
            width="90"
            align="center"
          >
            <template #default="{ row }">
              <span class="balance-text">¥{{ row.balance.toFixed(2) }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="permission"
            label="权限"
            width="90"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="getPermissionTagType(row.permission)" size="small">
                {{ getPermissionText(row.permission) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="70" align="center">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 1 ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === 1 ? "正常" : "禁用" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            min-width="240"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button
                  type="primary"
                  link
                  @click="viewUser(row)"
                  :icon="View"
                  size="small"
                >
                  查看
                </el-button>
                <el-button
                  type="warning"
                  link
                  @click="editUser(row)"
                  :icon="Edit"
                  size="small"
                >
                  编辑
                </el-button>
                <el-button
                  :type="row.status === 1 ? 'danger' : 'success'"
                  link
                  @click="toggleUserStatus(row)"
                  :icon="row.status === 1 ? Lock : Unlock"
                  size="small"
                >
                  {{ row.status === 1 ? "禁用" : "启用" }}
                </el-button>
                <el-button
                  type="info"
                  link
                  @click="manageBalance(row)"
                  :icon="Wallet"
                  size="small"
                >
                  余额
                </el-button>
                <el-dropdown trigger="click">
                  <el-button type="info" link :icon="More" size="small">
                    更多
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="resetPassword(row)" :icon="Key">
                        重置密码
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="viewDiscount(row)"
                        :icon="Discount"
                      >
                        查看折扣
                      </el-dropdown-item>
                      <el-dropdown-item
                        @click="viewDepositRecords(row)"
                        :icon="Money"
                      >
                        充值记录
                      </el-dropdown-item>
                      <el-dropdown-item
                        divided
                        @click="deleteUser(row)"
                        :icon="Delete"
                      >
                        <span style="color: #f56c6c">删除用户</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="pagination.currentPage"
            v-model:page-size="pagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="pagination.total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            class="custom-pagination"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="showAddUserDialog"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="550px"
      class="user-form-dialog"
      :before-close="
        () => {
          showAddUserDialog = false;
          resetUserForm();
        }
      "
      destroy-on-close
    >
      <div v-if="isEdit && currentUser" class="user-edit-header">
        <div class="user-edit-avatar">
          <img
            :src="`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.username}`"
            :alt="currentUser.username"
          />
        </div>
        <h2 class="user-edit-username">{{ currentUser.username }}</h2>
        <div class="user-edit-tags">
          <el-tag
            :type="getPermissionTagType(currentUser.permission)"
            effect="dark"
            size="small"
            class="permission-tag"
          >
            {{ getPermissionText(currentUser.permission) }}
          </el-tag>
          <el-tag
            :type="currentUser.status === 1 ? 'success' : 'danger'"
            effect="dark"
            size="small"
          >
            {{ currentUser.status === 1 ? "正常" : "禁用" }}
          </el-tag>
        </div>
      </div>

      <div v-else class="user-add-header">
        <div class="add-icon-container">
          <el-icon class="add-user-icon"><UserFilled /></el-icon>
        </div>
        <h2 class="add-user-title">创建新用户</h2>
        <p class="add-user-subtitle">填写以下信息创建新用户账号</p>
      </div>

      <el-form
        ref="userFormRef"
        :model="userForm"
        :rules="userFormRules"
        label-width="100px"
        class="user-form"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            :disabled="isEdit"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input
            v-model="userForm.password"
            type="password"
            show-password
            prefix-icon="Lock"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="userForm.phone" prefix-icon="Phone" />
        </el-form-item>
        <el-form-item label="身份证号" prop="identity">
          <el-input v-model="userForm.identity" prefix-icon="Document" />
        </el-form-item>
        <el-form-item label="用户权限" prop="permission" v-if="isEdit">
          <el-select v-model="userForm.permission" style="width: 100%">
            <el-option label="普通用户" :value="0">
              <div class="permission-option">
                <el-icon><User /></el-icon>
                <span>普通用户</span>
              </div>
            </el-option>
            <el-option label="包月用户" :value="1">
              <div class="permission-option">
                <el-icon color="#67c23a"><Checked /></el-icon>
                <span>包月用户</span>
              </div>
            </el-option>
            <el-option label="VIP用户" :value="2">
              <div class="permission-option">
                <el-icon color="#e6a23c"><Star /></el-icon>
                <span>VIP用户</span>
              </div>
            </el-option>
            <el-option label="管理员" :value="99">
              <div class="permission-option">
                <el-icon color="#f56c6c"><Setting /></el-icon>
                <span>管理员</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAddUserDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitUserForm"
            :loading="formLoading"
          >
            {{ isEdit ? "更新" : "创建" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 余额管理对话框 -->
    <el-dialog
      v-model="showBalanceDialog"
      title="余额管理"
      width="480px"
      class="balance-dialog"
      :before-close="() => (showBalanceDialog = false)"
    >
      <div class="balance-header">
        <div class="balance-avatar">
          <img
            :src="`https://api.dicebear.com/7.x/initials/svg?seed=${
              currentUser?.username || ''
            }`"
            :alt="currentUser?.username"
          />
        </div>
        <div class="balance-user-info">
          <div class="balance-username">{{ currentUser?.username }}</div>
          <div class="current-balance">
            <span class="label">当前余额</span>
            <span class="amount"
              >¥{{ currentUser?.balance?.toFixed(2) || "0.00" }}</span
            >
          </div>
        </div>
      </div>

      <el-form
        ref="balanceFormRef"
        :model="balanceForm"
        :rules="balanceFormRules"
        label-width="100px"
        class="balance-form"
      >
        <el-form-item label="操作类型" prop="type">
          <el-radio-group v-model="balanceForm.type" class="balance-type-group">
            <el-radio-button value="add">
              <el-icon><TopRight /></el-icon> 充值
            </el-radio-button>
            <el-radio-button value="deduct">
              <el-icon><BottomRight /></el-icon> 扣款
            </el-radio-button>
            <el-radio-button value="set">
              <el-icon><Edit /></el-icon> 设置
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          :label="
            balanceForm.type === 'set'
              ? '设置金额'
              : balanceForm.type === 'add'
              ? '充值金额'
              : '扣款金额'
          "
          prop="amount"
        >
          <el-input-number
            v-model="balanceForm.amount"
            :min="0"
            :precision="2"
            style="width: 100%"
            :placeholder="
              balanceForm.type === 'set' ? '输入新余额' : '输入金额'
            "
          >
            <template #prefix>
              <span class="amount-prefix">¥</span>
            </template>
          </el-input-number>
        </el-form-item>

        <div class="balance-preview" v-if="balanceForm.amount > 0">
          <div class="preview-label">操作后余额</div>
          <div class="preview-amount">
            ¥{{ calculateFinalBalance() }}
            <el-icon :class="getBalanceChangeIconClass()">
              <component :is="getBalanceChangeIcon()" />
            </el-icon>
          </div>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showBalanceDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitBalanceForm"
            :loading="formLoading"
          >
            确认
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog
      v-model="showUserDetailDialog"
      title="用户详情"
      width="400px"
      class="user-detail-dialog"
      :before-close="() => (showUserDetailDialog = false)"
    >
      <template v-if="currentDetailUser">
        <div class="user-detail-content">
          <div class="user-detail-header">
            <div class="user-avatar-large">
              <img
                :src="`https://api.dicebear.com/7.x/initials/svg?seed=${currentDetailUser.username}`"
                :alt="currentDetailUser.username"
              />
            </div>
            <h2>{{ currentDetailUser.username }}</h2>
            <div class="user-tags">
              <el-tag
                :type="getPermissionTagType(currentDetailUser.permission)"
                size="small"
                effect="dark"
                class="user-tag"
              >
                {{ getPermissionText(currentDetailUser.permission) }}
              </el-tag>
              <el-tag
                :type="currentDetailUser.status === 1 ? 'success' : 'danger'"
                size="small"
                effect="dark"
                class="user-tag"
              >
                {{ currentDetailUser.status === 1 ? "正常" : "禁用" }}
              </el-tag>
            </div>
          </div>
          <div class="user-detail-body">
            <div class="detail-item">
              <div class="item-label">
                <el-icon><Phone /></el-icon>
                手机号
              </div>
              <div class="item-value">
                {{ currentDetailUser.phone || "未设置" }}
              </div>
            </div>
            <div class="detail-item">
              <div class="item-label">
                <el-icon><Document /></el-icon>
                身份证
              </div>
              <div class="item-value">
                {{ currentDetailUser.identity || "未设置" }}
              </div>
            </div>
            <div class="detail-item">
              <div class="item-label">
                <el-icon><Wallet /></el-icon>
                余额
              </div>
              <div class="item-value balance-value">
                ¥{{ currentDetailUser.balance.toFixed(2) }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showUserDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="editDetailUser">编辑用户</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户折扣弹窗 -->
    <el-dialog
      v-model="showDiscountDialog"
      title="用户折扣信息"
      width="400px"
      class="discount-dialog"
      :before-close="() => (showDiscountDialog = false)"
    >
      <template v-if="currentDiscountUser && discountInfo">
        <div class="discount-content">
          <div class="discount-header">
            <div class="discount-avatar">
              <img
                :src="`https://api.dicebear.com/7.x/initials/svg?seed=${currentDiscountUser.username}`"
                :alt="currentDiscountUser.username"
              />
            </div>
            <h2 class="discount-username">
              {{ currentDiscountUser.username }}
            </h2>
            <div class="discount-level">
              <el-tag
                :type="getPermissionTagType(discountInfo.permissionCode)"
                effect="dark"
                size="small"
              >
                {{ discountInfo.permissionName }}
              </el-tag>
            </div>
          </div>
          <div class="discount-body">
            <div class="discount-rate">
              <div class="rate-label">
                <el-icon><Discount /></el-icon>
                折扣率
              </div>
              <div class="rate-value">
                {{ (discountInfo.discount * 100).toFixed(0) }}%
              </div>
            </div>
            <div class="discount-description">
              <div class="description-label">
                <el-icon><Document /></el-icon>
                描述
              </div>
              <div class="description-value">
                {{ discountInfo.description }}
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="showDiscountDialog">
        <div class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
      </template>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showDiscountDialog = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 充值记录弹窗 -->
    <el-dialog
      v-model="showDepositDialog"
      title="充值记录"
      width="800px"
      class="deposit-dialog"
      :before-close="() => (showDepositDialog = false)"
    >
      <template v-if="currentDepositUser">
        <div class="deposit-content">
          <div class="deposit-header">
            <div class="deposit-avatar">
              <img
                :src="`https://api.dicebear.com/7.x/initials/svg?seed=${currentDepositUser.username}`"
                :alt="currentDepositUser.username"
              />
            </div>
            <div class="deposit-user-info">
              <div class="deposit-username">
                {{ currentDepositUser.username }}
              </div>
              <div class="deposit-stats">
                <div class="stat-item">
                  <span class="label">总充值次数</span>
                  <span class="value">{{ depositStats.total }}</span>
                </div>
                <div class="stat-item">
                  <span class="label">总充值金额</span>
                  <span class="value"
                    >¥{{ depositStats.totalAmount.toFixed(2) }}</span
                  >
                </div>
                <div class="stat-item">
                  <span class="label">平均金额</span>
                  <span class="value"
                    >¥{{ depositStats.averageAmount.toFixed(2) }}</span
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="deposit-table">
            <el-table
              :data="depositRecords"
              v-loading="depositLoading"
              style="width: 100%"
              border
              stripe
            >
              <el-table-column
                prop="orderNumber"
                label="订单号"
                width="180"
                align="center"
              />
              <el-table-column
                prop="amount"
                label="金额"
                width="70"
                align="center"
              >
                <template #default="{ row }">
                  <span class="amount">¥{{ row.amount.toFixed(2) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                prop="paymentMethod"
                label="支付方式"
                width="90"
                align="center"
              >
                <template #default="{ row }">
                  <el-tag :type="getPaymentMethodTagType(row.paymentMethod)">
                    {{ getPaymentMethodText(row.paymentMethod) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column
                prop="operatorId"
                label="操作员"
                width="70"
                align="center"
              />
              <el-table-column
                prop="createdAt"
                label="充值时间"
                width="160"
                align="center"
              >
                <template #default="{ row }">
                  {{ formatTime(row.createdAt) }}
                </template>
              </el-table-column>
              <el-table-column
                prop="remark"
                label="备注"
                min-width="150"
                align="center"
              />
            </el-table>

            <!-- 分页 -->
            <div class="pagination-wrapper" v-if="depositPagination.total > 0">
              <el-pagination
                v-model:current-page="depositPagination.currentPage"
                v-model:page-size="depositPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="depositPagination.total"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleDepositSizeChange"
                @current-change="handleDepositCurrentChange"
                class="custom-pagination"
              />
            </div>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import * as ElementPlus from "element-plus";
import type { FormInstance } from "element-plus";
import {
  User,
  Plus,
  Refresh,
  Search,
  RefreshRight,
  UserFilled,
  CircleCheckFilled,
  CircleCloseFilled,
  StarFilled,
  View,
  Edit,
  Lock,
  Unlock,
  Wallet,
  More,
  Key,
  Discount,
  Delete,
  Phone,
  Document,
  Setting,
  Star,
  Checked,
  TopRight,
  BottomRight,
  ArrowUp,
  ArrowDown,
  Money,
} from "@element-plus/icons-vue";
import {
  getUserList,
  getUser,
  createUser,
  updateUser,
  deleteUser as deleteUserAPI,
  enableUser,
  disableUser,
  updateUserPermission,
  updateUserBalance,
  addUserBalance,
  deductUserBalance,
  updateUserPassword,
  getUserDiscount,
} from "../../api/user-management";
import {
  getUserDepositRecords,
  DepositRecord,
  PaymentMethod,
} from "../../api/deposit";

interface UserInfo {
  id: number;
  username: string;
  identity?: string;
  phone?: string;
  status: number;
  permission: number;
  balance: number;
  admin: boolean;
}

// 响应式数据
const loading = ref(false);
const formLoading = ref(false);
const userList = ref<UserInfo[]>([]);
const selectedUsers = ref<UserInfo[]>([]);
const showAddUserDialog = ref(false);
const showBalanceDialog = ref(false);
const isEdit = ref(false);
const currentUser = ref<UserInfo | null>(null);

// 搜索表单
const searchForm = reactive({
  username: "",
  status: "",
  permission: "",
});

// 分页信息
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 用户统计
const userStats = reactive({
  total: 0,
  active: 0,
  disabled: 0,
  vip: 0,
});

// 用户表单
const userForm = reactive({
  username: "",
  password: "",
  phone: "",
  identity: "",
  permission: 0,
});

// 余额表单
const balanceForm = reactive({
  type: "add",
  amount: 0,
});

// 表单引用
const userFormRef = ref<FormInstance | null>(null);
const balanceFormRef = ref<FormInstance | null>(null);

// 表单验证规则
const userFormRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "用户名长度在 3 到 20 个字符",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度在 6 到 20 个字符", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "请输入正确的手机号",
      trigger: "blur",
    },
  ],
  identity: [
    { required: true, message: "请输入身份证号", trigger: "blur" },
    { pattern: /^\d{18}$/, message: "请输入正确的身份证号", trigger: "blur" },
  ],
};

const balanceFormRules = {
  amount: [
    { required: true, message: "请输入金额", trigger: "blur" },
    { type: "number", min: 0, message: "金额不能小于0", trigger: "blur" },
  ],
};

// 添加用户详情对话框的控制变量
const showUserDetailDialog = ref(false);
const currentDetailUser = ref<UserInfo | null>(null);

// 添加折扣弹窗控制变量
const showDiscountDialog = ref(false);
const currentDiscountUser = ref<UserInfo | null>(null);
const discountInfo = ref<any | null>(null);

// 充值记录相关
const showDepositDialog = ref(false);
const currentDepositUser = ref<UserInfo | null>(null);
const depositRecords = ref<DepositRecord[]>([]);
const depositLoading = ref(false);
const depositPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});
const depositStats = reactive({
  total: 0,
  totalAmount: 0,
  averageAmount: 0,
});

// 格式化时间
const formatTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

// 方法
const fetchUserList = async () => {
  loading.value = true;
  try {
    // 使用API函数获取用户列表
    const response = await getUserList({
      page: pagination.currentPage - 1,
      size: pagination.pageSize,
      username: searchForm.username || undefined,
    });

    userList.value = response.content;
    pagination.total = response.totalElements;

    // 更新统计信息
    updateUserStats();
  } catch (error) {
    console.error("获取用户列表失败", error);
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

const updateUserStats = () => {
  userStats.total = pagination.total;
  userStats.active = userList.value.filter((user) => user.status === 1).length;
  userStats.disabled = userList.value.filter(
    (user) => user.status === 0
  ).length;
  userStats.vip = userList.value.filter((user) => user.permission == 2).length;
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchUserList();
};

const resetSearch = () => {
  Object.assign(searchForm, {
    username: "",
    status: "",
    permission: "",
  });
  handleSearch();
};

const refreshUserList = () => {
  fetchUserList();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchUserList();
};

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  fetchUserList();
};

const handleSelectionChange = (selection: UserInfo[]) => {
  selectedUsers.value = selection;
};

const getPermissionText = (permission: number): string => {
  const map: Record<number, string> = {
    0: "普通",
    1: "包月",
    2: "VIP",
    99: "管理员",
  };
  return map[permission] || "未知";
};

const getPermissionTagType = (permission: number): string => {
  const map: Record<number, string> = {
    0: "",
    1: "success",
    2: "warning",
    99: "danger",
  };
  return map[permission] || "";
};

const viewUser = (user: UserInfo) => {
  currentDetailUser.value = user;
  showUserDetailDialog.value = true;
};

const editUser = (user: UserInfo) => {
  isEdit.value = true;
  currentUser.value = user;
  Object.assign(userForm, {
    username: user.username,
    phone: user.phone || "",
    identity: user.identity || "",
    permission: user.permission,
  });
  showAddUserDialog.value = true;
};

const toggleUserStatus = async (user: UserInfo) => {
  const action = user.status === 1 ? "禁用" : "启用";
  try {
    await ElMessageBox.confirm(
      `确定要${action}用户 "${user.username}" 吗？`,
      "确认操作"
    );

    // 使用API函数启用或禁用用户
    if (user.status === 1) {
      await disableUser(user.id);
    } else {
      await enableUser(user.id);
    }

    user.status = user.status === 1 ? 0 : 1;
    ElMessage.success(`${action}成功`);
    updateUserStats();
  } catch (error) {
    if (error !== "cancel") {
      console.error(`${action}用户失败`, error);
      ElMessage.error(`${action}失败`);
    }
  }
};

const manageBalance = (user: UserInfo) => {
  currentUser.value = user;
  balanceForm.type = "add";
  balanceForm.amount = 0;
  showBalanceDialog.value = true;
};

const resetPassword = async (user: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.username}" 的密码吗？`,
      "确认操作"
    );

    // 使用API函数重置密码
    await updateUserPassword(user.id, "admin", "123456");

    ElMessage({
      type: "success",
      message: "密码重置成功，新密码为：123456",
    });
  } catch (error) {
    if (error !== "cancel") {
      console.error("重置密码失败", error);
      ElMessage.error("密码重置失败");
    }
  }
};

const viewDiscount = async (user: UserInfo) => {
  try {
    currentDiscountUser.value = user;
    showDiscountDialog.value = true;

    // 使用API函数获取用户折扣信息
    const discountData = await getUserDiscount(user.id);
    discountInfo.value = discountData;
  } catch (error) {
    console.error("获取折扣信息失败", error);
    ElMessage.error("获取折扣信息失败");
    showDiscountDialog.value = false;
  }
};

const deleteUser = async (user: UserInfo) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.username}" 吗？此操作不可恢复！`,
      "危险操作",
      { type: "warning" }
    );

    // 使用API函数删除用户
    await deleteUserAPI(user.id);

    ElMessage.success("删除成功");
    fetchUserList();
  } catch (error) {
    if (error !== "cancel") {
      console.error("删除用户失败", error);
      ElMessage.error("删除失败");
    }
  }
};

const submitUserForm = async () => {
  try {
    if (userFormRef.value) {
      await userFormRef.value.validate();
    }
    formLoading.value = true;

    if (isEdit.value) {
      // 更新用户信息
      await updateUser(currentUser.value!.id, {
        phone: userForm.phone,
        identity: userForm.identity,
      });

      // 更新权限
      await updateUserPermission(currentUser.value!.id, userForm.permission);

      ElMessage.success("更新成功");
      showAddUserDialog.value = false;
      resetUserForm();
      fetchUserList();
    } else {
      // 创建用户
      await createUser({
        username: userForm.username,
        password: userForm.password,
        phone: userForm.phone,
        identity: userForm.identity,
      });

      ElMessage.success("创建成功");
      showAddUserDialog.value = false;
      resetUserForm();
      fetchUserList();
    }
  } catch (error) {
    console.error(isEdit.value ? "更新用户失败" : "创建用户失败", error);
    ElMessage.error(isEdit.value ? "更新失败" : "创建失败");
  } finally {
    formLoading.value = false;
  }
};

const submitBalanceForm = async () => {
  try {
    if (balanceFormRef.value) {
      await balanceFormRef.value.validate();
    }
    formLoading.value = true;

    const { type, amount } = balanceForm;

    if (type === "add") {
      // 充值
      await addUserBalance(currentUser.value!.id, amount);
      currentUser.value!.balance += amount;
    } else if (type === "deduct") {
      // 扣款
      await deductUserBalance(currentUser.value!.id, amount);
      currentUser.value!.balance = Math.max(
        0,
        currentUser.value!.balance - amount
      );
    } else {
      // 设置余额
      await updateUserBalance(currentUser.value!.id, amount);
      currentUser.value!.balance = amount;
    }

    // 更新列表中的数据
    const userIndex = userList.value.findIndex(
      (u) => u.id === currentUser.value!.id
    );
    if (userIndex !== -1) {
      userList.value[userIndex].balance = currentUser.value!.balance;
    }

    ElMessage.success("操作成功");
    showBalanceDialog.value = false;
  } catch (error) {
    console.error("余额操作失败", error);
    ElMessage.error("操作失败");
  } finally {
    formLoading.value = false;
  }
};

const resetUserForm = () => {
  Object.assign(userForm, {
    username: "",
    password: "",
    phone: "",
    identity: "",
    permission: 0,
  });
  isEdit.value = false;
  currentUser.value = null;
  userFormRef.value?.resetFields();
};

// 添加编辑详情用户的方法
const editDetailUser = () => {
  if (currentDetailUser.value) {
    editUser(currentDetailUser.value);
    showUserDetailDialog.value = false;
  }
};

// 计算操作后的余额
const calculateFinalBalance = () => {
  if (!currentUser.value || balanceForm.amount <= 0) return "0.00";

  const currentBalance = currentUser.value.balance || 0;
  let finalBalance = currentBalance;

  if (balanceForm.type === "add") {
    finalBalance = currentBalance + balanceForm.amount;
  } else if (balanceForm.type === "deduct") {
    finalBalance = Math.max(0, currentBalance - balanceForm.amount);
  } else if (balanceForm.type === "set") {
    finalBalance = balanceForm.amount;
  }

  return finalBalance.toFixed(2);
};

// 获取余额变化图标
const getBalanceChangeIcon = () => {
  if (
    balanceForm.type === "add" ||
    (balanceForm.type === "set" &&
      balanceForm.amount > (currentUser.value?.balance || 0))
  ) {
    return ArrowUp;
  } else if (
    balanceForm.type === "deduct" ||
    (balanceForm.type === "set" &&
      balanceForm.amount < (currentUser.value?.balance || 0))
  ) {
    return ArrowDown;
  }
  return "";
};

// 获取余额变化图标的样式类
const getBalanceChangeIconClass = () => {
  if (
    balanceForm.type === "add" ||
    (balanceForm.type === "set" &&
      balanceForm.amount > (currentUser.value?.balance || 0))
  ) {
    return "balance-increase";
  } else if (
    balanceForm.type === "deduct" ||
    (balanceForm.type === "set" &&
      balanceForm.amount < (currentUser.value?.balance || 0))
  ) {
    return "balance-decrease";
  }
  return "";
};

// 新增用户按钮点击事件处理
const openAddUserDialog = () => {
  resetUserForm(); // 重置表单
  isEdit.value = false; // 确保不是编辑模式
  currentUser.value = null; // 清除当前用户
  showAddUserDialog.value = true; // 显示对话框
};

// 获取支付方式文本
const getPaymentMethodText = (method: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "现金",
    [PaymentMethod.ALIPAY]: "支付宝",
    [PaymentMethod.WECHAT]: "微信",
    [PaymentMethod.BANK_CARD]: "银行卡",
  };
  return map[method] || "未知";
};

// 获取支付方式标签类型
const getPaymentMethodTagType = (method: PaymentMethod): string => {
  const map: Record<PaymentMethod, string> = {
    [PaymentMethod.CASH]: "success",
    [PaymentMethod.ALIPAY]: "primary",
    [PaymentMethod.WECHAT]: "success",
    [PaymentMethod.BANK_CARD]: "info",
  };
  return map[method] || "";
};

// 查看充值记录
const viewDepositRecords = async (user: UserInfo) => {
  currentDepositUser.value = user;
  showDepositDialog.value = true;
  depositPagination.currentPage = 1;
  await fetchDepositRecords();
};

// 获取充值记录
const fetchDepositRecords = async () => {
  if (!currentDepositUser.value) return;

  depositLoading.value = true;
  try {
    const response = await getUserDepositRecords(currentDepositUser.value.id, {
      page: depositPagination.currentPage - 1,
      size: depositPagination.pageSize,
      sortBy: "createdAt",
      direction: "desc",
    });

    depositRecords.value = response.data.content;
    depositPagination.total = response.data.totalElements;

    // 更新统计信息
    updateDepositStats();
  } catch (error) {
    console.error("获取充值记录失败:", error);
    ElMessage.error("获取充值记录失败");
  } finally {
    depositLoading.value = false;
  }
};

// 更新充值统计信息
const updateDepositStats = () => {
  depositStats.total = depositRecords.value.length;
  depositStats.totalAmount = depositRecords.value.reduce(
    (sum, record) => sum + record.amount,
    0
  );
  depositStats.averageAmount =
    depositStats.total > 0 ? depositStats.totalAmount / depositStats.total : 0;
};

// 处理充值记录分页
const handleDepositSizeChange = (size: number) => {
  depositPagination.pageSize = size;
  fetchDepositRecords();
};

const handleDepositCurrentChange = (page: number) => {
  depositPagination.currentPage = page;
  fetchDepositRecords();
};

// 生命周期
onMounted(() => {
  fetchUserList();
});
</script>

<style scoped>
.user-list-container {
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

/* 优化搜索区域样式 */
.search-section {
  margin-bottom: 16px;
}

.search-card {
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.08);
  border: none;
}

.search-form {
  padding: 6px 0;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: nowrap;
}

.search-input {
  min-width: 180px;
  max-width: 220px;
}

.status-select,
.permission-select {
  width: 120px;
  flex-shrink: 0;
}

.search-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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

.total-users .stat-icon {
  background: linear-gradient(45deg, #409eff, #66b3ff);
}

.active-users .stat-icon {
  background: linear-gradient(45deg, #67c23a, #85ce61);
}

.disabled-users .stat-icon {
  background: linear-gradient(45deg, #f56c6c, #f78989);
}

.vip-users .stat-icon {
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

.user-table {
  background: white;
}

.user-table :deep(.el-table__header) {
  background: linear-gradient(45deg, #f8f9fa, #e9ecef);
}

.user-table :deep(.el-table__header th) {
  background: transparent;
  color: #495057;
  font-weight: 600;
  border-bottom: 2px solid #409eff;
}

.user-table :deep(.el-table__row:hover) {
  background: #f0f8ff;
}

/* 优化用户名列样式 */
.username-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.avatar-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.user-avatar {
  border: 2px solid #e9ecef;
  flex-shrink: 0;
}

.username-text {
  overflow: hidden;
  text-overflow: ellipsis;
}

.balance-text {
  font-weight: 600;
  color: #e6a23c;
}

/* 优化操作按钮区域 */
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

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 12px;
}

.custom-pagination {
  background: white;
  padding: 8px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
  padding: 20px;
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

/* 用户详情对话框样式 */
:deep(.user-detail-dialog .el-dialog__body) {
  padding: 0;
}

.user-detail-content {
  display: flex;
  flex-direction: column;
}

.user-detail-header {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.user-avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-detail-header h2 {
  margin: 5px 0;
  font-size: 20px;
  color: #2c3e50;
}

.user-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.user-tag {
  font-weight: 500;
}

.user-detail-body {
  padding: 20px;
}

.detail-item {
  display: flex;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.item-label {
  width: 100px;
  color: #606266;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.item-value {
  flex: 1;
  color: #303133;
}

.balance-value {
  color: #e6a23c;
  font-weight: 600;
}

/* 用户折扣弹窗样式 */
:deep(.discount-dialog .el-dialog__body) {
  padding: 0;
}

.discount-content {
  display: flex;
  flex-direction: column;
}

.discount-header {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.discount-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.discount-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.discount-username {
  margin: 5px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.discount-level {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.discount-body {
  padding: 20px;
}

.discount-rate {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.rate-label {
  color: #606266;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 5px;
}

.rate-value {
  font-size: 24px;
  font-weight: 700;
  color: #409eff;
}

.discount-description {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.description-label {
  color: #606266;
  font-weight: 500;
}

.description-value {
  color: #303133;
  line-height: 1.5;
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 6px;
  margin-top: 5px;
}

/* 折扣弹窗加载状态 */
.loading-container {
  padding: 30px 20px;
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 折扣弹窗图标样式 */
.rate-label .el-icon,
.description-label .el-icon {
  color: #409eff;
  margin-right: 5px;
}

/* 用户表单对话框样式 */
:deep(.user-form-dialog .el-dialog__body) {
  padding: 0;
}

.user-form {
  padding: 20px;
}

/* 编辑用户头部样式 */
.user-edit-header {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.user-edit-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 10px;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.user-edit-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-edit-username {
  margin: 5px 0;
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
}

.user-edit-tags {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

/* 新增用户头部样式 */
.user-add-header {
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

.add-user-icon {
  font-size: 36px;
}

.add-user-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.add-user-subtitle {
  margin: 5px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

/* 表单项样式优化 */
.user-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.user-form :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6;
  transition: all 0.2s;
}

.user-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc;
}

.user-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff;
}

.user-form :deep(.el-input__prefix-inner) {
  display: flex;
  align-items: center;
  color: #909399;
}

/* 权限选择样式 */
.permission-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
}

/* 余额管理对话框样式 */
:deep(.balance-dialog .el-dialog__body) {
  padding: 0;
}

.balance-header {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  align-items: center;
  gap: 15px;
}

.balance-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.balance-user-info {
  flex: 1;
}

.balance-username {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.current-balance {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.current-balance .label {
  font-size: 14px;
  color: #606266;
}

.current-balance .amount {
  font-size: 22px;
  font-weight: 700;
  color: #409eff;
}

.balance-form {
  padding: 20px;
}

.balance-type-group {
  width: 100%;
  display: flex;
}

.balance-type-group :deep(.el-radio-button) {
  flex: 1;
}

.balance-type-group :deep(.el-radio-button__inner) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.amount-prefix {
  color: #909399;
  font-weight: 600;
}

.balance-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-label {
  font-size: 14px;
  color: #606266;
}

.preview-amount {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 5px;
}

.balance-increase {
  color: #67c23a;
}

.balance-decrease {
  color: #f56c6c;
}

/* 删除不再需要的旧样式 */
.dialog-header-banner {
  display: none;
}

.banner-icon,
.banner-text {
  display: none;
}

.dialog-header-banner.add-mode,
.dialog-header-banner.edit-mode {
  display: none;
}

/* 响应式设计 */
@media (max-width: 1280px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

@media (max-width: 992px) {
  .search-row {
    flex-wrap: wrap;
  }

  .search-input {
    min-width: 100%;
    max-width: 100%;
  }

  .status-select,
  .permission-select {
    flex: 1;
  }

  .search-buttons {
    width: 100%;
    justify-content: flex-end;
    margin-top: 10px;
  }
}

@media (max-width: 768px) {
  .user-list-container {
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

  .user-dialog,
  .balance-dialog {
    width: 90% !important;
    margin: 0 auto;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-table :deep(.el-table__row) {
  animation: fadeInUp 0.3s ease;
}

/* 自定义滚动条 */
:deep(.el-table__body-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: #c1c1c1 #f1f1f1;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar) {
  width: 6px;
  height: 6px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

:deep(.el-table__body-wrapper::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}

/* 加载状态样式优化 */
:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
}

:deep(.el-loading-spinner .path) {
  stroke: #409eff;
}

/* 按钮hover效果 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-1px);
}

/* 标签样式优化 */
.el-tag {
  border-radius: 4px;
  font-weight: 500;
}

/* 输入框聚焦效果 */
:deep(.el-input__wrapper) {
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 添加头像预览对话框样式 */
:deep(.el-message-box) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-message-box__header) {
  padding: 12px;
  background: #f5f7fa;
}

:deep(.el-message-box__content) {
  padding: 20px;
}

:deep(.el-message-box__btns) {
  justify-content: center;
  padding: 10px 20px 15px;
}

/* 充值记录弹窗样式 */
:deep(.deposit-dialog .el-dialog__body) {
  padding: 0;
}

.deposit-content {
  display: flex;
  flex-direction: column;
}

.deposit-header {
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%);
  display: flex;
  align-items: center;
  gap: 20px;
}

.deposit-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.deposit-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.deposit-user-info {
  flex: 1;
}

.deposit-username {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
}

.deposit-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.stat-item .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-item .value {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

.deposit-table {
  padding: 20px;
}

.deposit-table .amount {
  font-weight: 600;
  color: #f56c6c;
}
</style>
