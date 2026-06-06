<template>
  <div class="verify-panel">
    <!-- 开始界面 -->
    <div class="start-panel" v-if="!isStarted">
      <div class="start-card">
        <div class="start-header">
          <h2 class="start-title">问题回顾</h2>
        </div>

        <div class="start-body">
          <div class="setting-group">
            <span class="setting-label">选择题数</span>
            <div class="question-options">
              <div
                v-for="opt in questionOptions"
                :key="opt.value"
                class="option-card"
                :class="{ active: settings.totalQuestions === opt.value }"
                @click="settings.totalQuestions = opt.value"
              >
                <div class="option-value-container">
                  <span class="option-value">{{ opt.label }}</span>
                  <span class="option-unit" v-if="opt.label !== '全部'">题</span>
                </div>
              </div>
            </div>
          </div>

          <div class="setting-tip">
            <i class="el-icon-info"></i>
            <span>随机出题，检验知识掌握程度</span>
          </div>
        </div>

        <div class="start-footer">
          <el-button type="primary" size="large" @click="handleStart" class="start-btn">
            开始
            <i class="el-icon-arrow-right"></i>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 验证界面 -->
    <div class="verify-main" v-else>
      <!-- 顶部导航 -->
      <div class="top-bar">
        <div class="top-left">
          <span class="current-num">{{ currentIndex + 1 }}</span>
          <span class="total-num">/ {{ questionList.length }}</span>
        </div>
        <div class="top-center">
          <el-progress
            :percentage="progressPercent"
            :show-text="false"
            :stroke-width="6"
          ></el-progress>
        </div>
        <div class="top-right">
          <div class="stat-item timer">
            <i class="el-icon-time"></i>
            <span>{{ formatTime(elapsedTime) }}</span>
          </div>
          <el-button
            type="danger"
            @click="handleEnd"
            plain
            class="end-btn"
          >
            结束
          </el-button>
        </div>
      </div>

      <!-- 内容区域 - 可滚动 -->
      <div class="content-area">
        <!-- 题目卡片 -->
        <div class="question-card" v-if="currentQuestion">
          <div class="question-tags">
            <el-tag :type="difficultyType" size="small" effect="dark">
              {{ currentQuestion.difficulty }}
            </el-tag>
            <el-tag type="info" size="small" effect="plain">
              {{ currentQuestion.category_name }}
            </el-tag>
          </div>

          <div class="question-text">
            {{ currentQuestion.question }}
          </div>

          <div class="question-intent" @click="showIntent = !showIntent">
            <div class="intent-header">
              <i class="el-icon-view"></i>
              <span>考察意图</span>
              <i :class="showIntent ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
            </div>
            <div class="intent-content" v-if="showIntent">
              {{ currentQuestion.intent }}
            </div>
          </div>

          <!-- 查看答案按钮 (提交后隐藏) -->
          <div class="answer-hint-btn" @click="showAnswer = !showAnswer" v-if="!isVerified">
            <i :class="showAnswer ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
            <span>{{ showAnswer ? '收起参考' : '展开参考' }}</span>
          </div>
        </div>

        <!-- 参考答案卡片 (查看答案后显示，提交后隐藏) -->
        <div class="reference-card" v-if="showAnswer && currentQuestion && !isVerified">
          <div class="reference-section">
            <div class="section-title">
              <i class="el-icon-document"></i>
              <span>参考回答</span>
            </div>
            <div class="reference-content">
              <v-md-preview :text="currentQuestion.answer" />
            </div>
          </div>
        </div>

        <!-- 答案输入区 -->
        <div class="answer-card" v-if="!isVerified">
          <div class="answer-header">
            <span class="answer-label">你的回答</span>
            <span class="char-count" :class="{ warning: charCount > 1800 }">
              {{ charCount }} / 2000
            </span>
          </div>
          <el-input
            type="textarea"
            v-model="userAnswer"
            placeholder="请输入你的回答，尽可能包含关键知识点和项目经验..."
            :rows="6"
            :maxlength="2000"
            resize="none"
            ref="answerInput"
          ></el-input>
        </div>

        <!-- 评分面板 -->
        <div class="score-card" v-else>
          <!-- 用时显示 -->
          <div class="time-display">
            <i class="el-icon-time"></i>
            <span>回答用时：{{ formatTime(lastElapsedTime) }}</span>
          </div>

          <!-- 参考回答 -->
          <div class="reference-section">
            <div class="section-title">
              <i class="el-icon-document"></i>
              <span>参考回答</span>
            </div>
            <div class="reference-content">
              <v-md-preview :text="currentQuestion.answer" />
            </div>
          </div>

          <!-- 自评打分 -->
          <div class="rating-section">
            <div class="section-title">
              <i class="el-icon-edit-outline"></i>
              <span>自评打分</span>
            </div>
            <div class="rating-content">
              <div class="score-display" :style="{ color: isScored ? scoreLevel.color : '#909399' }">
                <span class="score-num">{{ isScored ? score : '--' }}</span>
                <span class="score-label">{{ isScored ? scoreLevel.level : '未打分' }}</span>
              </div>
              <div class="score-hint" v-if="!isScored">
                <i class="el-icon-info"></i>
                <span>请拖动滑块进行自评打分</span>
              </div>
              <el-slider
                v-model="currentScore"
                :min="0"
                :max="100"
                :step="10"
                :marks="scoreMarks"
                :show-tooltip="false"
                @change="handleScoreChange"
              ></el-slider>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作栏 - 固定 -->
      <div class="action-bar">
        <el-button
          @click="handlePrev"
          :disabled="currentIndex <= 0 || isVerified"
          plain
          class="nav-btn"
        >
          <i class="el-icon-arrow-left"></i>
          上一个
        </el-button>
        <el-button
          type="primary"
          @click="isVerified ? handleSubmit() : handleVerify()"
          :disabled="(!isVerified && !userAnswer.trim()) || (isVerified && !isScored)"
          class="submit-btn"
        >
          {{ isVerified ? (isLastQuestion ? '完成验证' : '下一题') : '提交' }}
        </el-button>
        <el-button
          @click="handleNextQuestion"
          :disabled="currentIndex >= questionList.length - 1 || isVerified"
          plain
          class="nav-btn"
        >
          下一个
          <i class="el-icon-arrow-right"></i>
        </el-button>
        <el-button
          @click="handleGrill"
          :disabled="isVerified"
          type="warning"
          plain
          class="grill-btn"
        >
          拷问
        </el-button>
      </div>
    </div>

    <!-- 结果弹窗 -->
    <el-dialog
      v-model="showResult"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      width="400px"
      center
      class="result-dialog"
    >
      <div class="result-content">
        <div class="result-score" :style="{ borderColor: scoreLevel.color }">
          <span class="result-num" :style="{ color: scoreLevel.color }">{{ currentScore }}</span>
          <span class="result-label">分</span>
        </div>
        <div class="result-level" :style="{ color: scoreLevel.color }">
          {{ scoreLevel.level }}
        </div>
        <div class="result-time">
          <i class="el-icon-time"></i>
          <span>用时：{{ formatTime(lastElapsedTime) }}</span>
        </div>
        <div class="result-message" :class="currentScore >= 70 ? 'pass' : 'weak'">
          <i :class="currentScore >= 70 ? 'el-icon-success' : 'el-icon-warning'"></i>
          <span>{{ currentScore >= 70 ? '已掌握，继续加油' : '已加入弱项，后续重点练习' }}</span>
        </div>
      </div>
      <template #footer>
        <el-button @click="handleReanswer">重新作答</el-button>
        <el-button type="primary" @click="handleNext">
          {{ isLastQuestion ? '完成' : '下一题' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 完成弹窗 -->
    <el-dialog
      v-model="showComplete"
      :show-close="false"
      :close-on-click-modal="false"
      width="400px"
      center
      class="complete-dialog"
    >
      <div class="complete-content">
        <div class="complete-icon">
          <i class="el-icon-data-analysis"></i>
        </div>
        <h3 class="complete-title">当前结果</h3>
        <div class="complete-stats">
          <div class="stat-row">
            <span class="stat-name">完成题数</span>
            <span class="stat-val">{{ stats.completedQuestions }} 题</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">平均分数</span>
            <span class="stat-val highlight">{{ stats.averageScore }} 分</span>
          </div>
          <div class="stat-row">
            <span class="stat-name">弱项题目</span>
            <span class="stat-val" :class="{ warning: stats.weakCount > 0 }">
              {{ stats.weakCount }} 题
            </span>
          </div>
          <div class="stat-row">
            <span class="stat-name">总共用时</span>
            <span class="stat-val">{{ formatTime(totalTime) }}</span>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="complete-footer">
          <el-button @click="handleRestart" plain>
            再来一次
          </el-button>
          <el-button type="primary" @click="handleContinue" class="continue-btn">
            继续
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { createInterviewSession, submitAnswer, calculateInterviewStats, getScoreLevel } from '../utils/interview';
import { getRandomQuestions, getQuestionsByCategory, loadQuestionsAsync } from '../utils/questionBank';

export default {
  name: 'InterviewPanel',
  data() {
    return {
      isStarted: false,
      settings: {
        totalQuestions: 10
      },
      totalQuestionCount: 0,
      session: null,
      questionList: [],
      currentIndex: 0,
      currentQuestion: null,
      userAnswer: '',
      currentScore: 0,
      isScored: false,
      isVerified: false,
      isCurrentWeak: false,
      showResult: false,
      showComplete: false,
      showIntent: false,
      showAnswer: false,
      // 计时相关
      startTime: 0,
      elapsedTime: 0,
      lastElapsedTime: 0,
      totalTime: 0,
      timerInterval: null,
      scoreMarks: {
        0: '0',
        50: '50',
        60: '60',
        70: '70',
        80: '80',
        90: '90',
        100: '100'
      }
    };
  },
  async created() {
    // 从接口加载题库数据
    const questions = await loadQuestionsAsync();
    this.totalQuestionCount = questions.length;
    // 默认选择第一个选项（10%）
    this.settings.totalQuestions = Math.floor(this.totalQuestionCount * 0.1);
  },
  computed: {
    questionOptions() {
      const total = this.totalQuestionCount;
      return [
        { value: Math.floor(total * 0.1), label: Math.floor(total * 0.1).toString() },
        { value: Math.floor(total * 0.2), label: Math.floor(total * 0.2).toString() },
        { value: Math.floor(total * 0.5), label: Math.floor(total * 0.5).toString() },
        { value: total, label: '全部' }
      ];
    },
    score() {
      return this.currentScore;
    },
    charCount() {
      return this.userAnswer ? this.userAnswer.length : 0;
    },
    isLastQuestion() {
      return this.currentIndex >= this.questionList.length - 1;
    },
    progressPercent() {
      if (this.questionList.length === 0) return 0;
      return Math.round(((this.currentIndex + 1) / this.questionList.length) * 100);
    },
    stats() {
      if (!this.session) {
        return { totalQuestions: 0, completedQuestions: 0, averageScore: 0, weakCount: 0, duration: 0 };
      }
      return calculateInterviewStats(this.session);
    },
    scoreLevel() {
      return getScoreLevel(this.score);
    },
    difficultyType() {
      const map = { '基础': 'success', '进阶': 'warning', '深挖': 'danger' };
      return map[this.currentQuestion?.difficulty] || 'info';
    }
  },
  methods: {
    handleStart() {
      this.session = createInterviewSession({
        totalQuestions: this.settings.totalQuestions
      });
      // 随机加载题目到列表
      this.questionList = getRandomQuestions(this.settings.totalQuestions);
      this.currentIndex = 0;
      this.currentQuestion = this.questionList[0];
      this.isStarted = true;
      this.isVerified = false;
      this.isScored = false;
      this.currentScore = 0;
      this.userAnswer = '';
      this.showIntent = false;
      this.showAnswer = false;
      // 开始计时
      this.startTimer();
    },
    startTimer() {
      this.startTime = Date.now();
      this.elapsedTime = 0;
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
      this.timerInterval = setInterval(() => {
        this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
      }, 1000);
    },
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.lastElapsedTime = this.elapsedTime;
    },
    formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    },
    handleVerify() {
      if (!this.userAnswer.trim()) {
        this.$message.warning('请输入答案');
        return;
      }
      this.stopTimer();
      // 累加当前题目用时到总用时
      this.totalTime += this.lastElapsedTime;
      this.isVerified = true;
      // 提交后自动展开考察意图
      this.showIntent = true;
    },
    handleReset() {
      this.isVerified = false;
      this.isScored = false;
      this.currentScore = 0;
      this.userAnswer = '';
      this.startTimer();
    },
    handlePrev() {
      if (this.currentIndex > 0) {
        this.currentIndex--;
        this.currentQuestion = this.questionList[this.currentIndex];
        this.isVerified = false;
        this.isScored = false;
        this.currentScore = 0;
        this.userAnswer = '';
        this.showIntent = false;
        this.showAnswer = false;
        this.startTimer();
      }
    },
    handleNextQuestion() {
      if (this.currentIndex < this.questionList.length - 1) {
        this.currentIndex++;
        this.currentQuestion = this.questionList[this.currentIndex];
        this.isVerified = false;
        this.isScored = false;
        this.currentScore = 0;
        this.userAnswer = '';
        this.showIntent = false;
        this.showAnswer = false;
        this.startTimer();
      }
    },
    handleScoreChange(val) {
      // 只有50分及以上才是有效打分
      if (val >= 50) {
        this.isScored = true;
      } else {
        this.isScored = false;
      }
    },
    handleSubmit() {
      const result = submitAnswer({
        questionId: this.currentQuestion.id,
        userAnswer: this.userAnswer,
        score: this.score,
        session: this.session
      });
      this.currentScore = this.score;
      this.isCurrentWeak = result.isWeak;
      this.showResult = true;
    },
    handleReanswer() {
      this.showResult = false;
      this.isVerified = false;
      this.isScored = false;
      this.currentScore = 0;
      this.userAnswer = '';
      this.showAnswer = false;
      this.startTimer();
    },
    handleNext() {
      this.showResult = false;
      if (this.session.status === 'completed') {
        this.showComplete = true;
        return;
      }
      // 自动跳到下一题
      if (this.currentIndex < this.questionList.length - 1) {
        this.currentIndex++;
        this.currentQuestion = this.questionList[this.currentIndex];
      }
      this.isVerified = false;
      this.isScored = false;
      this.currentScore = 0;
      this.userAnswer = '';
      this.showIntent = false;
      this.showAnswer = false;
      this.startTimer();
    },
    handleGrill() {
      // 查找相关题目（同分类）
      const currentCategory = this.currentQuestion.category;
      const currentId = this.currentQuestion.id;

      // 从题库中查找同分类的题目
      const allQuestions = getQuestionsByCategory();
      const relatedQuestion = allQuestions
        .filter(q => q.id !== currentId)
        .filter(q => q.category === currentCategory)
        .sort(() => Math.random() - 0.5)[0];

      if (relatedQuestion) {
        // 将相关题目插入到当前题目后面
        const insertIndex = this.currentIndex + 1;
        this.questionList.splice(insertIndex, 0, relatedQuestion);

        // 跳转到下一题（拷问题目）
        this.currentIndex = insertIndex;
        this.currentQuestion = this.questionList[this.currentIndex];
        this.isVerified = false;
        this.isScored = false;
        this.currentScore = 0;
        this.userAnswer = '';
        this.showIntent = false;
        this.showAnswer = false;
        this.startTimer();

        this.$message.success('已找到相关题目，开始拷问！');
      } else {
        this.$message.warning('未找到相关题目');
      }
    },
    handleEnd() {
      this.stopTimer();
      // 更新会话状态
      if (this.session) {
        this.session.status = 'completed';
        this.session.endTime = new Date().toISOString();
        this.session.completedQuestions = this.currentIndex + 1;
      }
      this.showComplete = true;
    },
    handleRestart() {
      this.showComplete = false;
      this.isStarted = false;
      this.session = null;
      this.questionList = [];
      this.currentIndex = 0;
      this.currentQuestion = null;
      this.isVerified = false;
      this.isScored = false;
      this.currentScore = 0;
      this.elapsedTime = 0;
      this.lastElapsedTime = 0;
      this.totalTime = 0;
    },
    handleContinue() {
      this.showComplete = false;
      this.startTimer();
    }
  }
};
</script>

