# BK-SV v3.0 短视频去水印解析工具

[English](README_en.md) | [中文](#项目简介)

---

## 项目简介

BK-SV v3.0 是一款简洁高效的在线短视频去水印解析工具，支持抖音、快手、B站、小红书等多个主流平台的一键无水印视频及图集解析。

**特点：**
- 多平台支持：抖音、快手、B站、小红书、微博、微视、皮皮虾等
- 无水印解析：一键提取无水印视频和图集
- 简单免费：无需注册，打开即可使用
- 界面美观：现代化 UI 设计，支持浅色/深色模式
- 多语言支持：中文、English

### 在线体验

- 官方网站：https://www.jiuhunwl.cn
- API 服务：https://api.bugpk.com

### 技术栈

- **前端框架**：原生 JavaScript (Vanilla JS)
- **样式框架**：Tailwind CSS
- **图标库**：Font Awesome 6
- **特性**：响应式设计、粒子背景动画、主题切换、多语言支持

### 文件结构

```
html/
├── index.html          # 主页面
├── main.js            # 核心 JavaScript 逻辑
├── README.md          # 文档入口（中英切换）
├── README_zh.md      # 中文文档
└── README_en.md      # English documentation
```

### 快速开始

1. **克隆项目**
   ```bash
   git clone https://github.com/jiuhunwl/shortvideo-html.git
   ```

2. **本地运行**
   - 直接在浏览器中打开 `index.html`
   - 或使用任意本地服务器：
     ```bash
     # Python 3
     python -m http.server 8080

     # Node.js
     npx serve .
     ```

3. **访问页面**
   打开浏览器访问 `http://localhost:8080`

### 功能说明

#### 1. 视频解析
- 粘贴短视频分享链接到输入框
- 选择对应平台（可选）
- 点击「开始解析」按钮
- 解析成功后可下载无水印视频或图集

#### 2. 平台切换
支持以下平台：
- 抖音 / Douyin
- 快手 / Kuaishou
- B站 / Bilibili
- 小红书 / Xiaohongshu
- 微博 / Weibo
- 微视 / Weishi
- 皮皮虾 / Pipix
- 更多平台持续更新中...

#### 3. 主题切换
点击导航栏右侧主题图标可在浅色/深色模式间切换

#### 4. 多语言
支持中文和 English，点击导航栏语言切换按钮即可

### API 接口

项目使用后端 API 进行视频解析：

| 平台 | 接口地址 |
|------|----------|
| 所有平台 | `https://api.bugpk.com/api/short_videos` |
| 抖音 | `https://api.bugpk.com/api/douyin` |
| 快手 | `https://api.bugpk.com/api/ksjx` |
| B站 | `https://api.bugpk.com/api/bilibili` |
| 小红书 | `https://api.bugpk.com/api/xhsjx` |
| 今日头条 | `https://api.bugpk.com/api/toutiao` |

### 页面结构

```
index.html
├── Header (导航栏)
│   ├── Logo & 品牌
│   ├── 导航链接
│   ├── 主题切换
│   └── 语言切换
├── Hero Section (主横幅)
│   ├── 标题 & 描述
│   ├── 功能特性
│   └── 输入框 & 解析按钮
├── Result Section (结果展示)
├── Platform Grid (支持的平台)
├── Tutorial Section (使用教程)
├── FAQ Section (常见问题)
└── Footer (页脚)
```

### 主题定制

项目使用 CSS 变量定义主题颜色，修改 `index.html` 中的 `:root` 即可：

```css
:root {
    --color-primary: #6366f1;      /* 主色 */
    --color-secondary: #8b5cf6;     /* 副色 */
    --color-accent: #ec4899;       /* 强调色 */
    /* ... */
}
```

### 浏览器兼容

| 浏览器 | 最低版本 |
|--------|----------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

### 开发指南

#### 添加新平台

1. 在 `main.js` 的 `SUPPORTED_PLATFORMS` 数组中添加平台信息：
   ```javascript
   { name: '新平台', url: 'https://example.com', desc: '解析说明', gradient: 'from-blue-500 to-cyan-400', img: '图标URL' }
   ```

2. 在 `PLATFORM_API_MAP` 中添加 API 映射（如需要）

3. 更新 `PLATFORM_TABS` 添加平台切换按钮

#### 添加新语言

在 `main.js` 的 `LANG` 对象中添加翻译：

```javascript
var LANG = {
    'zh-CN': { /* 中文翻译 */ },
    'en': { /* 英文翻译 */ },
    '新语言代码': { /* 新语言翻译 */ }
};
```

### 开源协议

本项目采用 MIT 开源协议，欢迎 Star 和贡献！

### 联系方式

- 作者：BugPk & JH-Ahua
- 邮箱：admin@bugpk.com
- 博客：https://www.jiuhunwl.cn
- GitHub：https://github.com/jiuhunwl/shortvideo-html
