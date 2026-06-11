/**
 * 蛇实体模块
 * 负责蛇身数据、移动、碰撞检测、绘制
 */

import {
  GRID_SIZE,
  CELL_SIZE,
  INITIAL_SNAKE_LENGTH,
  INITIAL_SNAKE_HEAD,
  INITIAL_DIRECTION,
} from './config.js';

export class Snake {
  constructor() {
    this.reset();
  }

  /** 重置蛇到初始状态 */
  reset() {
    this.body = [];
    // 从头部向左延伸 INITIAL_SNAKE_LENGTH 节
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      this.body.push({
        x: INITIAL_SNAKE_HEAD.x - i,
        y: INITIAL_SNAKE_HEAD.y,
      });
    }
    this.direction = { ...INITIAL_DIRECTION };
    /** 下一帧生效的方向（缓冲输入，防止反向） */
    this.nextDirection = { ...INITIAL_DIRECTION };
    this.growPending = 0;
  }

  /**
   * 设置移动方向
   * 禁止 180° 反向，避免蛇立即死亡
   * @param {{ x: number, y: number }} dir
   */
  setDirection(dir) {
    // 禁止与当前方向或已排队方向相反，防止 180° 转向立即死亡
    const isOpposite = (a, b) => a.x === -b.x && a.y === -b.y;
    if (isOpposite(dir, this.direction) || isOpposite(dir, this.nextDirection)) {
      return;
    }
    this.nextDirection = { ...dir };
  }

  /** 标记蛇身增长（吃到食物后调用） */
  grow(amount = 1) {
    this.growPending += amount;
  }

  /** 移动一步 */
  move() {
    this.direction = { ...this.nextDirection };
    const head = this.body[0];
    const newHead = {
      x: head.x + this.direction.x,
      y: head.y + this.direction.y,
    };
    this.body.unshift(newHead);

    if (this.growPending > 0) {
      this.growPending--;
    } else {
      this.body.pop();
    }
  }

  /** 获取蛇头坐标 */
  getHead() {
    return this.body[0];
  }

  /** 蛇身长度 */
  get length() {
    return this.body.length;
  }

  /**
   * 检测是否撞墙
   * @returns {boolean}
   */
  hitWall() {
    const { x, y } = this.getHead();
    return x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE;
  }

  /**
   * 检测是否撞到自己（不含头部本身）
   * @returns {boolean}
   */
  hitSelf() {
    const head = this.getHead();
    return this.body.slice(1).some(seg => seg.x === head.x && seg.y === head.y);
  }

  /**
   * 检测蛇头是否在某格子上
   * @param {{ x: number, y: number }} pos
   * @returns {boolean}
   */
  occupies(pos) {
    return this.body.some(seg => seg.x === pos.x && seg.y === pos.y);
  }

  /**
   * 在 Canvas 上绘制蛇
   * @param {CanvasRenderingContext2D} ctx
   */
  draw(ctx) {
    this.body.forEach((seg, index) => {
      const px = seg.x * CELL_SIZE;
      const py = seg.y * CELL_SIZE;
      const padding = 2;
      const size = CELL_SIZE - padding * 2;

      if (index === 0) {
        // 蛇头：更亮的绿色 + 眼睛
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.roundRect(px + padding, py + padding, size, size, 6);
        ctx.fill();

        // 眼睛方向指示
        ctx.fillStyle = '#0a0e14';
        const eyeSize = 3;
        const offset = 5;
        if (this.direction.x === 1) {
          ctx.fillRect(px + offset + 8, py + offset + 2, eyeSize, eyeSize);
          ctx.fillRect(px + offset + 8, py + offset + 10, eyeSize, eyeSize);
        } else if (this.direction.x === -1) {
          ctx.fillRect(px + offset + 2, py + offset + 2, eyeSize, eyeSize);
          ctx.fillRect(px + offset + 2, py + offset + 10, eyeSize, eyeSize);
        } else if (this.direction.y === -1) {
          ctx.fillRect(px + offset + 2, py + offset + 2, eyeSize, eyeSize);
          ctx.fillRect(px + offset + 10, py + offset + 2, eyeSize, eyeSize);
        } else {
          ctx.fillRect(px + offset + 2, py + offset + 10, eyeSize, eyeSize);
          ctx.fillRect(px + offset + 10, py + offset + 10, eyeSize, eyeSize);
        }
      } else {
        // 蛇身：渐变绿色
        const alpha = 1 - (index / this.body.length) * 0.5;
        ctx.fillStyle = `rgba(74, 222, 128, ${alpha})`;
        ctx.beginPath();
        ctx.roundRect(px + padding, py + padding, size, size, 4);
        ctx.fill();
      }
    });
  }
}
