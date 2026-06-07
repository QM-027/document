<template>
  <div class="save-page">
    <div class="save-card">
      <div class="save-header">
        <span class="save-title">{{ form.id ? '编辑文章' : '新增文章' }}</span>
        <div class="header-actions">
          <el-button size="default" @click="handleSubmit" :loading="loading" class="btn-save">保存</el-button>
        </div>
      </div>

      <div class="save-body">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="80px"
          class="form-box"
        >
          <!-- 固定区域：基础信息 -->
          <div class="form-fixed">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="展示标题" prop="title">
                  <el-input v-model="form.title" placeholder="请输入标题" size="large" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="归属分类" prop="category_code">
                  <el-select
                    v-model="form.category_code"
                    placeholder="请选择分类"
                    clearable
                    filterable
                    size="large"
                    style="width: 100%"
                  >
                    <el-option-group
                      v-for="parent in categoryList"
                      :key="parent.code"
                      :label="parent.name"
                    >
                      <el-option
                        v-for="child in parent.children"
                        :key="child.code"
                        :label="child.name"
                        :value="child.code"
                      />
                    </el-option-group>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="标题排序" prop="title_sort">
                  <el-input-number v-model="form.title_sort" :min="1" :max="999" size="large" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="展示状态" prop="title_show">
                  <el-radio-group v-model="form.title_show">
                    <el-radio label="1">展示</el-radio>
                    <el-radio label="2">隐藏</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- 滚动区域：文章内容 -->
          <div class="form-editor">
            <el-form-item label="文章内容" prop="content" class="editor-item">
              <v-md-editor v-model="form.content" height="100%" left-toolbar="undo redo clear" right-toolbar="preview fullscreen" />
            </el-form-item>
          </div>

        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { debounceSubmit } from "@/utils/debounceSubmit.js";
import { getDocument, saveDocument } from "@/api/document/index.js";
import { getUser } from "@/utils/auth";
import {useItemStore} from "../../../utils/item.js";

export default {
  name: "Save",
  data() {
    return {
      loading: false,
      form: {
        id: "",
        title: "",
        category_code: "",
        title_sort: 0,
        title_show: "1",
        content: "",
        create_time: ""
      },
      categoryList: [],
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        category_code: [{ required: true, message: "请选择分类", trigger: "change" }],
        title_sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
        title_show: [{ required: true, message: "请选择状态", trigger: "change" }],
        content: [{ required: true, message: "请输入内容", trigger: "blur" }]
      }
    };
  },
  created() {
    // 权限校验：仅 admin 且 userId=1 可访问
    const user = getUser();
    if (!user || user.username !== 'admin' || user.userId !== 1) {
      this.$message.warning('无权限访问');
      this.$router.go(-1);
      return;
    }
    this.handleOpen();
  },
  methods: {
    handleOpen() {
      this.resetInfo();
      this.fetchCategoryList();

      const itemStore = useItemStore()
      // 深拷贝 item，避免直接引用 store 中的对象
      const item = itemStore.currentItem ? JSON.parse(JSON.stringify(itemStore.currentItem)) : null
      if (item && item.id) {
        this.form = {
          id: item.id,
          title: item.title || '',
          category_code: item.category_code || '',
          title_sort: Number(item.title_sort) || 0,
          title_show: item.title_show || '1',
          content: item.content || '',
          create_time: item.create_time || ''
        };
      } else {
        this.$nextTick(() => {
          this.$refs.formRef.resetFields();
        });
      }
      // 表单赋值完成后清空 store
      itemStore.setItem(null)
    },
    fetchCategoryList() {
      getDocument().then(res => {
        if (res.code === "0000") {
          this.categoryList = res.data;
        } else {
          this.categoryList = [];
        }
      }).catch(() => {
        this.categoryList = [];
      });
    },
    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return;
        debounceSubmit(() => {
          this.loading = true;
          return saveDocument(this.form)
            .then(() => this.$message.success("保存成功"))
            .catch(() => this.$message.error("保存失败"))
            .finally(() => {
              this.handleClose();
              this.loading = false;
            });
        }).catch(err => {
          if (typeof err === "string") this.$message.warning(err);
        });
      });
    },
    handleClose() {
      this.$router.go(-1);
    },
    resetInfo() {
      this.form = {
        id: "",
        title: "",
        category_code: "",
        title_sort: 0,
        title_show: "1",
        content: "",
        create_time: ""
      };
    }
  }
};
</script>

<style scoped>
.save-page {
  height: calc(100vh - 60px);
  background: #f0f2f5;
  overflow: hidden;
  box-sizing: border-box;
}

.save-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.save-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 15px;
  flex-shrink: 0;
}

.save-title {
  font-size: 18px;
  font-weight: 700;
  color: #303133;
  font-family: "JetBrains Mono", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.btn-close {
  border-radius: 8px;
}

.btn-save {
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
}

.btn-save:hover {
  opacity: 0.9;
}

.save-body {
  padding: 10px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.form-box {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.form-fixed {
  flex-shrink: 0;
  margin-bottom: 16px;
}

.form-editor {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.editor-item {
  height: calc(100% - 15px);
}

.editor-item /deep/ .el-form-item__content {
  height: 100%;
  min-height: 0;
}

@media screen and (max-width: 768px) {
  .save-page {
    padding: 16px;
  }

  .save-header {
    padding: 16px 20px;
  }

  .save-body {
    padding: 20px;
  }
}
</style>

<style>
@import '../../../assets/fonts/font.css';
@import '../../../assets/styles/md-preview.css';

.v-md-editor {
  border: 1px solid #dcdfe6 !important;
  border-radius: 4px !important;
  box-shadow: none !important;
}

.v-md-editor--preview {
  box-shadow: none !important;
}
</style>
