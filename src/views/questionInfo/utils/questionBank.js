/**
 * 题库管理工具模块（接口版）
 * 负责题库数据的加载、随机出题、弱项管理等
 */

import { getQuestionInfoList } from '@/api/questionInfo';
import { loadWeakQuestions, saveWeakQuestions, loadAnswerHistory } from './localStorage';

// 题库数据缓存
let questionsCache = null;

/**
 * 加载题库数据（从接口获取）
 * @returns {Promise<Array>} 题库数组
 */
export async function loadQuestionsAsync() {
  if (questionsCache) {
    return questionsCache;
  }
  const res = await getQuestionInfoList();
  if (res && res.code === '0000' && res.data) {
    questionsCache = res.data;
  } else {
    questionsCache = [];
  }
  return questionsCache;
}

/**
 * 同步获取已缓存的题库数据（需先调用过 loadQuestionsAsync）
 * @returns {Array} 题库数组
 */
export function loadQuestions() {
  return questionsCache || [];
}

/**
 * 获取所有分类
 * @returns {Array} 分类列表
 */
export function getCategories() {
  const questions = loadQuestions();
  const categoryMap = new Map();

  questions.forEach(q => {
    if (!categoryMap.has(q.category)) {
      categoryMap.set(q.category, {
        id: q.category,
        name: q.category_name,
        part: q.part,
        count: 0
      });
    }
    categoryMap.get(q.category).count++;
  });

  return Array.from(categoryMap.values());
}

/**
 * 获取所有部分
 * @returns {Array} 部分列表
 */
export function getParts() {
  const questions = loadQuestions();
  const partMap = new Map();

  questions.forEach(q => {
    if (!partMap.has(q.part)) {
      partMap.set(q.part, {
        name: q.part,
        categories: new Set()
      });
    }
    partMap.get(q.part).categories.add(q.category);
  });

  return Array.from(partMap.entries()).map(([name, data]) => ({
    name,
    categories: Array.from(data.categories)
  }));
}

/**
 * 按分类筛选题目
 * @param {Array} categories - 分类ID数组，为空则返回全部
 * @returns {Array} 筛选后的题目
 */
export function getQuestionsByCategory(categories = []) {
  const questions = loadQuestions();
  if (!categories || categories.length === 0) {
    return questions;
  }
  return questions.filter(q => categories.includes(q.category));
}

/**
 * 按顺序获取下一道题目
 * @param {Array} excludeIds - 需要排除的题目ID数组
 * @param {number} currentIndex - 当前题目索引
 * @returns {Object|null} 下一道题目
 */
export function getNextQuestionInOrder(excludeIds = [], currentIndex = 0) {
  const questions = loadQuestions();

  // 排除已答过的题目
  const availableQuestions = excludeIds.length > 0
    ? questions.filter(q => !excludeIds.includes(q.id))
    : questions;

  if (availableQuestions.length === 0) {
    return null;
  }

  // 按题目ID排序（Q1, Q2, Q3...）
  const sortedQuestions = [...availableQuestions].sort((a, b) => {
    const numA = parseInt(a.id.replace(/\D/g, ''));
    const numB = parseInt(b.id.replace(/\D/g, ''));
    return numA - numB;
  });

  // 返回第一道未答过的题目
  return sortedQuestions[0];
}

/**
 * 获取随机题目列表
 * @param {number} count - 需要获取的题目数量
 * @returns {Array} 随机题目列表
 */
export function getRandomQuestions(count = 10) {
  const questions = loadQuestions();

  // 打乱题目顺序
  const shuffled = [...questions].sort(() => Math.random() - 0.5);

  // 返回指定数量的题目
  return shuffled.slice(0, count);
}

/**
 * 添加题目到弱项列表
 * @param {string} questionId - 题目ID
 */
export function addToWeakList(questionId) {
  const weakList = loadWeakQuestions();
  if (!weakList.includes(questionId)) {
    weakList.push(questionId);
    saveWeakQuestions(weakList);
  }
}

/**
 * 从弱项列表移除题目
 * @param {string} questionId - 题目ID
 */
export function removeFromWeakList(questionId) {
  let weakList = loadWeakQuestions();
  weakList = weakList.filter(id => id !== questionId);
  saveWeakQuestions(weakList);
}

/**
 * 获取弱项题目详情
 * @returns {Array} 弱项题目数组
 */
export function getWeakQuestions() {
  const weakIds = loadWeakQuestions();
  const questions = loadQuestions();
  return questions.filter(q => weakIds.includes(q.id));
}

/**
 * 根据ID获取题目
 * @param {string} questionId - 题目ID
 * @returns {Object|null} 题目对象
 */
export function getQuestionById(questionId) {
  const questions = loadQuestions();
  return questions.find(q => q.id === questionId) || null;
}

/**
 * 获取题目统计信息
 * @returns {Object} 统计信息
 */
export function getQuestionStats() {
  const questions = loadQuestions();
  const history = loadAnswerHistory();
  const weakList = loadWeakQuestions();

  // 计算已答题目（去重）
  const answeredIds = new Set(history.map(r => r.questionId));

  // 计算平均分
  const scores = history.map(r => r.score);
  const averageScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  return {
    totalQuestions: questions.length,
    answeredCount: answeredIds.size,
    weakCount: weakList.length,
    averageScore: averageScore,
    totalAnswers: history.length
  };
}

/**
 * 检查题目是否已答过
 * @param {string} questionId - 题目ID
 * @returns {boolean}
 */
export function isQuestionAnswered(questionId) {
  const history = loadAnswerHistory();
  return history.some(r => r.questionId === questionId);
}

/**
 * 获取题目答题次数
 * @param {string} questionId - 题目ID
 * @returns {number}
 */
export function getQuestionAttemptCount(questionId) {
  const history = loadAnswerHistory();
  return history.filter(r => r.questionId === questionId).length;
}