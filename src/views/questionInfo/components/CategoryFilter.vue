<template>
  <div class="category-filter">
    <div class="filter-header">
      <span class="filter-title">题目分类</span>
      <el-button type="text" @click="toggleSelectAll">
        {{ isAllSelected ? '取消全选' : '全选' }}
      </el-button>
    </div>

    <div class="filter-content">
      <el-checkbox-group v-model="selectedCategories" @change="handleChange">
        <div class="category-group" v-for="part in parts" :key="part.name">
          <div class="group-title">{{ part.name }}</div>
          <div class="category-items">
            <el-checkbox
              v-for="cat in getPartCategories(part)"
              :key="cat.id"
              :label="cat.id"
            >
              {{ cat.name }}
              <span class="category-count">({{ cat.count }})</span>
            </el-checkbox>
          </div>
        </div>
      </el-checkbox-group>
    </div>
  </div>
</template>

<script>
import { getCategories, getParts } from '../utils/questionBank';

export default {
  name: 'CategoryFilter',
  props: {
    modelValue: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:modelValue'],
  data() {
    return {
      categories: [],
      parts: [],
      selectedCategories: this.modelValue
    };
  },
  computed: {
    isAllSelected() {
      return this.selectedCategories.length === this.categories.length;
    }
  },
  created() {
    this.initData();
  },
  watch: {
    modelValue(newVal) {
      this.selectedCategories = newVal;
    }
  },
  methods: {
    initData() {
      this.categories = getCategories();
      this.parts = getParts();

      // 默认全选
      if (this.selectedCategories.length === 0) {
        this.selectedCategories = this.categories.map(c => c.id);
        this.$emit('update:modelValue', this.selectedCategories);
      }
    },
    getPartCategories(part) {
      return this.categories.filter(c => part.categories.includes(c.id));
    },
    handleChange(val) {
      this.$emit('update:modelValue', val);
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedCategories = [];
      } else {
        this.selectedCategories = this.categories.map(c => c.id);
      }
      this.$emit('update:modelValue', this.selectedCategories);
    }
  }
};
</script>

<style scoped>
.category-filter {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.filter-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.category-group {
  margin-bottom: 16px;
}

.category-group:last-child {
  margin-bottom: 0;
}

.group-title {
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.category-items {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.category-items :deep(.el-checkbox) {
  margin-right: 0;
}

.category-count {
  font-size: 12px;
  color: #909399;
}

@media screen and (max-width: 768px) {
  .category-items {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
