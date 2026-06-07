<template>
  <div class="document-page">
    <!-- 可滚动的整体内容区域 -->
    <div class="scroll-container">
      <!-- 功能模块 -->
      <function-module />

      <!-- 思维导图区域 -->
      <div class="mind-map-wrapper">
        <mind-map :data="dataList" @node-click="openPreview" />
      </div>

      <!-- 备案信息 -->
      <footer-beian />
    </div>
  </div>
</template>

<script>
import { getDocument } from "@/api/document/index.js";
import FunctionModule from "@/components/FunctionModule/index.vue";
import MindMap from "@/components/MindMap/index.vue";
import FooterBeian from "@/components/FooterBeian/index.vue";

export default {
  name: 'Document',
  components: {
    FunctionModule,
    MindMap,
    FooterBeian
  },
  data() {
    return {
      dataList: []
    };
  },
  created() {
    this.getList();
  },
  methods: {
    openPreview(item) {
      if (!item.code || !item.remark) return this.$message.warning("该分类下没有数据");
      this.$router.push({ path: '/preview', query: { code: item.code, name: item.name } });
    },
    getList() {
      getDocument().then(res => {
        if (res.code === "0000") {
          this.dataList = res.data;
        } else {
          this.dataList = [];
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
  background: #f0f2f5;
}

/* ==================== 滚动容器 ==================== */
.scroll-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* ==================== 思维导图区域 ==================== */
.mind-map-wrapper {
  padding: 20px 0 40px;
}
</style>
