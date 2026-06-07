<template>
  <div class="page-container">
    <!-- 左侧导航 -->
    <div class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div class="sidebar-header" v-show="!isCollapsed">
        <span class="sidebar-title">{{ categoryName }}</span>
      </div>
      <ul class="nav-list" v-show="!isCollapsed">
        <li
            v-for="(item, index) in dataList"
            :key="item.id"
            :class="{ active: activeKey === item.id }"
            @click="selectItem(item.id)"
        >
          <span class="item-num">{{ String(index + 1).padStart(2, '0') }}</span>
          <span class="item-label">{{ item.title }}</span>
        </li>
      </ul>

      <!-- 收起/展开按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <i :class="isCollapsed ? 'el-icon-arrow-right' : 'el-icon-arrow-left'"></i>
      </div>
    </div>

    <div ref="contentRef" class="content" :class="{ 'content-full-width': isCollapsed }">
      <template v-if="currentItem">
        <div class="content-header">
          <span class="content-title">{{ title }}</span>
          <div class="header-sub" v-if="createTime || currentItem">
            <span class="create-time" v-if="createTime">{{ createTime }}</span>
            <el-button v-show="isAdmin" size="small" type="text" class="edit-btn" @click="handleEdit">
              <i class="el-icon-edit"></i> 编辑
            </el-button>
          </div>
        </div>
        <markdown-preview :text="currentMarkdown" />
      </template>

      <div v-else class="empty-tip">
        <i class="el-icon-document"></i>
        <span>暂无数据</span>
      </div>

      <!-- 底部上下条按钮 -->
      <div class="content-nav">
        <el-button @click="prevItem" :disabled="!canPrev" plain class="nav-btn">
          <i class="el-icon-arrow-left"></i> 上一条
        </el-button>
        <div class="word-count">
          <span>{{ charCount }} 字</span>
          <span class="word-count-divider">|</span>
          <span>{{ wordCount }} 词</span>
        </div>
        <el-button @click="nextItem" :disabled="!canNext" plain class="nav-btn">
          下一条 <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>

      <!-- 备案信息 -->
      <footer-beian />



      <!-- 主题选择 -->
      <div class="theme-selector">
        <el-dropdown @command="handleThemeChange" placement="top-end">
          <div class="theme-btn">
            <i class="el-icon-brush"><svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="18" height="18"><path d="M864 128H416c-17.7 0-32 14.3-32 32v128H160c-17.7 0-32 14.3-32 32v448c0 17.7 14.3 32 32 32h448c17.7 0 32-14.3 32-32V576h224c17.7 0 32-14.3 32-32V160c0-17.7-14.3-32-32-32zM576 736H192V416h384v320zm224-224H608V192h192v320z" fill="currentColor"/><path d="M672 288a48 48 0 1 0 96 0 48 48 0 1 0-96 0zM512 480a48 48 0 1 0 96 0 48 48 0 1 0-96 0zM352 352a48 48 0 1 0 96 0 48 48 0 1 0-96 0z" fill="currentColor"/></svg></i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item
                v-for="theme in themeList"
                :key="theme.value"
                :command="theme.value"
                :class="{ 'is-active': currentTheme === theme.value }"
              >
                <span class="theme-item">
                  <span class="theme-dot" :style="{ background: theme.color }"></span>
                  {{ theme.label }}
                </span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocumentListByCode } from "@/api/document/index.js";
import MarkdownPreview from "@/components/MarkdownPreview/index.vue";
import '@/assets/styles/drake-theme.css';
import '@/assets/styles/md-preview.css';
import FooterBeian from "@/components/FooterBeian/index.vue";
import {getUser} from "../../../utils/auth.js";

