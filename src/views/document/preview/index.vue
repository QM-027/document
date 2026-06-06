<template>
  <div class="page-container">
    <div class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <ul class="nav-list">
        <li
            v-for="(item, index) in dataList"
            :key="item.id"
            :class="{ active: activeKey === item.id, 'is-collapsed-item': isCollapsed }"
            @click="selectItem(item.id)"
        >
          <span class="item-index">{{ index + 1 }}.</span>
          <span v-if="!isCollapsed" class="item-label">{{ item.title }}</span>
          <el-tooltip v-else :content="item.title" placement="right">
            <span></span>
          </el-tooltip>
        </li>
      </ul>

      <!-- 收起/展开按钮 -->
      <div class="collapse-btn" @click="toggleCollapse">
        <img :src="expandIcon" class="collapse-icon" :class="{ 'is-rotated': isCollapsed }" />
      </div>
    </div>

    <div ref="contentRef" class="content" :class="{ 'content-full-width': isCollapsed }">
      <span class="content-title">{{title}}</span>
      <v-md-preview :text="currentMarkdown" />
    </div>
  </div>
</template>

<script>
import expandIcon from "@/assets/svg/expand.svg";
import { getDocumentListByCode } from "@/api/document/index.js";

export default {
  name: "Preview",
  data() {
    return {
      expandIcon,
      dataList: [],
      title: "",
      activeKey: "",
      isCollapsed: false,
      contentRef: null,
      screenWidth: window.innerWidth
    };
  },
  computed: {
    Fold() {
      return Fold
    },
    Expand() {
      return Expand
    },
    currentMarkdown() {
      if (!this.dataList || !this.activeKey) return "";
      const item = this.dataList.find(i => i.id === this.activeKey);
      if (item && item.title) this.title = item.title;
      if (item && item.content) return item.content;
      return "";
    },
  },
  mounted() {
    const code = this.$route.query.code;
    if (code) {
      getDocumentListByCode(code).then((res) => {
        if (res && res.code === "0000" && res.data.length > 0) {
          this.dataList = res.data;
          if (this.dataList && this.dataList.length > 0) {
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

    // 根据屏幕宽度设置是否折叠
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
      // 滚动到顶部
      this.$nextTick(() => {
        if (this.$refs.contentRef) {
          this.$refs.contentRef.scrollTop = 0;
        }
      });
    },
    toggleCollapse() {
      this.isCollapsed = !this.isCollapsed;
    },
  },
};
</script>

<style scoped>
.page-container {
  display: flex;
  width: 100%;
  height: 98vh;
}

.sidebar {
  width: 20%;
  min-width: 200px;
  border-right: 1px solid #eee;
  padding: 20px 10px;
  box-sizing: border-box;
  background: #f6f6f7;
  transition: width 0.3s ease;
  overflow: hidden;
  border-radius: 10px;
  position: relative;
}

.sidebar.is-collapsed {
  width: 60px;
  min-width: 60px;
  padding: 20px 5px;
}

.collapse-btn {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: #8facf1;
  border-radius: 50%;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: visible;
}

.collapse-icon {
  width: 15px;
  height: 30px;
  transform: rotate(90deg);
  transition: transform 0.3s;
}

.collapse-icon.is-rotated {
  transform: rotate(270deg);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  max-height: calc(98vh - 60px);
}

.nav-list li {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  white-space: nowrap;
  border-radius: 4px;
  margin-bottom: 5px;
}

.nav-list .item-index {
  font-weight: bold;
  margin-right: 8px;
}

.nav-list .item-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-list li.is-collapsed-item {
  justify-content: flex-start;
  padding-left: 10px;
}

.nav-list li.active {
  color: #3b50ab;
}

.content {
  flex: 1;
  padding: 40px 60px;
  overflow-y: auto;
  transition: all 0.3s ease;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
  background: #fff;
}

.content-title {
  display: block;
  text-align: center;
  font-weight: bold;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
  font-size: 24px;
  color: #1a1a1a;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

/* 手机端和iPad折叠时保证导航栏最小宽度 */
@media screen and (max-width: 1024px) {
  .sidebar.is-collapsed {
    width: 60px;
    min-width: 60px;
  }

  .content {
    padding: 20px 16px;
  }

  .content-title {
    font-size: 20px;
    margin-bottom: 20px;
    padding-bottom: 15px;
  }
}
</style>

<style>
@import '@/assets/fonts/font.css';
@import '@/assets/styles/md-preview.css';
</style>
