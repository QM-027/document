<template>
  <el-container id="homepage-container">
    <el-aside class="carousel-aside" width="40%">

      <el-carousel :interval="5000" height="100%" indicator-position="outside" class="image-carousel">
        <el-carousel-item v-for="(img, index) in imageList" :key="index">
          <img :src="img.path" :alt="img.name" class="full-height-image" />
        </el-carousel-item>
      </el-carousel>

    </el-aside>

    <el-main class="content-main">
      <div class="header">
        <div class="welcome-message">
          <p class="greeting" @click="toSelect()">简单学玩</p>
          <p class="system-name">美好的一天，从现在开始吧～</p>
        </div>
      </div>

      <div class="content">
        <el-row :gutter="20" v-for="(data, index) in dataList" :key="index" class="data-section">
          <el-col :span="24">
            <div class="data-title-container">
              <span class="title-indicator"></span> <span class="data-title">{{ data.name }}</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="app-list-container">
              <el-card class="app-item-card" shadow="hover" v-for="(group, groupIndex) in data.children" :key="groupIndex">
                <div class="app-card-content-wrapper" @click="toSkip(group)">
                  <p class="app-name">{{ group.name }}</p>
                  <span class="app-content">{{ group.remark }}</span>
                </div>
              </el-card>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import {getDocument} from "@/api/document/index.js";

const modules = import.meta.glob('@/assets/qm/*.(png|jpg)', { eager: true, import: 'default' });

let images = [];
for (const path in modules) {
  images.push({
    name: path.split('/').pop(),
    path: modules[path]
  });
}

export default {
  name: 'Document',
  data() {
    return {
      // 轮播图图片列表
      imageList: images,
      // 保持原有数据结构
      dataList: [],
      authorization: '',
    }
  },
  created() {
    this.getList();
  },
  methods: {
    toSelect() {
      this.$router.push({ path: `/select` });
    },
    toSkip(item) {
      this.$router.push({ path: `/preview`,query: {code:item.code} });
    },
    getList() {
      getDocument().then((res) => {
        if (res.code === "0000") {
          this.dataList = res.data
        } else {
          this.dataList = []
        }

      })
    },
  }
}
</script>

<style scoped>
/* 容器设置全高 */
#homepage-container {
  height: 93vh;
  padding: 0;
  margin: 0;
  display: flex;
  background-color: #FFFFFF; /* 整体背景色为白色 */
}

/* -------------------- 左侧轮播图区域 -------------------- */
.carousel-aside {
  background-color: #FFFFFF;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;

  height: 100%;
}

.image-carousel {
  width: 100%;
  height: 100%;
}


/* 确保图片完整展示，不被裁剪 */
.full-height-image {
  max-width: 99.5%;
  max-height: 99.5%;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  margin: auto;

  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Element UI 轮播图指示器样式调整 (可选，让它在外部清晰可见) */
.image-carousel /deep/ .el-carousel__indicator button {
  background-color: rgba(0, 0, 0, 0.3);
}
.image-carousel /deep/ .el-carousel__indicator.is-active button {
  background-color: #409EFF; /* 选中指示器颜色 */
}

/* -------------------- 右侧内容区域 -------------------- */
.content-main {
  padding: 0 !important;
  display: flex;
  flex-direction: column;
  /* 整体内容区域稍微透明，让背景图隐约可见 (如果轮播图有留白，则内容区会是这个颜色) */
  background-color: rgba(255, 255, 255, 0.1);
  height: 100%;
  overflow: hidden;
}

.header {
  flex: 0 0 120px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding-left: 30px;
  box-sizing: border-box;
  background-color: rgba(255, 255, 255, 0); /* 头部背景完全透明 */
}

.welcome-message {
  background-color: rgba(255, 255, 255, 0.7);
  border-radius: 10px;
}

.welcome-message .greeting {
  font-size: 1.9rem;
  color: #2f5cf6;
  font-weight: bold;
  margin-bottom: 3px;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.welcome-message .system-name {
  margin-top: 0;
  font-size: 1.4rem;
  color: #6b747e;
  text-align: left;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.1);
}

.content {
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
  box-sizing: border-box;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.data-section {
  margin-bottom: 30px;
}

.data-title-container {
  display: flex;
  align-items: center;
  padding: 10px 10px 10px 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  margin-bottom: 10px;
}
.title-indicator {
  width: 4px;
  height: 18px;
  background-color: #409EFF;
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
  margin-left: -15px;
  margin-top: -10px;
}

.app-list-container /deep/ .el-card {
  background-color: rgba(255, 255, 255, 0.85) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.app-item-card {
  flex: 0 0 calc(18% - 10px);
  margin-left: 15px;
  margin-top: 20px;
  margin-bottom: 15px;
  max-width: 220px;
  min-width: 180px;
  height: 120px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
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
  padding: 20px;
  box-sizing: border-box;
}

.app-name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0 0 4px 0;
  width: 100%;
  flex-basis: 33.33%;
  flex-shrink: 0;
  flex-grow: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.app-content {
  padding-top: 10px;
  font-size: 14px;
  color: #666;
  margin: 0;
  width: 100%;
  flex-basis: 66.66%;
  flex-grow: 1;
  flex-shrink: 1;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ================= 根据列数控制布局 (保持不变) ================= */
.app-list-container.col-4 .app-item-card {
  flex: 0 0 calc(25% - 10px);
}
.app-list-container.col-3 .app-item-card {
  flex: 0 0 calc(33.333% - 10px);
}
.app-list-container.col-2 .app-item-card {
  flex: 0 0 calc(50% - 10px);
}
.app-list-container.col-1 .app-item-card {
  flex: 0 0 100%;
}

@media (max-width: 768px) {
  #homepage-container {
    flex-direction: column;
  }
  .carousel-aside {
    width: 100% !important;
    height: 250px; /* 移动端给轮播图固定高度 */
  }
  .content-main {
    height: auto; /* 移动端内容区高度自适应 */
  }
}
</style>

