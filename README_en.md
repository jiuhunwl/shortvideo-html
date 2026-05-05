# BK-SV v3.0 Video Watermark Remover

[中文](README_zh.md) | [English](#project-overview)

---

### Project Overview

BK-SV v3.0 is a simple and efficient online video watermark removal tool that supports one-click watermark-free video and album extraction from major platforms like Douyin, Kuaishou, Bilibili, Xiaohongshu, and more.

**Features:**
- Multi-platform Support: Douyin, Kuaishou, Bilibili, Xiaohongshu, Weibo, Weishi, Pipix, and more
- Watermark Removal: One-click extraction of videos and albums without watermarks
- Simple & Free: No registration required, use directly
- Beautiful UI: Modern design with light/dark mode support
- Multi-language: Chinese, English

### Live Demo

- Website: https://www.jiuhunwl.cn
- API: https://api.bugpk.com

### Tech Stack

- **Frontend**: Vanilla JavaScript
- **CSS Framework**: Tailwind CSS
- **Icons**: Font Awesome 6
- **Features**: Responsive design, particle background animation, theme toggle, multi-language support

### File Structure

```
html/
├── index.html          # Main page
├── main.js            # Core JavaScript logic
├── README.md          # Documentation entry (Chinese/English switch)
└── README_en.md      # This file
```

### Quick Start

1. **Clone the project**
   ```bash
   git clone https://github.com/jiuhunwl/shortvideo-html.git
   ```

2. **Run locally**
   - Open `index.html` directly in a browser
   - Or use a local server:
     ```bash
     # Python 3
     python -m http.server 8080

     # Node.js
     npx serve .
     ```

3. **Access the page**
   Visit `http://localhost:8080` in your browser

### Features

#### 1. Video Parsing
- Paste the short video share link into the input box
- Select the corresponding platform (optional)
- Click the "Start Parsing" button
- After successful parsing, download watermark-free videos or albums

#### 2. Platform Switching
Supported platforms:
- Douyin
- Kuaishou
- Bilibili
- Xiaohongshu
- Weibo
- Weishi
- Pipix
- More platforms coming soon...

#### 3. Theme Toggle
Click the theme icon on the right side of the navbar to switch between light/dark mode

#### 4. Multi-language
Supports Chinese and English, click the language toggle button in the navbar

### API Endpoints

The project uses backend APIs for video parsing:

| Platform | API URL |
|----------|---------|
| All Platforms | `https://api.bugpk.com/api/short_videos` |
| Douyin | `https://api.bugpk.com/api/douyin` |
| Kuaishou | `https://api.bugpk.com/api/ksjx` |
| Bilibili | `https://api.bugpk.com/api/bilibili` |
| Xiaohongshu | `https://api.bugpk.com/api/xhsjx` |
| Toutiao | `https://api.bugpk.com/api/toutiao` |

### Page Structure

```
index.html
├── Header
│   ├── Logo & Brand
│   ├── Navigation Links
│   ├── Theme Toggle
│   └── Language Toggle
├── Hero Section
│   ├── Title & Description
│   ├── Feature Highlights
│   └── Input & Parse Button
├── Result Section
├── Platform Grid
├── Tutorial Section
├── FAQ Section
└── Footer
```

### Theme Customization

The project uses CSS variables for theming. Modify the `:root` in `index.html`:

```css
:root {
    --color-primary: #6366f1;      /* Primary */
    --color-secondary: #8b5cf6;     /* Secondary */
    --color-accent: #ec4899;       /* Accent */
    /* ... */
}
```

### Browser Compatibility

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 80+ |
| Firefox | 75+ |
| Safari | 13+ |
| Edge | 80+ |

### Development Guide

#### Adding a New Platform

1. Add platform info to `SUPPORTED_PLATFORMS` array in `main.js`:
   ```javascript
   { name: 'New Platform', url: 'https://example.com', desc: 'Description', gradient: 'from-blue-500 to-cyan-400', img: 'iconURL' }
   ```

2. Add API mapping in `PLATFORM_API_MAP` if needed

3. Update `PLATFORM_TABS` to add platform switch button

#### Adding a New Language

Add translations in the `LANG` object in `main.js`:

```javascript
var LANG = {
    'zh-CN': { /* Chinese translations */ },
    'en': { /* English translations */ },
    'new-lang-code': { /* New language translations */ }
};
```

### License

This project is open source under the MIT License. Welcome to Star and contribute!

### Contact

- Author: BugPk & JH-Ahua
- Email: admin@bugpk.com
- Blog: https://www.jiuhunwl.cn
- GitHub: https://github.com/jiuhunwl/shortvideo-html
