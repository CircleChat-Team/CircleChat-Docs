<template>
  <div class="cc-home">
    <!-- 导航 -->
    <header class="cc-nav" :class="{ 'cc-nav-scrolled': isScrolled }">
      <div class="cc-nav-inner">
        <a href="/" class="cc-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="brandGrad" x1="0" y1="0" x2="24" y2="24">
                <stop stop-color="#ffcb6b"/>
                <stop offset="1" stop-color="#a8d94a"/>
              </linearGradient>
            </defs>
            <circle cx="12" cy="12" r="9.1" stroke="url(#brandGrad)" stroke-width="1.7"/>
            <circle cx="12" cy="12" r="3.1" fill="url(#brandGrad)"/>
          </svg>
          CircleChat
        </a>
        <nav class="cc-nav-links">
          <a href="/getting-started/quickstart">开始使用</a>
          <a href="/api/overview">API 参考</a>
          <a href="/development/architecture">开发指南</a>
          <a class="cc-nav-cta" href="/getting-started/quickstart">快速开始</a>
        </nav>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <section class="cc-hero">
        <div class="cc-hero-copy">
          <p style="color: #3964FE; display: flex; font-size: 20px;">由<img src="/deepseek.svg">构建</p>
          <br>
          <span class="cc-pill"><i></i>单进程部署 · Node.js + node:sqlite</span>
          <h1 class="cc-hero-title">Circle<span class="cc-grad">Chat</span></h1>
          <p class="cc-lede">
            自托管的轻量多人聊天服务器。<strong>单进程部署</strong>、
            <strong>群组与私聊</strong>、<strong>零第三方运行时依赖</strong>，
            界面支持中英2语，页面加载目标 1 秒内。
          </p>
          <div class="cc-actions">
            <a class="cc-btn cc-btn-primary" href="/getting-started/quickstart">
              快速开始
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12h13M12.5 6l6 6-6 6" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
            <a class="cc-btn cc-btn-ghost" href="/api/overview">API 参考</a>
          </div>
        </div>

        <!-- 聊天卡片 -->
        <div class="cc-chat-wrap">
          <div class="cc-float-badge cc-b1">🛡️ 治理体系完备</div>
          <div class="cc-float-badge cc-b2">🌍 zh / en</div>
          <div class="cc-chat-card">
            <div class="cc-chat-head">
              <div class="cc-chat-avatar">前</div>
              <div>
                <div class="cc-chat-titgong nle">前端小组</div>
                <div class="cc-chat-sub"><span class="cc-live"></span>3 人在线</div>
              </div>
              <div class="cc-chat-actions">•••</div>
            </div>
            <div class="cc-chat-body">
              <div class="cc-msg cc-left">
                <div class="cc-ava cc-a1">M</div>
                <div class="cc-bubble">新的 WebSocket 协议压测通过了 🎉</div>
              </div>
              <div class="cc-msg cc-right">
                <div class="cc-bubble cc-me">收到，Markdown 也接上了 <code>node:sqlite</code></div>
              </div>
              <div class="cc-msg cc-left">
                <div class="cc-ava cc-a2">日</div>
                <div class="cc-bubble">画像のアップロードも動いてるよ</div>
              </div>
              <div class="cc-typing"><span></span><span></span><span></span></div>
            </div>
            <div class="cc-chat-input">发条消息… <b>↑</b></div>
          </div>
        </div>
      </section>

      <!-- 数据条 -->
      <section class="cc-stats">
        <div class="cc-stats-inner">
          <div class="cc-stat"><div class="cc-stat-num">1</div><div class="cc-stat-label">单进程运行</div></div>
          <div class="cc-stat"><div class="cc-stat-num">0</div><div class="cc-stat-label">第三方运行时依赖</div></div>
          <div class="cc-stat"><div class="cc-stat-num">3</div><div class="cc-stat-label">界面语言 zh / en / ja</div></div>
          <div class="cc-stat"><div class="cc-stat-num">&lt;1s</div><div class="cc-stat-label">页面加载目标</div></div>
        </div>
      </section>

      <!-- 特性 -->
      <section class="cc-features">
        <div class="cc-section-head">
          <span class="cc-eyebrow">核心能力</span>
          <h2>开箱即用的完整聊天栈</h2>
          <p>从多人会话到站点治理，全部内置，无需拼装第三方服务。</p>
        </div>
        <div class="cc-grid">
          <article class="cc-card"><div class="cc-icon">💬</div><h3>群组 &amp; 私聊</h3><p>群组多人聊天、好友私聊，在线状态与正在输入提示，表情回应、引用回复与撤回一应俱全。</p></article>
          <article class="cc-card"><div class="cc-icon">🚀</div><h3>零第三方运行时依赖</h3><p>服务端仅依赖 Node.js 内建能力与 node:sqlite，自研 WebSocket 协议，易于审查与自托管。</p></article>
          <article class="cc-card"><div class="cc-icon">⚡</div><h3>轻量与高性能</h3><p>单进程设计，页面加载目标 1 秒内；全站 HTML/CSS/JS 均由内部静态服务直接托管。</p></article>
          <article class="cc-card"><div class="cc-icon">🛡️</div><h3>治理体系完备</h3><p>开放注册审核、举报、禁言/封禁/IP 封禁、审计日志与站内信箱（公告 + 通知）。</p></article>
          <article class="cc-card"><div class="cc-icon">🎨</div><h3>Markdown 富消息</h3><p>文本渲染 Markdown、代码高亮与数学公式；上传图片/音视频/文件并支持分片断点续传。</p></article>
          <article class="cc-card"><div class="cc-icon">🌍</div><h3>多语言界面</h3><p>内置 zh / en / ja 三种界面语言，展示地址与请求地址可分离部署。</p></article>
        </div>
      </section>

      <!-- 文档地图 -->
      <section class="cc-docs">
        <div class="cc-section-head">
          <span class="cc-eyebrow">文档结构</span>
          <h2>从入门到源码，一图看清</h2>
          <p>四个板块、二十余篇文档，覆盖部署、使用、接口与开发全流程。</p>
        </div>
        <div class="cc-docs-layout">
          <div class="cc-docs-col">
            <h4><span class="cc-dot"></span>开始使用</h4>
            <p class="cc-count">4 篇文档</p>
            <ul>
              <li><a href="/getting-started/quickstart">快速开始</a></li>
              <li><a href="/getting-started/installation">生产部署</a></li>
              <li><a href="/getting-started/configuration">配置说明</a></li>
              <li><a href="/getting-started/oauth">GitHub 登录与仓库卡片</a></li>
            </ul>
          </div>
          <div class="cc-docs-col">
            <h4><span class="cc-dot"></span>使用指南</h4>
            <p class="cc-count">6 篇文档</p>
            <ul>
              <li><a href="/guide/usage">用户指南</a></li>
              <li><a href="/guide/administration">管理后台</a></li>
              <li><a href="/guide/markdown">消息格式与富文本</a></li>
              <li><a href="/guide/security">安全模型与加固</a></li>
              <li><a href="/guide/clients">客户端</a></li>
              <li><a href="/guide/faq">常见问题与排错</a></li>
            </ul>
          </div>
          <div class="cc-docs-col">
            <h4><span class="cc-dot"></span>API 参考</h4>
            <p class="cc-count">9 篇文档</p>
            <ul>
              <li><a href="/api/overview">API 概览与鉴权</a></li>
              <li><a href="/api/auth">认证与登录</a></li>
              <li><a href="/api/account">账号与资料</a></li>
              <li><a href="/api/friends">好友与用户</a></li>
              <li><a href="/api/groups">群组</a></li>
              <li><a href="/api/messages">消息与上传</a></li>
              <li><a href="/api/mailbox">站内信箱</a></li>
              <li><a href="/api/admin">管理端 API</a></li>
              <li><a href="/api/websocket">WebSocket 协议</a></li>
            </ul>
          </div>
          <div class="cc-docs-col">
            <h4><span class="cc-dot"></span>开发</h4>
            <p class="cc-count">2 篇文档</p>
            <ul>
              <li><a href="/development/architecture">架构说明</a></li>
              <li><a href="/development/contribute">贡献指南</a></li>
            </ul>
          </div>
        </div>
      </section>

      <!-- 快速开始步骤 -->
      <section class="cc-steps">
        <div class="cc-steps-layout">
          <div>
            <div class="cc-section-head cc-left">
              <span class="cc-eyebrow">快速开始</span>
              <h2>三步之内，跑起来</h2>
              <p>无需数据库服务、无需构建工具链，克隆即可运行。</p>
            </div>
            <div class="cc-step-list">
              <div class="cc-step"><div class="cc-step-num">1</div><div class="cc-step-body"><h5>获取源码</h5><p>克隆仓库到本地，无需安装任何外部运行时。</p></div></div>
              <div class="cc-step"><div class="cc-step-num">2</div><div class="cc-step-body"><h5>配置环境变量</h5><p>设置端口、数据目录与站点地址，详见配置说明。</p></div></div>
              <div class="cc-step"><div class="cc-step-num">3</div><div class="cc-step-body"><h5>启动单进程服务</h5><p>一条命令拉起 HTTP + WebSocket，静态资源同步托管。</p></div></div>
            </div>
          </div>
          <div class="cc-terminal">
            <div class="cc-term-bar"><div class="cc-dots"><i></i><i></i><i></i></div><span>bash — circlechat</span></div>
            <div class="cc-term-body">
              <span class="cc-ln cc-cmt"># 1. 获取源码</span>
              <span class="cc-ln"><span class="cc-cmd">git clone</span> <span class="cc-str">https://github.com/your-org/circlechat.git</span></span>
              <span class="cc-ln"><span class="cc-cmd">cd</span> circlechat</span>
              <span class="cc-ln"> </span>
              <span class="cc-ln cc-cmt"># 2. 配置环境</span>
              <span class="cc-ln"><span class="cc-cmd">cp</span> .env.example .env</span>
              <span class="cc-ln"><span class="cc-cmd">vim</span> .env <span class="cc-cmt"># PORT=3000, SITE_URL=...</span></span>
              <span class="cc-ln"> </span>
              <span class="cc-ln cc-cmt"># 3. 启动服务</span>
              <span class="cc-ln"><span class="cc-cmd">node</span> <span class="cc-flag">--experimental-sqlite</span> server.js</span>
              <span class="cc-ln"><span class="cc-ok">✓</span> HTTP  server listening on :3000</span>
              <span class="cc-ln"><span class="cc-ok">✓</span> WS    gateway ready on /ws</span>
              <span class="cc-ln"><span class="cc-ok">✓</span> SQLite ready at ./data/circlechat.db</span>
              <span class="cc-ln"><span class="cc-ok">✓</span> Static assets served from /public</span>
              <span class="cc-ln"> </span>
              <span class="cc-ln"><span class="cc-cmd">$</span> <span class="cc-caret"></span></span>
            </div>
          </div>
        </div>
      </section>

      <!-- API 端点预览 -->
      <section class="cc-api">
        <div class="cc-section-head">
          <span class="cc-eyebrow">API 参考</span>
          <h2>清晰的接口，从鉴权到长连接</h2>
          <p>所有接口均为一手 HTTP 与 WebSocket，无中间抽象层。</p>
        </div>
        <div class="cc-api-grid">
          <div class="cc-api-card"><h5><em>🔐</em> 认证与账号</h5><ul class="cc-api-list"><li><span class="cc-verb cc-post">POST</span><span class="cc-path">/api/auth/login</span></li><li><span class="cc-verb cc-post">POST</span><span class="cc-path">/api/auth/register</span></li><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/account/me</span></li></ul></div>
          <div class="cc-api-card"><h5><em>👥</em> 好友与用户</h5><ul class="cc-api-list"><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/friends</span></li><li><span class="cc-verb cc-post">POST</span><span class="cc-path">/api/friends/request</span></li><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/users/:id</span></li></ul></div>
          <div class="cc-api-card"><h5><em>👪</em> 群组</h5><ul class="cc-api-list"><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/groups</span></li><li><span class="cc-verb cc-post">POST</span><span class="cc-path">/api/groups/:id/join</span></li><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/groups/:id/members</span></li></ul></div>
          <div class="cc-api-card"><h5><em>✉️</em> 消息与上传</h5><ul class="cc-api-list"><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/messages/:room</span></li><li><span class="cc-verb cc-post">POST</span><span class="cc-path">/api/messages</span></li><li><span class="cc-verb cc-post">POST</span><span class="cc-path">/api/upload/chunk</span></li></ul></div>
          <div class="cc-api-card"><h5><em>📮</em> 站内信箱</h5><ul class="cc-api-list"><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/mailbox/notices</span></li><li><span class="cc-verb cc-get">GET</span><span class="cc-path">/api/mailbox/announcements</span></li><li><span class="cc-verb cc-post">POST</span><span class="cc-path">/api/mailbox/read</span></li></ul></div>
          <div class="cc-api-card"><h5><em>🔌</em> WebSocket 协议</h5><ul class="cc-api-list"><li><span class="cc-verb cc-ws">WS</span><span class="cc-path">/ws · 自研帧协议</span></li><li><span class="cc-verb cc-ws">EVT</span><span class="cc-path">message · presence · typing</span></li><li><span class="cc-verb cc-ws">EVT</span><span class="cc-path">reaction · recall · notice</span></li></ul></div>
        </div>
      </section>

      <!-- CTA -->
      <section class="cc-cta">
        <div class="cc-cta-box">
          <h2>把它跑在自己的机器上</h2>
          <p>没有云服务依赖，没有隐性成本。克隆、配置、启动，三步拥有一个可审计、可掌控的聊天服务器。</p>
          <div class="cc-actions">
            <a class="cc-btn cc-btn-primary" href="/getting-started/quickstart">快速开始 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h13M12.5 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
            <a class="cc-btn cc-btn-ghost" href="/getting-started/installation">生产部署</a>
          </div>
          <div class="cc-cta-meta"><span>零第三方运行时依赖</span><span>单进程 · node:sqlite</span><span>中英日三语界面</span></div>
        </div>
      </section>
    </main>

    <!-- 页脚 -->
    <footer class="cc-footer">
      <div class="cc-foot-inner">
        <div class="cc-foot-top">
          <div class="cc-foot-brand">
            <a href="/" class="cc-brand">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><defs><linearGradient id="footGrad" x1="0" y1="0" x2="24" y2="24"><stop stop-color="#ffcb6b"/><stop offset="1" stop-color="#a8d94a"/></linearGradient></defs><circle cx="12" cy="12" r="9.1" stroke="url(#footGrad)" stroke-width="1.7"/><circle cx="12" cy="12" r="3.1" fill="url(#footGrad)"/></svg>
              CircleChat
            </a>
            <p>自托管的轻量多人聊天服务器。单进程部署，零第三方运行时依赖。</p>
          </div>
          <div class="cc-foot-col"><h6>开始使用</h6><ul><li><a href="/README">项目简介</a></li><li><a href="/getting-started/quickstart">快速开始</a></li><li><a href="/getting-started/installation">生产部署</a></li><li><a href="/getting-started/configuration">配置说明</a></li><li><a href="/getting-started/oauth">GitHub 登录</a></li></ul></div>
          <div class="cc-foot-col"><h6>使用指南</h6><ul><li><a href="/guide/usage">用户指南</a></li><li><a href="/guide/administration">管理后台</a></li><li><a href="/guide/markdown">消息与富文本</a></li><li><a href="/guide/security">安全模型与加固</a></li><li><a href="/guide/faq">常见问题与排错</a></li></ul></div>
          <div class="cc-foot-col"><h6>开发者</h6><ul><li><a href="/api/overview">API 概览与鉴权</a></li><li><a href="/api/websocket">WebSocket 协议</a></li><li><a href="/development/architecture">架构说明</a></li><li><a href="/development/contribute">贡献指南</a></li></ul></div>
        </div>
        <div class="cc-foot-bottom">
          <div>CircleChat · 自托管的轻量多人聊天服务器</div>
          <div class="cc-lang-tags"><span class="cc-on">中文</span><span>English</span><span>日本語</span></div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled = ref(false)
