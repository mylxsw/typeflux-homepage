/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEFAULT_LANG, LANG_CODES, localizedPath, parsePath } from '../lib/localePath'
import { getPathname } from '../lib/serverContext'
import { isAuthRoute } from '../lib/authNavigation'

// Supported languages
export const languages = [
  { code: 'en', name: 'English', flag: 'EN' },
  { code: 'zh-CN', name: '简体中文', flag: '简' },
  { code: 'zh-TW', name: '繁體中文', flag: '繁' },
  { code: 'ja', name: '日本語', flag: 'JP' },
  { code: 'ko', name: '한국어', flag: 'KR' },
]

// Translations
const translations = {
  en: {
    nav: {
      product: 'Product',
      agent: 'AI Agent',
      launcher: 'Launcher',
      voice: 'Voice Input',
      capture: 'Screenshots',
      clipboard: 'Clipboard',
      ring: 'Ring',
      custom: 'Make it yours',
      privacy: 'Privacy',
      blog: 'Blog',
      github: 'GitHub',
      download: 'Download Free',
    },
    releases: {
      eyebrow: 'Release Notes',
      title: 'Version history, newest first',
      summary: 'Browse every published Typeflux release in reverse chronological order. Add one Markdown file per release and the page updates automatically.',
      download: 'Download',
      latestDownload: 'Download',
      appleSiliconDownload: 'Download for Mac (Apple chip)',
      intelDownload: 'Download for Mac (Intel chip)',
      downloadCN: 'Download (China Mainland)',
      downloadGlobal: 'Download (Global)',
      latestDownloadLabel: 'Latest Build',
      latestLabel: 'Latest Release',
      keyImprovements: 'Key Improvements',
      historyTitle: 'Version History',
      moreHistory: 'Load older versions',
      latestDatePrefix: 'Released on',
      latestDescription: 'Get the newest Typeflux build directly from the latest published release, then use the timeline below to review previous versions and updates.',
      highlightLatest: 'Always points to the newest build',
      highlightTimeline: 'Reverse-chronological release timeline',
      highlightMarkdown: 'Managed with one Markdown file per version',
      noVersion: 'Coming soon',
      emptyTitle: 'No releases yet',
      emptyDescription: 'Add Markdown files to src/content/releases and they will appear here automatically.',
    },
    billingPlans: {
      eyebrow: 'Typeflux plans',
      title: 'Choose the plan that fits you.',
      loadingTitle: 'Loading your plans',
      loadingSummary: 'We are securely retrieving the plans available for your Typeflux account.',
      missingTitle: 'Open this page from Typeflux',
      missingSummary: 'This billing link is missing its secure access token. Return to the Typeflux app and choose Subscribe again.',
      expiredTitle: 'This billing link has expired',
      errorTitle: 'Plans are temporarily unavailable',
      errorSummary: 'We could not load the available plans. Check your connection and try again.',
      retry: 'Try again',
      emptyTitle: 'No plans are available',
      emptySummary: 'There are no purchasable plans configured right now. Please check back later.',
      billingUnavailable: 'Billing is temporarily unavailable. You can still review plans, but checkout is disabled.',
      recommended: 'Recommended',
      mostPopular: 'Most Popular',
      currentPlan: 'Current plan',
      choosePlan: 'Choose {plan}',
      billingInterval: 'Billing interval',
      choosingPlan: 'Opening Stripe…',
      billedYearly: 'Billed Yearly',
      billedYearlyDiscount: 'Billed Yearly ({percent}%off)',
      billedMonthly: 'Billed Monthly',
      subscribeYearly: 'Subscribe Yearly',
      subscribeMonthly: 'Subscribe Monthly',
      creditsPerMonth: '{credits} Credits per month',
      unlimitedCreditsPerMonth: 'Unlimited Credits per month',
      perMonth: 'month',
      perYear: 'year',
      freePrice: 'Free',
      savePercent: 'Save {percent}%',
      monthlyEquivalent: 'Equivalent to {price} / month',
      catalog: {
        plans: {
          free: { name: 'Free', tagline: 'Start with Typeflux', description: 'For light personal use' },
          pro: { name: 'Pro', tagline: 'Get more done with AI', description: 'For professionals with higher AI usage' },
        },
        monthlyCredits: '{credits} AI credits per month',
        unlimitedCredits: 'Unlimited AI credits',
      },
      checkoutConflict: 'Your account already has an active subscription. Refresh billing in Typeflux to see the latest status.',
      checkoutFailed: 'Stripe Checkout could not be opened. Please try again.',
      checkoutPending: 'Your previous checkout is still being confirmed. Your selection is kept — please try again in a few minutes, or contact support if this continues.',
      checkoutReconciliation: 'Billing setup for your account needs a quick check by our support team. Changing plans will not resolve it — please contact support.',
    },
    cookie: {
      bannerLabel: 'Cookie consent notice',
      eyebrow: 'Privacy Choices',
      title: 'Choose your cookies',
      message: 'We use cookies and similar storage technologies to keep the site working, remember preferences, and understand site usage.',
      learnMore: 'Learn more in our Privacy Policy',
      accept: 'Accept all',
      reject: 'Reject non-essential cookies',
    },
    // Footer
    footer: {
      desc: 'The open-source AI layer for your Mac',
      product: 'Product',
      agent: 'AI Agent',
      releases: 'Releases',
      privacy: 'Privacy',
      terms: 'Terms of Service',
      resources: 'Resources',
      profileLinks: 'Project information and links',
      authorGithub: 'GitHub',
      aboutMe: 'About Me',
      wechat: 'WeChat Official Account',
      wechatModalTitle: 'WeChat Official Account',
      wechatQrAlt: 'QR code for the WeChat official account',
      close: 'Close',
      download: 'Download',
      feedback: 'Feedback',
      privacyPolicy: 'Privacy Policy',
      copyright: '© 2026 Typeflux. Open source project under AGPL-3.0 license.',
    },
    seo: {
      home: {
        title: 'Typeflux — AI Voice Typing, Agent & Launcher for Mac',
        description:
          'Hold Fn to dictate in any Mac app, ask an AI agent that sees your screen and acts with your approval, launch anything by keyword, and flick a ring of actions at your pointer. Free, open source, runs fully on-device.',
      },
      releases: {
        title: 'Typeflux Releases — Download the Latest macOS Version',
        description:
          'Download the latest Typeflux build for macOS (Apple Silicon & Intel) and browse the full release history with changelogs for every version.',
      },
      privacy: {
        title: 'Privacy Policy — Typeflux',
        description:
          'How Typeflux handles your data: local-first voice processing, no voice data retention, and open-source transparency.',
      },
      terms: {
        title: 'Terms of Service — Typeflux',
        description:
          'The terms that govern your use of the Typeflux website and the Typeflux macOS application.',
      },
      billing: {
        title: 'Typeflux Billing',
        description: 'Manage your Typeflux subscription and plans.',
      },
      blog: {
        title: 'Typeflux Blog — Guides & Notes on Voice Typing',
        description:
          'Guides, tips, and engineering notes on voice typing, local speech models, and the Typeflux macOS app.',
      },
    },
    blog: {
      indexTitle: 'Blog',
      indexSubtitle: 'Guides and notes on voice typing, local models, and Typeflux.',
      readMore: 'Read more',
      backToBlog: 'Back to all posts',
      emptyTitle: 'No posts yet',
      emptyDescription: 'Guides and articles are on the way. Check back soon.',
    },
    faq: {
      title: 'Frequently Asked Questions',
      subtitle: 'Everything you need to know about Typeflux.',
      items: [
        {
          q: 'What is Typeflux?',
          a: 'Typeflux is an AI productivity app for macOS with four entry points: hold Fn to dictate in any app, ask an AI agent from the launcher, search and run keywords and workflows in the launcher, and open a ring of actions at your pointer. It also includes screenshots, screen recording, clipboard history, translation and a notebook.',
        },
        {
          q: 'Can the AI agent change things on my Mac without asking?',
          a: 'Not unless you allow it. In the default mode the agent reads on its own but asks before it changes files, runs commands or operates apps, and file access is limited to folders you grant. You can switch a conversation to ask every time, or to full auto for trusted tasks.',
        },
        {
          q: 'Does Typeflux replace Raycast or Alfred?',
          a: 'For many people, yes. The launcher opens apps and files, searches file contents, browser tabs and bookmarks, translates, calculates, runs commands and shows your calendar by keyword, and can import Alfred workflows. You can also use them side by side.',
        },
        {
          q: 'Is Typeflux free to use?',
          a: 'Yes. Typeflux is free and open-source under the AGPL-3.0 license, and every feature works without payment. Local models and your own API keys cost nothing extra.',
        },
        {
          q: 'Which apps does Typeflux work with?',
          a: 'Any app you can type in. Hold the Fn key, speak, and the recognized text is inserted into the active text field — no plugins or integrations required.',
        },
        {
          q: 'Does Typeflux upload my voice data?',
          a: 'You can run local speech recognition models fully offline, so your voice never leaves your Mac. Even when you use a cloud recognition provider, Typeflux does not collect, store, or analyze your voice or text data.',
        },
        {
          q: 'Can I use Typeflux offline?',
          a: 'Yes. Once a local model is downloaded, voice typing works without an internet connection.',
        },
        {
          q: 'What languages can Typeflux recognize?',
          a: 'It depends on the recognition engine you choose. The built-in Soniox real-time engine supports more than 60 languages, and you can also use Alibaba Cloud Paraformer, Doubao, or local models covering Chinese, English, Japanese, Korean, and more.',
        },
        {
          q: 'Is Typeflux a free alternative to Wispr Flow, SuperWhisper, or Typeless?',
          a: 'Yes. Typeflux covers the same core job — system-wide AI voice typing and dictation on macOS — and is free and open-source. Its local models have no word caps or weekly quotas.',
        },
        {
          q: 'Is Typeflux the same app as Typeless?',
          a: 'No. Typeless is a separate, similarly named product from a different team. Typeflux is the free, open-source voice typing app for macOS — this website and the github.com/mylxsw/typeflux repository are the only official sources.',
        },
        {
          q: 'Does Typeflux use Whisper?',
          a: 'Yes. You can run OpenAI Whisper models (medium and large-v3) locally on your Mac through WhisperKit on Apple CoreML, alongside SenseVoice, Qwen3-ASR, and FunASR. Cloud recognition engines are available too if you prefer.',
        },
        {
          q: 'Is there an iPhone app?',
          a: 'Typeflux for iPhone is in preparation and coming soon. It will let you continue your Ask conversations, dictate by voice and use Typeflux Cloud or your own models.',
        },
      ],
    },
  },
  'zh-CN': {
    nav: {
      product: '产品',
      agent: 'AI Agent',
      launcher: '启动器',
      voice: '语音输入',
      capture: '截图录屏',
      clipboard: '剪贴板',
      ring: '圆环',
      custom: '自定义',
      privacy: '隐私',
      blog: '博客',
      github: 'GitHub',
      download: '免费下载',
    },
    releases: {
      eyebrow: 'Release Notes',
      title: '版本发布历史',
      summary: '这里会按时间倒序展示 Typeflux 的所有版本发布记录。你只需要往 src/content/releases 目录里新增一个 Markdown 文件，页面就会自动更新。',
      download: '下载版本',
      latestDownload: '下载',
      appleSiliconDownload: '下载 Mac 版（Apple 芯片）',
      intelDownload: '下载 Mac 版（Intel 芯片）',
      downloadCN: '中国大陆下载',
      downloadGlobal: '全球下载',
      latestDownloadLabel: 'Latest Build',
      latestLabel: 'Latest Release',
      keyImprovements: '关键改进',
      historyTitle: '版本历史',
      moreHistory: '查看更多历史版本',
      latestDatePrefix: '发布时间',
      latestDescription: '这里优先提供当前最新版本的直达下载入口，下方时间线则用于查看历次发布记录与更新说明。',
      highlightLatest: '始终指向最新可用版本',
      highlightTimeline: '按时间倒序查看所有发布记录',
      highlightMarkdown: '每个版本只需维护一个 Markdown 文件',
      noVersion: '即将发布',
      emptyTitle: '还没有发布记录',
      emptyDescription: '把 Markdown 文件放进 src/content/releases 目录后，这里会自动显示。',
    },
    billingPlans: {
      eyebrow: 'Typeflux 套餐',
      title: '选择适合你的套餐',
      loadingTitle: '正在加载套餐',
      loadingSummary: '正在安全获取你的 Typeflux 账户可用套餐',
      missingTitle: '请从 Typeflux 打开此页面',
      missingSummary: '账单链接缺少安全访问 token。请返回 Typeflux 应用，再次选择「订阅」。',
      expiredTitle: '账单链接已过期',
      errorTitle: '暂时无法加载套餐',
      errorSummary: '未能获取可用套餐，请检查网络连接后重试。',
      retry: '重试',
      emptyTitle: '暂无可用套餐',
      emptySummary: '当前没有配置可购买的套餐，请稍后再来查看。',
      billingUnavailable: '账单功能暂时不可用。你仍可查看套餐，但目前无法付款。',
      recommended: '推荐',
      mostPopular: '最受欢迎',
      currentPlan: '当前套餐',
      choosePlan: '选择{plan}',
      billingInterval: '付费周期',
      choosingPlan: '正在打开 Stripe…',
      billedYearly: '按年付费',
      billedYearlyDiscount: '按年付费（省 {percent}%）',
      billedMonthly: '按月付费',
      subscribeYearly: '按年订阅',
      subscribeMonthly: '按月订阅',
      creditsPerMonth: '每月 {credits} 积分',
      unlimitedCreditsPerMonth: '每月无限积分',
      perMonth: '月',
      perYear: '年',
      freePrice: '免费',
      savePercent: '省 {percent}%',
      monthlyEquivalent: '折合每月 {price}',
      catalog: {
        plans: {
          free: { name: '免费版', tagline: '从 Typeflux 开始', description: '适合轻度个人使用' },
          pro: { name: '专业版', tagline: '用 AI 高效完成更多工作', description: '适合 AI 使用量较高的专业人士' },
        },
        monthlyCredits: '每月 {credits} AI 积分',
        unlimitedCredits: '无限 AI 积分',
      },
      checkoutConflict: '你的账户已有生效中的订阅。请在 Typeflux 中刷新账单状态。',
      checkoutFailed: '无法打开 Stripe Checkout，请重试。',
      checkoutPending: '上一次 Checkout 仍在确认中，已为你保留当前选择。请几分钟后重试；如持续出现，请联系客服。',
      checkoutReconciliation: '你的账户账单设置需要客服核对，切换套餐无法解决，请联系客服。',
    },
    cookie: {
      bannerLabel: 'Cookie 同意提示',
      eyebrow: '隐私选项',
      title: '选择 Cookie 设置',
      message: '我们使用 Cookie 和类似的本地存储技术来保障网站正常运行、记住偏好设置，并了解站点的整体使用情况。',
      learnMore: '在隐私政策中了解更多',
      accept: '全部接受',
      reject: '拒绝非必要 Cookie',
    },
    footer: {
      desc: '开源免费的 Mac AI 效率工具',
      product: '产品',
      agent: 'AI Agent',
      releases: '版本发布',
      privacy: '隐私保护',
      terms: '服务条款',
      resources: '资源',
      profileLinks: '项目基本信息及相关链接',
      authorGithub: 'GitHub',
      aboutMe: '关于我',
      wechat: '微信公众号',
      wechatModalTitle: '微信公众号',
      wechatQrAlt: '微信公众号二维码',
      close: '关闭',
      download: '下载',
      feedback: '反馈',
      privacyPolicy: '隐私政策',
      copyright: '© 2026 Typeflux. 开源项目，使用 AGPL-3.0 许可证。',
    },
    seo: {
      home: {
        title: 'Typeflux — Mac 上的 AI 语音输入、Agent 与启动器',
        description:
          '按住 Fn 在任意应用中语音输入；向能看到屏幕、经你批准再动手的 AI Agent 提问；用关键字启动一切；在鼠标处弹出操作圆环。开源免费，可完全本地运行。',
      },
      releases: {
        title: 'Typeflux 版本发布 — 下载最新 macOS 版本',
        description:
          '下载 Typeflux 最新 macOS 版本（支持 Apple 芯片与 Intel），并查看历次版本更新记录与变更说明。',
      },
      privacy: {
        title: '隐私政策 — Typeflux',
        description:
          '了解 Typeflux 如何处理你的数据：本地优先的语音处理，不留存语音数据，代码完全开源可审计。',
      },
      terms: {
        title: '服务条款 — Typeflux',
        description: '使用 Typeflux 网站与 macOS 应用前请阅读的服务条款。',
      },
      billing: {
        title: 'Typeflux 账单',
        description: '管理你的 Typeflux 订阅与套餐。',
      },
      blog: {
        title: 'Typeflux 博客 — 语音输入指南与技巧',
        description: '关于语音输入、本地语音模型与 Typeflux 使用技巧的指南和随笔。',
      },
    },
    blog: {
      indexTitle: '博客',
      indexSubtitle: '语音输入指南与 Typeflux 使用随笔。',
      readMore: '阅读全文',
      backToBlog: '返回文章列表',
      emptyTitle: '暂无文章',
      emptyDescription: '内容正在准备中，稍后再来看看。',
    },
    faq: {
      title: '常见问题',
      subtitle: '关于 Typeflux，你想知道的都在这里。',
      items: [
        {
          q: 'Typeflux 是什么？',
          a: 'Typeflux 是一款 macOS 上的 AI 效率工具，有四个入口：按住 Fn 在任意应用里语音输入；在启动器里向 AI Agent 提问；在启动器里搜索、运行关键字和工作流；在鼠标处打开操作圆环。另外还有截图、录屏、剪贴板历史、翻译和笔记本等工具。',
        },
        {
          q: 'AI Agent 会不会不经允许就改动我的 Mac？',
          a: '除非你允许，否则不会。默认模式下，Agent 会自行完成读取类操作，但在修改文件、执行命令或操作应用前都会先问你，文件访问也只限于你授权的文件夹。你也可以把某个对话切换成「每步都问」，或在放心的任务里切换成「全自动」。',
        },
        {
          q: 'Typeflux 能替代 Raycast 或 Alfred 吗？',
          a: '对很多人来说可以。启动器可以打开应用和文件，搜索文件内容、浏览器标签页和书签，通过关键字翻译、计算、运行命令、查看日历，还能导入 Alfred 工作流。你也可以和它们同时使用。',
        },
        {
          q: 'Typeflux 是免费的吗？',
          a: '是的。Typeflux 基于 AGPL-3.0 协议开源免费，所有功能都无需付费即可使用。使用本地模型或你自己的 API Key 也不会产生额外费用。',
        },
        {
          q: 'Typeflux 能在哪些应用里使用？',
          a: '任何可以输入文字的应用都可以。按住 Fn 键说话，松开后文字会直接输入到当前光标所在的文本框，不需要安装插件或做额外配置。',
        },
        {
          q: '我的语音数据会被上传吗？',
          a: '你可以下载本地语音识别模型，完全离线使用，语音数据不会离开你的 Mac。即使使用云端识别服务，Typeflux 也不会收集、存储或分析你的语音和文字数据。',
        },
        {
          q: '没有网络也能用吗？',
          a: '可以。下载本地模型后，语音输入在离线状态下也能正常工作。',
        },
        {
          q: '支持识别哪些语言？',
          a: '取决于你选择的识别引擎。内置的 Soniox 实时识别引擎支持 60 多种语言，也可以选择阿里云 Paraformer、豆包或本地模型，覆盖中文、英文、日语、韩语等常用语言。',
        },
        {
          q: 'Typeflux 可以作为 Wispr Flow、SuperWhisper 或 Typeless 的免费替代品吗？',
          a: '可以。Typeflux 解决的是同一个核心问题——macOS 系统级 AI 语音输入与听写——并且免费开源。本地模型没有字数上限或每周配额。',
        },
        {
          q: 'Typeflux 和 Typeless 是同一个产品吗？',
          a: '不是。Typeless 是另一款名称相近、由不同团队开发的产品。Typeflux 是免费开源的 macOS 语音输入工具，本网站和 github.com/mylxsw/typeflux 仓库是唯一官方渠道。',
        },
        {
          q: 'Typeflux 使用 Whisper 吗？',
          a: '是的。你可以通过 WhisperKit（Apple CoreML）在 Mac 本地运行 OpenAI Whisper 模型（medium 与 large-v3），也可以选用 SenseVoice、Qwen3-ASR、FunASR 等本地模型；如果愿意，也可以使用云端识别引擎。',
        },
        {
          q: 'Typeflux 有 iPhone 版吗？',
          a: 'iPhone 版正在筹备中，即将上线。届时你可以在 iPhone 上继续对话、用语音输入，并使用 Typeflux Cloud 或你自己的模型。',
        },
      ],
    },
  },
  'zh-TW': {
    nav: {
      product: '產品',
      agent: 'AI Agent',
      launcher: '啟動器',
      voice: '語音輸入',
      capture: '截圖錄影',
      clipboard: '剪貼簿',
      ring: '圓環',
      custom: '自訂',
      privacy: '隱私',
      blog: '部落格',
      github: 'GitHub',
      download: '免費下載',
    },
    releases: {
      eyebrow: 'Release Notes',
      title: '版本發布歷史',
      summary: '這裡會依照時間倒序顯示 Typeflux 的所有版本發布記錄。你只需要在 src/content/releases 目錄中新增一個 Markdown 檔案，頁面就會自動更新。',
      download: '下載版本',
      latestDownload: '下載',
      appleSiliconDownload: '下載 Mac 版（Apple 晶片）',
      intelDownload: '下載 Mac 版（Intel 晶片）',
      downloadCN: '中國大陸下載',
      downloadGlobal: '全球下載',
      latestDownloadLabel: 'Latest Build',
      latestLabel: 'Latest Release',
      keyImprovements: '關鍵改進',
      historyTitle: '版本歷史',
      moreHistory: '查看更多歷史版本',
      latestDatePrefix: '發布時間',
      latestDescription: '這裡優先提供目前最新版本的直接下載入口，下方時間線則用於瀏覽歷次發布記錄與更新說明。',
      highlightLatest: '始終指向最新可用版本',
      highlightTimeline: '依時間倒序瀏覽所有發布記錄',
      highlightMarkdown: '每個版本只需維護一個 Markdown 檔案',
      noVersion: '即將發布',
      emptyTitle: '還沒有發布記錄',
      emptyDescription: '將 Markdown 檔案放入 src/content/releases 目錄後，這裡會自動顯示。',
    },
    billingPlans: {
      eyebrow: 'Typeflux 方案',
      title: '選擇適合你的方案。',
      loadingTitle: '正在載入方案',
      loadingSummary: '正在安全取得你的 Typeflux 帳戶可用方案。',
      missingTitle: '請從 Typeflux 開啟此頁面',
      missingSummary: '帳單連結缺少安全存取 token。請返回 Typeflux 應用程式，再次選擇「訂閱」。',
      expiredTitle: '帳單連結已過期',
      errorTitle: '暫時無法載入方案',
      errorSummary: '無法取得可用方案，請檢查網路連線後重試。',
      retry: '重試',
      emptyTitle: '暫無可用方案',
      emptySummary: '目前沒有設定可購買的方案，請稍後再查看。',
      billingUnavailable: '帳單功能暫時無法使用。你仍可查看方案，但目前無法付款。',
      recommended: '推薦',
      mostPopular: '最受歡迎',
      currentPlan: '目前方案',
      choosePlan: '選擇{plan}',
      billingInterval: '付費週期',
      choosingPlan: '正在開啟 Stripe…',
      billedYearly: '按年計費',
      billedYearlyDiscount: '按年計費（省 {percent}%）',
      billedMonthly: '按月計費',
      subscribeYearly: '訂閱年繳方案',
      subscribeMonthly: '訂閱月繳方案',
      creditsPerMonth: '每月 {credits} 點數',
      unlimitedCreditsPerMonth: '每月無限點數',
      perMonth: '月',
      perYear: '年',
      freePrice: '免費',
      savePercent: '省下 {percent}%',
      monthlyEquivalent: '相當於每月 {price}',
      catalog: {
        plans: {
          free: { name: '免費版', tagline: '從 Typeflux 開始', description: '適合輕度個人使用' },
          pro: { name: '專業版', tagline: '運用 AI 高效完成更多工作', description: '適合 AI 使用量較高的專業人士' },
        },
        monthlyCredits: '每月 {credits} AI 點數',
        unlimitedCredits: '無限 AI 點數',
      },
      checkoutConflict: '你的帳戶已有生效中的訂閱。請在 Typeflux 中重新整理帳單狀態。',
      checkoutFailed: '無法開啟 Stripe Checkout，請重試。',
      checkoutPending: '上一次 Checkout 仍在確認中，已為你保留目前的選擇。請幾分鐘後重試；如持續出現，請聯絡客服。',
      checkoutReconciliation: '你的帳戶帳單設定需要客服核對，切換方案無法解決，請聯絡客服。',
    },
    cookie: {
      bannerLabel: 'Cookie 同意提示',
      eyebrow: '隱私選項',
      title: '選擇 Cookie 設定',
      message: '我們使用 Cookie 與類似的本地儲存技術來維持網站運作、記住偏好設定，並了解站點的整體使用情況。',
      learnMore: '在隱私政策中了解更多',
      accept: '全部接受',
      reject: '拒絕非必要 Cookie',
    },
    footer: {
      desc: '開源免費的 Mac AI 效率工具',
      product: '產品',
      agent: 'AI Agent',
      releases: '版本發布',
      privacy: '隱私保護',
      terms: '服務條款',
      resources: '資源',
      profileLinks: '專案基本資訊及相關連結',
      authorGithub: 'GitHub',
      aboutMe: '關於我',
      wechat: '微信公眾號',
      wechatModalTitle: '微信公眾號',
      wechatQrAlt: '微信公眾號二維碼',
      close: '關閉',
      download: '下載',
      feedback: '反饋',
      privacyPolicy: '隱私政策',
      copyright: '© 2026 Typeflux. 開源專案，使用 AGPL-3.0 授權條款。',
    },
    seo: {
      home: {
        title: 'Typeflux — Mac 上的 AI 語音輸入、Agent 與啟動器',
        description:
          '按住 Fn 在任何 App 中語音輸入；向看得到螢幕、經你核准再動手的 AI Agent 提問；用關鍵字啟動一切；在滑鼠處彈出操作圓環。開源免費，可完全在本機執行。',
      },
      releases: {
        title: 'Typeflux 版本發布 — 下載最新 macOS 版本',
        description:
          '下載 Typeflux 最新 macOS 版本（支援 Apple 晶片與 Intel），並查看歷次版本更新記錄與變更說明。',
      },
      privacy: {
        title: '隱私政策 — Typeflux',
        description:
          '了解 Typeflux 如何處理你的資料：本地優先的語音處理，不留存語音資料，程式碼完全開源可稽核。',
      },
      terms: {
        title: '服務條款 — Typeflux',
        description: '使用 Typeflux 網站與 macOS 應用程式前請閱讀的服務條款。',
      },
      billing: {
        title: 'Typeflux 帳單',
        description: '管理你的 Typeflux 訂閱與方案。',
      },
      blog: {
        title: 'Typeflux 部落格 — 語音輸入指南與技巧',
        description: '關於語音輸入、本地語音模型與 Typeflux 使用技巧的指南和隨筆。',
      },
    },
    blog: {
      indexTitle: '部落格',
      indexSubtitle: '語音輸入指南與 Typeflux 使用隨筆。',
      readMore: '閱讀全文',
      backToBlog: '返回文章列表',
      emptyTitle: '暫無文章',
      emptyDescription: '內容正在準備中，稍後再來看看。',
    },
    faq: {
      title: '常見問題',
      subtitle: '關於 Typeflux，你想知道的都在這裡。',
      items: [
        {
          q: 'Typeflux 是什麼？',
          a: 'Typeflux 是一款 macOS 上的 AI 效率工具，有四個入口：按住 Fn 在任何 App 裡語音輸入；在啟動器裡向 AI Agent 提問；在啟動器裡搜尋、執行關鍵字和工作流程；在滑鼠處打開操作圓環。另外還有截圖、螢幕錄影、剪貼簿紀錄、翻譯和筆記本等工具。',
        },
        {
          q: 'AI Agent 會不會未經允許就改動我的 Mac？',
          a: '除非你允許，否則不會。預設模式下，Agent 會自行完成讀取類操作，但在修改檔案、執行指令或操作 App 前都會先問你，檔案存取也只限於你授權的資料夾。你也可以把某個對話切換成「每步都問」，或在放心的任務裡切換成「全自動」。',
        },
        {
          q: 'Typeflux 能取代 Raycast 或 Alfred 嗎？',
          a: '對很多人來說可以。啟動器可以開啟 App 和檔案，搜尋檔案內容、瀏覽器分頁和書籤，透過關鍵字翻譯、計算、執行指令、查看行事曆，還能匯入 Alfred 工作流程。你也可以和它們同時使用。',
        },
        {
          q: 'Typeflux 是免費的嗎？',
          a: '是的。Typeflux 以 AGPL-3.0 授權開源免費，所有功能都不需付費即可使用。使用本機模型或你自己的 API Key 也不會產生額外費用。',
        },
        {
          q: 'Typeflux 能在哪些應用程式裡使用？',
          a: '任何可以輸入文字的應用程式都可以。按住 Fn 鍵說話，鬆開後文字會直接輸入到目前游標所在的文字框，不需要安裝外掛或做額外設定。',
        },
        {
          q: '我的語音資料會被上傳嗎？',
          a: '你可以下載本地語音識別模型，完全離線使用，語音資料不會離開你的 Mac。即使使用雲端識別服務，Typeflux 也不會收集、儲存或分析你的語音和文字資料。',
        },
        {
          q: '沒有網路也能用嗎？',
          a: '可以。下載本地模型後，語音輸入在離線狀態下也能正常運作。',
        },
        {
          q: '支援識別哪些語言？',
          a: '取決於你選擇的識別引擎。內建的 Soniox 即時識別引擎支援 60 多種語言，也可以選擇阿里雲 Paraformer、豆包或本地模型，涵蓋中文、英文、日語、韓語等常用語言。',
        },
        {
          q: 'Typeflux 可以作為 Wispr Flow、SuperWhisper 或 Typeless 的免費替代品嗎？',
          a: '可以。Typeflux 解決的是同一個核心問題——macOS 系統級 AI 語音輸入與聽寫——並且免費開源。本機模型沒有字數上限或每週配額。',
        },
        {
          q: 'Typeflux 和 Typeless 是同一個產品嗎？',
          a: '不是。Typeless 是另一款名稱相近、由不同團隊開發的產品。Typeflux 是免費開源的 macOS 語音輸入工具，本網站和 github.com/mylxsw/typeflux 儲存庫是唯一官方管道。',
        },
        {
          q: 'Typeflux 使用 Whisper 嗎？',
          a: '是的。你可以透過 WhisperKit（Apple CoreML）在 Mac 本地執行 OpenAI Whisper 模型（medium 與 large-v3），也可以選用 SenseVoice、Qwen3-ASR、FunASR 等本地模型；如果願意，也可以使用雲端識別引擎。',
        },
        {
          q: 'Typeflux 有 iPhone 版嗎？',
          a: 'iPhone 版正在籌備中，即將推出。屆時你可以在 iPhone 上繼續對話、用語音輸入，並使用 Typeflux Cloud 或你自己的模型。',
        },
      ],
    },
  },
  ja: {
    nav: {
      product: '製品',
      agent: 'AI エージェント',
      launcher: 'ランチャー',
      voice: '音声入力',
      capture: 'スクリーンショット',
      clipboard: 'クリップボード',
      ring: 'リング',
      custom: 'カスタマイズ',
      privacy: 'プライバシー',
      blog: 'ブログ',
      github: 'GitHub',
      download: '無料ダウンロード',
    },
    releases: {
      eyebrow: 'Release Notes',
      title: 'リリース履歴',
      summary: 'Typeflux の公開済みリリースを新しい順に一覧できます。src/content/releases に Markdown ファイルを 1 つ追加するだけで、このページに自動反映されます。',
      download: 'ダウンロード',
      latestDownload: 'ダウンロード',
      appleSiliconDownload: 'Mac 版をダウンロード（Apple チップ）',
      intelDownload: 'Mac 版をダウンロード（Intel チップ）',
      downloadCN: '中国本土版をダウンロード',
      downloadGlobal: 'グローバル版をダウンロード',
      latestDownloadLabel: 'Latest Build',
      latestLabel: 'Latest Release',
      keyImprovements: '主な改善点',
      historyTitle: 'バージョン履歴',
      moreHistory: '過去のバージョンを見る',
      latestDatePrefix: '公開日',
      latestDescription: 'ここでは最新公開版への直接ダウンロードを優先して表示し、下のタイムラインで過去のリリース履歴と更新内容を確認できます。',
      highlightLatest: '常に最新ビルドへリンク',
      highlightTimeline: '新しい順のリリースタイムライン',
      highlightMarkdown: '各バージョンを Markdown 1 ファイルで管理',
      noVersion: '近日公開',
      emptyTitle: 'リリースはまだありません',
      emptyDescription: 'Markdown ファイルを src/content/releases に追加すると、ここに自動表示されます。',
    },
    billingPlans: {
      eyebrow: 'Typeflux プラン',
      title: 'あなたに合うプランを。',
      loadingTitle: 'プランを読み込んでいます',
      loadingSummary: 'Typeflux アカウントで利用できるプランを安全に取得しています。',
      missingTitle: 'Typeflux からこのページを開いてください',
      missingSummary: '請求リンクに安全なアクセストークンがありません。Typeflux に戻り、もう一度「購読」を選択してください。',
      expiredTitle: '請求リンクの有効期限が切れました',
      errorTitle: 'プランを一時的に読み込めません',
      errorSummary: '利用可能なプランを取得できませんでした。接続を確認して再度お試しください。',
      retry: '再試行',
      emptyTitle: '利用可能なプランがありません',
      emptySummary: '現在購入できるプランは設定されていません。しばらくしてからご確認ください。',
      billingUnavailable: '請求機能は一時的に利用できません。プランは確認できますが、お支払いは無効です。',
      recommended: 'おすすめ',
      mostPopular: '一番人気',
      currentPlan: '現在のプラン',
      choosePlan: '{plan}を選択',
      billingInterval: '請求期間',
      choosingPlan: 'Stripe を開いています…',
      billedYearly: '年払い',
      billedYearlyDiscount: '年払い（{percent}%お得）',
      billedMonthly: '月払い',
      subscribeYearly: '年間プランを購読',
      subscribeMonthly: '月間プランを購読',
      creditsPerMonth: '月 {credits} クレジット',
      unlimitedCreditsPerMonth: '月あたり無制限のクレジット',
      perMonth: '月',
      perYear: '年',
      freePrice: '無料',
      savePercent: '{percent}% お得',
      monthlyEquivalent: '月あたり {price} 相当',
      catalog: {
        plans: {
          free: { name: '無料', tagline: 'Typeflux を気軽に始める', description: '軽めの個人利用に適しています' },
          pro: { name: 'Pro', tagline: 'AI でより多くの仕事を効率よく', description: 'AI をより多く活用するプロ向けです' },
        },
        monthlyCredits: '毎月 {credits} AI クレジット',
        unlimitedCredits: '無制限の AI クレジット',
      },
      checkoutConflict: 'このアカウントには有効なサブスクリプションがあります。Typeflux で請求状態を更新してください。',
      checkoutFailed: 'Stripe Checkout を開けませんでした。もう一度お試しください。',
      checkoutPending: '前回のチェックアウトを確認中です。選択内容は保持されています。数分後にもう一度お試しください。解決しない場合はサポートにお問い合わせください。',
      checkoutReconciliation: 'アカウントの請求設定にサポートによる確認が必要です。プランを変更しても解決しません。サポートにお問い合わせください。',
    },
    cookie: {
      bannerLabel: 'Cookie 同意のお知らせ',
      eyebrow: 'プライバシー設定',
      title: 'Cookie を選択してください',
      message: '当サイトでは、サイトの動作維持、設定の記憶、利用状況の把握のために Cookie と類似の保存技術を使用しています。',
      learnMore: 'プライバシーポリシーを見る',
      accept: 'すべて許可',
      reject: '必須以外を拒否',
    },
    footer: {
      desc: 'Mac のためのオープンソース AI レイヤー',
      product: '製品',
      agent: 'AI エージェント',
      releases: 'リリース',
      privacy: 'プライバシー保護',
      terms: '利用規約',
      resources: 'リソース',
      profileLinks: 'プロジェクト情報と関連リンク',
      authorGithub: 'GitHub',
      aboutMe: 'About Me',
      wechat: 'WeChat公式アカウント',
      wechatModalTitle: 'WeChat公式アカウント',
      wechatQrAlt: 'WeChat公式アカウントのQRコード',
      close: '閉じる',
      download: 'ダウンロード',
      feedback: 'フィードバック',
      privacyPolicy: 'プライバシーポリシー',
      copyright: '© 2026 Typeflux. AGPL-3.0ライセンスのオープンソースプロジェクト。',
    },
    seo: {
      home: {
        title: 'Typeflux — Mac 向け AI 音声入力・エージェント・ランチャー',
        description:
          'Fn を押したまま話せばどのアプリにも入力。画面を理解し承認後に動く AI エージェント、キーワードで何でも起動できるランチャー、ポインタの位置に開くアクションリング。無料・オープンソースで、完全にオンデバイスでも動作します。',
      },
      releases: {
        title: 'Typeflux リリース — 最新の macOS 版をダウンロード',
        description:
          'Typeflux の最新 macOS ビルド（Apple チップ・Intel 対応）をダウンロードし、全バージョンの更新履歴を確認できます。',
      },
      privacy: {
        title: 'プライバシーポリシー — Typeflux',
        description:
          'Typeflux のデータの取り扱い：ローカル優先の音声処理、音声データの非保持、完全オープンソースで誰でも監査可能。',
      },
      terms: {
        title: '利用規約 — Typeflux',
        description: 'Typeflux ウェブサイトおよび macOS アプリのご利用に適用される利用規約です。',
      },
      billing: {
        title: 'Typeflux 請求',
        description: 'Typeflux のサブスクリプションとプランを管理します。',
      },
      blog: {
        title: 'Typeflux ブログ — 音声入力ガイドとヒント',
        description: '音声入力、ローカル音声モデル、Typeflux の使い方に関するガイドとノート。',
      },
    },
    blog: {
      indexTitle: 'ブログ',
      indexSubtitle: '音声入力ガイドと Typeflux の活用ノート。',
      readMore: '続きを読む',
      backToBlog: '記事一覧に戻る',
      emptyTitle: '記事はまだありません',
      emptyDescription: 'コンテンツを準備中です。後ほどご覧ください。',
    },
    faq: {
      title: 'よくある質問',
      subtitle: 'Typeflux に関する疑問はこちらで解決できます。',
      items: [
        {
          q: 'Typeflux とは何ですか？',
          a: 'Typeflux は macOS 向けの AI 生産性アプリで、4つの入口があります。Fn を押したままどのアプリにも音声入力、ランチャーから AI エージェントに質問、ランチャーでの検索とキーワード・ワークフローの実行、そしてポインタの位置に開くアクションリング。スクリーンショット、画面録画、クリップボード履歴、翻訳、ノートも備えています。',
        },
        {
          q: 'AI エージェントが勝手に Mac を変更することはありますか？',
          a: 'あなたが許可しない限りありません。標準モードでは、読み取りは自動で行いますが、ファイルの変更、コマンドの実行、アプリの操作の前には確認し、ファイルへのアクセスは許可したフォルダに限られます。会話ごとに「毎回確認」や、安心して任せられる作業向けの「全自動」に切り替えることもできます。',
        },
        {
          q: 'Typeflux は Raycast や Alfred の代わりになりますか？',
          a: '多くの人にとってはなります。ランチャーでアプリやファイルを開き、ファイルの中身、ブラウザのタブ、ブックマークを検索し、キーワードで翻訳、計算、コマンド実行、カレンダー表示ができ、Alfred のワークフローも取り込めます。併用もできます。',
        },
        {
          q: 'Typeflux は無料で使えますか？',
          a: 'はい。Typeflux は AGPL-3.0 ライセンスの無料オープンソースで、すべての機能を無料で使えます。ローカルモデルや自分の API キーを使う場合も追加料金はかかりません。',
        },
        {
          q: 'どのアプリで使えますか？',
          a: '文字を入力できるすべてのアプリで使えます。Fn キーを押して話すだけで、認識されたテキストがアクティブなテキスト欄に直接入力されます。プラグインや連携設定は不要です。',
        },
        {
          q: '音声データはアップロードされますか？',
          a: 'ローカル音声認識モデルを使えば完全にオフラインで動作し、音声が Mac の外に出ることはありません。クラウド認識サービスを利用する場合も、Typeflux が音声やテキストデータを収集・保存・分析することはありません。',
        },
        {
          q: 'オフラインでも使えますか？',
          a: 'はい。ローカルモデルをダウンロードすれば、インターネット接続がなくても音声入力を使えます。',
        },
        {
          q: 'どの言語を認識できますか？',
          a: '選択する認識エンジンによって異なります。内蔵の Soniox リアルタイム認識エンジンは 60 以上の言語に対応しているほか、Alibaba Cloud Paraformer、Doubao、ローカルモデルも選択でき、中国語・英語・日本語・韓国語などをカバーします。',
        },
        {
          q: 'Typeflux は Wispr Flow、SuperWhisper、Typeless の無料代替として使えますか？',
          a: 'はい。Typeflux は macOS のシステム全体で使える AI 音声入力・ディクテーションという同じ課題を解決し、無料・オープンソースです。ローカルモデルに文字数制限や週ごとのクォータはありません。',
        },
        {
          q: 'Typeflux と Typeless は同じアプリですか？',
          a: 'いいえ。Typeless は名前が似ている別チームの製品です。Typeflux は無料・オープンソースの macOS 音声入力ツールで、本サイトと github.com/mylxsw/typeflux リポジトリが唯一の公式窓口です。',
        },
        {
          q: 'Typeflux は Whisper を使っていますか？',
          a: 'はい。WhisperKit（Apple CoreML）経由で OpenAI Whisper モデル（medium・large-v3）を Mac 上でローカル実行でき、SenseVoice、Qwen3-ASR、FunASR などのローカルモデルも選択可能です。クラウド認識エンジンも利用できます。',
        },
        {
          q: 'iPhone アプリはありますか？',
          a: 'iPhone 版は現在準備中で、近日公開予定です。iPhone で会話の続きをしたり、音声で入力したり、Typeflux Cloud や自分のモデルを使ったりできるようになります。',
        },
      ],
    },
  },
  ko: {
    nav: {
      product: '제품',
      agent: 'AI 에이전트',
      launcher: '런처',
      voice: '음성 입력',
      capture: '스크린샷',
      clipboard: '클립보드',
      ring: '링',
      custom: '나만의 설정',
      privacy: '개인정보',
      blog: '블로그',
      github: 'GitHub',
      download: '무료 다운로드',
    },
    releases: {
      eyebrow: 'Release Notes',
      title: '버전 출시 기록',
      summary: 'Typeflux의 모든 릴리스를 최신순으로 볼 수 있습니다. src/content/releases 폴더에 릴리스별 Markdown 파일만 추가하면 이 페이지가 자동으로 갱신됩니다.',
      download: '다운로드',
      latestDownload: '다운로드',
      appleSiliconDownload: 'Mac용 다운로드(Apple 칩)',
      intelDownload: 'Mac용 다운로드(Intel 칩)',
      downloadCN: '중국 본토 버전',
      downloadGlobal: '글로벌 버전',
      latestDownloadLabel: 'Latest Build',
      latestLabel: 'Latest Release',
      keyImprovements: '핵심 개선 사항',
      historyTitle: '버전 기록',
      moreHistory: '이전 버전 더 보기',
      latestDatePrefix: '출시일',
      latestDescription: '이 영역은 현재 최신 버전의 직접 다운로드를 우선 보여주고, 아래 타임라인에서는 이전 릴리스와 변경 사항을 확인할 수 있습니다.',
      highlightLatest: '항상 최신 빌드로 연결',
      highlightTimeline: '최신순 릴리스 타임라인',
      highlightMarkdown: '버전마다 Markdown 파일 하나로 관리',
      noVersion: '곧 출시',
      emptyTitle: '아직 릴리스가 없습니다',
      emptyDescription: 'Markdown 파일을 src/content/releases 폴더에 추가하면 여기에 자동으로 표시됩니다.',
    },
    billingPlans: {
      eyebrow: 'Typeflux 요금제',
      title: '나에게 맞는 요금제를 선택하세요.',
      loadingTitle: '요금제를 불러오는 중입니다',
      loadingSummary: 'Typeflux 계정에서 이용할 수 있는 요금제를 안전하게 가져오고 있습니다.',
      missingTitle: 'Typeflux에서 이 페이지를 열어 주세요',
      missingSummary: '결제 링크에 보안 액세스 토큰이 없습니다. Typeflux 앱으로 돌아가 다시 구독을 선택해 주세요.',
      expiredTitle: '결제 링크가 만료되었습니다',
      errorTitle: '요금제를 일시적으로 불러올 수 없습니다',
      errorSummary: '이용 가능한 요금제를 가져오지 못했습니다. 연결을 확인하고 다시 시도해 주세요.',
      retry: '다시 시도',
      emptyTitle: '이용 가능한 요금제가 없습니다',
      emptySummary: '현재 구매할 수 있도록 설정된 요금제가 없습니다. 나중에 다시 확인해 주세요.',
      billingUnavailable: '결제 기능을 일시적으로 사용할 수 없습니다. 요금제는 확인할 수 있지만 결제는 비활성화됩니다.',
      recommended: '추천',
      mostPopular: '가장 인기 있음',
      currentPlan: '현재 요금제',
      choosePlan: '{plan} 선택',
      billingInterval: '결제 주기',
      choosingPlan: 'Stripe 여는 중…',
      billedYearly: '연간 결제',
      billedYearlyDiscount: '연간 결제 ({percent}% 할인)',
      billedMonthly: '월간 결제',
      subscribeYearly: '연간 구독',
      subscribeMonthly: '월간 구독',
      creditsPerMonth: '월 {credits} 크레딧',
      unlimitedCreditsPerMonth: '월 무제한 크레딧',
      perMonth: '월',
      perYear: '년',
      freePrice: '무료',
      savePercent: '{percent}% 절약',
      monthlyEquivalent: '월 {price} 상당',
      catalog: {
        plans: {
          free: { name: '무료', tagline: 'Typeflux를 부담 없이 시작하세요', description: '가벼운 개인 사용에 적합합니다' },
          pro: { name: '프로', tagline: 'AI로 더 많은 작업을 효율적으로', description: 'AI 사용량이 많은 전문가에게 적합합니다' },
        },
        monthlyCredits: '매월 {credits} AI 크레딧',
        unlimitedCredits: '무제한 AI 크레딧',
      },
      checkoutConflict: '계정에 이미 활성 구독이 있습니다. Typeflux에서 결제 상태를 새로고침해 주세요.',
      checkoutFailed: 'Stripe Checkout을 열 수 없습니다. 다시 시도해 주세요.',
      checkoutPending: '이전 결제를 아직 확인하고 있습니다. 선택은 유지됩니다. 몇 분 후 다시 시도하고, 계속되면 고객 지원에 문의해 주세요.',
      checkoutReconciliation: '계정의 결제 설정은 고객 지원팀의 확인이 필요합니다. 요금제를 바꿔도 해결되지 않으니 고객 지원에 문의해 주세요.',
    },
    cookie: {
      bannerLabel: '쿠키 동의 안내',
      eyebrow: '개인정보 선택',
      title: '쿠키 설정을 선택해 주세요',
      message: '저희는 사이트 운영, 환경설정 저장, 전체적인 사이트 사용 현황 파악을 위해 쿠키 및 유사한 저장 기술을 사용합니다.',
      learnMore: '개인정보 처리방침에서 자세히 보기',
      accept: '모두 허용',
      reject: '필수 외 쿠키 거부',
    },
    footer: {
      desc: 'Mac을 위한 오픈 소스 AI 레이어',
      product: '제품',
      agent: 'AI 에이전트',
      releases: '릴리스',
      privacy: '개인정보 보호',
      terms: '이용약관',
      resources: '리소스',
      profileLinks: '프로젝트 정보 및 관련 링크',
      authorGithub: 'GitHub',
      aboutMe: 'About Me',
      wechat: '위챗 공식 계정',
      wechatModalTitle: '위챗 공식 계정',
      wechatQrAlt: '위챗 공식 계정 QR 코드',
      close: '닫기',
      download: '다운로드',
      feedback: '피드백',
      privacyPolicy: '개인정보 처리방침',
      copyright: '© 2026 Typeflux. AGPL-3.0 라이선스의 오픈소스 프로젝트입니다.',
    },
    seo: {
      home: {
        title: 'Typeflux — Mac용 AI 음성 입력, 에이전트, 런처',
        description:
          'Fn을 누른 채 말하면 어떤 앱에든 입력됩니다. 화면을 이해하고 승인 후 작업하는 AI 에이전트, 키워드로 무엇이든 실행하는 런처, 포인터 위치의 액션 링까지. 무료 오픈 소스이며 기기 안에서만 실행할 수도 있습니다.',
      },
      releases: {
        title: 'Typeflux 릴리스 — 최신 macOS 버전 다운로드',
        description:
          'Typeflux 최신 macOS 빌드(Apple 칩·Intel 지원)를 다운로드하고 모든 버전의 변경 내역을 확인하세요.',
      },
      privacy: {
        title: '개인정보 처리방침 — Typeflux',
        description:
          'Typeflux의 데이터 처리 방식: 로컬 우선 음성 처리, 음성 데이터 미보관, 누구나 감사할 수 있는 완전한 오픈소스.',
      },
      terms: {
        title: '이용약관 — Typeflux',
        description: 'Typeflux 웹사이트와 macOS 앱 사용에 적용되는 이용약관입니다.',
      },
      billing: {
        title: 'Typeflux 결제',
        description: 'Typeflux 구독과 요금제를 관리합니다.',
      },
      blog: {
        title: 'Typeflux 블로그 — 음성 입력 가이드와 팁',
        description: '음성 입력, 로컬 음성 모델, Typeflux 활용법에 관한 가이드와 노트.',
      },
    },
    blog: {
      indexTitle: '블로그',
      indexSubtitle: '음성 입력 가이드와 Typeflux 활용 노트.',
      readMore: '더 읽기',
      backToBlog: '글 목록으로 돌아가기',
      emptyTitle: '아직 게시물이 없습니다',
      emptyDescription: '콘텐츠를 준비 중입니다. 나중에 다시 확인해 주세요.',
    },
    faq: {
      title: '자주 묻는 질문',
      subtitle: 'Typeflux에 대해 궁금한 점을 여기에서 확인하세요.',
      items: [
        {
          q: 'Typeflux는 무엇인가요?',
          a: 'Typeflux는 네 가지 입구를 가진 macOS용 AI 생산성 앱입니다. Fn을 누른 채 어떤 앱에든 음성 입력하고, 런처에서 AI 에이전트에게 묻고, 런처에서 검색하고 키워드와 워크플로를 실행하며, 포인터 위치에서 액션 링을 엽니다. 스크린샷, 화면 녹화, 클립보드 기록, 번역, 노트도 들어 있습니다.',
        },
        {
          q: 'AI 에이전트가 허락 없이 Mac을 바꾸나요?',
          a: '허락하지 않는 한 그렇지 않습니다. 기본 모드에서 에이전트는 읽기는 알아서 하지만, 파일을 바꾸거나 명령을 실행하거나 앱을 조작하기 전에는 먼저 묻고, 파일 접근은 허용한 폴더로 제한됩니다. 대화마다 \'매번 확인\'이나, 믿고 맡기는 작업을 위한 \'완전 자동\'으로 바꿀 수도 있습니다.',
        },
        {
          q: 'Typeflux가 Raycast나 Alfred를 대신할 수 있나요?',
          a: '많은 분들에게는 그렇습니다. 런처로 앱과 파일을 열고, 파일 내용, 브라우저 탭, 북마크를 검색하며, 키워드로 번역, 계산, 명령 실행, 달력 확인을 하고, Alfred 워크플로도 가져올 수 있습니다. 함께 사용해도 됩니다.',
        },
        {
          q: 'Typeflux는 무료인가요?',
          a: '네. Typeflux는 AGPL-3.0 라이선스의 무료 오픈 소스이며 모든 기능을 무료로 쓸 수 있습니다. 로컬 모델이나 내 API 키를 사용해도 추가 비용이 없습니다.',
        },
        {
          q: '어떤 앱에서 사용할 수 있나요?',
          a: '텍스트를 입력할 수 있는 모든 앱에서 사용할 수 있습니다. Fn 키를 누르고 말하면 인식된 텍스트가 활성 텍스트 필드에 바로 입력됩니다. 플러그인이나 별도 설정이 필요 없습니다.',
        },
        {
          q: '제 음성 데이터가 업로드되나요?',
          a: '로컬 음성 인식 모델을 사용하면 완전히 오프라인으로 동작해 음성이 Mac 밖으로 나가지 않습니다. 클라우드 인식 서비스를 이용하더라도 Typeflux는 음성이나 텍스트 데이터를 수집·저장·분석하지 않습니다.',
        },
        {
          q: '오프라인에서도 사용할 수 있나요?',
          a: '네. 로컬 모델을 다운로드해 두면 인터넷 연결 없이도 음성 입력을 사용할 수 있습니다.',
        },
        {
          q: '어떤 언어를 인식할 수 있나요?',
          a: '선택한 인식 엔진에 따라 다릅니다. 내장된 Soniox 실시간 인식 엔진은 60개 이상의 언어를 지원하며, Alibaba Cloud Paraformer, Doubao 또는 로컬 모델을 사용해 중국어, 영어, 일본어, 한국어 등을 인식할 수 있습니다.',
        },
        {
          q: 'Typeflux가 Wispr Flow, SuperWhisper, Typeless의 무료 대안이 될 수 있나요?',
          a: '네. Typeflux는 macOS 시스템 전반의 AI 음성 입력·받아쓰기라는 같은 핵심 문제를 해결하며 무료·오픈소스입니다. 로컬 모델에는 글자 수 제한이나 주간 쿼터가 없습니다.',
        },
        {
          q: 'Typeflux와 Typeless는 같은 앱인가요?',
          a: '아니요. Typeless는 이름이 비슷한 다른 팀의 제품입니다. Typeflux는 무료 오픈소스 macOS 음성 입력 도구이며, 이 사이트와 github.com/mylxsw/typeflux 저장소가 공식 채널입니다.',
        },
        {
          q: 'Typeflux는 Whisper를 사용하나요?',
          a: '네. WhisperKit(Apple CoreML)을 통해 OpenAI Whisper 모델(medium, large-v3)을 Mac에서 로컬로 실행할 수 있고, SenseVoice, Qwen3-ASR, FunASR 등의 로컬 모델도 선택할 수 있습니다. 클라우드 인식 엔진도 사용 가능합니다.',
        },
        {
          q: 'iPhone 앱이 있나요?',
          a: 'iPhone용 Typeflux는 현재 준비 중이며 곧 출시됩니다. iPhone에서 대화를 이어 가고, 음성으로 입력하고, Typeflux Cloud나 내 모델을 사용할 수 있게 됩니다.',
        },
      ],
    },
  },
}

