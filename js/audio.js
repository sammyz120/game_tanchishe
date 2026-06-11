/**
 * 音效管理模块
 *
 * 若 assets/sounds/ 目录下没有对应 mp3 文件，
 * 会自动降级为 Web Audio API 生成的占位音效。
 *
 * 替换为真实音效：将文件放到 assets/sounds/ 并命名为：
 *   - eat.mp3  （吃到食物）
 *   - die.mp3  （死亡）
 */

import { SOUND_PATHS } from './config.js';

class AudioManager {
  constructor() {
    /** @type {Record<string, HTMLAudioElement>} */
    this._clips = {};
    /** @type {AudioContext|null} */
    this._ctx = null;
    this._enabled = true;
    this._preload();
  }

  /** 预加载音效文件；加载失败则标记为占位模式 */
  _preload() {
    for (const [key, path] of Object.entries(SOUND_PATHS)) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = 0.5;
      audio.addEventListener('error', () => {
        this._clips[key] = null; // 标记为不可用，触发占位音效
      });
      this._clips[key] = audio;
    }
  }

  /** 获取或创建 AudioContext（需用户交互后才能播放） */
  _getContext() {
    if (!this._ctx) {
      this._ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this._ctx;
  }

  /**
   * 播放占位音效（简单方波/噪声）
   * @param {'eat'|'die'} type
   */
  _playFallback(type) {
    try {
      const ctx = this._getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'eat') {
        // 短促上升音
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.12);
      } else {
        // 下降悲鸣
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // 静默失败
    }
  }

  /**
   * 播放指定音效
   * @param {'eat'|'die'} name
   */
  play(name) {
    if (!this._enabled) return;

    const clip = this._clips[name];
    if (clip) {
      clip.currentTime = 0;
      clip.play().catch(() => this._playFallback(name));
    } else {
      this._playFallback(name);
    }
  }

  /** 在用户首次交互时恢复 AudioContext（浏览器自动播放策略） */
  resume() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }
}

export const audioManager = new AudioManager();