<style scoped>
.verify-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
  min-height: 0;
}

/* 开始界面 */
.start-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.start-card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.start-header {
  text-align: center;
  padding: 40px 30px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}


.start-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
}

.start-subtitle {
  font-size: 14px;
  opacity: 0.8;
  margin: 0;
}

.start-body {
  padding: 30px;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 12px;
}

.question-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-card:hover {
  border-color: #c0c4cc;
}

.option-card.active {
  border-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
}

.option-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 8px;
  border: 2px solid #e4e7ed;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.option-value-container {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.option-value {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.option-card.active .option-value {
  color: #667eea;
}

.option-unit {
  font-size: 12px;
  color: #909399;
}

.setting-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 12px;
  border-radius: 8px;
}

.setting-tip i {
  color: #667eea;
}

.start-footer {
  padding: 0 30px 30px;
}

.start-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.start-btn:hover {
  opacity: 0.9;
}

/* 验证界面 */
.verify-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
  flex-shrink: 0;
}

.top-left {
  display: flex;
  align-items: baseline;
  min-width: 60px;
}

.current-num {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}

.total-num {
  font-size: 14px;
  color: #909399;
  margin-left: 4px;
}

.top-center {
  flex: 1;
}

.top-center /deep/ .el-progress-bar__outer {
  background: #e4e7ed;
}

