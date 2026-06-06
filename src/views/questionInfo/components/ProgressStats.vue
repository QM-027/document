<template>
  <div class="progress-stats">
    <div class="stats-header">
      <span class="stats-title">本次面试统计</span>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">
          <i class="el-icon-document-checked"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ completedQuestions }}</span>
          <span class="stat-label">已完成</span>
        </div>
        <div class="stat-total">/ {{ totalQuestions }}</div>
      </div>

      <div class="stat-card">
        <div class="stat-icon average">
          <i class="el-icon-data-line"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ averageScore }}</span>
          <span class="stat-label">平均分</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon weak">
          <i class="el-icon-warning-outline"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ weakCount }}</span>
          <span class="stat-label">弱项</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon duration">
          <i class="el-icon-time"></i>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ duration }}</span>
          <span class="stat-label">用时(分)</span>
        </div>
      </div>
    </div>

    <!-- 进度条 -->
    <div class="progress-bar">
      <el-progress
        :percentage="progressPercent"
        :color="progressColor"
        :stroke-width="10"
      ></el-progress>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ProgressStats',
  props: {
    totalQuestions: {
      type: Number,
      default: 10
    },
    completedQuestions: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    },
    weakCount: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      default: 0
    }
  },
  computed: {
    progressPercent() {
      if (this.totalQuestions === 0) return 0;
      return Math.round((this.completedQuestions / this.totalQuestions) * 100);
    },
    progressColor() {
      if (this.progressPercent >= 80) return '#67C23A';
      if (this.progressPercent >= 50) return '#409EFF';
      return '#E6A23C';
    }
  }
};
</script>

<style scoped>
.progress-stats {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stats-header {
  margin-bottom: 16px;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f5f7fa;
  border-radius: 6px;
  padding: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecf5ff;
  color: #409eff;
  font-size: 20px;
}

.stat-icon.average {
  background: #f0f9eb;
  color: #67c23a;
}

.stat-icon.weak {
  background: #fdf6ec;
  color: #e6a23c;
}

.stat-icon.duration {
  background: #f4f4f5;
  color: #909399;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.stat-total {
  font-size: 14px;
  color: #c0c4cc;
  margin-left: auto;
}

.progress-bar {
  padding: 0 4px;
}

@media screen and (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media screen and (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
