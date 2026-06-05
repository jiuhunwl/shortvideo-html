# 🎬 BK-SV v3.0 Video Watermark Remover

[![GitHub Stars](https://img.shields.io/github/stars/jiuhunwl/shortvideo-html?style=social)](https://github.com/jiuhunwl/shortvideo-html)
[![License](https://img.shields.io/github/license/jiuhunwl/shortvideo-html)](https://github.com/jiuhunwl/shortvideo-html/blob/main/LICENSE)
[![Version](https://img.shields.io/badge/version-3.0-blue)](https://github.com/jiuhunwl/shortvideo-html)

[中文](README.md) | [English](#project-overview)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Features](#-features)
- [Core Modules](#-core-modules)
- [API Endpoints](#-api-endpoints)
- [Component Architecture](#-component-architecture)
- [Configuration](#-configuration)
- [Browser Compatibility](#-browser-compatibility)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [License](#-license)
- [Contact](#-contact)

---

## 🌟 Project Overview

BK-SV v3.0 is a simple and efficient online video watermark removal tool that supports one-click watermark-free video and album extraction from major platforms like Douyin, Kuaishou, Bilibili, Xiaohongshu, and more.

> 💡 **Highlight**: This project has been completely refactored with **Vue 3** framework, adopting modern frontend technology stack for better performance and development experience.

### ✨ Core Features

| Feature | Description |
|---------|-------------|
| 🌐 Multi-platform | Douyin, Kuaishou, Bilibili, Xiaohongshu, Weibo, Weishi, Pipix, etc. |
| 🚀 Watermark Removal | One-click extraction of videos and albums without watermarks |
| 🔓 Free & Simple | No registration required, use directly |
| 🎨 Modern UI | Modern design with automatic light/dark mode switching |
| 🌍 Multi-language | Chinese, English |
| 📥 Batch Download | Pack and download multiple images and video resources |

### 🔗 Live Demo

- 🖥️ Website: [https://sv.bugpk.com](https://sv.bugpk.com)
- 🔌 API Service: [https://api.bugpk.com](https://api.bugpk.com)

---

## 🛠️ Tech Stack

| Category | Technology | Version | Description |
|----------|------------|---------|-------------|
| Framework | <img src="https://img.shields.io/badge/Vue.js-3.x-green?logo=vue.js"/> | 3.x | Progressive JavaScript framework |
| Build Tool | <img src="https://img.shields.io/badge/Vite-6.x-purple?logo=vite"/> | 6.x | Next-generation frontend build tool |
| State Management | <img src="https://img.shields.io/badge/Pinia-2.x-blue?logo=pinia"/> | 2.x | Vue official state management |
| Router | <img src="https://img.shields.io/badge/Vue_Router-4.x-orange?logo=vue.js"/> | 4.x | Vue official routing manager |
| CSS Framework | <img src="https://img.shields.io/badge/Tailwind_CSS-3.x-cyan?logo=tailwind-css"/> | 3.x | Utility-first CSS framework |
| Icons | <img src="https://img.shields.io/badge/Font_Awesome-6.x-red?logo=font-awesome"/> | 6.x | Popular icon library |
| Compression | <img src="https://img.shields.io/badge/JSZip-3.x-yellow"/> | 3.x | For packaging download resources |

---

## 📁 Project Structure

```
shortvideo-html/                              # Project root
├── src/                                      # Source directory
│   ├── components/                           # Vue components (12)
│   │   ├── HeaderNav.vue                     # Top navigation bar
│   │   ├── HeroSection.vue                   # Hero banner section
│   │   ├── PlatformTabs.vue                  # Platform selection tabs
│   │   ├── PlatformGrid.vue                  # Supported platforms grid
│   │   ├── ResultSection.vue                 # Parsing result display
│   │   ├── TutorialSection.vue               # Usage tutorial
│   │   ├── FaqSection.vue                    # FAQ section
│   │   ├── FooterSection.vue                 # Footer
│   │   ├── ToastContainer.vue                # Toast notifications container
│   │   ├── ProgressModal.vue                 # Progress modal
│   │   ├── DownloadCard.vue                  # Download card
│   │   └── ParticlesCanvas.vue               # Particle background animation
│   ├── composables/                          # Composables (3)
│   │   ├── useButtonControl.js               # Button control (debounce, retry, timeout)
│   │   ├── useI18n.js                        # Internationalization support
│   │   └── useRequestTimeout.js              # Request timeout handling
│   ├── stores/                               # Pinia stores (1)
│   │   └── video.js                          # Video parsing state
│   ├── services/                             # Services (2)
│   │   ├── operationLogger.js                # Operation logger
│   │   └── retryManager.js                   # Request retry manager
│   ├── utils/                                # Utility functions (2)
│   │   ├── antiReplay.js                     # Anti-replay protection
│   │   └── rateLimit.js                      # Rate limiting
│   ├── router/                               # Router configuration (1)
│   │   └── index.js                          # Route definitions
│   ├── assets/                               # Static assets
│   │   └── design-system.css                 # Design system styles
│   ├── App.vue                               # Root component
│   ├── main.js                               # Application entry
│   └── style.css                             # Global styles
├── dist/                                     # Build output (generated by npm run build)
├── index.html                                # HTML template
├── vite.config.js                            # Vite configuration
├── tailwind.config.js                        # Tailwind CSS configuration
├── postcss.config.js                         # PostCSS configuration
├── LICENSE                                   # License
├── README.md                                 # Documentation (Chinese)
└── README_en.md                              # Documentation (English)
```

---

## 🚀 Quick Start

### Environment Requirements

| Dependency | Minimum Version | Description |
|------------|-----------------|-------------|
| Node.js | >= 18.0.0 | JavaScript runtime |
| npm | >= 9.0.0 | Package manager |

### Install Dependencies

```bash
npm install
```

### Development Mode

```bash
npm run dev
```

Visit **http://localhost:5173** after startup

### Production Build

```bash
npm run build
```

Build output in `dist/` directory

### Preview Build

```bash
npm run preview
```

---

## 🎯 Features

### 1. 📹 Video Parsing

```
Paste link → Auto-detect platform → Click parse → Get watermark-free resources
```

- Paste short video share link
- Auto-detect platform (manual selection optional)
- One-click parsing to get watermark-free videos or albums

### 2. 🌐 Supported Platforms

| Platform | API Endpoint | Supported Content | Status |
|----------|--------------|-------------------|--------|
| 📱 Douyin | `/api/douyin` | Video, Album, Music | ✅ |
| 📸 Kuaishou | `/api/ksjx` | Video, Album | ✅ |
| 📺 Bilibili | `/api/bilibili` | Video | ✅ |
| 🌸 Xiaohongshu | `/api/xhsjx` | Video, Album, Live Photos | ✅ |
| 📰 Toutiao | `/api/toutiao` | Video | ✅ |
| 🔄 Universal | `/api/short_videos` | Auto-detect | ✅ |

### 3. 🎨 Theme Toggle

- 🌞 **Light Mode**: Fresh and bright, suitable for daytime
- 🌙 **Dark Mode**: Eye-friendly, suitable for nighttime
- ⏰ **Auto Switch**: Based on system time (light: 6:00-18:00, dark: other times)
- 👆 **Manual Switch**: Click theme icon in navbar

### 4. 🌍 Multi-language Support

| Language | Code | Switch |
|----------|------|--------|
| Chinese | zh-CN | Click language button in navbar |
| English | en | Click language button in navbar |

### 5. 📥 Download Features

| Feature | Description |
|---------|-------------|
| 📦 Single File | Download single video or image |
| 📁 Batch Download | Pack all resources as ZIP file |
| 📊 Real-time Progress | Show download progress and speed |
| ⏸️ Pause/Cancel | Support pause and cancel download tasks |

---

## 🧩 Core Modules

### 1. State Management (Pinia)

`src/stores/video.js` manages global state:

| State | Type | Description |
|-------|------|-------------|
| `resultData` | Object | Parsing result data |
| `toasts` | Array | Toast notifications list |
| `downloads` | Array | Download tasks list |
| `showProgress` | Boolean | Progress modal state |

### 2. Composables

**useButtonControl** - Button control composable:

| Feature | Description |
|---------|-------------|
| ⚡ Throttle | Prevent frequent clicks |
| 🔒 Anti-replay | Prevent duplicate requests |
| ⏱️ Timeout | Auto timeout handling |
| 🔄 Retry | Auto retry on failure |

### 3. Utility Functions

| Function | Feature |
|----------|---------|
| `antiReplay` | Anti-replay protection (timestamp validation, signature generation) |
| `rateLimit` | Rate limiting (request counting, rate limiting strategy) |

---

## 🔌 API Endpoints

### Basic Request

```http
GET /api/short_videos?url={video_url}
```

### Response Format

```json
{
  "code": 200,
  "msg": "success",
  "data": {
    "title": "Video Title",
    "url": "Watermark-free video URL",
    "cover": "Cover image",
    "images": ["image1", "image2"],
    "music": {
      "name": "Background music name",
      "url": "Music URL"
    },
    "live_photo": [
      { "image": "Cover", "video": "Video" }
    ],
    "video_backup": [
      { "url": "Backup video URL", "label": "Backup source" }
    ]
  }
}
```

---

## 🏗️ Component Architecture

```
App.vue (Root)
├── ParticlesCanvas (Particle background)
├── ToastContainer (Global notifications)
├── ProgressModal (Progress modal)
├── DownloadCard (Download card)
├── HeaderNav (Navbar)
├── main (Main content)
│   ├── HeroSection (Hero banner)
│   ├── ResultSection (Parsing result)
│   ├── PlatformGrid (Platform showcase)
│   ├── TutorialSection (Tutorial)
│   └── FaqSection (FAQ)
└── FooterSection (Footer)
```

---

## ⚙️ Configuration

### Vite Configuration (`vite.config.js`)

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'  // Path alias
    }
  }
})
```

### Tailwind Configuration (`tailwind.config.js`)

Supports dark mode and custom theme colors. See file for details.

---

## 🌐 Browser Compatibility

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome | 80+ | ✅ Supported |
| Firefox | 75+ | ✅ Supported |
| Safari | 13+ | ✅ Supported |
| Edge | 80+ | ✅ Supported |

---

## 📝 Development Guide

### Adding a New Platform

1. Add API mapping in `PLATFORM_API_MAP` in `src/App.vue`
2. Add platform options in components
3. Update internationalization translations

### Adding a New Language

1. Add translation object in `src/composables/useI18n.js`
2. Update language toggle button in `HeaderNav.vue`

### Code Standards

| Standard | Description |
|----------|-------------|
| Framework | Use Vue 3 Composition API |
| Linting | Use ESLint for code style checking |
| Component Naming | PascalCase (e.g., HeaderNav.vue) |
| File Naming | kebab-case (e.g., use-button-control.js) |

---

## 🚀 Deployment

### Static Deployment

Deploy `dist/` directory to any static file server:

| Platform | Description |
|----------|-------------|
| Nginx | High-performance web server |
| Apache | Popular web server |
| Netlify | Cloud static hosting |
| Vercel | Cloud static hosting |
| GitHub Pages | GitHub static page hosting |

### Nginx Configuration Example

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

## 📄 License

This project is open source under the **MIT License**. Welcome to Star and contribute!

```
MIT License

Copyright (c) 2024 BugPk & JH-Ahua

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 📞 Contact

| Method | Information |
|--------|-------------|
| 👤 Author | BugPk & JH-Ahua |
| 📧 Email | admin@bugpk.com |
| 🌐 Blog | https://www.jiuhunwl.cn |
| 🐙 GitHub | https://github.com/jiuhunwl/shortvideo-html |

---

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/chart?repos=jiuhunwl/shortvideo-html&type=date&legend=top-left)](https://www.star-history.com/?repos=jiuhunwl%2Fshortvideo-html&type=date&legend=top-left)

---

> 💝 If this project helps you, please give it a ⭐ Star!