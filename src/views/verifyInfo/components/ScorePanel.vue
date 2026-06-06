<template>
  <div class="score-panel">
    <!-- 参考答案区域 -->
    <div class="reference-answer">
      <div class="section-header">
        <i class="el-icon-document"></i>
        <span>参考答案</span>
      </div>
      <div class="answer-content">
        <p v-for="(paragraph, index) in formattedAnswer" :key="index">{{ paragraph }}</p>
      </div>
    </div>

    <!-- 得分要点区域 -->
    <div class="key-points">
      <div class="section-header">
        <i class="el-icon-star-on"></i>
        <span>得分要点</span>
      </div>
      <ul class="points-list">
        <li v-for="(point, index) in question.keyPoints" :key="index">
          <i class="el-icon-check"></i>
          <span>{{ point }}</span>
        </li>
      </ul>
    </div>

    <!-- 追问方向 -->
    <div class="follow-up" v-if="question.followUpQuestions && question.followUpQuestions.length > 0">
      <div class="section-header">
        <i class="el-icon-question"></i>
        <span>可能追问</span>
      </div>
      <ul class="follow-up-list">
        <li v-for="(q, index) in question.followUpQuestions" :key="index">
          {{ q }}
        </li>
      </ul>
    </div>

    <!-- 自评打分区域 -->
    <div class="score-section">
      <div class="section-header">
        <i class="el-icon-edit-outline"></i>
        <span>自评打分</span>
      </div>
      <div class="score-content">
        <p class="score-hint">请对照参考答案和得分要点，为自己的回答打分：</p>
        <div class="score-slider">
          <el-slider
            v-model="score"
            :min="0"
            :max="100"
            :step="5"
            show-input
            :marks="scoreMarks"
            @change="handleScoreChange"
          ></el-slider>
        </div>
        <div class="score-level" :style="{ color: scoreLevel.color }">
          <i :class="scoreLevel.icon"></i>
          <span>{{ scoreLevel.level }} ({{ score }}分)</span>
        </div>
        <p class="score-suggestion">{{ scoreSuggestion }}</p>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div class="score-actions">
      <el-button @click="handleReset">重新作答</el-button>
      <el-button type="primary" @click="handleSubmit" :disabled="!score">
        {{ isLastQuestion ? '完成面试' : '下一题' }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { getScoreLevel, getAnswerSuggestion } from '../utils/interview';

export default {
  name: 'ScorePanel',
  props: {
    question: {
      type: Object,
      required: true
    },
    isLastQuestion: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      score: 75,
      scoreMarks: {
        0: '0',
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100'
      }
    };
  },
  computed: {
    formattedAnswer() {
      if (!this.question.referenceAnswer) return [];
      return this.question.referenceAnswer.split('\n').filter(p => p.trim());
    },
    scoreLevel() {
      return getScoreLevel(this.score);
    },
    scoreSuggestion() {
      return getAnswerSuggestion(this.question, this.score);
    }
  },
  methods: {
    handleScoreChange(val) {
      this.$emit('score-change', val);
    },
    handleReset() {
      this.$emit('reset');
    },
    handleSubmit() {
      this.$emit('submit', this.score);
    }
  }
};
</script>

<style scoped>
.score-panel {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.section-header i {
  color: #409eff;
}

.reference-answer {
  margin-bottom: 20px;
}

.answer-content {
  background: #f5f7fa;
  border-radius: 6px;
  padding: 16px;
}

.answer-content p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 12px 0;
}

.answer-content p:last-child {
  margin-bottom: 0;
}

.key-points {
  margin-bottom: 20px;
}

.points-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.points-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  padding: 8px 0;
  border-bottom: 1px dashed #ebeef5;
}

.points-list li:last-child {
  border-bottom: none;
}

.points-list li i {
  color: #67c23a;
  margin-top: 4px;
}

.follow-up {
  margin-bottom: 20px;
}

.follow-up-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.follow-up-list li {
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
  padding: 8px 0 8px 16px;
  position: relative;
}

.follow-up-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #409eff;
}

.score-section {
  margin-bottom: 20px;
}

.score-content {
  background: #ecf5ff;
  border-radius: 6px;
  padding: 16px;
}

.score-hint {
  font-size: 14px;
  color: #606266;
  margin: 0 0 16px 0;
}

.score-slider {
  padding: 0 10px;
  margin-bottom: 16px;
}

.score-slider :deep(.el-slider__input) {
  width: 80px;
}

.score-level {
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
}

.score-level i {
  margin-right: 8px;
}

.score-suggestion {
  font-size: 13px;
  color: #909399;
  text-align: center;
  margin: 0;
}

.score-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

@media screen and (max-width: 768px) {
  .score-panel {
    padding: 16px;
    padding-bottom: 24px;
  }

  .score-actions {
    flex-direction: column;
    padding-bottom: 20px;
  }

  .score-actions .el-button {
    width: 100%;
  }

  .score-slider :deep(.el-slider__input) {
    width: 60px;
  }
}

@media screen and (max-width: 480px) {
  .score-panel {
    padding: 12px;
    padding-bottom: 32px;
  }

  .score-actions {
    padding-bottom: 30px;
  }
}
</style>