const I18nContext = createContext()

const STORAGE_KEY = 'typeflux-language'

// The URL path prefix (`/zh-CN/...`) is the single source of truth for the
// active language, so server-rendered markup always matches the first client
// render. Saved/browser preferences only trigger a one-time redirect from the
// unprefixed English URLs to the preferred language's URL.
function detectPreferredLang() {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved && translations[saved]) return saved
  const browserLang = navigator.language || ''
  if (translations[browserLang]) return browserLang
  if (browserLang.startsWith('zh')) return 'zh-CN'
  return DEFAULT_LANG
}

function hasLangPrefix(pathname) {
  const lower = pathname.toLowerCase()
  return LANG_CODES.some(
    (code) => code !== DEFAULT_LANG && (lower === `/${code.toLowerCase()}` || lower.startsWith(`/${code.toLowerCase()}/`)),
  )
}

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const pathname = getPathname()
    return isAuthRoute(pathname) && !hasLangPrefix(pathname) ? detectPreferredLang() : parsePath(pathname).lang
  })
  const isReady = true

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  useEffect(() => {
    const pathname = window.location.pathname
    if (hasLangPrefix(pathname)) return
    const preferred = detectPreferredLang()
    if (preferred !== DEFAULT_LANG) {
      const { route } = parsePath(pathname)
      if (isAuthRoute(route)) {
        window.history.replaceState(null, '', localizedPath(preferred, route))
        return
      }
      window.location.replace(`${localizedPath(preferred, route)}${window.location.search}${window.location.hash}`)
    }
  }, [])

  const setLanguage = useCallback((newLang) => {
    if (!translations[newLang]) return
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang)
      const { lang: current, route } = parsePath(window.location.pathname)
      if (isAuthRoute(route)) {
        window.history.replaceState(null, '', localizedPath(newLang, route))
        setLang(newLang)
        return
      }
      if (newLang !== current) {
        window.location.assign(`${localizedPath(newLang, route)}${window.location.hash}`)
        return
      }
    }
    setLang(newLang)
    document.documentElement.lang = newLang
  }, [])

  const t = useCallback(
    (key) => {
      const keys = key.split('.')
      let value = translations[lang]
      for (const k of keys) {
        if (value && typeof value === 'object') {
          value = value[k]
        } else {
          return key
        }
      }
      return value || key
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLanguage, t, languages, isReady }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}

// Pure accessor for code that runs outside React (e.g. the prerenderer).
export function getSeoCopy(lang, page) {
  const table = translations[lang] || translations[DEFAULT_LANG]
  const fallback = translations[DEFAULT_LANG].seo[page]
  return table.seo?.[page] || fallback
}

// Remembers the visitor's language choice. Language links are plain <a href>
// navigations (crawler-friendly); this just stores the preference alongside.
export function saveLanguagePreference(lang) {
  if (typeof window !== 'undefined' && translations[lang]) {
    localStorage.setItem(STORAGE_KEY, lang)
  }
}

// FAQ items for one language, used by the visible FAQ section and the FAQPage
// structured data. Falls back to English for languages without translations.
export function getFaqItems(lang) {
  const table = translations[lang] || translations[DEFAULT_LANG]
  return table.faq?.items || translations[DEFAULT_LANG].faq.items
}