const onScroll = () => { isScrolled.value = window.scrollY > 12 }

let observer = null

onMounted(() => {
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  document.querySelectorAll('.cc-card').forEach(card => {
    card.addEventListener('pointermove', e => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px')
      card.style.setProperty('--my', (e.clientY - r.top) + 'px')
    })
  })

  const revealEls = document.querySelectorAll('.cc-reveal')
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return
      const el = entry.target
      const parent = el.parentElement
      const siblings = parent ? [...parent.children].filter(c => c.classList.contains('cc-reveal')) : []
      const idx = siblings.indexOf(el)
      el.style.transitionDelay = (idx > 0 ? Math.min(idx, 6) * 70 : 0) + 'ms'
      el.classList.add('cc-in')
      observer.unobserve(el)
    })
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' })

  revealEls.forEach(el => observer.observe(el))
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (observer) observer.disconnect()
})
</script>

<style>
/* 与之前相同的样式，全部作用域在 .cc-home 下 */
.cc-home {
  --bg: #0c0e0c;
  --text: #f3efe6;
  --muted: #9a978d;
  --muted-2: #6f716a;
  --amber: #f2a33c;
  --amber-lt: #ffcb6b;
  --lime: #a8d94a;
  --line: rgba(255, 255, 255, .08);
  --line-soft: rgba(255, 255, 255, .05);
  --radius: 20px;
  --ease: cubic-bezier(.2, .7, .3, 1);
  background: var(--bg);
  color: var(--text);
  font-family: "Inter", "SF Pro Text", -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}
