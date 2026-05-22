<template>
  <div class="page-wrapper">
    <div class="page-header" :class="{ 'header-shadow': headerShadow }">
      <div class="welcome-message">
        <img src="@/assets/svg/qm1.svg" alt="icon" class="header-icon"/>
        <p class="greeting">简单学玩
          <span class="system-name">美好的一天，从现在开始吧～</span>
        </p>
      </div>

      <div class="dropdown-group">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">设置</span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="401">新增</el-dropdown-item>
              <el-dropdown-item command="404">开发</el-dropdown-item>
              <el-dropdown-item divided command="select">选择</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <div class="page-main">
      <el-aside class="carousel-aside">
        <el-carousel :interval="5000" indicator-position="outside" class="image-carousel" height="100%">
          <el-carousel-item v-for="(img, index) in imageList" :key="index">
            <div class="image-container">
              <img :src="img.path" :alt="img.name" class="full-size-image"/>
            </div>
          </el-carousel-item>
        </el-carousel>
      </el-aside>
      <div class="page-content">
        <div class="content" ref="contentScroll">
          <el-row :gutter="20" v-for="(data, index) in dataList" :key="index" class="data-section">
            <el-col :span="24">
              <div class="data-title-container">
                <span class="title-indicator"></span>
                <span class="data-title">{{ data.name }}</span>
              </div>
            </el-col>
            <el-col :span="24">
              <div class="app-list-container">
                <el-card
                    class="app-item-card"
                    shadow="hover"
                    v-for="(group, groupIndex) in data.children"
                    :key="groupIndex"
                >
                  <div class="app-card-content-wrapper" @click="toSkip(group)">
                    <p class="app-name">{{ group.name }}</p>
                    <span class="app-content">{{ group.remark }}</span>
                  </div>
                </el-card>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {getDocument} from "@/api/document/index.js";

const modules = import.meta.glob('@/assets/qm/*.(png|jpg|jpeg|svg)', {eager: true, import: 'default'});

let images = [];
for (const path in modules) {
  images.push({
    name: path.split('/').pop(),
    path: modules[path],
  });
}

export default {
  name: 'Document',
  data() {
    return {
      imageList: images,
      dataList: [],
      headerShadow: false,
    };
  },
  created() {
    this.getList();
  },
  mounted() {
    this.$nextTick(() => {
      const contentEl = this.$refs.contentScroll;
      if (contentEl) {
        contentEl.addEventListener('scroll', this.handleScroll);
        this.handleScroll();
      }
    });
  },
  beforeDestroy() {
    const contentEl = this.$refs.contentScroll;
    if (contentEl) {
      contentEl.removeEventListener('scroll', this.handleScroll);
    }
  },
  methods: {
    handleCommand(command) {
      // 根据 command 跳转不同页面
      this.$router.push({ path: `/${command}` });
    },
    handleScroll() {
      const el = this.$refs.contentScroll;
      if (!el) return;
      this.headerShadow = el.scrollTop > 0;
    },
    toSkip(item) {
      this.$router.push({path: `/preview`, query: {code: item.code}});
    },
    getList() {
      getDocument().then((res) => {
        if (res.code === "0000") {
          this.dataList = res.data;
        } else {
          this.dataList = [];
        }
      });
    },
  },
};
</script>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden !important;
}

.page-wrapper {
  display: flex;
  flex-direction: column;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.94);
}

.page-header {
  flex: 0 0 80px;
  height: 80px;
  padding: 0 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: none;
  border-bottom: 1px solid transparent;
  transition: border-bottom-color 0.3s;
  z-index: 10;
}

