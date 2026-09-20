import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  base: '/CircleChat-Docs/',
  title: 'CircleChat',
  description: '自托管的轻量多人聊天服务器 —— 使用与开发文档',
  lastUpdated: true,
  cleanUrls: false,

  themeConfig: {
    logo: '/logo.svg',
    nav: [
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
        ],
      },
      {
        text: '使用指南',
        items: [
          { text: '用户指南', link: '/guide/usage' },
          { text: '管理后台', link: '/guide/administration' },
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
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: { noResultsText: '未找到相关结果', resetButtonTitle: '清除查询', footer: { selectText: '选择', navigateText: '切换' } },
        },
      },
    },
    footer: {
      message: '基于 GPL-3.0 开源',
      copyright: 'Copyright © CircleChat Team',
    },
  },
})