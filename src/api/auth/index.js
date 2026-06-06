import axios from 'axios';
import { ElMessage, ElLoading } from 'element-plus';
import { getToken, removeToken, removeUser } from '@/utils/auth';

let loadingInstance = null;

// 认证服务专用实例（不带 /api 前缀）
const authService = axios.create({
  baseURL: '/',
  timeout: 10000
});

// 请求拦截器
authService.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    });
    return config;
  },
  error => {
    loadingInstance && loadingInstance.close();
    return Promise.reject(error);
  }
);

// 响应拦截器
authService.interceptors.response.use(
  response => {
    loadingInstance && loadingInstance.close();
    const res = response.data;
    if (res.code && res.code !== '0000') {
      ElMessage({ message: res.reason || '请求错误', type: 'error', duration: 3000 });
      return Promise.reject(new Error(res.reason || 'Error'));
    }
    return res;
  },
  error => {
    loadingInstance && loadingInstance.close();
    if (error.response && error.response.status === 401) {
      removeToken();
      removeUser();
      window.location.href = '/login';
      return Promise.reject(error);
    }
    ElMessage({ message: error.message || '网络错误', type: 'error', duration: 3000 });
    return Promise.reject(error);
  }
);

// 发送邮箱验证码
export function sendEmailCode(email) {
  return authService({
    url: '/auth/sendEmailCode',
    method: 'post',
    params: { email }
  });
}

// 邮箱验证码登录
export function emailLogin(data) {
  return authService({
    url: '/auth/emailLogin',
    method: 'post',
    data
  });
}

// 退出登录
export function logout() {
  return authService({
    url: '/auth/logout',
    method: 'post'
  });
}

// 验证 Token
export function validateToken() {
  return authService({
    url: '/auth/validate',
    method: 'get'
  });
}
