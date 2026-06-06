<template>
  <el-dialog
    :visible.sync="visible"
    :title="title"
    width="70%"
    top="5vh"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    @close="handleClose"
    class="preview-dialog"
  >
    <div class="preview-content" v-loading="loading">
      <v-md-preview :text="markdownText" />
    </div>
  </el-dialog>
</template>

<script>
import { getDocumentListByCode } from "@/api/document/index.js";

export default {
  name: 'PreviewModal',
  data() {
    return {
      visible: false,
      loading: false,
      title: '',
      markdownText: ''
    };
  },
  methods: {
    open(item) {
      this.title = item.name;
      this.markdownText = '';
      this.visible = true;
      this.loading = true;

      getDocumentListByCode(item.code).then(res => {
        if (res && res.code === '0000' && res.data && res.data.length > 0) {
          this.markdownText = res.data[0].content || '';
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    handleClose() {
      this.visible = false;
      this.markdownText = '';
    }
  }
};
</script>

<style scoped>
.preview-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 0 10px;
}
</style>

<style>
@import '../../../assets/fonts/font.css';
@import '../../../assets/styles/md-preview.css';

.preview-dialog .el-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.preview-dialog .el-dialog__header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
}

.preview-dialog .el-dialog__title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.preview-dialog .el-dialog__body {
  padding: 20px 24px;
}
</style>
