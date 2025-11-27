// src/utils/request.js (适用于 Vue 3 + Element Plus)

import axios from 'axios';
// 从 Element Plus 导入组件，用于提示和加载
import { ElMessage, ElLoading } from 'element-plus';

// 读取环境变量文件 (.env.development / .env.production) 中的 VITE_APP_BASE_API
const BASE_API = import.meta.env.VITE_APP_BASE_API;

let loadingInstance = null; // 用于存储加载组件实例

// 1. 创建 Axios 实例
const service = axios.create({
    // 确保这里的 baseURL 和你的 vite.config.js 或 vue.config.js 代理配置一致
    baseURL: BASE_API,
    timeout: 10000, // 请求超时时间
});

// 2. 请求拦截器 (Request Interceptors)
service.interceptors.request.use(
    config => {
        // 比如：在请求发送前，开启加载动画
        loadingInstance = ElLoading.service({
            lock: true,
            text: '加载中...',
            background: 'rgba(0, 0, 0, 0.7)'
        });

        return config;
    },
    error => {
        // 请求出错，关闭加载
        loadingInstance && loadingInstance.close();
        console.error(error);
        return Promise.reject(error);
    }
);

// 3. 响应拦截器 (Response Interceptors)
service.interceptors.response.use(
    response => {
        // 响应成功，关闭加载
        loadingInstance && loadingInstance.close();

        const res = response.data;

        if (res.code && res.code !== "0000") {
            // 非 200 状态码统一处理错误
            ElMessage({
                message: res.msg || '请求错误',
                type: 'error',
                duration: 3 * 1000
            });
            return Promise.reject(new Error(res.msg || 'Error'));
        } else {
            // 成功请求，返回数据部分
            return res;
        }
    },
    error => {
        // 响应出错，关闭加载
        loadingInstance && loadingInstance.close();

        // HTTP 状态码错误处理（4xx, 5xx等）
        let message = '请求失败，请检查网络或后端服务';
        if (error.response) {
            // 根据 HTTP 状态码给予更具体的提示
            message = `请求错误: ${error.response.status}`;
        } else if (error.message.includes('timeout')) {
            message = '请求超时，请稍后重试';
        }

        ElMessage({
            message: message,
            type: 'error',
            duration: 5 * 1000
        });
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export default service;
