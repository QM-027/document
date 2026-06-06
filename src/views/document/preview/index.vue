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
      <div class="content-header">
        <span class="content-title">{{ title }}</span>
        <span class="create-time" v-if="createTime">创建时间：{{ createTime }}</span>
      </div>
      <v-md-preview :text="currentMarkdown" />

      <!-- 底部上下条按钮 -->
      <div class="content-nav" v-if="isCollapsed">
        <el-button @click="prevItem" :disabled="!canPrev" plain class="nav-btn">
          <i class="el-icon-arrow-left"></i> 上一条
        </el-button>
        <el-button @click="nextItem" :disabled="!canNext" plain class="nav-btn">
          下一条 <i class="el-icon-arrow-right"></i>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { getDocumentListByCode } from "@/api/document/index.js";

export default {
  name: "Preview",
  data() {
    return {
      dataList: [],
      categoryName: "",
      title: "",
      createTime: "",
      activeKey: "",
      isCollapsed: false,
      contentRef: null,
      screenWidth: window.innerWidth
    };
  },
  computed: {
    currentMarkdown() {
      if (!this.dataList || !this.activeKey) return "";
      const item = this.dataList.find(i => i.id === this.activeKey);
      if (item) {
        if (item.title) this.title = item.title;
        this.createTime = item.create_time || '';
        return item.content || '';
      }
      return "";
    },
    currentIndex() {
      return this.dataList.findIndex(i => i.id === this.activeKey);
    },
    canPrev() {
      return this.currentIndex > 0;
    },
    canNext() {
      return this.currentIndex < this.dataList.length - 1;
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
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    }
  }
};
</script>

<style scoped>
@import '../../../assets/fonts/font.css';

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

/* 底部上下条按钮 */
.content-nav {
  display: flex;
  gap: 12px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.nav-btn {
  flex: 1;
  height: 44px;
  font-size: 15px;
  border-radius: 10px;
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
  padding: 10px 10px;
  overflow-y: auto;
  background: #fff;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

.content-header {
  text-align: center;
  border-bottom: 1px solid #eee;
}

.content-title {
  display: block;
  font-weight: 700;
  font-size: 24px;
  color: #1a1a1a;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.create-time {
  display: block;
  text-align: right;
  font-size: 13px;
  color: #909399;
  margin-top: 10px;
}

/* 响应式 */
@media screen and (min-width: 700px) and (max-width: 810px) {
  .sidebar {
    width: 200px;
    min-width: 200px;
  }

  .content {
    padding: 10px 10px;
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

  .content {
    padding: 20px 16px;
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

<style>
@import '../../../assets/fonts/font.css';
@import '../../../assets/styles/md-preview.css';
</style>