.cc-home * { box-sizing: border-box; }
.cc-home::before {
  content: "";
  position: fixed; inset: 0; z-index: -2; pointer-events: none;
  background:
    radial-gradient(900px 520px at 10% -8%, rgba(242, 163, 60, .16), transparent 62%),
    radial-gradient(820px 620px at 90% 2%, rgba(168, 217, 74, .10), transparent 60%),
    radial-gradient(1100px 800px at 50% 112%, rgba(242, 163, 60, .07), transparent 62%);
}
.cc-home::after {
  content: "";
  position: fixed; inset: 0; z-index: -1; pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, .028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, .028) 1px, transparent 1px);
  background-size: 64px 64px;
  -webkit-mask-image: radial-gradient(circle at 50% 12%, #000 0%, transparent 72%);
  mask-image: radial-gradient(circle at 50% 12%, #000 0%, transparent 72%);
}
.cc-home ::selection { background: rgba(242, 163, 60, .35); color: #fff; }
.cc-home a { color: inherit; }

/* 导航 */
.cc-nav {
  position: sticky; top: 0; z-index: 80;
  border-bottom: 1px solid transparent;
  transition: background .35s ease, border-color .35s ease, backdrop-filter .35s ease;
}
.cc-nav.cc-nav-scrolled {
  background: rgba(12, 14, 12, .74);
  border-bottom-color: var(--line);
  -webkit-backdrop-filter: blur(16px) saturate(140%);
  backdrop-filter: blur(16px) saturate(140%);
}
.cc-nav-inner {
  max-width: 1240px; margin: 0 auto; padding: 15px 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.cc-brand {
  display: inline-flex; align-items: center; gap: 10px;
  font-weight: 750; font-size: 1.02rem; letter-spacing: -.01em;
  color: var(--text); text-decoration: none; flex: none;
}
.cc-brand svg { display: block; }
.cc-nav-links { display: flex; align-items: center; gap: 4px; }
.cc-nav-links a {
  color: var(--muted); text-decoration: none; font-size: .9rem; font-weight: 520;
  padding: 9px 14px; border-radius: 99px; transition: color .25s, background .25s;
}
.cc-nav-links a:hover { color: var(--text); background: rgba(255, 255, 255, .05); }
.cc-nav-links a.cc-nav-cta {
  color: #1a1206; font-weight: 650; margin-left: 6px;
  background: linear-gradient(135deg, var(--amber-lt), var(--amber) 60%, #e08a1e);
  box-shadow: 0 10px 26px -12px rgba(242, 163, 60, .85), inset 0 1px 0 rgba(255, 255, 255, .45);
}
.cc-nav-links a.cc-nav-cta:hover { filter: brightness(1.06); transform: translateY(-1px); }
@media (max-width: 820px) { .cc-nav-links a:not(.cc-nav-cta) { display: none; } }

/* Hero */
.cc-hero {
  max-width: 1240px; margin: 0 auto; padding: 70px 24px 100px;
  display: grid; grid-template-columns: 1.05fr .95fr; gap: 64px; align-items: center;
}
.cc-pill {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 7px 15px 7px 11px; border-radius: 99px;
  font-size: .8rem; font-weight: 520; color: #d8d3c6;
  border: 1px solid rgba(255, 255, 255, .10);
  background: linear-gradient(120deg, rgba(242, 163, 60, .12), rgba(168, 217, 74, .07));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, .06);
  margin-bottom: 26px;
}
.cc-pill i {
  width: 7px; height: 7px; border-radius: 50%; background: var(--lime);
  animation: cc-ripple 2.4s infinite;
}
@keyframes cc-ripple {
  0% { box-shadow: 0 0 0 0 rgba(168, 217, 74, .55); }
  70% { box-shadow: 0 0 0 9px rgba(168, 217, 74, 0); }
  100% { box-shadow: 0 0 0 0 rgba(168, 217, 74, 0); }
}
.cc-hero-title {
  margin: 0 0 22px;
  font-size: clamp(2.9rem, 6.4vw, 4.7rem);
  line-height: 1.02; font-weight: 820; letter-spacing: -.045em;
}
.cc-grad {
  background: linear-gradient(100deg, #ffd88a 0%, var(--amber) 42%, var(--lime) 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.cc-lede {
  margin: 0 0 32px; max-width: 34em;
  font-size: clamp(1rem, 1.35vw, 1.14rem);
  color: var(--muted); line-height: 1.78;
}
.cc-lede strong { color: #e6e1d4; font-weight: 600; }
.cc-actions { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
.cc-btn {
  display: inline-flex; align-items: center; gap: 9px;
  padding: 14px 26px; border-radius: 99px;
  font-size: .96rem; font-weight: 640;
  text-decoration: none; border: 1px solid transparent; cursor: pointer;
  transition: transform .3s var(--ease), box-shadow .3s var(--ease),
    background .3s ease, border-color .3s ease, filter .3s ease;
}
.cc-btn-primary {
  color: #1a1206;
  background: linear-gradient(135deg, var(--amber-lt), var(--amber) 58%, #e08a1e);
  box-shadow: 0 16px 38px -14px rgba(242, 163, 60, .85), inset 0 1px 0 rgba(255, 255, 255, .5);
}
.cc-btn-primary:hover {
  transform: translateY(-2px); filter: brightness(1.06);
  box-shadow: 0 24px 48px -16px rgba(242, 163, 60, 1), inset 0 1px 0 rgba(255, 255, 255, .6);
}
.cc-btn-ghost {
  color: var(--text); border-color: rgba(255, 255, 255, .14);
  background: rgba(255, 255, 255, .03);
}
.cc-btn-ghost:hover {
  transform: translateY(-2px);
  border-color: rgba(242, 163, 60, .45);
  background: rgba(242, 163, 60, .09);
}
.cc-btn svg { transition: transform .3s var(--ease); }
.cc-btn:hover svg { transform: translateX(3px); }

/* 聊天卡片 */
.cc-chat-wrap { position: relative; max-width: 430px; margin-left: auto; width: 100%; }
.cc-chat-wrap::before {
  content: ""; position: absolute; inset: -60px -40px; z-index: -1;
  background:
    radial-gradient(closest-side, rgba(242, 163, 60, .28), transparent 72%),
    radial-gradient(closest-side at 78% 82%, rgba(168, 217, 74, .20), transparent 70%);
  filter: blur(38px);
  animation: cc-glowPulse 9s ease-in-out infinite;
}
@keyframes cc-glowPulse {
  0%, 100% { opacity: .75; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.06); }
}
.cc-chat-card {
  position: relative; border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, .09);
  background: linear-gradient(165deg, rgba(30, 34, 28, .94), rgba(16, 19, 16, .96));
  box-shadow: 0 50px 90px -40px rgba(0, 0, 0, .95), inset 0 1px 0 rgba(255, 255, 255, .07);
  overflow: hidden;
  animation: cc-cardIn 1s var(--ease) both .15s;
}
@keyframes cc-cardIn {
  from { opacity: 0; transform: translateY(26px) scale(.97); }
  to { opacity: 1; transform: none; }
}
.cc-chat-head {
  display: flex; align-items: center; gap: 12px;
  padding: 16px 18px; border-bottom: 1px solid rgba(255, 255, 255, .06);
  background: rgba(255, 255, 255, .02);
}
.cc-chat-avatar {
  width: 38px; height: 38px; border-radius: 12px; flex: none;
  display: grid; place-items: center;
  font-size: .9rem; font-weight: 700; color: #1a1206;
  background: linear-gradient(140deg, var(--amber-lt), var(--amber) 60%, #d9821a);
  box-shadow: 0 6px 16px -8px rgba(242, 163, 60, .9);
}
.cc-chat-title { font-size: .92rem; font-weight: 680; }
.cc-chat-sub { font-size: .74rem; color: var(--muted); display: flex; align-items: center; gap: 6px; }
.cc-live { width: 6px; height: 6px; border-radius: 50%; background: var(--lime); box-shadow: 0 0 8px rgba(168, 217, 74, .9); }
.cc-chat-actions { margin-left: auto; color: #5f615c; letter-spacing: 2px; font-size: 1rem; user-select: none; }
.cc-chat-body { padding: 18px; display: flex; flex-direction: column; gap: 14px; }
.cc-msg { display: flex; gap: 9px; align-items: flex-end; animation: cc-msgIn .6s var(--ease) both; }
.cc-msg:nth-child(1) { animation-delay: .45s; }
.cc-msg:nth-child(2) { animation-delay: .62s; }
.cc-msg:nth-child(3) { animation-delay: .79s; }
@keyframes cc-msgIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: none; }
}
.cc-msg.cc-right { justify-content: flex-end; }
.cc-ava {
  width: 26px; height: 26px; border-radius: 50%; flex: none;
  display: grid; place-items: center;
  font-size: .68rem; font-weight: 700; color: #0e120c;
}
.cc-ava.cc-a1 { background: linear-gradient(140deg, #c9e77a, var(--lime)); }
.cc-ava.cc-a2 { background: linear-gradient(140deg, #ffd79a, #e8a33f); }
.cc-bubble {
  max-width: 76%; padding: 10px 14px;
  font-size: .86rem; line-height: 1.6; color: #e9e5da;
  background: rgba(255, 255, 255, .055);
  border: 1px solid rgba(255, 255, 255, .07);
  border-radius: 16px 16px 16px 5px;
}
.cc-bubble.cc-me {
  color: #1a1206; font-weight: 560;
  background: linear-gradient(135deg, var(--amber-lt), var(--amber) 70%, #dd8a1e);
  border-color: transparent;
  border-radius: 16px 16px 5px 16px;
  box-shadow: 0 10px 24px -14px rgba(242, 163, 60, .95);
}
.cc-bubble code {
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: .8em; padding: 1px 5px; border-radius: 5px;
  background: rgba(0, 0, 0, .28); color: #ffd79a;
}
.cc-bubble.cc-me code { background: rgba(0, 0, 0, .18); color: #2a1c05; }
.cc-typing {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 9px 14px; border-radius: 14px 14px 14px 5px;
  background: rgba(255, 255, 255, .04);
  border: 1px solid rgba(255, 255, 255, .06);
  width: fit-content;
}
.cc-typing span {
  width: 6px; height: 6px; border-radius: 50%; background: #8d8a80;
  animation: cc-blink 1.3s infinite;
}
.cc-typing span:nth-child(2) { animation-delay: .16s; }
.cc-typing span:nth-child(3) { animation-delay: .32s; }
@keyframes cc-blink {
  0%, 60%, 100% { opacity: .28; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-3px); }
}
.cc-chat-input {
  display: flex; align-items: center; gap: 10px;
  margin: 0 16px 16px; padding: 7px 7px 7px 16px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, .08);
  background: rgba(255, 255, 255, .028);
  font-size: .82rem; color: #6f716b;
}
.cc-chat-input b {
  margin-left: auto; width: 30px; height: 30px; border-radius: 50%;
  display: grid; place-items: center; font-size: .9rem; color: #1a1206;
  background: linear-gradient(135deg, var(--amber-lt), var(--amber));
  box-shadow: 0 6px 16px -8px rgba(242, 163, 60, .95);
}
.cc-float-badge {
  position: absolute; z-index: 3;
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 16px; border-radius: 99px;
  font-size: .79rem; font-weight: 600; color: #eae5d9;
  border: 1px solid rgba(255, 255, 255, .12);
  background: linear-gradient(140deg, rgba(38, 42, 34, .92), rgba(20, 23, 20, .92));
  box-shadow: 0 20px 40px -20px rgba(0, 0, 0, .95);
  white-space: nowrap;
}
.cc-float-badge.cc-b1 { top: -20px; left: -30px; animation: cc-floatY 6s ease-in-out infinite; }
.cc-float-badge.cc-b2 { bottom: -18px; right: -26px; animation: cc-floatY 7.5s ease-in-out infinite .8s; }
@keyframes cc-floatY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-11px); }
}

/* 数据条 */
.cc-stats { max-width: 1240px; margin: 0 auto; padding: 0 24px 84px; }
.cc-stats-inner {
  display: grid; grid-template-columns: repeat(4, 1fr);
  border: 1px solid var(--line); border-radius: 22px; overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, .035), rgba(255, 255, 255, .008));
}
.cc-stat {
  padding: 26px 24px; text-align: center; position: relative;
  transition: background .35s ease;
}
.cc-stat + .cc-stat::before {
  content: ""; position: absolute; left: 0; top: 22%; height: 56%; width: 1px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, .10), transparent);
}
.cc-stat:hover { background: rgba(242, 163, 60, .05); }
.cc-stat-num {
  font-size: clamp(1.5rem, 2.6vw, 2rem); font-weight: 800; letter-spacing: -.03em;
  background: linear-gradient(120deg, #ffd88a, var(--amber) 55%, var(--lime));
  -webkit-background-clip: text; background-clip: text; color: transparent;
  line-height: 1.2;
}
.cc-stat-label { font-size: .83rem; color: var(--muted); margin-top: 6px; }
@media (max-width: 760px) {
  .cc-stats-inner { grid-template-columns: repeat(2, 1fr); }
  .cc-stat:nth-child(3)::before, .cc-stat:nth-child(odd)::before { display: none; }
  .cc-stat:nth-child(3), .cc-stat:nth-child(4) { border-top: 1px solid var(--line); }
}

/* 区块标题 */
.cc-section-head { max-width: 660px; margin: 0 auto 52px; text-align: center; }
.cc-section-head.cc-left { margin-left: 0; text-align: left; max-width: 560px; }
.cc-eyebrow {
  display: inline-block; margin-bottom: 14px;
  font-size: .76rem; font-weight: 700; letter-spacing: .18em; text-transform: uppercase;
  color: var(--amber);
}
.cc-section-head h2 {
  margin: 0 0 14px;
  font-size: clamp(1.85rem, 3.4vw, 2.6rem);
  font-weight: 780; letter-spacing: -.035em; line-height: 1.15;
}
.cc-section-head p { margin: 0; color: var(--muted); font-size: 1rem; line-height: 1.75; }

/* 特性卡片 */
.cc-features { max-width: 1240px; margin: 0 auto; padding: 0 24px 110px; }
.cc-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
.cc-card {
  position: relative; overflow: hidden;
  padding: 28px 26px 30px;
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: linear-gradient(180deg, rgba(255, 255, 255, .045), rgba(255, 255, 255, .014));
  transition: transform .45s var(--ease), border-color .35s ease, background .35s ease;
}
.cc-card::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  opacity: 0; transition: opacity .45s ease;
  background: radial-gradient(300px circle at var(--mx, 50%) var(--my, 50%), rgba(242, 163, 60, .15), transparent 68%);
}
.cc-card:hover {
  transform: translateY(-6px);
  border-color: rgba(255, 255, 255, .10);
  background: linear-gradient(180deg, rgba(255, 255, 255, .062), rgba(255, 255, 255, .02));
}
.cc-card:hover::before { opacity: 1; }
.cc-icon {
  width: 50px; height: 50px; border-radius: 15px;
  display: grid; place-items: center; font-size: 23px;
  margin-bottom: 18px;
  background: linear-gradient(150deg, rgba(242, 163, 60, .20), rgba(168, 217, 74, .10));
  border: 1px solid rgba(255, 255, 255, .09);
  transition: transform .45s var(--ease);
}
.cc-card:hover .cc-icon { transform: translateY(-2px) scale(1.06) rotate(-3deg); }
.cc-card h3 { margin: 0 0 10px; font-size: 1.04rem; font-weight: 700; letter-spacing: -.015em; }
.cc-card p { margin: 0; font-size: .9rem; line-height: 1.75; color: var(--muted); }

/* 文档地图 */
.cc-docs { max-width: 1240px; margin: 0 auto; padding: 0 24px 110px; }
.cc-docs-layout { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
.cc-docs-col {
  padding: 24px 22px 26px; border-radius: 18px;
  border: 1px solid var(--line-soft);
  background: linear-gradient(180deg, rgba(255, 255, 255, .032), rgba(255, 255, 255, .008));
  transition: border-color .35s ease, background .35s ease, transform .45s var(--ease);
}
.cc-docs-col:hover {
  border-color: rgba(242, 163, 60, .28);
  background: linear-gradient(180deg, rgba(242, 163, 60, .055), rgba(255, 255, 255, .012));
  transform: translateY(-4px);
}
.cc-docs-col h4 {
  margin: 0 0 4px; font-size: .95rem; font-weight: 720;
  display: flex; align-items: center; gap: 9px;
}
.cc-docs-col h4 .cc-dot {
  width: 8px; height: 8px; border-radius: 50%; flex: none;
  background: linear-gradient(140deg, var(--amber-lt), var(--lime));
  box-shadow: 0 0 10px rgba(242, 163, 60, .7);
}
.cc-docs-col .cc-count {
  font-size: .72rem; color: var(--muted-2); margin: 0 0 16px 17px;
}
.cc-docs-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.cc-docs-col li a {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 9px;
  font-size: .845rem; color: var(--muted); text-decoration: none;
  transition: color .22s ease, background .22s ease, padding-left .22s ease;
}
.cc-docs-col li a::before {
  content: ""; width: 4px; height: 4px; border-radius: 50%; flex: none;
  background: currentColor; opacity: .35; transition: opacity .22s ease, transform .22s ease;
}
.cc-docs-col li a:hover { color: var(--text); background: rgba(255, 255, 255, .05); padding-left: 14px; }
.cc-docs-col li a:hover::before { opacity: 1; transform: scale(1.4); background: var(--amber); }
@media (max-width: 1060px) { .cc-docs-layout { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .cc-docs-layout { grid-template-columns: 1fr; } }

/* 步骤 + 终端 */
.cc-steps { max-width: 1240px; margin: 0 auto; padding: 0 24px 110px; }
.cc-steps-layout { display: grid; grid-template-columns: .95fr 1.05fr; gap: 56px; align-items: center; }
.cc-step-list { display: flex; flex-direction: column; gap: 12px; }
.cc-step {
  display: flex; gap: 16px; padding: 18px 20px; border-radius: 16px;
  border: 1px solid transparent;
  transition: border-color .3s ease, background .3s ease, transform .35s var(--ease);
}
.cc-step:hover {
  border-color: rgba(255, 255, 255, .09);
  background: rgba(255, 255, 255, .028);
  transform: translateX(4px);
}
.cc-step-num {
  width: 34px; height: 34px; border-radius: 10px; flex: none;
  display: grid; place-items: center;
  font-size: .85rem; font-weight: 750;
  color: #1a1206;
  background: linear-gradient(140deg, var(--amber-lt), var(--amber) 65%, #dd8a1e);
  box-shadow: 0 8px 18px -10px rgba(242, 163, 60, .95), inset 0 1px 0 rgba(255, 255, 255, .45);
}
.cc-step-body h5 { margin: 0 0 4px; font-size: .95rem; font-weight: 680; }
.cc-step-body p { margin: 0; font-size: .845rem; color: var(--muted); line-height: 1.65; }
.cc-terminal {
  border-radius: 16px; overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .09);
  background: linear-gradient(165deg, rgba(24, 27, 22, .96), rgba(13, 15, 13, .98));
  box-shadow: 0 40px 80px -40px rgba(0, 0, 0, .95);
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
.cc-term-bar {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, .06);
  background: rgba(255, 255, 255, .022);
}
.cc-term-bar .cc-dots { display: flex; gap: 6px; }
.cc-term-bar .cc-dots i { width: 10px; height: 10px; border-radius: 50%; display: block; }
.cc-term-bar .cc-dots i:nth-child(1) { background: #e8695a; }
.cc-term-bar .cc-dots i:nth-child(2) { background: #e8b04a; }
.cc-term-bar .cc-dots i:nth-child(3) { background: #8fbf4a; }
.cc-term-bar span { margin-left: 8px; font-size: .74rem; color: var(--muted-2); }
.cc-term-body { padding: 20px 22px; font-size: .815rem; line-height: 2; overflow-x: auto; }
.cc-term-body .cc-ln { display: block; white-space: pre; }
.cc-term-body .cc-cmt { color: #5f7261; }
.cc-term-body .cc-cmd { color: #e8e3d6; }
.cc-term-body .cc-ok { color: var(--lime); }
.cc-term-body .cc-flag { color: var(--amber-lt); }
.cc-term-body .cc-str { color: #d9b06a; }
.cc-caret {
  display: inline-block; width: 7px; height: 14px; vertical-align: -2px;
  background: var(--amber); margin-left: 2px;
  animation: cc-caretBlink 1.1s steps(2) infinite;
}
@keyframes cc-caretBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
@media (max-width: 980px) { .cc-steps-layout { grid-template-columns: 1fr; gap: 38px; } }

/* API 端点 */
.cc-api { max-width: 1240px; margin: 0 auto; padding: 0 24px 110px; }
.cc-api-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.cc-api-card {
  padding: 22px 22px 24px; border-radius: 16px;
  border: 1px solid var(--line-soft);
  background: linear-gradient(180deg, rgba(255, 255, 255, .03), rgba(255, 255, 255, .006));
  transition: border-color .3s ease, transform .4s var(--ease), background .3s ease;
}
.cc-api-card:hover {
  border-color: rgba(168, 217, 74, .30);
  background: linear-gradient(180deg, rgba(168, 217, 74, .05), rgba(255, 255, 255, .01));
  transform: translateY(-4px);
}
.cc-api-card h5 {
  margin: 0 0 14px; font-size: .9rem; font-weight: 700;
  display: flex; align-items: center; gap: 8px; color: #e9e4d7;
}
.cc-api-card h5 em { font-style: normal; font-size: .9rem; }
.cc-api-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 8px; }
.cc-api-list li {
  display: flex; align-items: center; gap: 9px;
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: .765rem; color: #8f9189;
}
.cc-verb {
  flex: none; width: 46px; text-align: center;
  padding: 2px 0; border-radius: 5px; font-size: .66rem; font-weight: 750;
}
.cc-verb.cc-get { background: rgba(168, 217, 74, .14); color: #b6e368; border: 1px solid rgba(168, 217, 74, .22); }
.cc-verb.cc-post { background: rgba(242, 163, 60, .14); color: #ffc46b; border: 1px solid rgba(242, 163, 60, .24); }
.cc-verb.cc-ws { background: rgba(255, 255, 255, .07); color: #d5d0c4; border: 1px solid rgba(255, 255, 255, .12); }
.cc-path { color: #c9c5b9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 980px) { .cc-api-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 620px) { .cc-api-grid { grid-template-columns: 1fr; } }

/* CTA */
.cc-cta { max-width: 1240px; margin: 0 auto; padding: 0 24px 120px; }
.cc-cta-box {
  position: relative; overflow: hidden;
  padding: 64px 48px; border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, .10);
  background:
    radial-gradient(620px 320px at 12% 0%, rgba(242, 163, 60, .20), transparent 62%),
    radial-gradient(620px 340px at 90% 100%, rgba(168, 217, 74, .14), transparent 60%),
    linear-gradient(165deg, rgba(30, 34, 28, .92), rgba(15, 18, 15, .96));
  box-shadow: 0 50px 100px -50px rgba(0, 0, 0, .98);
  text-align: center;
}
.cc-cta-box h2 {
  margin: 0 0 16px; font-size: clamp(1.7rem, 3.2vw, 2.4rem);
  font-weight: 790; letter-spacing: -.035em; line-height: 1.18;
}
.cc-cta-box p {
  margin: 0 auto 32px; max-width: 44ch;
  color: var(--muted); font-size: 1rem; line-height: 1.75;
}
.cc-cta-box .cc-actions { justify-content: center; }
.cc-cta-meta {
  margin-top: 30px; display: flex; flex-wrap: wrap; gap: 10px 26px;
  justify-content: center; font-size: .82rem; color: var(--muted-2);
}
.cc-cta-meta span { display: inline-flex; align-items: center; gap: 7px; }
.cc-cta-meta span::before {
  content: ""; width: 5px; height: 5px; border-radius: 50%;
  background: var(--lime); box-shadow: 0 0 8px rgba(168, 217, 74, .9);
}
@media (max-width: 640px) { .cc-cta-box { padding: 48px 24px; } }

/* 页脚 */
.cc-footer { border-top: 1px solid var(--line); background: rgba(255, 255, 255, .012); }
.cc-foot-inner { max-width: 1240px; margin: 0 auto; padding: 44px 24px 34px; }
.cc-foot-top {
  display: grid; grid-template-columns: 1.4fr 1fr 1fr 1fr; gap: 36px;
  padding-bottom: 34px; border-bottom: 1px solid var(--line-soft);
}
.cc-foot-brand p {
  margin: 12px 0 0; font-size: .845rem; color: var(--muted-2);
  line-height: 1.7; max-width: 30ch;
}
.cc-foot-col h6 {
  margin: 0 0 14px; font-size: .78rem; font-weight: 700;
  letter-spacing: .12em; text-transform: uppercase; color: #7d7a70;
}
.cc-foot-col ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.cc-foot-col a { font-size: .85rem; color: var(--muted); text-decoration: none; transition: color .22s ease; }
.cc-foot-col a:hover { color: var(--amber); }
.cc-foot-bottom {
  display: flex; flex-wrap: wrap; gap: 14px; align-items: center; justify-content: space-between;
  padding-top: 24px; font-size: .82rem; color: var(--muted-2);
}
.cc-lang-tags { display: flex; gap: 8px; }
.cc-lang-tags span {
  padding: 4px 11px; border-radius: 99px; font-size: .74rem; font-weight: 600;
  border: 1px solid rgba(255, 255, 255, .09);
  background: rgba(255, 255, 255, .03); color: #a5a297;
}
.cc-lang-tags span.cc-on {
  border-color: rgba(242, 163, 60, .35);
  background: rgba(242, 163, 60, .10); color: var(--amber-lt);
}
@media (max-width: 900px) { .cc-foot-top { grid-template-columns: 1fr 1fr; gap: 30px; } }
@media (max-width: 520px) { .cc-foot-top { grid-template-columns: 1fr; } }

@media (max-width: 980px) {
  .cc-hero { grid-template-columns: 1fr; gap: 70px; padding: 48px 24px 84px; }
  .cc-chat-wrap { margin: 0 auto; }
  .cc-float-badge.cc-b1 { left: -14px; }
  .cc-float-badge.cc-b2 { right: -14px; }
  .cc-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .cc-grid { grid-template-columns: 1fr; }
  .cc-float-badge { display: none; }
  .cc-features, .cc-docs, .cc-steps, .cc-api { padding-bottom: 80px; }
}
@media (prefers-reduced-motion: reduce) {
  .cc-home *, .cc-home *::before, .cc-home *::after {
    animation-duration: .001ms !important;
    transition-duration: .001ms !important;
  }
}
</style>