/**
 * 分数持久化模块
 * 使用 localStorage 存储历史最高分
 */

import { STORAGE_KEY } from './config.js';

/**
 * 读取历史最高分
 * @returns {number}
 */
export function getHighScore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const score = parseInt(raw, 10);
    return Number.isFinite(score) && score >= 0 ? score : 0;
  } catch {
    // localStorage 不可用时返回 0
    return 0;
  }
}

/**
 * 尝试更新历史最高分
 * @param {number} score 本局最终分数
 * @returns {{ highScore: number, isNewRecord: boolean }}
 */
export function updateHighScore(score) {
  const current = getHighScore();
  if (score > current) {
    try {
      localStorage.setItem(STORAGE_KEY, String(score));
    } catch {
      // 写入失败时仍返回计算结果，不影响游戏流程
    }
    return { highScore: score, isNewRecord: true };
  }
  return { highScore: current, isNewRecord: false };
}
