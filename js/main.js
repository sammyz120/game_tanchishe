/**
 * 应用入口
 * 负责 UI 状态切换、事件绑定、与 Game 实例桥接
 */

import { Game, GameState, KEY_MAP } from './game.js';
import { getHighScore } from './storage.js';
import { audioManager } from './audio.js';

// ===== DOM 元素 =====
const canvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');

const startHighScore = document.getElementById('startHighScore');
const scoreDisplay = document.getElementById('scoreDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const foodCountDisplay = document.getElementById('foodCountDisplay');
const lengthDisplay = document.getElementById('lengthDisplay');

const finalScore = document.getElementById('finalScore');
const finalTime = document.getElementById('finalTime');
const finalFoodCount = document.getElementById('finalFoodCount');
const finalHighScore = document.getElementById('finalHighScore');
const newRecordMsg = document.getElementById('newRecordMsg');

// ===== 初始化 =====
const game = new Game(canvas, {
  onStatsUpdate: (stats) => {
    scoreDisplay.textContent = stats.score;
    timeDisplay.textContent = stats.timeFormatted;
    foodCountDisplay.textContent = stats.foodCount;
    lengthDisplay.textContent = stats.length;
  },
  onGameOver: (result) => {
    finalScore.textContent = result.score;
    finalTime.textContent = Game.formatTime(result.elapsedMs);
    finalFoodCount.textContent = result.foodCount;
    finalHighScore.textContent = result.highScore;

    if (result.isNewRecord) {
      newRecordMsg.classList.remove('hidden');
    } else {
      newRecordMsg.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
  },
});

/** 刷新开始界面上的历史最高分 */
function refreshStartHighScore() {
  startHighScore.textContent = getHighScore();
}

/** 开始游戏 */
function startGame() {
  audioManager.resume();
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  newRecordMsg.classList.add('hidden');
  game.start();
}

/** 显示开始界面 */
function showStartScreen() {
  game.stop();
  game.state = GameState.IDLE;
  gameOverScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
  refreshStartHighScore();
}

// ===== 事件绑定 =====
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

document.addEventListener('keydown', (e) => {
  // 方向 / WASD
  if (KEY_MAP[e.key]) {
    e.preventDefault();
    game.handleDirection(KEY_MAP[e.key]);
    return;
  }

  // 暂停
  if (e.key === 'p' || e.key === 'P') {
    if (game.state === GameState.PLAYING || game.state === GameState.PAUSED) {
      game.togglePause();
    }
    return;
  }

  // 重新开始（游戏结束或暂停时）
  if (e.key === ' ' || e.key === 'Enter') {
    if (game.state === GameState.OVER) {
      e.preventDefault();
      startGame();
    }
  }
});

// 初始化显示
refreshStartHighScore();
