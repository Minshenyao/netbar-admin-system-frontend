import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';

// 创建axios实例
const request = axios.create({
  baseURL: '/api', // 使用代理
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    
    // 如果有token，则添加到请求头
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 添加常见的请求头
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json';
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    
    return config;
  },
  error => {
    console.error('请求错误', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data;
    
    // 如果响应码不为0，则认为有错误
    if (res.code !== 0) {
      ElMessage.error(res.message || '系统错误');
      
      // 如果响应码为401，则认为token过期或无效
      if (res.code === 401) {
        // 清除用户登录状态
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        
        // 跳转到登录页
        router.push('/login');
      }
      
      return Promise.reject(new Error(res.message || '系统错误'));
    }
    
    // return Promise.resolve(res as ApiResponse<any>);
    return res;
  },
  error => {
    // 处理HTTP错误
    let message = '系统错误';
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录';
          // 清除用户登录状态
          localStorage.removeItem('token');
          localStorage.removeItem('userName');
          // 跳转到登录页
          router.push('/login');
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求错误，未找到该资源';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `连接错误${error.response.status}`;
      }
    } else if (error.request) {
      message = '网络错误，请检查您的网络连接';
    } else {
      message = error.message;
    }
    
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default request; 