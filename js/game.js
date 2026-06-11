/**
 * 游戏核心逻辑模块
 * 管理游戏状态、主循环、碰撞判定、计时与分数
 */

import {
  CANVAS_SIZE,
  GRID_SIZE,
  CELL_SIZE,
  TICK_INTERVAL,
  Direction,
} from './config.js';
import { Snake } from './snake.js';
import { FoodManager } from './food.js';
import { audioManager } from './audio.js';
import { updateHighScore } from './storage.js';

/** 游戏状态枚举 */
export const GameState = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  OVER: 'over',
};

export class Game {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} callbacks
   * @param {(stats: object) => void} callbacks.onStatsUpdate  实时数据更新
   * @param {(result: object) => void} callbacks.onGameOver     游戏结束
   */
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.callbacks = callbacks;

    this.snake = new Snake();
    this.food = new FoodManager();

    this.state = GameState.IDLE;
    this.score = 0;
    this.elapsedMs = 0;
    this._lastTick = 0;
    this._animFrameId = null;
    this._timerIntervalId = null;
  }

  /** 格式化毫秒为 mm:ss */
  static formatTime(ms) {
    const totalSec = Math.floor(ms / 1000);
    const min = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const sec = String(totalSec % 60).padStart(2, '0');
    return `${min}:${sec}`;
  }

  /** 开始新游戏 */
  start() {
    this.stop();
    this.snake.reset();
    this.food.reset();
    this.score = 0;
    this.elapsedMs = 0;
    this.state = GameState.PLAYING;

    this.food.spawn(this.snake.body);
    this._emitStats();
    this._lastTick = performance.now();

    // 主循环（移动 + 渲染）
    const loop = (now) => {
      if (this.state !== GameState.PLAYING) return;
      if (now - this._lastTick >= TICK_INTERVAL) {
        this._tick();
        this._lastTick = now;
      }
      this._render();
      this._animFrameId = requestAnimationFrame(loop);
    };
    this._animFrameId = requestAnimationFrame(loop);

    // 计时器（独立于帧率，精确到秒）
    this._timerIntervalId = setInterval(() => {
      if (this.state === GameState.PLAYING) {
        this.elapsedMs += 1000;
        this._emitStats();
      }
    }, 1000);
  }

  /** 暂停 / 继续 */
  togglePause() {
    if (this.state === GameState.PLAYING) {
      this.state = GameState.PAUSED;
      clearInterval(this._timerIntervalId);
    } else if (this.state === GameState.PAUSED) {
      this.state = GameState.PLAYING;
      this._lastTick = performance.now();
      this._timerIntervalId = setInterval(() => {
        if (this.state === GameState.PLAYING) {
          this.elapsedMs += 1000;
          this._emitStats();
        }
      }, 1000);
      const loop = (now) => {
        if (this.state !== GameState.PLAYING) return;
        if (now - this._lastTick >= TICK_INTERVAL) {
          this._tick();
          this._lastTick = now;
        }
        this._render();
        this._animFrameId = requestAnimationFrame(loop);
      };
      this._animFrameId = requestAnimationFrame(loop);
    }
  }

  /** 停止游戏循环 */
  stop() {
    if (this._animFrameId) {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = null;
    }
    if (this._timerIntervalId) {
      clearInterval(this._timerIntervalId);
      this._timerIntervalId = null;
    }
  }

  /**
   * 处理方向输入
   * @param {{ x: number, y: number }} dir
   */
  handleDirection(dir) {
    if (this.state === GameState.PLAYING || this.state === GameState.PAUSED) {
      this.snake.setDirection(dir);
    }
  }

  /** 每帧逻辑 tick */
  _tick() {
    this.snake.move();

    // 撞墙或撞自己
    if (this.snake.hitWall() || this.snake.hitSelf()) {
      this._gameOver();
      return;
    }

    // 检测吃食物
    const eatenType = this.food.checkEat(this.snake.getHead());
    if (eatenType) {
      this.score += eatenType.score;
      this.snake.grow();
      audioManager.play('eat');
      this.food.spawn(this.snake.body);
      this._emitStats();

      // 棋盘填满且蛇占满 → 通关式结束（可选扩展点）
      if (!this.food.current && this.snake.length >= GRID_SIZE * GRID_SIZE) {
        this._gameOver(true);
      }
    }
  }

  /**
   * 游戏结束
   * @param {boolean} [win=false]
   */
  _gameOver(win = false) {
    this.state = GameState.OVER;
    this.stop();
    audioManager.play('die');

    const { highScore, isNewRecord } = updateHighScore(this.score);

    this._render(); // 最后一帧

    this.callbacks.onGameOver?.({
      score: this.score,
      elapsedMs: this.elapsedMs,
      foodCount: this.food.totalEaten,
      highScore,
      isNewRecord,
      win,
    });
  }

  /** 推送实时数据到 UI */
  _emitStats() {
    this.callbacks.onStatsUpdate?.({
      score: this.score,
      elapsedMs: this.elapsedMs,
      foodCount: this.food.totalEaten,
      length: this.snake.length,
      timeFormatted: Game.formatTime(this.elapsedMs),
    });
  }

  /** 绘制一帧 */
  _render() {
    const { ctx } = this;

    // 背景
    ctx.fillStyle = '#0a0e14';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // 网格线（淡）
    ctx.strokeStyle = 'rgba(45, 58, 79, 0.35)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      const pos = i * CELL_SIZE;
      ctx.beginPath();
      ctx.moveTo(pos, 0);
      ctx.lineTo(pos, CANVAS_SIZE);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, pos);
      ctx.lineTo(CANVAS_SIZE, pos);
      ctx.stroke();
    }

    this.food.draw(ctx);
    this.snake.draw(ctx);

    // 暂停提示
    if (this.state === GameState.PAUSED) {
      ctx.fillStyle = 'rgba(10, 14, 20, 0.6)';
      ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.fillStyle = '#e8edf4';
      ctx.font = 'bold 28px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('已暂停', CANVAS_SIZE / 2, CANVAS_SIZE / 2);
      ctx.font = '14px system-ui';
      ctx.fillStyle = '#8b9cb3';
      ctx.fillText('按 P 继续', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 32);
    }
  }
}

/** 键盘映射表 */
export const KEY_MAP = {
  ArrowUp:    Direction.UP,
  ArrowDown:  Direction.DOWN,
  ArrowLeft:  Direction.LEFT,
  ArrowRight: Direction.RIGHT,
  w: Direction.UP,
  W: Direction.UP,
  s: Direction.DOWN,
  S: Direction.DOWN,
  a: Direction.LEFT,
  A: Direction.LEFT,
  d: Direction.RIGHT,
  D: Direction.RIGHT,
};
