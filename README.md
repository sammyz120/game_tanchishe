# 贪吃蛇 (Snake Game)

一个使用 HTML5 Canvas + 原生 JavaScript 实现的 2D 贪吃蛇小游戏，模块化设计，便于扩展。

## 如何运行

本项目为纯前端项目，无需安装依赖。

### 方式一：直接打开（部分浏览器可能限制 ES Module）

```bash
# 在项目根目录启动本地服务器（推荐）
python3 -m http.server 8080
# 或
npx serve .
```

然后在浏览器访问 `http://localhost:8080`

### 方式二：VS Code Live Server

用 VS Code 的 Live Server 插件打开 `index.html` 即可。

## 操作说明

| 按键 | 功能 |
|------|------|
| ↑ ↓ ← → 或 W A S D | 控制蛇移动 |
| P | 暂停 / 继续 |
| Space / Enter | 游戏结束后重新开始 |

## 食物类型

| 类型 | 颜色 | 形状 | 分值 |
|------|------|------|------|
| 普通 | 绿色 | 圆形 | +10 |
| 高级 | 蓝色 | 圆形（高光） | +30 |
| 稀有 | 粉色 | 菱形 | +50 |

## 音效文件

将音效文件放到 `assets/sounds/` 目录：

```
assets/sounds/
├── eat.mp3   # 吃到食物
└── die.mp3   # 死亡
```

若未放置音效文件，游戏会使用 Web Audio API 自动生成的占位音效，不影响游玩。

如需更换格式或文件名，请修改 `js/config.js` 中的 `SOUND_PATHS`。

## 分数存储

历史最高分保存在浏览器 `localStorage`，键名为 `snake_high_score`。清除浏览器数据会重置记录。

## 项目结构

```
game_tanchishe/
├── index.html          # 页面结构（开始 / 游戏 / 结算界面）
├── css/
│   └── style.css       # 样式
├── js/
│   ├── main.js         # 入口：UI 事件、界面切换
│   ├── game.js         # 核心：游戏循环、状态机、碰撞
│   ├── snake.js        # 蛇：移动、反向防护、绘制
│   ├── food.js         # 食物：多类型随机生成、绘制
│   ├── audio.js        # 音效：文件加载 + 占位音效
│   ├── storage.js      # 持久化：localStorage 最高分
│   └── config.js       # 配置：网格、速度、食物权重等
└── assets/
    └── sounds/         # 音效资源目录
```

## 后续扩展建议

| 方向 | 建议改动位置 |
|------|-------------|
| **关卡系统** | `config.js` 增加关卡配置；`game.js` 按关卡切换速度、障碍物 |
| **障碍物** | 新建 `obstacle.js`；`game.js` 碰撞检测中加入障碍判断 |
| **排行榜** | 扩展 `storage.js` 存储 Top N 记录；新增排行榜 UI |
| **皮肤系统** | `snake.js` / `food.js` 的 `draw()` 方法支持主题配置 |
| **移动端触控** | `main.js` 添加 swipe 手势或虚拟方向键 |
| **多人对战** | 扩展 `snake.js` 支持多条蛇；`game.js` 管理多玩家输入 |
| **道具系统** | `food.js` 增加特殊道具类型（加速、减速、穿墙等） |

## License

See [LICENSE](LICENSE).
