/**
 * 游戏全局配置
 * 修改此文件即可调整网格大小、速度、食物概率等参数
 */

/** 画布像素尺寸（与 index.html 中 canvas 属性保持一致） */
export const CANVAS_SIZE = 600;

/** 网格列 / 行数（格子为正方形） */
export const GRID_SIZE = 20;

/** 每格像素大小（自动计算） */
export const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;

/** 游戏帧率（毫秒/帧），数值越小蛇移动越快 */
export const TICK_INTERVAL = 120;

/** 蛇的初始长度 */
export const INITIAL_SNAKE_LENGTH = 3;

/** 蛇的初始位置（网格坐标） */
export const INITIAL_SNAKE_HEAD = { x: 10, y: 10 };

/** 蛇的初始移动方向 */
export const INITIAL_DIRECTION = { x: 1, y: 0 }; // 向右

/** 方向常量，便于比较 */
export const Direction = {
  UP:    { x: 0,  y: -1 },
  DOWN:  { x: 0,  y: 1  },
  LEFT:  { x: -1, y: 0  },
  RIGHT: { x: 1,  y: 0  },
};

/**
 * 食物类型定义
 * weight: 随机权重（越大概率越高）
 */
export const FOOD_TYPES = {
  normal: {
    id: 'normal',
    label: '普通',
    score: 10,
    weight: 60,
    color: '#4ade80',
    shape: 'circle',
  },
  advanced: {
    id: 'advanced',
    label: '高级',
    score: 30,
    weight: 30,
    color: '#60a5fa',
    shape: 'circle',
  },
  rare: {
    id: 'rare',
    label: '稀有',
    score: 50,
    weight: 10,
    color: '#f472b6',
    shape: 'diamond',
  },
};

/** localStorage 键名 */
export const STORAGE_KEY = 'snake_high_score';

/** 音效文件路径（相对于项目根目录） */
export const SOUND_PATHS = {
  eat: 'assets/sounds/eat.mp3',
  die: 'assets/sounds/die.mp3',
};
