import { createApp } from 'vue'
import App from './App.vue'

// --- Element Plus 引入 ---
import ElementPlus from 'element-plus';
// 引入 Element Plus 的默认主题样式
import 'element-plus/dist/index.css';

import router from './router';
import store from './store';

import VMdEditor from '@kangc/v-md-editor'
import '@kangc/v-md-editor/lib/style/base-editor.css'

import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'

import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js'
import '@kangc/v-md-editor/lib/theme/style/vuepress.css'


import Prism from 'prismjs'
import 'prismjs/components/prism-json'


// 注册主题
VMdEditor.use(vuepressTheme , { Prism: Prism } )
VMdPreview.use(vuepressTheme, {Prism})

// --- 创建应用实例 ---
const app = createApp(App);

// --- 注册全局插件 ---

// 1. 注册 Element Plus
// 可以选择语言和大小配置，这里使用默认
app.use(ElementPlus);
// 或者使用更精简的方式，如：app.use(ElementPlus, { locale: zhCn });

// 2. 注册 Vue Router (如果项目需要路由)
app.use(router);

// 3. 注册状态管理 (Vuex 或 Pinia)
app.use(store);

app.use(VMdEditor)

app.use(VMdPreview)


// --- 挂载应用 ---
// 确保在所有配置和插件注册完成后进行挂载
app.mount('#app');