.top-center /deep/ .el-progress-bar__inner {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.top-right {
  display: flex;
  gap: 12px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
  padding: 6px 10px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-item i {
  font-size: 14px;
}

.stat-item.highlight {
  color: #67c23a;
  background: #f0f9eb;
}

.stat-item.warning {
  color: #e6a23c;
  background: #fdf6ec;
}

/* 内容区域 */
.content-area {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.content-area::-webkit-scrollbar {
  width: 6px;
}

.content-area::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 3px;
}

/* 底部操作栏 */
.action-bar {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
  z-index: 10;
  flex-shrink: 0;
}

.nav-btn {
  flex: 1;
  height: 44px;
  font-size: 15px;
  border-radius: 10px;
}

.submit-btn {
  flex: 2;
  height: 44px;
  font-size: 15px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.grill-btn {
  flex: 1;
  height: 44px;
  font-size: 15px;
  border-radius: 10px;
}

.end-btn {
  height: 36px;
  font-size: 14px;
  border-radius: 8px;
}

.timer {
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* 用时显示 */
.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.08);
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #667eea;
  font-weight: 500;
}

.time-display i {
  font-size: 16px;
}

.score-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fdf6ec;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #e6a23c;
}

.score-hint i {
  font-size: 14px;
}

/* 完成弹窗底部 */
.complete-footer {
  display: flex;
  gap: 12px;
  width: 100%;
}

.complete-footer .el-button {
  flex: 1;
  height: 44px;
  font-size: 15px;
  border-radius: 10px;
}

.continue-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* 题目卡片 */
.question-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.question-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.question-text {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  line-height: 1.6;
  margin-bottom: 16px;
}

.question-intent {
  background: #f5f7fa;
  border-radius: 8px;
  overflow: hidden;
}

.intent-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: #606266;
  cursor: pointer;
}

