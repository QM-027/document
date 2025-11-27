<template>
  <div class="page-container">
    <div class="sidebar" :class="{ 'is-collapsed': isCollapsed }">
      <div
          class="sidebar-header"
          :class="{ 'is-collapsed': isCollapsed }"
      >
        <!-- 返回按钮 -->
        <div v-if="!isCollapsed" @click="goBack" class="icon-button">
          <el-icon :size="24"><Back /></el-icon>
        </div>

        <!-- 收起/展开按钮 -->
        <div @click="toggleCollapse" class="icon-button">
          <el-icon :size="24">
            <component :is="isCollapsed ? Expand : Fold" />
          </el-icon>
        </div>
      </div>

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
    </div>

    <div ref="contentRef" class="content" :class="{ 'content-full-width': isCollapsed }">
      <span class="content-title">{{title}}</span>
      <v-md-preview :text="currentMarkdown" />
    </div>
  </div>
</template>

<script>
import { Back, Fold, Expand } from "@element-plus/icons-vue";
import {getDocumentListByCode} from "@/api/document/index.js";

export default {
  name: "Preview",
  components: { Back, Fold, Expand },
  data() {
    return {
      dataList: [],
      title: "",
      activeKey: "",
      isCollapsed: false,
      contentRef: null,
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
      if (item && item.content) return  item.content;

      return "";
    },
  },
  mounted() {
    this.dataList = []
    const code = this.$route.query.code;
    if(code) {
      getDocumentListByCode(code).then((res) => {
        if (res && res.code === "0000") {
          this.dataList = res.data
        } else {
          this.dataList = []
        }

      })
    } else {
      this.$message({type: 'error', message: "获取数据失败"});
    }
  },
  methods: {
    goBack() {
      if (this.$router) {
        this.$router.go(-1);
      }
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
}

.sidebar.is-collapsed {
  width: 60px;
  min-width: 60px;
  padding: 20px 5px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  padding: 0 5px;
  transition: all 0.3s;
}

/* 展开状态：返回+收起按钮左右分开 */
.sidebar-header:not(.is-collapsed) {
  justify-content: space-between;
}

/* 收起状态：只有一个展开按钮，左对齐 */
.sidebar-header.is-collapsed {
  justify-content: flex-start;
}

/* 图标大小和间距统一 */
.icon-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;   /* 可以根据需要调整 */
  height: 24px;
  cursor: pointer;
  margin-right: 10px; /* 保持左边距 */
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
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
  padding: 20px;
  overflow-y: auto;
  transition: all 0.3s ease;
}

.content-title {
  display: block;
  text-align: center;
  font-weight: bold;
  font-family: "Microsoft YaHei", "黑体", "SimHei", sans-serif;
  font-size: 20px;
}
</style>
