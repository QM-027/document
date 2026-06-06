/**
 * 面试逻辑工具模块
 * 负责面试流程控制、评分逻辑等
 */

import { getNextQuestionInOrder, addToWeakList, removeFromWeakList } from './questionBank';
import { saveAnswerRecord, loadAnswerHistory } from './localStorage';

/**
 * 创建面试会话
 * @param {Object} options - 配置选项
 * @param {number} options.totalQuestions - 题目数量
 * @returns {Object} 面试会话对象
 */
export function createInterviewSession(options = {}) {
  const {
    totalQuestions = 10
  } = options;

  return {
    id: generateSessionId(),
    totalQuestions: totalQuestions,
    completedQuestions: 0,
    currentQuestion: null,
    answeredQuestionIds: [],
    scores: [],
    startTime: new Date().toISOString(),
    endTime: null,
    status: 'active' // active, paused, completed
  };
}

/**
 * 生成会话ID
 * @returns {string} 会话ID
 */
function generateSessionId() {
  return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 获取下一题
 * @param {Object} session - 面试会话
 * @returns {Object|null} 下一题题目对象
 */
export function getNextQuestion(session) {
  if (session.completedQuestions >= session.totalQuestions) {
    return null;
  }

  const question = getNextQuestionInOrder(
    session.answeredQuestionIds,
    session.completedQuestions
  );

  return question;
}

/**
 * 提交答案并评分
 * @param {Object} params - 参数
 * @param {string} params.questionId - 题目ID
 * @param {string} params.userAnswer - 用户答案
 * @param {number} params.score - 用户自评分数
 * @param {Object} params.session - 面试会话
 * @returns {Object} 提交结果
 */
export function submitAnswer(params) {
  const { questionId, userAnswer, score, session } = params;

  // 保存答题记录
  const record = {
    questionId: questionId,
    userAnswer: userAnswer,
    score: score,
    answeredAt: new Date().toISOString(),
    sessionId: session.id
  };

  saveAnswerRecord(record);

  // 更新会话状态
  session.completedQuestions++;
  session.answeredQuestionIds.push(questionId);
  session.scores.push(score);

  // 处理弱项逻辑
  const WEAK_THRESHOLD = 70;
  if (score < WEAK_THRESHOLD) {
    addToWeakList(questionId);
  } else {
    // 如果分数达标，从弱项中移除
    removeFromWeakList(questionId);
  }

  // 检查面试是否结束
  if (session.completedQuestions >= session.totalQuestions) {
    session.status = 'completed';
    session.endTime = new Date().toISOString();
  }

  return {
    record: record,
    session: session,
    isWeak: score < WEAK_THRESHOLD,
    isCompleted: session.status === 'completed'
  };
}

/**
 * 计算面试统计
 * @param {Object} session - 面试会话
 * @returns {Object} 统计信息
 */
export function calculateInterviewStats(session) {
  const scores = session.scores;

  if (scores.length === 0) {
    return {
      totalQuestions: session.totalQuestions,
      completedQuestions: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      weakCount: 0,
      passCount: 0,
      passRate: 0,
      duration: 0
    };
  }

  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const highestScore = Math.max(...scores);
  const lowestScore = Math.min(...scores);
  const weakCount = scores.filter(s => s < 70).length;
  const passCount = scores.filter(s => s >= 70).length;
  const passRate = Math.round((passCount / scores.length) * 100);

  // 计算时长（分钟）
  const startTime = new Date(session.startTime);
  const endTime = session.endTime ? new Date(session.endTime) : new Date();
  const duration = Math.round((endTime - startTime) / 1000 / 60);

  return {
    totalQuestions: session.totalQuestions,
    completedQuestions: session.completedQuestions,
    averageScore: averageScore,
    highestScore: highestScore,
    lowestScore: lowestScore,
    weakCount: weakCount,
    passCount: passCount,
    passRate: passRate,
    duration: duration
  };
}

/**
 * 获取评分等级
 * @param {number} score - 分数
 * @returns {Object} 等级信息
 */
export function getScoreLevel(score) {
  if (score >= 90) {
    return { level: '优秀', color: '#67C23A', icon: 'el-icon-star-on' };
  } else if (score >= 80) {
    return { level: '良好', color: '#409EFF', icon: 'el-icon-star-on' };
  } else if (score >= 70) {
    return { level: '合格', color: '#E6A23C', icon: 'el-icon-star-half' };
  } else if (score >= 60) {
    return { level: '待提升', color: '#F56C6C', icon: 'el-icon-star-off' };
  } else {
    return { level: '不合格', color: '#909399', icon: 'el-icon-star-off' };
  }
}

/**
 * 获取答题建议
 * @param {Object} question - 题目对象
 * @param {number} score - 分数
 * @returns {string} 建议文本
 */
export function getAnswerSuggestion(question, score) {
  if (score >= 90) {
    return '回答非常出色！对知识点掌握扎实，能够结合实际项目经验进行阐述。';
  } else if (score >= 80) {
    return '回答良好！核心要点基本覆盖，可以尝试补充更多项目实践经验。';
  } else if (score >= 70) {
    return '回答合格！建议重点复习得分要点，加强项目场景的描述能力。';
  } else if (score >= 60) {
    return '需要加强！建议系统复习该知识点，并准备相关的项目案例。';
  } else {
    return '建议重点学习！该知识点需要系统性地学习和理解，建议查阅相关资料后重新练习。';
  }
}

/**
 * 获取历史最佳成绩
 * @param {string} questionId - 题目ID
 * @returns {Object} 最佳成绩信息
 */
export function getQuestionBestAttempt(questionId) {
  const history = loadAnswerHistory();
  const records = history.filter(r => r.questionId === questionId);

  if (records.length === 0) {
    return null;
  }

  // 按分数降序排序
  records.sort((a, b) => b.score - a.score);

  return {
    bestScore: records[0].score,
    attemptCount: records.length,
    lastAttempt: records[records.length - 1]
  };
}

/**
 * 检查是否需要重新练习
 * @param {string} questionId - 题目ID
 * @returns {boolean}
 */
export function needsRepractice(questionId) {
  const bestAttempt = getQuestionBestAttempt(questionId);
  if (!bestAttempt) return true;
  return bestAttempt.bestScore < 70;
}
