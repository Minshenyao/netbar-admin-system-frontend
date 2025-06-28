# 网吧计时管理系统前端

## 项目介绍

本项目是[网吧计时管理系统](https://github.com/Minshenyao/netbar-admin-system-backend)课程设计的前端部分，采用Vue 3 + TypeScript + Vite构建的现代化Web应用。项目使用Element Plus作为UI组件库，实现了用户管理、电脑管理、计时收费、充值管理等核心功能的前端界面。

### 主要功能
- 用户管理
  - 用户注册与登录
  - 用户信息管理（普通用户、包月用户、包年用户、VIP用户）
  - 用户状态监控
- 电脑管理
  - 电脑状态实时监控
  - 电脑分配与管理
  - 设备状态可视化展示
- 上机记录管理
  - 计时收费展示
  - 使用统计与分析
  - 数据可视化报表
- 充值记录管理
  - 余额充值界面
  - 消费记录查询
  - 账单明细导出
- 权限管理系统
  - 基于JWT的身份认证
  - 动态路由权限控制
  - 菜单权限管理

### 计费规则
- 基础计费：0.1元/分钟
- 智能计费：系统会根据用户余额自动计算可上机时长
- 自动下机：到达预计下机时间后，如果用户未主动下机，系统将自动执行下机操作
- 余额预警：上机前会检查用户余额，确保有足够的余额支持上机时长

例如：用户余额为10元时，系统会自动计算出可上机100分钟（约1小时40分钟），到时间后自动下机。

### 用户权限说明
系统根据用户权限自动分配不同的操作界面：
- 管理员用户
  - 登录后直接进入管理界面
  - 可以管理所有用户、电脑和系统设置
  - 可以查看统计报表和系统日志
- 普通用户
  - 登录后直接进入上机界面
  - 可以查看个人信息和余额
  - 可以进行上机和充值操作
  - 可以查看个人消费记录

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia 状态管理
- Element Plus
- Axios
- ECharts 图表
- VueUse/Motion 动效

## 开发环境要求

### 前置要求
- Node.js (v16+)
- pnpm 包管理器
- 现代浏览器（Chrome、Firefox、Safari、Edge等）

### 安装 pnpm (如果尚未安装)

```bash
npm install -g pnpm
```

## 快速开始

### 1. 克隆仓库
```bash
git clone https://github.com/Minshenyao/netbar-admin-system-frontend.git
cd netbar-admin-system-frontend
```

### 2. 安装依赖

```bash
pnpm install
```

### 3. 配置环境变量
创建 `.env.development` 文件用于开发环境：
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_TITLE=网吧计时管理系统
```

### 4. 启动开发服务器

```bash
pnpm dev
```

### 5. 构建生产版本

```bash
pnpm build
```

### 6. 本地预览生产构建

```bash
pnpm preview
```

## 项目结构

```
src/
├── api/                # API 请求接口
│   ├── user.ts        # 用户相关接口
│   ├── computer.ts    # 电脑相关接口
│   └── record.ts      # 记录相关接口
├── assets/            # 静态资源文件
├── components/        # 通用组件
│   ├── common/        # 公共组件
│   └── business/      # 业务组件
├── router/            # 路由配置
├── store/             # Pinia 状态管理
│   ├── modules/       # 状态模块
│   └── index.ts       # 状态入口
├── utils/             # 工具函数
│   ├── request.ts     # Axios 封装
│   └── auth.ts        # 权限相关
└── views/             # 页面视图组件
    ├── user/          # 用户相关页面
    ├── computer/      # 电脑相关页面
    └── record/        # 记录相关页面
```

## 开发规范

- 使用 TypeScript 进行类型检查
- 组件使用 Vue 3 `<script setup>` 语法
- 遵循 Element Plus 的设计规范
- 代码格式化使用 Prettier
- 提交规范使用 Conventional Commits

## 系统界面预览

### 登录注册
![登录界面](/images/login.png)
![注册界面](/images/register.png)

### 系统总览
![仪表盘](/images/dashboard.png)

### 用户管理
![用户列表](/images/userlist.png)
![用户角色](/images/userrole.png)

### 电脑管理
![电脑列表](/images/computerList.png)
![电脑区域](/images/computerArea.png)

### 上机操作流程
![用户上机](/images/userStart.png)
![使用中](/images/userUse.png)
![下机结算](/images/userEnd.png)

### 充值与记录
![充值管理](/images/recharge.png)
![操作记录](/images/operations.png)

### 重要说明
- 本项目为课程设计作品，仅供学习和参考
- 禁止将本项目用于商业用途
- 如果您对本项目进行了修改或改进，需要以相同的许可证开源

## 联系方式

如果您有任何问题或建议，欢迎提出 Issue 或通过以下方式联系我：
- GitHub: [https://github.com/Minshenyao]
