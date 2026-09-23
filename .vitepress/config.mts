import { defineConfig } from 'vitepress'
const currentYear = new Date().getFullYear()

export default defineConfig({
  lang: 'zh-CN',
  base: '/CircleChat-Docs/',
  title: 'CircleChat',
  description: '自托管的轻量多人聊天服务器 —— 使用与开发文档',
  lastUpdated: true,
  cleanUrls: false,
  markdown: {
    container: {
      tipLabel: '提示',
      warningLabel: '警告',
      dangerLabel: '危险',
      infoLabel: '信息',
      detailsLabel: '详细信息'
    }
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: "首页", link: "/" },
      { text: '开始使用', link: '/getting-started/quickstart' },
      { text: 'API 参考', link: '/api/overview' },
      { text: '开发指南', link: '/development/architecture' },
    ],
    sidebar: [
      {
        text: '开始使用',
        items: [
          { text: '项目简介', link: '/README' },
          { text: '快速开始', link: '/getting-started/quickstart' },
          { text: '生产部署', link: '/getting-started/installation' },
          { text: '配置说明', link: '/getting-started/configuration' },
          { text: 'GitHub 登录与仓库卡片', link: '/getting-started/oauth' },
        ],
      },
      {
        text: '使用指南',
        items: [
          { text: '用户指南', link: '/guide/usage' },
          { text: '管理后台', link: '/guide/administration' },
          { text: '消息格式与富文本', link: '/guide/markdown' },
          { text: '安全模型与加固', link: '/guide/security' },
          { text: '客户端', link: '/guide/clients' },
          { text: '常见问题与排错', link: '/guide/faq' },
        ],
      },
      {
        text: 'API 参考',
        items: [
          { text: 'API 概览与鉴权', link: '/api/overview' },
          { text: '认证与登录', link: '/api/auth' },
          { text: '账号与资料', link: '/api/account' },
          { text: '好友与用户', link: '/api/friends' },
          { text: '群组', link: '/api/groups' },
          { text: '消息与上传', link: '/api/messages' },
          { text: '站内信箱', link: '/api/mailbox' },
          { text: '管理端 API', link: '/api/admin' },
          { text: 'WebSocket 协议', link: '/api/websocket' },
        ],
      },
      {
        text: '开发',
        items: [
          { text: '架构说明', link: '/development/architecture' },
          { text: '贡献指南', link: '/development/contribute' },
        ],
      },
    ],
    docFooter: { prev: '上一页', next: '下一页' },
    outline: { label: '本页目录', level: [2, 3] },
    lastUpdatedText: '最后更新',
    returnToTopLabel: '返回顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    editLink: {
      pattern: 'https://github.com/CircleChat-Team/CircleChat-Docs/edit/main/:path',
      text: '在 GitHub 上编辑此页'
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/CircleChat-Team/CircleChat-Docs' }
    ],
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                displayDetails: '显示详细列表',
                resetButtonTitle: '清除查询',
                backButtonTitle: '关闭搜索',
                noResultsText: '未找到相关结果',
                footer: {
                  selectText: '选择',
                  selectKeyAriaLabel: '输入',
                  navigateText: '切换',
                  navigateUpKeyAriaLabel: '上箭头',
                  navigateDownKeyAriaLabel: '下箭头',
                  closeText: '关闭',
                  closeKeyAriaLabel: 'Esc'
                }
              }
            }
          }
        }
      },
    },
    footer: {
      message: '基于 GPL-3.0 开源',
      copyright: `Copyright © ${currentYear} CircleChat Team`,
    },
  },
})
