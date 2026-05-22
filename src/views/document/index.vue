<template>
  <div class="page-wrapper">
    <div class="page-main">
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
                    <p class="app-content">{{ group.remark }}</p>
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

export default {
  name: 'Document',
  data() {
    return {
      dataList: [],
    };
  },
  created() {
    this.getList();
  },
  methods: {
    toSkip(item) {
      if (!item.remark) return this.$message.warning("该分类下没有数据")
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
.page-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.94);
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
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.content::-webkit-scrollbar {
  display: none;
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
  align-items: stretch;
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
  padding: 16px;
}

.app-name {
  font-size: 16px;
  font-weight: 700;
  color: #333;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.app-content {
  font-size: 13px;
  color: #888;
  margin: 8px 0 0 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

/* ========================================= */
/* --- APP/手机 适配 (max-width: 768px) --- */
/* ========================================= */
@media screen and (max-width: 768px) {
  .page-main {
    flex-direction: column;
  }

  .page-content {
    flex: 1 1 0%;
    width: 100%;
    min-width: 100%;
  }

  .content {
    padding: 16px;
  }

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
  .content {
    padding: 20px;
  }

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
