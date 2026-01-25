# Rspress更换字体

假设要安装本地字体 `MapleMonoNormalNL-Regular.woff2` 和网络字体 `LXGW WenKai GB Screen` 。

`MapleMonoNormalNL-Regular.woff2` 用于代码字体

`LXGW WenKai GB Screen` 用于正文字体和代码中的中文字体

## 1. 创建模板

在项目的根目录（`rspress.config.ts` 所在目录）下创建 `theme` 目录，
并在 `theme` 目录下创建 `index.tsx` 文件和 `index.css` 文件，
稍后添加字体文件。

```text
theme
├── MapleMonoNormalNL-Regular.woff2
├── index.css
└── index.tsx
```

### index.tsx

```tsx
import './index.css';
export * from '@rspress/core/theme-original';
```

### index.css

`--rp-font-family-base` 定义了字体变量，`--rp-font-family-mono` 定义了代码字体变量。

先展示最终的样式，下文会详细介绍。

```css
/* 定义本地字体 */
@font-face {
  font-family: "MapleMonoNormalNL-Regular";
  src: url("./MapleMonoNormalNL-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

/* 应用字体变量 */
:root {
  --rp-font-family-base:
    "LXGW WenKai GB Screen", "Inter var experimental", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --rp-font-family-mono:
    "MapleMonoNormalNL-Regular", "JetBrains Mono", "LXGW WenKai GB Screen", Menlo, Monaco, Consolas, "Courier New", monospace;
}
```

## 2. 本地字体

在 [Maple Mono Releases](https://github.com/subframe7536/maple-font/releases) 下载 `woff2` 字体文件。

### 定义

把字体文件放入 `theme` 目录下，在 `index.css` 中定义字体变量：

```css
@font-face {
  font-family: "MapleMonoNormalNL-Regular";
  src: url("./MapleMonoNormalNL-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

`font-display: swap;` 是字体加载优化，可以查看 [font-display -CSS | MDN](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@font-face/font-display)

### 应用

在定义之后，在 `:root` 中 `--rp-font-family-base` 的开头添加该字体，以应用代码字体：

```css
:root {
    --rp-font-family-mono:
    "MapleMonoNormalNL-Regular", "JetBrains Mono", Menlo, Monaco, Consolas, "Courier New", monospace;
}
```

## 3. 网络字体

### link 标签引入字体

修改 `rspress.config.ts` :

```ts
import * as path from 'node:path';
import { defineConfig } from '@rspress/core';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'My Site',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  builderConfig: {
    html: {
      tags: [
        {
          tag: 'link',
          attrs: {
            rel: 'preconnect',
            href: 'https://cdn.jsdelivr.net',
          },
        },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-web/style.css',
            crossorigin: 'anonymous',
            referrerpolicy: 'no-referrer',
          },
        },
      ],
    },
  },
});
```

### 修改 index.css

引入 `https://cdn.jsdelivr.net/npm/lxgw-wenkai-screen-web/style.css` 之后可选四种字体：

- `LXGW WenKai Screen` ：全字符集，正文用
- `LXGW WenKai GB Screen` ：GB2312 常用字集，体积小，正文用
- `LXGW WenKai Mono Screen` ：全字符集，代码用
- `LXGW WenKai Mono GB Screen` ：GB2312 常用字集，代码用

这里我们使用 `LXGW WenKai GB Screen`

在 `:root` 中 `--rp-font-family-base` 的开头添加该字体，以应用正文字体；

在 `--rp-font-family-mono` 中紧随 `"JetBrains Mono"` 后添加该字体，以应用代码中的中文字体。

```css
:root {
  --rp-font-family-base:
    "LXGW WenKai GB Screen", "Inter var experimental", "Inter var", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  --rp-font-family-mono:
    "MapleMonoNormalNL-Regular", "JetBrains Mono", "LXGW WenKai GB Screen", Menlo, Monaco, Consolas, "Courier New", monospace;
}
```
