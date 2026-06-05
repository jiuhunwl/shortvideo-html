# 🎬 BK-SV v3.0 短视频去水印解析工具

[![GitHub Stars](https://img.shields.io/github/stars/jiuhunwl/shortvideo-html?style=social)](https://github.com/jiuhunwl/shortvideo-html)
[![License](https://img.shields.io/github/license/jiuhunwl/shortvideo-html)](https://github.com/jiuhunwl/shortvideo-html/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-3.0-blue)](https://github.com/jiuhunwl/shortvideo-html)

[English](README_en.md) | [中文](#项目简介)

---

## 📋 目录

- [项目简介](#-项目简介)
- [技术栈](#-技术栈)
- [项目结构](#-项目结构)
- [快速开始](#-快速开始)
- [功能说明](#-功能说明)
- [核心模块](#-核心模块)
- [API 接口](#-api-接口)
- [组件架构](#-组件架构)
- [配置说明](#-配置说明)
- [浏览器兼容](#-浏览器兼容)
- [开发指南](#-开发指南)
- [部署说明](#-部署说明)
- [开源协议](#-开源协议)
- [联系方式](#-联系方式)

---

## 🌟 项目简介

BK-SV v3.0 是一款简洁高效的在线短视频去水印解析工具，支持抖音、快手、B站、小红书等多个主流平台的一键无水印视频及图集解析。

> 💡 **项目亮点**：该项目已使用 **Vue 3** 框架进行全面重构，采用现代化的前端技术栈，提供更好的性能和开发体验。

### ✨ 核心特点

| 特性 | 说明 |
|------|------|
| 🌐 多平台支持 | 抖音、快手、B站、小红书、微博、微视、皮皮虾等 |
| 🚀 无水印解析 | 一键提取无水印视频和图集 |
| 🔓 简单免费 | 无需注册，打开即可使用 |
| 🎨 界面美观 | 现代化 UI 设计，支持浅色/深色模式自动切换 |
| 🌍 多语言支持 | 中文、English |
| 📥 批量下载 | 支持打包下载多个图片和视频资源 |

### 🔗 在线体验

- 🖥️ 演示地址：[https://sv.bugpk.com](https://sv.bugpk.com)
- 🔌 API 服务：[https://api.bugpk.com](https://api.bugpk.com)

---

## 🛠️ 技术栈

| 分类 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 前端框架 | <img src="https://img.shields.io/badge/Vue.js-3.x-green?logo=vue.js"/> | 3.x | 渐进式 JavaScript 框架 |
| 构建工具 | <img src="https://img.shields.io/badge/Vite-6.x-purple?logo=vite"/> | 6.x | 下一代前端构建工具 |
| 状态管理 | <img src="https://img.shields.io/badge/Pinia-2.x-blue?logo=pinia"/> | 2.x | Vue 官方状态管理库 |
| 路由管理 | <img src="https://img.shields.io/badge/Vue_Router-4.x-orange?logo=vue.js"/> | 4.x | Vue 官方路由管理器 |
| 样式框架 | <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-cyan?logo=tailwind-css"/> | 3.x | 实用优先的 CSS 框架 |
| 图标库 | <img src="https://img.shields.io/badge/Font_Awesome-6.x-red?logo=font-awesome"/> | 6.x | 流行的图标库 |
| 压缩库 | <img src="https://img.shields.io/badge/JSZip-3.x-yellow"/> | 3.x | 用于打包下载资源 |

---

## 📁 项目结构

```
shortvideo-html/                              # 项目根目录
├── src/                                      # 源代码目录
│   ├── components/                           # Vue 组件（12个）
│   │   ├── HeaderNav.vue                     # 顶部导航栏
│   │   ├── HeroSection.vue                   # 主横幅区域
│   │   ├── PlatformTabs.vue                  # 平台选择标签
│   │   ├── PlatformGrid.vue                  # 支持平台展示
│   │   ├── ResultSection.vue                 # 解析结果展示
│   │   ├── TutorialSection.vue               # 使用教程
│   │   ├── FaqSection.vue                    # 常见问题
│   │   ├── FooterSection.vue                 # 页脚
│   │   ├── ToastContainer.vue                # Toast 提示容器
│   │   ├── ProgressModal.vue                 # 进度弹窗
│   │   ├── DownloadCard.vue                  # 下载卡片
│   │   └── ParticlesCanvas.vue               # 粒子背景动画
│   ├── composables/                          # 组合式函数（3个）
│   │   ├── useButtonControl.js               # 按钮控制（防抖、重试、超时）
│   │   ├── useI18n.js                        # 国际化支持
│   │   └── useRequestTimeout.js              # 请求超时处理
│   ├── stores/                               # Pinia 状态管理（1个）
│   │   └── video.js                          # 视频解析状态
│   ├── services/                             # 服务层（2个）
│   │   ├── operationLogger.js                # 操作日志记录
│   │   └── retryManager.js                   # 请求重试管理
│   ├── utils/                                # 工具函数（2个）
│   │   ├── antiReplay.js                     # 防重放攻击
│   │   └── rateLimit.js                      # 请求频率限制
│   ├── router/                               # 路由配置（1个）
│   │   └── index.js                          # 路由定义
│   ├── assets/                               # 静态资源
│   │   └── design-system.css                 # 设计系统样式
│   ├── App.vue                               # 根组件
│   ├── main.js                               # 应用入口
│   └── style.css                             # 全局样式
├── dist/                                     # 构建产物（npm run build 生成）
├── index.html                                # HTML 模板
├── vite.config.js                            # Vite 配置
├── tailwind.config.js                        # Tailwind CSS 配置
├── postcss.config.js                         # PostCSS 配置
├── LICENSE                                   # 开源协议
├── README.md                                 # 项目文档（中文）
└── README_en.md                              # 项目文档（英文）
```

---

## 🚀 快速开始

### 环境要求

| 依赖 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | >= 18.0.0 | JavaScript 运行环境 |
| npm | >= 9.0.0 | 包管理器 |

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后访问 **http://localhost:5173**

### 生产构建

```bash
npm run build
```

构建产物输出到 `dist/` 目录

### 预览构建结果

```bash
npm run preview
```

---

## 🎯 功能说明

### 1. 📹 视频解析

```
粘贴链接 → 自动识别平台 → 点击解析 → 获取无水印资源
```

- 支持粘贴短视频分享链接
- 自动识别平台（可选手动选择）
- 一键解析，快速获取无水印视频或图集

### 2. 🌐 支持平台

| 平台 | API 接口 | 支持内容 | 状态 |
|------|----------|----------|------|
| 📱 抖音 | `/api/douyin` | 视频、图集、音乐 | ✅ |
| 📸 快手 | `/api/ksjx` | 视频、图集 | ✅ |
| 📺 B站 | `/api/bilibili` | 视频 | ✅ |
| 🌸 小红书 | `/api/xhsjx` | 视频、图集、实况照片 | ✅ |
| 📰 今日头条 | `/api/toutiao` | 视频 | ✅ |
| 🔄 通用 | `/api/short_videos` | 自动识别 | ✅ |

### 3. 🎨 主题切换

- 🌞 **浅色模式**：清爽明亮，适合白天使用
- 🌙 **深色模式**：护眼舒适，适合夜间使用
- ⏰ **自动切换**：根据系统时间自动切换（6:00-18:00 浅色，其余深色）
- 👆 **手动切换**：点击导航栏右侧主题图标

### 4. 🌍 多语言支持

| 语言 | 代码 | 切换方式 |
|------|------|----------|
| 中文 | zh-CN | 点击导航栏语言按钮 |
| English | en | 点击导航栏语言按钮 |

### 5. 📥 下载功能

| 功能 | 说明 |
|------|------|
| 📦 单文件下载 | 直接下载单个视频或图片 |
| 📁 批量下载 | 打包为 ZIP 文件下载所有资源 |
| 📊 实时进度 | 显示下载进度和速度 |
| ⏸️ 暂停/取消 | 支持暂停和取消下载任务 |

---

## 🧩 核心模块

### 1. 状态管理 (Pinia)

`src/stores/video.js` 管理全局状态：

| 状态 | 类型 | 说明 |
|------|------|------|
| `resultData` | Object | 解析结果数据 |
| `toasts` | Array | Toast 提示列表 |
| `downloads` | Array | 下载任务列表 |
| `showProgress` | Boolean | 进度弹窗状态 |

### 2. 组合式函数

**useButtonControl** - 按钮控制组合式函数：

| 功能 | 说明 |
|------|------|
| ⚡ 节流控制 | 防止频繁点击 |
| 🔒 防重放保护 | 防止重复请求 |
| ⏱️ 请求超时 | 自动超时处理 |
| 🔄 自动重试 | 失败自动重试 |

### 3. 工具函数

| 函数 | 功能 |
|------|------|
| `antiReplay` | 防重放攻击（时间戳验证、签名生成） |
| `rateLimit` | 频率限制（请求计数、限流策略） |

---

## 🔌 API 接口

### 基础请求

```http
GET /api/short_videos?url={视频链接}
```

### 响应格式

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "title": "视频标题",
    "url": "无水印视频地址",
    "cover": "封面图片",
    "images": ["图片1", "图片2"],
    "music": {
      "name": "背景音乐名",
      "url": "音乐地址"
    },
    "live_photo": [
      { "image": "封面", "video": "视频" }
    ],
    "video_backup": [
      { "url": "备用视频地址", "label": "备用源" }
    ]
  }
}
```

---

## 🏗️ 组件架构

```
App.vue (根组件)
├── ParticlesCanvas (粒子背景动画)
├── ToastContainer (全局提示)
├── ProgressModal (进度弹窗)
├── DownloadCard (下载卡片)
├── HeaderNav (导航栏)
├── main (主内容区)
│   ├── HeroSection (主横幅)
│   ├── ResultSection (解析结果)
│   ├── PlatformGrid (平台展示)
│   ├── TutorialSection (教程)
│   └── FaqSection (常见问题)
└── FooterSection (页脚)
```

---

## ⚙️ 配置说明

### Vite 配置 (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'  // 路径别名
    }
  }
})
```

### Tailwind 配置 (`tailwind.config.js`)

支持深色模式和自定义主题色，具体配置请查看该文件。

---

## 🌐 浏览器兼容

| 浏览器 | 最低版本 | 状态 |
|--------|----------|------|
| Chrome | 80+ | ✅ 支持 |
| Firefox | 75+ | ✅ 支持 |
| Safari | 13+ | ✅ 支持 |
| Edge | 80+ | ✅ 支持 |

---

## 📝 开发指南

### 添加新平台

1. 在 `src/App.vue` 的 `PLATFORM_API_MAP` 中添加 API 映射
2. 在组件中添加平台选项
3. 更新国际化翻译

### 添加新语言

1. 在 `src/composables/useI18n.js` 中添加翻译对象
2. 更新 `HeaderNav.vue` 语言切换按钮

### 代码规范

| 规范 | 说明 |
|------|------|
| 框架 | 使用 Vue 3 Composition API |
| 检查 | 使用 ESLint 检查代码风格 |
| 组件命名 | PascalCase（如 HeaderNav.vue） |
| 文件命名 | kebab-case（如 use-button-control.js） |

---

## 🚀 部署说明

### 静态部署

将 `dist/` 目录部署到任意静态文件服务器：

| 平台 | 说明 |
|------|------|
| Nginx | 高性能 Web 服务器 |
| Apache | 流行的 Web 服务器 |
| Netlify | 云端静态托管 |
| Vercel | 云端静态托管 |
| GitHub Pages | GitHub 静态页面托管 |

### Nginx 配置示例

```nginx
server {
  listen 80;
  server_name your-domain.com;
  root /path/to/dist;
  index index.html;
  
  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

---

## 📄 开源协议

本项目采用 **MIT 开源协议**，欢迎 Star 和贡献！

```
MIT License

Copyright (c) 2024 BugPk & JH-Ahua

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 📞 联系方式

| 方式 | 信息 |
|------|------|
| 👤 作者 | BugPk & JH-Ahua |
| 📧 邮箱 | admin@bugpk.com |
| 🌐 博客 | https://www.jiuhunwl.cn |
| 🐙 GitHub | https://github.com/jiuhunwl/shortvideo-html |

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/chart?repos=jiuhunwl/shortvideo-html&type=date&legend=top-left)](https://www.star-history.com/?repos=jiuhunwl%2Fshortvideo-html&type=date&legend=top-left)

---

> 💝 如果这个项目对你有帮助，请给个 ⭐ Star 支持一下！