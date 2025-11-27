<template>
  <div class="page-container">
    <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
        class="form-box"
    >
      <!-- 第一行：标题 + 分类 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="展示标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="归属分类" prop="category_code">
            <el-select
                v-model="form.category_code"
                placeholder="请选择分类"
                clearable
                filterable
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

      <!-- 第二行：排序 + 展示状态 -->
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="标题排序" prop="title_sort">
            <el-input-number v-model="form.title_sort" :min="1" :max="999" style="width: 100%" />
          </el-form-item>
        </el-col>

        <el-col :span="12">
          <el-form-item label="展示状态" prop="title_show">
            <el-radio-group v-model="form.title_show">
              <el-radio :label="'1'">展示</el-radio>
              <el-radio :label="'2'">隐藏</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 第三行：内容 -->
      <el-form-item label="文章内容" prop="content">
        <v-md-editor v-model="form.content" height="70vh" />
      </el-form-item>

      <!-- 按钮居中：保存 + 关闭 -->
      <div class="button-center">
        <el-button round color="#626aef" @click="handleSubmit" :loading="loading">
          保存
        </el-button>
        <el-button round @click="handleClose">关闭</el-button>
      </div>
    </el-form>

  </div>
</template>

<script>
import { debounceSubmit } from "@/utils/debounceSubmit.js"
import {getDocument, saveDocument} from "@/api/document/index.js"

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
        title_show: '1',
        content: "",
        create_time: "",
      },
      categoryList: [],
      rules: {
        title: [{ required: true, message: "请输入标题", trigger: "blur" }],
        category_code: [{ required: true, message: "请选择分类", trigger: "change" }],
        title_sort: [{ required: true, message: "请输入排序", trigger: "blur" }],
        title_show: [{ required: true, message: "请选择状态", trigger: "change" }],
        content: [{ required: true, message: "请输入内容", trigger: "blur" }]
      }
    }
  },

  created() {
    this.handleOpen();
  },

  methods: {
    handleOpen(){
      this.resetInfo();
      // 获取分类数据
      this.fetchCategoryList()
    },
    fetchCategoryList() {
      getDocument().then((res) => {
        if (res.code === "0000") {
          this.categoryList = res.data
        } else {
          this.categoryList = []
        }
      }).catch(() => {
        this.categoryList = []
      })
    },

    handleSubmit() {
      this.$refs.formRef.validate(valid => {
        if (!valid) return

        debounceSubmit(() => {
          this.loading = true
          return saveDocument(this.form)
              .then(() => this.$message.success("保存成功"))
              .catch(() => this.$message.error("保存失败"))
              .finally(() => {
                this.handleOpen();
                this.loading = false
              })
        }).catch(err => {
          if (typeof err === "string") this.$message.warning(err)
        })
      })
    },

    handleClose() {
      this.$router.go(-1);
    },
    resetInfo(){
      this.form = {
        id: "",
        title: "",
        category_code: "",
        title_sort: 0,
        title_show: '1',
        content: "",
        create_time: "",
      }
    },
  }
}
</script>

<style scoped>
.page-container {
  width: 80%;
  margin: 0 auto;
  padding-top: 20px;
}

.form-box {
  width: 100%;
}

/* 按钮居中 */
.button-center {
  text-align: center;
}
</style>
