/**
 * 本地存储工具模块
 * 用于管理面试答题记录和弱项题目
 */

const STORAGE_KEYS = {
  ANSWER_HISTORY: 'interview_answer_history',
  WEAK_QUESTIONS: 'interview_weak_questions',
  INTERVIEW_SESSION: 'interview_session'
};

/**
 * 保存答题记录
 * @param {Object} record - 答题记录
 * @param {string} record.questionId - 题目ID
 * @param {string} record.userAnswer - 用户答案
 * @param {number} record.score - 评分
 * @param {string} record.answeredAt - 答题时间
 */
export function saveAnswerRecord(record) {
  try {
    const history = loadAnswerHistory();
    history.push({
      ...record,
      answeredAt: record.answeredAt || new Date().toISOString()
    });
    localStorage.setItem(STORAGE_KEYS.ANSWER_HISTORY, JSON.stringify(history));
    return true;
  } catch (error) {
    console.error('保存答题记录失败:', error);
    return false;
  }
}

/**
 * 加载答题历史
 * @returns {Array} 答题记录数组
 */
export function loadAnswerHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEYS.ANSWER_HISTORY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('加载答题历史失败:', error);
    return [];
  }
}

/**
 * 保存弱项题目列表
 * @param {Array} weakList - 弱项题目ID数组
 */
export function saveWeakQuestions(weakList) {
  try {
    localStorage.setItem(STORAGE_KEYS.WEAK_QUESTIONS, JSON.stringify(weakList));
    return true;
  } catch (error) {
    console.error('保存弱项题目失败:', error);
    return false;
  }
}

/**
 * 加载弱项题目列表
 * @returns {Array} 弱项题目ID数组
 */
export function loadWeakQuestions() {
  try {
    const weakList = localStorage.getItem(STORAGE_KEYS.WEAK_QUESTIONS);
    return weakList ? JSON.parse(weakList) : [];
  } catch (error) {
    console.error('加载弱项题目失败:', error);
    return [];
  }
}

/**
 * 保存面试会话状态
 * @param {Object} session - 会话状态
 */
export function saveInterviewSession(session) {
  try {
    localStorage.setItem(STORAGE_KEYS.INTERVIEW_SESSION, JSON.stringify(session));
    return true;
  } catch (error) {
    console.error('保存面试会话失败:', error);
    return false;
  }
}

/**
 * 加载面试会话状态
 * @returns {Object|null} 会话状态
 */
export function loadInterviewSession() {
  try {
    const session = localStorage.getItem(STORAGE_KEYS.INTERVIEW_SESSION);
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('加载面试会话失败:', error);
    return null;
  }
}

/**
 * 清除所有历史记录
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ANSWER_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.WEAK_QUESTIONS);
    localStorage.removeItem(STORAGE_KEYS.INTERVIEW_SESSION);
    return true;
  } catch (error) {
    console.error('清除历史记录失败:', error);
    return false;
  }
}

/**
 * 获取某道题目的答题记录
 * @param {string} questionId - 题目ID
 * @returns {Array} 该题目的答题记录
 */
export function getQuestionHistory(questionId) {
  const history = loadAnswerHistory();
  return history.filter(record => record.questionId === questionId);
}

/**
 * 获取题目的最高分
 * @param {string} questionId - 题目ID
 * @returns {number} 最高分
 */
export function getQuestionBestScore(questionId) {
  const records = getQuestionHistory(questionId);
  if (records.length === 0) return 0;
  return Math.max(...records.map(r => r.score));
}
