<template>
  <div class="question-card">
    <div class="question-header">
      <div class="question-meta">
        <el-tag :type="difficultyType" size="small">{{ question.difficulty }}</el-tag>
        <el-tag type="info" size="small">{{ question.category_name }}</el-tag>
        <el-tag size="small">{{ 'Q'+question.id }}</el-tag>
      </div>
      <div class="question-progress">
        <span class="progress-text">{{ currentIndex }} / {{ total }}</span>
      </div>
    </div>

    <div class="question-content">
      <p class="question-text">{{ question.question }}</p>
    </div>

    <div class="question-key-points" v-if="showHints">
      <div class="key-points-label">
        <i class="el-icon-star-on"></i>
        <span>得分要点</span>
      </div>
      <ul class="key-points-list">
        <li v-for="(point, index) in question.keyPoints" :key="index">
          {{ point }}
        </li>
      </ul>
    </div>

    <div class="question-actions">
      <el-button
        type="text"
        :icon="showHints ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"
        @click="toggleHints"
      >
        {{ showHints ? '隐藏提示' : '查看得分要点' }}
      </el-button>
      <span class="hint-warning" v-if="!showHints">
        <i class="el-icon-warning"></i>
        查看提示会影响自评参考
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionCard',
  props: {
    question: {
      type: Object,
      required: true
    },
    currentIndex: {
      type: Number,
      default: 1
    },
    total: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      showHints: false
    };
  },
  computed: {
    difficultyType() {
      const typeMap = {
        '基础': 'success',
        '进阶': 'warning',
        '深挖': 'danger'
      };
      return typeMap[this.question.difficulty] || 'info';
    }
  },
  methods: {
    toggleHints() {
      this.showHints = !this.showHints;
      this.$emit('hints-toggle', this.showHints);
    }
  },
  watch: {
    question() {
      this.showHints = false;
    }
  }
};
</script>

<style scoped>
.question-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-meta {
  display: flex;
  gap: 8px;
}

.progress-text {
  font-size: 14px;
  color: #909399;
}

.question-content {
  margin-bottom: 16px;
}

.question-text {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  line-height: 1.6;
  margin: 0;
}

.question-intent {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.intent-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
}

.intent-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0;
}

.question-key-points {
  background: #ecf5ff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
}

.key-points-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #e6a23c;
  margin-bottom: 8px;
}

.key-points-list {
  margin: 0;
  padding-left: 20px;
}

.key-points-list li {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}

.question-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hint-warning {
  font-size: 12px;
  color: #e6a23c;
}

.hint-warning i {
  margin-right: 4px;
}

@media screen and (max-width: 768px) {
  .question-card {
    padding: 16px;
  }

  .question-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .question-text {
    font-size: 16px;
  }

  .question-meta {
    flex-wrap: wrap;
  }

  .question-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media screen and (max-width: 480px) {
  .question-card {
    padding: 12px;
  }

  .question-text {
    font-size: 15px;
  }

  .intent-text {
    font-size: 13px;
  }
}
</style>