.intent-header i:first-child {
  color: #667eea;
}

.intent-header i:last-child {
  margin-left: auto;
  color: #909399;
}

.intent-content {
  padding: 0 16px 12px;
  font-size: 14px;
  color: #909399;
  line-height: 1.6;
}

.answer-hint-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px;
  margin-top: 12px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.answer-hint-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
}

.answer-hint-btn i {
  font-size: 14px;
  color: #667eea;
}

.answer-hint-btn span {
  font-size: 13px;
  color: #667eea;
  font-weight: 500;
}

/* 答案输入卡片 */
.answer-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 参考答案卡片 */
.reference-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  border-left: 4px solid #667eea;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.answer-label {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}

.char-count {
  font-size: 13px;
  color: #909399;
}

.char-count.warning {
  color: #e6a23c;
}

.answer-card /deep/ .el-textarea__inner {
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
  padding: 12px;
  border-color: #e4e7ed;
}

.answer-card /deep/ .el-textarea__inner:focus {
  border-color: #667eea;
}

/* 评分卡片 */
.score-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
}

.section-title i {
  color: #667eea;
}

.reference-section {
  margin-bottom: 20px;
}

.reference-content {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
}

.reference-content p {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin: 0 0 12px;
}

.reference-content p:last-child {
  margin-bottom: 0;
}

