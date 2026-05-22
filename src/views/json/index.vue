<template>
  <div class="json-page">
    <div class="toolbar">
      <div></div>
      <div>
        <el-button @click="toFormatInput" v-loading.fullscreen.lock="loading">格式化</el-button>
        <el-button @click="clear">清空</el-button>
        <el-button @click="copyJson">复制</el-button>
      </div>
    </div>

    <!-- 主体区域 强制占满 -->
    <div class="json-main">
      <el-row class="json-row" :gutter="12">
        <!-- 左侧 -->
        <el-col :span="6" class="json-col">
          <div class="panel-title">JSON 输入</div>

          <div ref="editor" class="json-editor" contenteditable="true" @input="onEditorInput"></div>
        </el-col>

        <!-- 右侧 -->
        <el-col :span="18" class="json-col">
          <div class="panel-title">美观化预览</div>
          <div class="json-container">
            <json-node v-if="outputObj" :data="outputObj" :level="0" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import JsonNode from "@/views/json/module/JsonNode.vue";

export default {
  name: "Json",
  components: { JsonNode },
  data() {
    return {
      loading: false,
      inputJson: "",
      outputObj: null,
    };
  },
  methods: {
    onEditorInput(e) {
      this.inputJson = e.target.innerText;
    },
    toFormatInput() {
      if (!this.inputJson) return this.$message.warning("请输入数据")

      this.loading = true
      this.outputObj = null

      setTimeout(() => {
        this.formatInput()
        this.loading = false
      }, 300)
    },
    formatInput() {
      try {
        this.outputObj = JSON.parse(this.inputJson);
        const formatted = JSON.stringify(this.outputObj, null, 2);
        this.inputJson = formatted;
        this.$refs.editor.innerText = formatted;
      } catch (e) {
        this.$message.error("JSON 格式错误");
      }
    },
    clear() {
      const demo = `{"abc": [""]}`;
      this.inputJson = demo;
      this.$refs.editor.innerText = demo;

      this.outputObj = null;
    },
    copyJson() {
      if (!this.outputObj) return this.$message.warning("没有数据可复制");
      const formatted = JSON.stringify(this.outputObj, null, 2);
      navigator.clipboard.writeText(formatted);
      this.$message.success("已复制");
    },
  },
};
</script>

<style scoped>
.json-page {
  height: 98vh;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
}

/* 顶部工具栏固定 */
.toolbar {
  height: 40px;
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 剩余区域强制占满 */
.json-main {
  flex: 1;
  min-height: 0;
}

/* 左右布局 */
.json-row {
  height: 100%;
  display: flex;
}

/* 列 */
.json-col {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题 */
.panel-title {
  font-size: 13px;
  margin-bottom: 6px;
  color: #64748b;
}

/* 左侧编辑器 */
.json-editor {
  flex: 1;
  min-height: 0;
  background: #020617;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
  outline: none;
}

/* placeholder */
.json-editor:empty:before {
  content: "点击检测按钮，或手动粘贴 JSON";
  color: #64748b;
}

/* 右侧 JSON 树 */
.json-container {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #0f172a;
  border-radius: 8px;
  padding: 12px;
}

.editor,
.preview {
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
