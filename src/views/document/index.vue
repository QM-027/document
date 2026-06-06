<template>
  <div class="document-page">
    <!-- 左侧 2/3：卡片列表 -->
    <div class="document-left" ref="contentScroll">
      <div v-for="(data, index) in dataList" :key="index" class="section">
        <div class="section-header">
          <span class="section-indicator"></span>
          <span class="section-title">{{ data.name }}</span>
        </div>
        <div class="card-list">
          <div
            class="card-item"
            v-for="(group, groupIndex) in data.children"
            :key="groupIndex"
            @click="toSkip(group)"
          >
            <div class="card-top"></div>
            <div class="card-body">
              <div class="card-icon">{{ String.fromCharCode(65 + index) }}{{ groupIndex + 1 }}</div>
              <div class="card-info">
                <p class="card-name">{{ group.name }}</p>
                <p class="card-remark">{{ group.remark }}</p>
              </div>
              <i class="card-arrow el-icon-arrow-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧 1/3：明细文章列表 -->
    <div class="document-right">
<!--      <div class="right-header">-->
<!--        <span class="right-title">日常记录</span>-->
<!--      </div>-->
      <div class="article-list">
        <div
          class="article-item"
          v-for="(item, index) in articleList"
          :key="index"
          @click="openPreview(item)"
        >
          <span class="article-index">{{ index + 1 }}</span>
          <span class="article-name">{{ item.name }}</span>
          <i class="article-arrow el-icon-arrow-right"></i>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import { getDocument } from "@/api/document/index.js";
export default {
  name: 'Document',
  data() {
    return {
      dataList: [],
      articleList: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    toSkip(item) {
      if (!item.remark) return this.$message.warning("该分类下没有数据");
      this.$router.push({ path: '/preview', query: { code: item.code, name: item.name } });
    },
    openPreview(item) {
      this.$router.push({ path: '/preview', query: { code: item.code, name: item.name } });
    },
    getList() {
      getDocument().then(res => {
        if (res.code === "0000") {
          // 左侧：排除"日常记录"
          this.dataList = res.data.filter(group => group.name !== '日常记录');
          // 右侧：只取"日常记录"的 children
          this.articleList = [];
          const dailyGroup = res.data.find(group => group.name === '日常记录');
          if (dailyGroup && dailyGroup.children) {
            dailyGroup.children.forEach(child => {
              this.articleList.push({
                name: child.name,
                code: child.code
              });
            });
          }
        } else {
          this.dataList = [];
          this.articleList = [];
        }
      });
    }
  }
};
</script>

<style scoped>
@import '../../assets/fonts/font.css';

.document-page {
  height: 100vh;
  overflow: hidden;
  display: flex;
  background: #f0f2f5;
}

/* 左侧卡片区域 */
.document-left {
  flex: 2;
  overflow-y: auto;
  padding: 30px 30px 30px 40px;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.document-left::-webkit-scrollbar {
  display: none;
}

.section {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.section-indicator {
  width: 4px;
  height: 20px;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 12px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.card-list {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card-item {
  width: 260px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.card-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.18);
}

.card-item:hover .card-top {
  opacity: 1;
}

.card-item:hover .card-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #667eea;
}

.card-top {
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s;
}

.card-body {
  display: flex;
  align-items: center;
  padding: 18px 20px;
  gap: 14px;
}

.card-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: #303133;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.card-remark {
  font-size: 12px;
  color: #909399;
  margin: 6px 0 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-arrow {
  font-size: 16px;
  color: #c0c4cc;
  opacity: 0;
  transform: translateX(-8px);
  transition: all 0.3s;
  flex-shrink: 0;
}

/* 右侧文章列表 */
.document-right {
  flex: 1;
  min-width: 200px;
  max-width: 220px;
  border-left: 1px solid #e8ecf1;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.right-header {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f0f2f5;
  flex-shrink: 0;
}

.right-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.article-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 16px;
}

.article-item {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  gap: 12px;
}

.article-item:hover {
  background: #f5f7fa;
}

.article-item:hover .article-arrow {
  opacity: 1;
  transform: translateX(0);
  color: #667eea;
}

.article-index {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.article-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.article-arrow {
  font-size: 14px;
  color: #c0c4cc;
  opacity: 0;
  transform: translateX(-6px);
  transition: all 0.2s;
  flex-shrink: 0;
}

/* 华为 Mate 70 Pro (约 412px) */
@media screen and (min-width: 360px) and (max-width: 480px) {
  .document-page {
    flex-direction: column;
  }

  .document-left {
    flex: none;
    height: 55vh;
    padding: 16px;
    border-bottom: 1px solid #e8ecf1;
  }

  .document-right {
    flex: none;
    max-width: none;
    min-width: auto;
    height: 45vh;
    border-left: none;
  }

  .section {
    margin-bottom: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .card-list {
    gap: 12px;
  }

  .card-item {
    width: 100%;
  }

  .card-body {
    padding: 14px;
    gap: 12px;
  }

  .card-icon {
    width: 38px;
    height: 38px;
    font-size: 13px;
  }

  .card-name {
    font-size: 14px;
  }

  .card-remark {
    font-size: 11px;
  }

  .article-arrow {
    opacity: 1;
    transform: translateX(0);
    color: #c0c4cc;
  }

  .right-header {
    padding: 16px 16px 12px;
  }

  .right-title {
    font-size: 16px;
  }

  .article-item {
    padding: 12px 8px;
  }
}

/* iPad mini 7 竖屏 (约 744px) */
@media screen and (min-width: 700px) and (max-width: 810px) {
  .document-left {
    padding: 20px 20px 20px 24px;
  }

  .section-title {
    font-size: 17px;
  }

  .card-list {
    gap: 14px;
  }

  .card-item {
    width: calc(50% - 7px);
  }

  .card-body {
    padding: 14px 16px;
    gap: 12px;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 14px;
  }

  .card-name {
    font-size: 14px;
  }

  .document-right {
    max-width: 200px;
    min-width: 180px;
  }

  .right-header {
    padding: 20px 16px 12px;
  }

  .right-title {
    font-size: 16px;
  }

  .article-item {
    padding: 12px 10px;
  }

  .article-name {
    font-size: 13px;
  }
}

/* iPad mini 7 横屏 (约 1133px) */
@media screen and (min-width: 1024px) and (max-width: 1200px) {
  .document-left {
    padding: 24px 24px 24px 30px;
  }

  .card-item {
    width: calc(33.333% - 14px);
  }

  .card-list {
    gap: 16px;
  }
}

/* 通用小屏 (手机) */
@media screen and (max-width: 359px) {
  .document-page {
    flex-direction: column;
  }

  .document-left {
    flex: none;
    height: 55vh;
    padding: 12px;
    border-bottom: 1px solid #e8ecf1;
  }

  .document-right {
    flex: none;
    max-width: none;
    min-width: auto;
    height: 45vh;
    border-left: none;
  }

  .card-list {
    gap: 10px;
  }

  .card-item {
    width: 100%;
  }

  .card-body {
    padding: 12px;
    gap: 10px;
  }

  .card-icon {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }

  .card-name {
    font-size: 13px;
  }

  .article-arrow {
    opacity: 1;
    transform: translateX(0);
    color: #c0c4cc;
  }
}
</style>