.points-section {
  margin-bottom: 20px;
}

.points-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.point-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.point-num {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  background: #667eea;
  color: #fff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.point-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.rating-section {
  margin-bottom: 20px;
}

.rating-content {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
}

.score-display {
  text-align: center;
  margin-bottom: 16px;
}

.score-num {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 16px;
  font-weight: 600;
  margin-left: 8px;
}

.rating-content /deep/ .el-slider {
  padding: 0 10px;
}

.rating-content /deep/ .el-slider__runway {
  height: 8px;
  border-radius: 4px;
  background: #e4e7ed;
}

.rating-content /deep/ .el-slider__bar {
  height: 8px;
  border-radius: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.rating-content /deep/ .el-slider__button-wrapper {
  top: -16px;
}

.rating-content /deep/ .el-slider__button {
  width: 20px;
  height: 20px;
  border: 3px solid #667eea;
  background: #fff;
}

/* 结果弹窗 */
.result-dialog /deep/ .el-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.result-dialog /deep/ .el-dialog__header {
  display: none;
}

.result-dialog /deep/ .el-dialog__body {
  padding: 40px 30px 20px;
}

.result-content {
  text-align: center;
}

.result-score {
  width: 100px;
  height: 100px;
  margin: 0 auto 16px;
  border: 4px solid;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.result-num {
  font-size: 42px;
  font-weight: 700;
  line-height: 1;
}

.result-label {
  font-size: 14px;
  color: #909399;
}

.result-level {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
}

.result-time {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14px;
  color: #909399;
  margin-bottom: 16px;
}

.result-time i {
  font-size: 16px;
}

.result-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  padding: 12px;
  border-radius: 8px;
}

.result-message.weak {
  color: #e6a23c;
  background: #fdf6ec;
}

.result-message.pass {
  color: #67c23a;
  background: #f0f9eb;
}

.result-dialog /deep/ .el-dialog__footer {
  padding: 20px 30px 30px;
}

.result-dialog /deep/ .el-dialog__footer .el-button {
  flex: 1;
  height: 40px;
  border-radius: 10px;
}

.result-dialog /deep/ .el-dialog__footer .el-button--primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* 完成弹窗 */
.complete-dialog /deep/ .el-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.complete-dialog /deep/ .el-dialog__header {
  display: none;
}

.complete-dialog /deep/ .el-dialog__body {
  padding: 40px 30px 20px;
}

.complete-content {
  text-align: center;
}

.complete-icon {
  font-size: 64px;
  color: #67c23a;
  margin-bottom: 16px;
}

.complete-title {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
  margin: 0 0 24px;
}

.complete-stats {
  background: #f5f7fa;
  border-radius: 12px;
  padding: 20px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-name {
  font-size: 14px;
  color: #909399;
}

.stat-val {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stat-val.highlight {
  color: #667eea;
}

.stat-val.warning {
  color: #e6a23c;
}

.complete-dialog /deep/ .el-dialog__footer {
  padding: 20px 30px 30px;
}

.restart-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

/* ====== 弹窗响应式 ====== */
@media screen and (max-width: 430px) {
  .result-dialog /deep/ .el-dialog {
    width: 90% !important;
    margin: 0 auto;
  }

  .result-dialog /deep/ .el-dialog__body {
    padding: 30px 20px 16px;
  }

  .result-score {
    width: 80px;
    height: 80px;
    margin-bottom: 12px;
  }

  .result-num {
    font-size: 32px;
  }

  .result-level {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .result-message {
    font-size: 13px;
    padding: 10px;
  }

  .result-dialog /deep/ .el-dialog__footer {
    padding: 16px 20px 24px;
  }

  .complete-dialog /deep/ .el-dialog {
    width: 90% !important;
    margin: 0 auto;
  }

  .complete-dialog /deep/ .el-dialog__body {
    padding: 30px 20px 16px;
  }

  .complete-icon {
    font-size: 48px;
    margin-bottom: 12px;
  }

  .complete-title {
    font-size: 20px;
    margin-bottom: 18px;
  }

  .complete-stats {
    padding: 16px;
    border-radius: 10px;
  }

  .stat-row {
    padding: 8px 0;
  }

  .stat-name {
    font-size: 13px;
  }

  .stat-val {
    font-size: 15px;
  }

  .complete-dialog /deep/ .el-dialog__footer {
    padding: 16px 20px 24px;
  }

  .restart-btn {
    height: 44px;
    font-size: 15px;
  }
}

@media screen and (min-width: 700px) and (max-width: 800px) {
  .result-dialog /deep/ .el-dialog {
    width: 420px !important;
  }

  .result-dialog /deep/ .el-dialog__body {
    padding: 44px 32px 24px;
  }

  .result-score {
    width: 110px;
    height: 110px;
    margin-bottom: 18px;
  }

  .result-num {
    font-size: 46px;
  }

  .result-level {
    font-size: 22px;
    margin-bottom: 18px;
  }

  .result-message {
    font-size: 15px;
    padding: 14px;
    border-radius: 10px;
  }

  .result-dialog /deep/ .el-dialog__footer {
    padding: 24px 32px 32px;
  }

  .result-dialog /deep/ .el-dialog__footer .el-button {
    height: 44px;
    font-size: 15px;
  }

  .complete-dialog /deep/ .el-dialog {
    width: 420px !important;
  }

  .complete-dialog /deep/ .el-dialog__body {
    padding: 44px 32px 24px;
  }

  .complete-icon {
    font-size: 72px;
    margin-bottom: 18px;
  }

  .complete-title {
    font-size: 26px;
    margin-bottom: 28px;
  }

  .complete-stats {
    padding: 24px;
    border-radius: 14px;
  }

  .stat-row {
    padding: 12px 0;
  }

  .stat-name {
    font-size: 15px;
  }

  .stat-val {
    font-size: 17px;
  }

  .complete-dialog /deep/ .el-dialog__footer {
    padding: 24px 32px 32px;
  }

  .restart-btn {
    height: 52px;
    font-size: 17px;
    border-radius: 14px;
  }
}

/* ====== 华为 Mate 70 Pro 适配 (宽度约 360-390px) ====== */
@media screen and (min-width: 360px) and (max-width: 430px) {
  .start-panel {
    padding: 16px;
  }

  .start-card {
    border-radius: 16px;
  }

  .start-header {
    padding: 32px 24px 20px;
  }

  .start-title {
    font-size: 24px;
  }

  .start-subtitle {
    font-size: 13px;
  }

  .start-body {
    padding: 24px;
  }

  .setting-label {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .question-options {
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .option-card {
    padding: 14px 6px;
    border-radius: 10px;
  }

  .option-value {
    font-size: 22px;
  }

  .option-unit {
    font-size: 11px;
  }

  .setting-tip {
    padding: 10px 12px;
    font-size: 12px;
  }

  .start-footer {
    padding: 0 24px 24px;
  }

  .start-btn {
    height: 46px;
    font-size: 15px;
  }

  .top-bar {
    padding: 14px 16px;
    gap: 12px;
  }

  .current-num {
    font-size: 22px;
  }

  .total-num {
    font-size: 13px;
  }

  .stat-item {
    padding: 5px 8px;
    font-size: 12px;
  }

  .content-area {
    padding: 16px;
    gap: 14px;
  }

  .question-card {
    padding: 16px;
    border-radius: 10px;
  }

  .question-text {
    font-size: 15px;
    line-height: 1.55;
    margin-bottom: 14px;
  }

  .intent-header {
    padding: 10px 14px;
    font-size: 13px;
  }

  .intent-content {
    padding: 0 14px 10px;
    font-size: 13px;
  }

  .answer-hint-btn {
    padding: 8px;
    margin-top: 10px;
  }

  .answer-hint-btn span {
    font-size: 12px;
  }

  .reference-card {
    padding: 16px;
    border-radius: 10px;
  }

  .answer-card {
    padding: 16px;
    border-radius: 10px;
  }

  .answer-label {
    font-size: 14px;
  }

  .answer-card /deep/ .el-textarea__inner {
    font-size: 14px;
    padding: 10px;
    min-height: 140px;
  }

  .action-bar {
    padding: 12px 16px;
    gap: 10px;
  }

  .nav-btn {
    height: 42px;
    font-size: 14px;
  }

  .submit-btn {
    height: 42px;
    font-size: 14px;
  }

  .grill-btn {
    height: 42px;
    font-size: 14px;
  }

  .end-btn {
    height: 34px;
    font-size: 13px;
  }

  .time-display {
    padding: 10px 14px;
    font-size: 13px;
    margin-bottom: 14px;
  }

  .score-card {
    padding: 16px;
    border-radius: 10px;
  }

  .section-title {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .reference-content {
    padding: 14px;
  }

  .reference-content p {
    font-size: 13px;
    line-height: 1.7;
    margin-bottom: 10px;
  }

  .point-item {
    padding: 8px 10px;
  }

  .point-num {
    width: 20px;
    height: 20px;
    font-size: 11px;
  }

  .point-text {
    font-size: 13px;
  }

  .rating-content {
    padding: 16px;
  }

  .score-num {
    font-size: 42px;
  }

  .score-label {
    font-size: 15px;
  }
}

/* ====== iPad mini 7 适配 (宽度约 744px 竖屏) ====== */
@media screen and (min-width: 700px) and (max-width: 800px) {
  .start-panel {
    padding: 24px;
  }

  .start-card {
    max-width: 520px;
    border-radius: 20px;
  }

  .start-header {
    padding: 48px 36px 28px;
  }

  .start-title {
    font-size: 32px;
  }

  .start-subtitle {
    font-size: 15px;
  }

  .start-body {
    padding: 36px;
  }

  .setting-label {
    font-size: 15px;
    margin-bottom: 14px;
  }

  .question-options {
    grid-template-columns: repeat(4, 1fr);
    gap: 14px;
  }

  .option-card {
    padding: 20px 10px;
    border-radius: 14px;
  }

  .option-value {
    font-size: 28px;
  }

  .option-unit {
    font-size: 13px;
  }

  .setting-tip {
    padding: 14px 18px;
    font-size: 14px;
    border-radius: 10px;
  }

  .start-footer {
    padding: 0 36px 36px;
  }

  .start-btn {
    height: 52px;
    font-size: 17px;
    border-radius: 14px;
  }

  .top-bar {
    padding: 18px 24px;
    gap: 18px;
  }

  .current-num {
    font-size: 26px;
  }

  .total-num {
    font-size: 15px;
  }

  .top-center /deep/ .el-progress-bar__outer {
    height: 8px;
    border-radius: 4px;
  }

  .top-center /deep/ .el-progress-bar__inner {
    border-radius: 4px;
  }

  .stat-item {
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 10px;
  }

  .content-area {
    padding: 24px;
    gap: 18px;
  }

  .question-card {
    padding: 24px;
    border-radius: 14px;
  }

  .question-tags {
    margin-bottom: 18px;
  }

  .question-text {
    font-size: 18px;
    line-height: 1.65;
    margin-bottom: 18px;
  }

  .question-intent {
    border-radius: 10px;
  }

  .intent-header {
    padding: 14px 18px;
    font-size: 15px;
  }

  .intent-content {
    padding: 0 18px 14px;
    font-size: 14px;
  }

  .answer-hint-btn {
    padding: 12px;
    margin-top: 14px;
    border-radius: 10px;
  }

  .answer-hint-btn span {
    font-size: 14px;
  }

  .reference-card {
    padding: 24px;
    border-radius: 14px;
    border-left-width: 5px;
  }

  .answer-card {
    padding: 24px;
    border-radius: 14px;
  }

  .answer-header {
    margin-bottom: 14px;
  }

  .answer-label {
    font-size: 16px;
  }

  .char-count {
    font-size: 14px;
  }

  .answer-card /deep/ .el-textarea__inner {
    font-size: 15px;
    padding: 14px;
    border-radius: 10px;
    min-height: 180px;
  }

  .action-bar {
    padding: 18px 24px;
    gap: 14px;
  }

  .nav-btn {
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
  }

  .submit-btn {
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
  }

  .grill-btn {
    height: 48px;
    font-size: 16px;
    border-radius: 12px;
  }

  .end-btn {
    height: 38px;
    font-size: 15px;
  }

  .time-display {
    padding: 14px 18px;
    font-size: 15px;
    margin-bottom: 18px;
  }

  .score-card {
    padding: 24px;
    border-radius: 14px;
  }

  .section-title {
    font-size: 16px;
    margin-bottom: 14px;
  }

  .reference-content {
    padding: 18px;
    border-radius: 10px;
  }

  .reference-content p {
    font-size: 15px;
    line-height: 1.8;
    margin-bottom: 14px;
  }

  .points-section {
    margin-bottom: 24px;
  }

  .points-list {
    gap: 12px;
  }

  .point-item {
    padding: 12px 14px;
    border-radius: 10px;
  }

  .point-num {
    width: 24px;
    height: 24px;
    font-size: 12px;
  }

  .point-text {
    font-size: 15px;
    line-height: 1.6;
  }

  .rating-section {
    margin-bottom: 24px;
  }

  .rating-content {
    padding: 24px;
    border-radius: 10px;
  }

  .score-display {
    margin-bottom: 20px;
  }

  .score-num {
    font-size: 52px;
  }

  .score-label {
    font-size: 18px;
    margin-left: 10px;
  }

  .rating-content /deep/ .el-slider {
    padding: 0 12px;
  }

  .rating-content /deep/ .el-slider__runway {
    height: 10px;
    border-radius: 5px;
  }

  .rating-content /deep/ .el-slider__bar {
    height: 10px;
    border-radius: 5px;
  }

  .rating-content /deep/ .el-slider__button {
    width: 24px;
    height: 24px;
    border-width: 4px;
  }
}

/* ====== iPad mini 7 横屏适配 (高度约 744px) ====== */
@media screen and (min-width: 700px) and (max-width: 800px) and (orientation: landscape) {
  .start-header {
    padding: 32px 36px 20px;
  }

  .start-title {
    font-size: 28px;
  }

  .start-body {
    padding: 24px 36px;
  }

  .question-options {
    gap: 12px;
  }

  .option-card {
    padding: 14px 10px;
  }

  .option-value {
    font-size: 24px;
  }

  .start-footer {
    padding: 0 36px 24px;
  }

  .content-area {
    padding: 18px 24px;
  }

  .question-card {
    padding: 18px;
  }

  .question-text {
    font-size: 16px;
    margin-bottom: 14px;
  }

  .answer-card /deep/ .el-textarea__inner {
    min-height: 140px;
  }
}

/* ====== 通用移动端适配 ====== */
@media screen and (max-width: 359px) {
  .start-panel {
    padding: 12px;
  }

  .start-card {
    border-radius: 12px;
  }

  .start-header {
    padding: 24px 16px 16px;
  }

  .start-title {
    font-size: 22px;
  }

  .start-subtitle {
    font-size: 12px;
  }

  .start-body {
    padding: 16px;
  }

  .setting-label {
    font-size: 13px;
    margin-bottom: 10px;
  }

  .question-options {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  .option-card {
    padding: 12px 6px;
    border-radius: 8px;
  }

  .option-value {
    font-size: 20px;
  }

  .option-unit {
    font-size: 11px;
  }

  .setting-tip {
    padding: 8px 10px;
    font-size: 11px;
  }

  .start-footer {
    padding: 0 16px 16px;
  }

  .start-btn {
    height: 42px;
    font-size: 14px;
    border-radius: 10px;
  }

  .top-bar {
    padding: 10px 12px;
    gap: 8px;
  }

  .current-num {
    font-size: 20px;
  }

  .stat-item {
    padding: 4px 6px;
    font-size: 11px;
  }

  .content-area {
    padding: 12px;
    gap: 12px;
  }

  .question-card {
    padding: 14px;
    border-radius: 8px;
  }

  .question-text {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .answer-hint-btn {
    padding: 8px;
    margin-top: 10px;
  }

  .answer-hint-btn span {
    font-size: 12px;
  }

  .reference-card {
    padding: 14px;
    border-radius: 8px;
  }

  .answer-card {
    padding: 14px;
    border-radius: 8px;
  }

  .answer-card /deep/ .el-textarea__inner {
    font-size: 13px;
    min-height: 120px;
  }

  .action-bar {
    padding: 12px 16px;
    gap: 8px;
  }

  .nav-btn {
    height: 38px;
    font-size: 13px;
  }

  .submit-btn {
    height: 38px;
    font-size: 13px;
  }

  .grill-btn {
    height: 38px;
    font-size: 13px;
  }

  .end-btn {
    height: 32px;
    font-size: 12px;
  }

  .time-display {
    padding: 10px 12px;
    font-size: 12px;
    margin-bottom: 12px;
  }

  .score-card {
    padding: 14px;
    border-radius: 8px;
  }

  .section-title {
    font-size: 13px;
  }

  .reference-content {
    padding: 12px;
  }

  .reference-content p {
    font-size: 12px;
  }

  .point-text {
    font-size: 12px;
  }

  .score-num {
    font-size: 36px;
  }
}
</style>

<style>
@import '../../../assets/fonts/font.css';
@import '../../../assets/styles/md-preview.css';
</style>