export default {
  name: "Preview",
  components: {FooterBeian, MarkdownPreview },
  data() {
    return {
      dataList: [],
      categoryName: "",
      title: "",
      createTime: "",
      activeKey: "",
      isCollapsed: false,
      contentRef: null,
      screenWidth: window.innerWidth,
      currentTheme: 'drake',
      themeList: [
        { label: 'Drake 默认', value: 'drake', color: '#e95f59' },
        { label: 'Drake Ayu', value: 'drake-ayu', color: '#f07178' },
        { label: 'Drake Black', value: 'drake-black', color: '#6ca0dc' },
        { label: 'Drake Dark', value: 'drake-dark', color: '#3473b0' },
        { label: 'Drake Google', value: 'drake-google', color: '#4285f4' },
        { label: 'Drake JB', value: 'drake-jb', color: '#667eea' },
        { label: 'Drake 掘金', value: 'drake-juejin', color: '#1e80ff' },
        { label: 'Drake Light', value: 'drake-light', color: '#4b83f0' },
        { label: 'Drake Material', value: 'drake-material', color: '#e91e63' },
        { label: 'Drake Purple', value: 'drake-purple', color: '#9c27b0' },
        { label: 'Drake Vue', value: 'drake-vue', color: '#42b883' },
        { label: 'Drake Vue3', value: 'drake-vue3', color: '#42d392' }
      ]
    };
  },
  computed: {
    isAdmin() {
      const user = getUser();
      return user && user.id == 1 && user.username === 'admin';
    },
    currentItem() {
      if (!this.dataList || !this.activeKey) return null;
      return this.dataList.find(i => i.id === this.activeKey) || null;
    },
    currentMarkdown() {
      if (!this.currentItem) return "";
      if (this.currentItem.title) this.title = this.currentItem.title;
      this.createTime = this.currentItem.create_time || '';
      return this.currentItem.content || '';
    },
    currentIndex() {
      return this.dataList.findIndex(i => i.id === this.activeKey);
    },
    canPrev() {
      return this.currentIndex > 0;
    },
    canNext() {
      return this.currentIndex < this.dataList.length - 1;
    },
    charCount() {
      if (!this.currentMarkdown) return 0;
      // 去除 markdown 语法标记后的纯文本字符数
      return this.currentMarkdown
        .replace(/[#*`~\[\]()!>|\-_{}]/g, '')
        .replace(/\s+/g, '')
        .length;
    },
    wordCount() {
      if (!this.currentMarkdown) return 0;
      // 中文按字数，英文按单词数
      const text = this.currentMarkdown
        .replace(/[#*`~\[\]()!>|\-_{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      // 匹配中文字符 + 英文单词
      const cn = (text.match(/[一-龥]/g) || []).length;
      const en = (text.match(/[a-zA-Z]+/g) || []).length;
      return cn + en;
    }
  },
  mounted() {
    const code = this.$route.query.code;
    this.categoryName = this.$route.query.name || '目录';
    if (code) {
      getDocumentListByCode(code).then(res => {
        if (res && res.code === "0000" && res.data.length > 0) {
          this.dataList = res.data;
          if (this.dataList.length > 0) {
            this.activeKey = this.dataList[0].id;
            this.title = this.dataList[0].title;
          }
        } else {
          this.dataList = [];
        }
      });
    } else {
      this.$message({ type: 'error', message: "获取数据失败" });
    }

    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    // 初始化主题
    this.initTheme();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  methods: {
    handleResize() {
      this.screenWidth = window.innerWidth;
      this.isCollapsed = this.screenWidth <= 1024;
    },
    selectItem(key) {
      this.activeKey = key;
      this.$nextTick(() => {
        if (this.$refs.contentRef) {
          this.$refs.contentRef.scrollTop = 0;
        }
      });
    },
    prevItem() {
      if (this.canPrev) {
        this.selectItem(this.dataList[this.currentIndex - 1].id);
      }
    },
    nextItem() {
      if (this.canNext) {
        this.selectItem(this.dataList[this.currentIndex + 1].id);
      }
    },
    handleEdit() {
      if (!this.currentItem) return;
      this.$router.push({
        path: '/save',
        query: {
          id: this.currentItem.id,
          title: this.currentItem.title,
          category_code: this.currentItem.category_code || '',
          title_sort: this.currentItem.title_sort || 0,
          title_show: this.currentItem.title_show || '1',
          content: this.currentItem.content || '',
          create_time: this.currentItem.create_time || ''
        }
      });
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
    initTheme() {
      const savedTheme = localStorage.getItem('drake-theme');
      if (savedTheme && this.themeList.some(t => t.value === savedTheme)) {
        this.currentTheme = savedTheme;
      }
      this.applyTheme(this.currentTheme);
    },
    handleThemeChange(theme) {
      this.applyTheme(theme);
      localStorage.setItem('drake-theme', theme);
    },
    applyTheme(theme) {
      // 通过 data-theme 属性切换主题（CSS 中已定义各主题变量）
      const writeEl = document.getElementById('write');
      if (writeEl) {
        writeEl.setAttribute('data-theme', theme);
      }
    }
  }
};
</script>

<style scoped>
.page-container {
  display: flex;
  width: 100%;
  height: 98vh;
  background: #f0f2f5;
}

/* 侧边栏 */
.sidebar {
  width: 240px;
  min-width: 240px;
  background: #fff;
  border-right: 1px solid #e8ecf1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
}

.sidebar.is-collapsed {
  width: 0;
  min-width: 0;
  border-right: none;
  overflow: visible;
}

.sidebar-header {
  padding: 24px 20px 16px;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.collapse-btn {
  position: absolute;
  right: -16px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.35);
  z-index: 20;
  color: #fff;
  font-size: 14px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  box-shadow: 0 4px 14px rgba(102, 126, 234, 0.55);
}

/* 空状态 */
.empty-tip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  color: #c0c4cc;
  font-size: 16px;
}

.empty-tip i {
  font-size: 48px;
  margin-bottom: 16px;
}

/* 底部上下条按钮 */
.content-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 40px;
  padding-bottom: 20px;
}

/* 备案信息 */
.footer-beian {
  text-align: center;
  padding: 20px 0;
  margin-top: auto;
}

.nav-btn {
  flex: 1;
  height: 44px;
  font-size: 15px;
  border-radius: 10px;
}

.word-count {
  font-size: 12px;
  color: #909399;
  font-family: "JetBrains Mono", monospace;
  user-select: none;
  white-space: nowrap;
}

.word-count-divider {
  margin: 0 6px;
  color: #dcdfe6;
}

/* 导航列表 */
.nav-list {
  list-style: none;
  padding: 12px;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.nav-list::-webkit-scrollbar {
  width: 4px;
}

.nav-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.nav-list li {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  cursor: pointer;
  color: #606266;
  transition: all 0.2s;
  white-space: nowrap;
  border-radius: 8px;
  margin-bottom: 4px;
  gap: 10px;
  font-size: 14px;
}

.nav-list li:hover {
  background: #f5f7fa;
  color: #303133;
}

.nav-list li.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  font-weight: 600;
}

.nav-list li.active .item-num {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.item-num {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #f0f2f5;
  color: #909399;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-family: "JetBrains Mono", monospace;
  transition: all 0.2s;
}

.item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 内容区域 */
.content {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow-y: auto;
  background: #fff;
}

.content-header {
  text-align: center;
  padding: 10px 10px;
  margin-bottom: 0;
}

.content-title {
  display: block;
  font-weight: 700;
  font-size: 24px;
  color: #1a1a1a;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.header-sub {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 10px;
}

.create-time {
  font-size: 13px;
  color: #909399;
}

.edit-btn {
  color: #667eea;
  font-size: 13px;
}

.edit-btn:hover {
  color: #764ba2;
}

/* 主题选择器 */
.theme-selector {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
}

.theme-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.4);
  transition: all 0.2s;
}

.theme-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.6);
}

.theme-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* 字数统计 */
.word-count {
  font-size: 12px;
  color: #909399;
  font-family: "JetBrains Mono", monospace;
  user-select: none;
  white-space: nowrap;
}

.word-count-divider {
  margin: 0 6px;
  color: #dcdfe6;
}

/* 下拉菜单选中态 */
:deep(.el-dropdown-menu__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

/* 响应式 */
@media screen and (min-width: 700px) and (max-width: 810px) {
  .sidebar {
    width: 200px;
    min-width: 200px;
  }

  .content-title {
    font-size: 22px;
  }
}

@media screen and (max-width: 699px) {
  .sidebar.is-collapsed {
    width: 50px;
    min-width: 50px;
  }

  .sidebar-header {
    padding: 16px 12px 12px;
  }

  .nav-list {
    padding: 8px;
  }

  .nav-list li {
    padding: 8px 10px;
    font-size: 13px;
  }

  .item-num {
    width: 22px;
    height: 22px;
    font-size: 11px;
  }

  .content-title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .collapse-btn {
    right: -10px;
    width: 20px;
    height: 40px;
    font-size: 10px;
    border-radius: 10px;
  }
}
</style>