.page-header.header-shadow {
  box-shadow: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.page-main {
  flex: 1 1 0%;
  display: flex;
  min-height: 0;
  overflow: hidden;
}


.page-content {
  flex: 1 1 0%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

.content {
  flex: 1 1 0%;
  min-height: 0;
  overflow-y: auto;
  padding: 24px 30px;
}

.content::-webkit-scrollbar {
  width: 6px
}

.content::-webkit-scrollbar-thumb {
  border-radius: 3px
}

.welcome-message {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-radius: 10px;
}
.header-icon {
  width: 70px;
  height: 70px;
  margin-right: 15px;
}
.greeting {
  font-size: 1.9rem;
  color: #2f5cf6;
  font-weight: bold;
  margin: 0;
}
.system-name {
  margin-left: 10px;
  font-size: 1.2rem;
  color: #6b747e;
  text-align: left;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.dropdown-group {
  display: flex;
  margin-right: 20px;
}
.el-dropdown-link {
  outline: none !important;
  cursor: pointer;
  font-weight: 500;
  font-size: 1rem;
}
.el-dropdown-link:focus, .el-dropdown-link:active {
  outline: none !important;
  box-shadow: none !important;
}

.carousel-aside {
  flex: 0 0 40%;
  position: relative;
  height: 100%;
  min-width: 220px;
  min-height: 0;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  margin-top: 10px;
  padding: 0 20px;
}

.image-carousel {
  width: 100%;
  height: 100%;
  position: relative;
}

.image-carousel .el-carousel__item {
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  background: transparent;
}

.image-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.full-size-image {
  max-width: 100%;
  max-height: 100%;
  width: auto !important;
  height: auto !important;
  object-fit: contain !important;
  border-radius: 8px;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
  display: block;
}


.data-section {
  margin-bottom: 30px;
}

.data-title-container {
  display: flex;
  align-items: center;
  padding: 10px 10px 10px 0;
  background: transparent;
  border-radius: 5px;
  margin-bottom: 10px;
}

.title-indicator {
  width: 4px;
  height: 18px;
  background: #409EFF;
  border-radius: 2px;
  margin-right: 10px;
}

.data-title {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.app-list-container {
  display: flex;
  flex-wrap: wrap;
  margin-left: -20px;
  margin-top: 10px;
}

.app-item-card {
  flex: 0 0 calc(20% - 20px);
  margin-left: 20px;
  margin-bottom: 15px;
  max-width: 250px;
  min-width: 180px;
  height: 120px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  box-sizing: border-box;
}

.app-item-card:hover {
  transform: scale(1.05);
  box-shadow: 3px 3px 10px 1px rgba(169, 199, 231, 0.4);
}

.app-item-card /deep/ .el-card__body {
  padding: 0 !important;
  width: 100%;
  height: 100%;
}

.app-card-content-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.app-name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-content {
  padding-top: 10px;
  font-size: 14px;
  color: #666;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========================================= */
/* --- APP/手机 适配 (max-width: 768px) --- */
/* ========================================= */
@media screen and (max-width: 768px) {
  /* --- 整体结构调整 --- */
  .page-header {
    flex: 0 0 60px; /* 缩小头部高度 */
    height: 60px;
    padding: 0 16px; /* 缩小水平边距 */
  }

  .page-main {
    flex-direction: column; /* 垂直排列 */
  }

  /* --- 轮播图 (Carousel Aside) 调整：保留，改为全宽和固定高度 --- */
  .carousel-aside {
    flex: 0 0 auto; /* 允许高度自适应 */
    width: 100%; /* 全宽 */
    height: 200px; /* 给轮播图一个适合手机屏幕的高度 */
    min-width: unset;
    padding: 10px 16px; /* 调整内边距 */
    display: flex; /* 确保显示 */
    margin-top: 0;
  }

  .page-content {
    flex: 1 1 0%;
    width: 100%; /* 全宽 */
    min-width: 100%;
  }

  .content {
    padding: 16px; /* 缩小内容区内边距 */
  }

  /* --- 头部元素调整 --- */
  .header-icon {
    width: 50px; /* 缩小头部图标 */
    height: 50px;
    margin-right: 10px;
  }

  .greeting {
    font-size: 1.4rem; /* 缩小主标题字体 */
  }

  .system-name {
    display: none; /* 在手机端隐藏次要信息 */
  }

  .el-dropdown-link {
    font-size: 0.9rem;
  }

  /* --- 内容区元素调整 --- */
  .data-title {
    font-size: 18px; /* 缩小章节标题字体 */
  }

  .app-list-container {
    margin-left: -10px; /* 调整负边距 */
    justify-content: space-around; /* 均匀分布卡片 */
  }

  .app-item-card {
    /* 手机端 2 列布局 */
    flex: 0 0 calc(50% - 10px); /* 占据约 50% 宽度 */
    margin-left: 10px;
    margin-bottom: 10px;
    min-width: unset; /* 取消最小宽度限制 */
    height: 100px; /* 缩小卡片高度 */
  }

  .app-name {
    font-size: 15px;
  }

  .app-content {
    padding-top: 5px;
    font-size: 12px;
    -webkit-line-clamp: 2;
  }
}


/* ========================================================== */
/* --- iPad/平板 适配 (769px - 1200px) --- */
/* ========================================================== */
@media screen and (min-width: 769px) and (max-width: 1200px) {
  /* --- 布局比例调整 (保持两侧布局) --- */
  .carousel-aside {
    flex: 0 0 30%; /* 缩小侧边栏，给内容区更多空间 */
    padding: 0 15px;
  }

  .page-header {
    padding: 0 24px;
  }

  .content {
    padding: 20px;
  }

  /* --- 卡片布局调整： 3 列布局 --- */
  .app-list-container {
    margin-left: -15px; /* 调整负边距 */
  }

  .app-item-card {
    /* 调整为 3 列 */
    flex: 0 0 calc(33.333% - 15px);
    margin-left: 15px;
    margin-bottom: 15px;
    min-width: 160px; /* 调整最小宽度 */
    height: 110px;
  }
}
</style>
