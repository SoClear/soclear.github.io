import { defineConfig, type DefaultTheme } from 'vitepress'

// VitePress 配置文件
// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'zh-Hans',
  title: "My Awesome Project",
  description: "A VitePress Site",
  // markdown文件的根目录
  srcDir: 'docs',
  vite: {
    build: {
      // 忽略打包大小超过阈值的警告
      chunkSizeWarningLimit: 3000
    }
  },
  markdown: {
    // 支持html
    html: true,
    // 显示行号
    lineNumbers: true,
    // npm add -D markdown-it-mathjax3 可以显示latex
    math: true,
    // 禁止将 `{{text}}` 中的 text 解析为JS表达式，见 https://github.com/vuejs/vitepress/discussions/480
    config(md) {
      const defaultCodeInline = md.renderer.rules.code_inline!
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
        tokens[idx].attrSet('v-pre', '')
        return defaultCodeInline(tokens, idx, options, env, self)
      }
    }
  },
  // 忽略死链（已失效的链接，也即没有对应文件的链接）
  ignoreDeadLinks: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Examples', link: '/markdown-examples' }
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ],
    footer: {
      message: '请勿转载',
      copyright: `版权所有 © 2019-${new Date().getFullYear()} SoClear`
    },
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    outline: {
      level: 'deep',
      label: '页面导航'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            displayDetails: '显示结果详情',
            resetButtonTitle: '清除查询条件',
            backButtonTitle: '返回',
            noResultsText: '没有找到',
            footer: {
              selectText: '选择',
              selectKeyAriaLabel: '选择',
              navigateText: '切换',
              navigateUpKeyAriaLabel: '上一个',
              navigateDownKeyAriaLabel: '下一个',
              closeText: '关闭',
              closeKeyAriaLabel: '关闭'
            }
          }
        }
      }
    }
  }
})
