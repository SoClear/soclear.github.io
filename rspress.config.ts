import * as path from 'node:path';
import { defineConfig } from '@rspress/core';
import ghPages from 'rspress-plugin-gh-pages';
import katex from 'rspress-plugin-katex';
import mermaid from 'rspress-plugin-mermaid';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  plugins: [
    ghPages({
      repo: 'https://github.com/SoClear/soclear.github.io.git',
      branch: 'rspress',
    }),
    katex(),
    mermaid()
  ],
  title: 'My Site',
  icon: '/rspress-icon.png',
  logo: {
    light: '/rspress-light-logo.png',
    dark: '/rspress-dark-logo.png',
  },
  markdown: {
    shiki: {
      langs: [
        {
          name: 'smali', // 匹配 markdown 中的 ```smali
          scopeName: 'source.smali', // 随便起个作用域名称
          patterns: [], // 关键点：这里留空，表示没有任何高亮规则
          repository: {}, // 关键点：这里留空，表示没有任何高亮规则
        },
        {
          name: 'math', // 匹配 markdown 中的 ```math
          scopeName: 'source.math', // 随便起个作用域名称
          patterns: [], // 关键点：这里留空，表示没有任何高亮规则
          repository: {}, // 关键点：这里留空，表示没有任何高亮规则
        },
      ],
    },
  },
  builderConfig: {
    tools: {
      rspack: {
        resolve: {
          // 允许图片的相对路径
          // 也即直接使用 图片.png 也可生效，而不是强制 ./图片.png
          preferRelative: true,
        },
      },
    },
  },
  themeConfig: {
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/SoClear',
      },
    ],
  },
});
