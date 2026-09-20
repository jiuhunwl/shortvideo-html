# 🎬 BK-SV v4.1 短视频去水印解析工具

[![GitHub Stars](https://img.shields.io/github/stars/jiuhunwl/shortvideo-html?style=social)](https://github.com/jiuhunwl/shortvideo-html)
[![License](https://img.shields.io/github/license/jiuhunwl/shortvideo-html)](https://github.com/jiuhunwl/shortvideo-html/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-4.1-blue)](https://github.com/jiuhunwl/shortvideo-html)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript)](https://www.typescriptlang.org/)

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

BK-SV v4.1 是一款简洁高效的在线短视频去水印解析工具，支持抖音、快手、B站、小红书等多个主流平台的一键无水印视频及图集解析。

> 💡 **项目亮点**：该项目已使用 **Vue 3 + TypeScript** 进行全面重构，采用现代化的前端技术栈，提供完整的类型安全、更好的性能和开发体验。

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
| 前端框架 | <img src="https://img.shields.io/badge/Vue.js-3.x-green?logo=vue.js"/> | 3.4+ | 渐进式 JavaScript 框架 |
| 开发语言 | <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript"/> | 5.9+ | 带类型系统的 JavaScript 超集 |
| 构建工具 | <img src="https://img.shields.io/badge/Vite-5.x-purple?logo=vite"/> | 5.x | 下一代前端构建工具 |
| 类型检查 | <img src="https://img.shields.io/badge/vue--tsc-3.x-3178c6"/> | 3.x | Vue SFC 类型检查器 |
| 状态管理 | <img src="https://img.shields.io/badge/Pinia-2.x-blue?logo=pinia"/> | 2.x | Vue 官方状态管理库 |
| 路由管理 | <img src="https://img.shields.io/badge/Vue_Router-4.x-orange?logo=vue.js"/> | 4.x | Vue 官方路由管理器 |
| 样式框架 | <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-cyan?logo=tailwind-css"/> | 3.x | 实用优先的 CSS 框架 |
| 图标库 | <img src="https://img.shields.io/badge/Font_Awesome-6.x-red?logo=font-awesome"/> | 6.x | 流行的图标库 |
| 压缩库 | <img src="https://img.shields.io/badge/JSZip-3.x-yellow"/> | 3.x | 用于打包下载资源 |

> 📘 **技术栈升级说明**：自 v4.0 起项目由 JavaScript 迁移至 TypeScript，核心逻辑（视频解析、下载调度、状态管理、类型契约）均已类型化，并新增 HLS 分片合并下载能力。

---

## 📁 项目结构

```
shortvideo-html/                              # 项目根目录
├── src/                                      # 源代码目录
│   ├── components/                           # Vue 组件（13个）
│   │   ├── HeaderNav.vue                     # 顶部导航栏
│   │   ├── HeroSection.vue                   # 主横幅区域
│   │   ├── PlatformTabs.vue                  # 平台选择标签
│   │   ├── PlatformGrid.vue                  # 支持平台展示
│   │   ├── ResultSection.vue                 # 解析结果展示
│   │   ├── VideoPlaylist.vue                 # 多集/合集选集列表
│   │   ├── TutorialSection.vue               # 使用教程
│   │   ├── FaqSection.vue                    # 常见问题
│   │   ├── FooterSection.vue                 # 页脚
│   │   ├── ToastContainer.vue                # Toast 提示容器
│   │   ├── ProgressModal.vue                 # 进度弹窗
│   │   ├── DownloadCard.vue                  # 下载卡片
│   │   └── ParticlesCanvas.vue               # 粒子背景动画
│   ├── composables/                          # 组合式函数（6个）
│   │   ├── useVideoParser.ts                 # 视频解析与数据归一化
│   │   ├── useMediaDownload.ts               # 下载调度（单文件/分片合并）
│   │   ├── useVideoSelection.ts              # 选集状态（多P/合集）
│   │   ├── useButtonControl.js               # 按钮控制（防抖、重试、超时）
│   │   ├── useI18n.js                        # 国际化支持
│   │   └── useRequestTimeout.js              # 请求超时处理
│   ├── stores/                               # Pinia 状态管理（1个）
│   │   └── video.ts                          # 视频解析状态
│   ├── services/                             # 服务层（3个）
│   │   ├── secureApiClient.ts                # 安全 API 客户端
│   │   ├── operationLogger.js                # 操作日志记录
│   │   └── retryManager.js                   # 请求重试管理
│   ├── utils/                                # 工具函数（5个）
│   │   ├── segmentDownload.ts                # HLS 分片解析与合并下载
│   │   ├── downloadFilename.ts               # 下载文件名生成
│   │   ├── videoFilename.ts                  # 视频文件名处理
│   │   ├── antiReplay.js                     # 防重放攻击
│   │   └── rateLimit.js                      # 请求频率限制
│   ├── types/                                # TypeScript 类型定义（3个）
│   │   ├── media.ts                          # 媒体数据契约（视频/合集）
│   │   ├── api.ts                            # API 请求响应类型
│   │   └── global.d.ts                       # 全局类型声明
│   ├── router/                               # 路由配置（1个）
│   │   └── index.js                          # 路由定义
│   ├── assets/                               # 静态资源
│   │   └── design-system.css                 # 设计系统样式
│   ├── App.vue                               # 根组件
│   ├── main.ts                               # 应用入口
│   └── style.css                             # 全局样式
├── dist/                                     # 构建产物（npm run build 生成）
├── index.html                                # HTML 模板
├── vite.config.js                            # Vite 配置
├── tsconfig.json                             # TypeScript 编译配置
├── tailwind.config.js                        # Tailwind CSS 配置
├── postcss.config.js                         # PostCSS 配置
├── .env.example                              # 环境变量模板
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
| TypeScript | 5.9+ | 由 devDependencies 自动安装 |

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

该命令会先执行 `vue-tsc --noEmit` 类型检查，通过后再由 Vite 打包，构建产物输出到 `dist/` 目录。

### 类型检查

```bash
npm run typecheck
```

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

`src/stores/video.ts` 管理全局状态：

| 状态 | 类型 | 说明 |
|------|------|------|
| `resultData` | `ParsedMedia \| null` | 解析结果数据 |
| `toasts` | `Toast[]` | Toast 提示列表 |
| `downloads` | `DownloadTask[]` | 下载任务列表 |
| `showProgress` | `boolean` | 进度弹窗状态 |

### 2. 组合式函数

**useVideoParser** (`src/composables/useVideoParser.ts`) - 解析与数据归一化：

| 功能 | 说明 |
|------|------|
| 🧩 多平台解析 | 按平台调用对应 API 并归一化响应 |
| 🎬 多集/合集识别 | 识别 B 站多 P 与 `ugc_season` 合集结构 |
| 🖼️ 图集/实况 | 支持图集与 LivePhoto 实况资源 |
| 🔗 懒解析 | B 站分集按需解析真实直链 |

**useMediaDownload** (`src/composables/useMediaDownload.ts`) - 下载调度：

| 功能 | 说明 |
|------|------|
| 📦 单文件下载 | 直接下载完整 mp4 |
| 🧵 HLS 分片合并 | 清单解析 → 顺序抓取 → 合并为单文件 |
| 🛡️ 完整性校验 | 比对 `Content-Length`，不完整自动兜底 |
| ⏸️ 取消/重试 | `AbortSignal` 取消；分片任务重试不退化为单文件 |

**useVideoSelection** (`src/composables/useVideoSelection.ts`) - 选集状态：

| 功能 | 说明 |
|------|------|
| 🎞️ 多 P 选集 | 管理分 P 选中索引 |
| 📚 合集切换 | 管理合集分区与合集内选集 |
| 📋 批量选择 | 多选集批量下载 |

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
| `segmentDownload` | HLS 清单解析、分片探测与合并下载 |
| `downloadFilename` | 下载文件名生成与净化 |
| `antiReplay` | 防重放攻击（时间戳验证、签名生成） |
| `rateLimit` | 频率限制（请求计数、限流策略） |

### 4. 类型契约

`src/types/` 定义跨模块的数据契约：

| 类型 | 说明 |
|------|------|
| `MediaVideo` | 单个视频/分集条目（含 `segments`、`_cid`、`_epNo` 等） |
| `MediaCollection` | 合集分区（标题 + 分集列表） |
| `ParsedMedia` | 归一化后的解析结果 |
| `PlatformKey` | 平台标识枚举 |

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

### TypeScript 配置 (`tsconfig.json`)

关键编译选项：

| 选项 | 值 | 说明 |
|------|-----|------|
| `target` | `ES2022` | 编译目标 |
| `moduleResolution` | `Bundler` | 适配 Vite 的模块解析 |
| `strict` | `true` | 开启严格模式 |
| `allowJs` | `true` | 允许混用既有 `.js` 模块 |
| `isolatedModules` | `true` | 保证单文件转译安全 |

### 环境变量 (`.env`)

复制 `.env.example` 为 `.env.local` 后按需修改：

```bash
VITE_API_BASE_URL=http://localhost:8080
```

> ⚠️ `.env.local` 属本地私有配置，已在 `.gitignore` 中排除，请勿提交。

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

1. 在 `src/composables/useVideoParser.ts` 的 `API` 表中添加接口映射
2. 在 `src/types/api.ts` 的 `PlatformKey` 中登记平台标识
3. 在组件中添加平台选项并更新国际化翻译

### 添加新语言

1. 在 `src/composables/useI18n.js` 中添加翻译对象
2. 更新 `HeaderNav.vue` 语言切换按钮

### 代码规范

| 规范 | 说明 |
|------|------|
| 框架 | 使用 Vue 3 Composition API + `<script setup lang="ts">` |
| 类型 | 核心逻辑必须标注类型，禁止无必要的 `any` |
| 类型检查 | 提交前执行 `npm run typecheck` 确保 exit 0 |
| 组件命名 | PascalCase（如 HeaderNav.vue） |
| 文件命名 | 组件 PascalCase，模块 kebab-case（如 use-media-download.ts） |

### 常用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 类型检查 + 生产构建 |
| `npm run typecheck` | 仅执行 `vue-tsc` 类型检查 |
| `npm run preview` | 本地预览构建产物 |

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