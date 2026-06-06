import { createRouter, createWebHistory } from 'vue-router';

// 1. 定义路由配置数组
const routes = [
    {
        path: '/',
        name: 'Document',
        component: () => import('@/views/document/index.vue'),
        hidden: true,
        meta: {title: '千梦大总管', icon: 'dashboard'}
    },
    {
        path: '/login',
        component: () => import('@/views/login.vue'),
        hidden: true,
        meta: {title: '登录'}
    },
    {
        path: '/waiting',
        component: () => import('@/views/error/waiting.vue'),
        hidden: true
    },
    {
        path: '/404',
        component: () => import('@/views/error/404.vue'),
        hidden: true
    },
    {
        path: '/401',
        component: () => import('@/views/error/401.vue'),
        hidden: true
    },
    {
        path: "/:pathMatch(.*)*",
        component: () => import('@/views/error/404.vue'),
    },
    {
        path: '/preview',
        component: () => import('@/views/document/preview/index.vue'),
        hidden: true,
        meta: {title: '千梦大总管', icon: 'dashboard'}
    },
    {
        path: '/select',
        component: () => import('@/views/document/select/index.vue'),
        hidden: true,
        meta: {title: '千梦大总管', icon: 'dashboard'}
    },
    // {
    //     path: '/save',
    //     component: () => import('@/views/document/save/index.vue'),
    //     hidden: true,
    //     meta: {title: '文章保存', icon: 'dashboard'}
    // },
    // {
    //     path: '/test',
    //     component: () => import('@/views/document/test/index.vue'),
    //     hidden: true,
    //     meta: {title: '测试', icon: 'dashboard'}
    // },

    {
        path: '/json',
        component: () => import('@/views/json/index.vue'),
        hidden: true,
        meta: {title: '千梦大总管', icon: 'dashboard'}
    },
    {
        path: '/questionInfo',
        component: () => import('@/views/questionInfo/index.vue'),
        hidden: true,
        meta: {title: '千梦大总管', icon: 'dashboard'}
    },
];

// 2. 创建 Router 实例
const router = createRouter({
    // 使用 history 模式，需要后端配合，否则用 createWebHashHistory
    history: createWebHistory(),
    routes
});

const defaultTitle = '千梦大总管'; // 定义一个默认标题

router.beforeEach((to, from, next) => {
    // 确保路由的 meta 信息中存在 title
    if (to.meta && to.meta.title) {
        // 设置标签页标题
        document.title = to.meta.title;
    } else {
        // 如果没有设置 title，使用默认标题
        document.title = defaultTitle;
    }

    // 继续导航
    next();
});

// 3. 导出 Router 实例
export default router;
