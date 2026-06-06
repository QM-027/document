<template>
  <el-dialog
    title="答题结果"
    v-model="dialogVisible"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    center
  >
    <div class="result-content">
      <!-- 评分展示 -->
      <div class="score-display">
        <div class="score-circle" :style="{ borderColor: scoreLevel.color }">
          <span class="score-number" :style="{ color: scoreLevel.color }">{{ score }}</span>
          <span class="score-unit">分</span>
        </div>
        <div class="score-level" :style="{ color: scoreLevel.color }">
          <i :class="scoreLevel.icon"></i>
          <span>{{ scoreLevel.level }}</span>
        </div>
      </div>

      <!-- 评价信息 -->
      <div class="result-message">
        <p v-if="isWeak" class="weak-message">
          <i class="el-icon-warning"></i>
          该题已加入弱项题库，后续会优先练习
        </p>
        <p v-else class="pass-message">
          <i class="el-icon-success"></i>
          回答良好！已标记为已掌握
        </p>
      </div>

      <!-- 统计信息 -->
      <div class="result-stats" v-if="stats">
        <div class="stat-item">
          <span class="stat-label">已完成</span>
          <span class="stat-value">{{ stats.completedQuestions }} / {{ stats.totalQuestions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">平均分</span>
          <span class="stat-value">{{ stats.averageScore }} 分</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">弱项数</span>
          <span class="stat-value" :class="{ 'weak-count': stats.weakCount > 0 }">{{ stats.weakCount }} 题</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleReanswer">重新作答</el-button>
        <el-button type="primary" @click="handleNext">
          {{ isLastQuestion ? '完成面试' : '下一题' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script>
import { getScoreLevel } from '../utils/interview';

export default {
  name: 'ResultDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      default: 0
    },
    isWeak: {
      type: Boolean,
      default: false
    },
    isLastQuestion: {
      type: Boolean,
      default: false
    },
    stats: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible', 'reanswer', 'next'],
  computed: {
    dialogVisible: {
      get() {
        return this.visible;
      },
      set(val) {
        this.$emit('update:visible', val);
      }
    },
    scoreLevel() {
      return getScoreLevel(this.score);
    }
  },
  methods: {
    handleReanswer() {
      this.$emit('reanswer');
    },
    handleNext() {
      this.$emit('next');
    }
  }
};
</script>

<style scoped>
.result-content {
  text-align: center;
  padding: 20px 0;
}

.score-display {
  margin-bottom: 24px;
}

.score-circle {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid;
  margin-bottom: 12px;
}

.score-number {
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.score-unit {
  font-size: 14px;
  color: #909399;
  margin-top: 4px;
}

.score-level {
  font-size: 20px;
  font-weight: 600;
}

.score-level i {
  margin-right: 8px;
}

.result-message {
  margin-bottom: 24px;
}

.result-message p {
  font-size: 15px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.weak-message {
  color: #e6a23c;
}

.pass-message {
  color: #67c23a;
}

.result-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.weak-count {
  color: #e6a23c;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

@media screen and (max-width: 768px) {
  .score-circle {
    width: 100px;
    height: 100px;
  }

  .score-number {
    font-size: 36px;
  }

  .result-stats {
    flex-direction: column;
    gap: 12px;
  }

  .stat-item {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
