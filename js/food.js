/**
 * 食物系统模块
 * 负责食物生成、类型随机、碰撞检测、绘制
 */

import { GRID_SIZE, CELL_SIZE, FOOD_TYPES } from './config.js';

/** 按权重随机选取食物类型 */
function pickRandomType() {
  const types = Object.values(FOOD_TYPES);
  const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const type of types) {
    roll -= type.weight;
    if (roll <= 0) return type;
  }
  return types[0];
}

/** 生成不与蛇身重叠的随机格子坐标 */
function randomEmptyCell(snakeBody) {
  const occupied = new Set(snakeBody.map(seg => `${seg.x},${seg.y}`));
  const empty = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) {
        empty.push({ x, y });
      }
    }
  }

  if (empty.length === 0) return null;
  return empty[Math.floor(Math.random() * empty.length)];
}

export class FoodManager {
  constructor() {
    /** @type {{ x: number, y: number, type: object } | null} */
    this.current = null;
    this.totalEaten = 0;
  }

  reset() {
    this.current = null;
    this.totalEaten = 0;
  }

  /**
   * 在空位生成新食物
   * @param {Array<{x:number,y:number}>} snakeBody
   * @returns {boolean} 是否成功生成（棋盘满则 false）
   */
  spawn(snakeBody) {
    const pos = randomEmptyCell(snakeBody);
    if (!pos) {
      this.current = null;
      return false;
    }
    this.current = { ...pos, type: pickRandomType() };
    return true;
  }

  /**
   * 检测蛇头是否吃到食物
   * @param {{ x: number, y: number }} head
   * @returns {object|null} 被吃食物类型配置，未吃到返回 null
   */
  checkEat(head) {
    if (!this.current) return null;
    if (head.x === this.current.x && head.y === this.current.y) {
      const eatenType = this.current.type;
      this.totalEaten++;
      this.current = null;
      return eatenType;
    }
    return null;
  }

  /**
   * 绘制当前食物
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    if (!this.current) return;

    const { x, y, type } = this.current;
    const cx = x * CELL_SIZE + CELL_SIZE / 2;
    const cy = y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 2 - 4;

    ctx.save();

    if (type.shape === 'diamond') {
      // 稀有食物：菱形 + 光晕
      ctx.shadowColor = type.color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.moveTo(cx, cy - radius);
      ctx.lineTo(cx + radius, cy);
      ctx.lineTo(cx, cy + radius);
      ctx.lineTo(cx - radius, cy);
      ctx.closePath();
      ctx.fill();
    } else {
      // 普通 / 高级：圆形
      ctx.shadowColor = type.color;
      ctx.shadowBlur = type.id === 'advanced' ? 10 : 6;
      ctx.fillStyle = type.color;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // 高级食物内圈高光
      if (type.id === 'advanced') {
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath();
        ctx.arc(cx - 3, cy - 3, radius * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
