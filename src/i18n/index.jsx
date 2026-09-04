/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEFAULT_LANG, LANG_CODES, localizedPath, parsePath } from '../lib/localePath'
import { getPathname } from '../lib/serverContext'

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
    // Header
    nav: {
      features: 'Features',
      agent: 'Agent',
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
    // Hero
    hero: {
      title1: 'Talk. ',
      title2: 'We\'ll Type.',
      subtitle: 'Press Fn and speak naturally. Typeflux delivers lightning-fast, accurate voice-to-text directly into any application. Best of all, it\'s free, open-source, and supports local models.',
      downloadBtn: 'Download Free',
      sourceBtn: 'View Source',
    },
    // Features
    features: {
      title: 'Press Fn, Start Speaking',
      subtitle: 'Simple key trigger, natural voice input. Typeflux works wherever you need to type.',
      card1Title: 'One-Click Voice Input',
      card1Desc: 'Hold the Fn key to start voice input, release to stop. No need to switch input methods or click buttons—it works seamlessly in any text field.',
      localModel: 'Local Model Support',
      localModelDesc: 'Supports local speech recognition models. It\'s fast, accurate, requires no internet connection, and ensures your privacy is fully protected.',
      persona: 'Persona Customization',
      personaDesc: 'Create different personas optimized for work, study, and social scenarios, tailoring speech recognition to fit your exact context.',
      minimal: 'Minimal Design',
      minimalDesc: 'Clean interface design that doesn\'t interrupt your workflow. Quietly stays in the menu bar, ready with one click.',
    },
    // Agent
    agent: {
      badge: 'Ask Anything',
      title: 'More Than Just Input,\nYour AI Assistant',
      subtitle: 'Press Fn twice to activate "Ask Anything". Talk to the AI Agent via voice for Q&A, content rewriting, and handling complex operations.',
      feature1Title: 'Voice Q&A',
      feature1Desc: 'Ask questions directly by voice, get instant answers',
      feature2Title: 'Content Rewrite',
      feature2Desc: 'Select text and use voice commands to rewrite, translate, or summarize it',
      feature3Title: 'Complex Operations',
      feature3Desc: 'Complete complex workflows through natural language',
      chatHint: 'Fn x2',
      agentLabel: 'Typeflux Agent',
      userExample: 'Could you translate this into English and make it sound more formal?',
      agentResponse: 'Sure thing! Here is the translation with a more formal tone:',
    },
    // Personas
    personas: {
      title: 'Custom Personas for Every Scenario',
      subtitle: 'Optimize for different scenarios by creating different personas. Stay professional at work, relaxed in social settings.',
      work: 'Work',
      workDesc: 'Professional terminology recognition, formal writing style, suitable for emails, reports, and documents.',
      study: 'Study',
      studyDesc: 'Enhanced academic vocabulary recognition, supports note-taking, suitable for classes and reading.',
      social: 'Social',
      socialDesc: 'Colloquial expressions, relaxed and natural tone, suitable for chatting and social media.',
      custom: 'Custom',
      customDesc: 'Fully customizable persona parameters, create an exclusive input experience based on your unique needs.',
    },
    // Privacy
    privacy: {
      title: 'Privacy First',
      subtitle: 'Your voice data belongs only to you.',
      local: 'Local Processing',
      localDesc: 'Supports local speech recognition models, voice data never uploaded to the cloud.',
      noData: 'No Data Retention',
      noDataDesc: 'We don\'t collect, store, or analyze any of your voice or text data.',
      openSource: 'Open Source Transparency',
      openSourceDesc: 'Fully open source code, anyone can audit to ensure no backdoors.',
    },
    // Open Source
    opensource: {
      title: 'Open Source & Free, Built for the Community',
      desc: 'Typeflux is a completely open source project. We believe great tools should belong to everyone. Welcome to contribute and make voice input better together.',
      githubBtn: 'View on GitHub',
      downloadBtn: 'Download Latest',
    },
    // CTA
    cta: {
      title: 'Free Your Hands,\nWrite with Your Voice',
      subtitle: 'Typeflux makes voice input your most natural way of expression.',
      downloadBtn: 'Download Typeflux Free',
    },
    billingPlans: {
      eyebrow: 'Typeflux plans',
      title: 'Choose the plan that fits you.',
      loadingTitle: 'Loading your plans',
      loadingSummary: 'We are securely retrieving the plans available for your Typeflux account.',
      missingTitle: 'Open this page from Typeflux',
      missingSummary: 'This billing link is missing its secure access token. Return to the Typeflux app and choose Subscribe again.',
      expiredTitle: 'This billing link has expired',
      expiredSummary: 'For your security, billing links are short-lived. Return to Typeflux and request a new one.',
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
      desc: 'Open source free macOS voice assistant',
      product: 'Product',
      features: 'Features',
      agent: 'Ask Anything',
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
        title: 'Typeflux — Free & Open-Source Voice Typing for macOS',
        description:
          'Hold Fn and speak. Typeflux turns your voice into text in any Mac app — fast, accurate, free, open-source, with local models for fully private, offline voice input.',
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
          q: 'Is Typeflux free to use?',
          a: 'Yes. Typeflux is free and open-source under the AGPL-3.0 license. Core voice typing works without any payment; an optional Pro plan is available for heavier AI usage.',
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
      ],
    },
  },
  'zh-CN': {
    nav: {
      features: '功能',
      agent: '随便问',
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
    hero: {
      title1: '你说内容',
      title2: '我来打字',
      subtitle: '按下 Fn 键自然说话，Typeflux 能把极速且精准的语音转文本，直接输入到任何应用中。更棒的是，它免费、开源，并且支持本地模型。',
      downloadBtn: '免费下载',
      sourceBtn: '查看源码',
    },
    features: {
      title: '按下 Fn，开口说话',
      subtitle: '简单的按键触发，自然的语音输入。Typeflux 在任何你需要打字的地方都能工作。',
      card1Title: '一键语音输入',
      card1Desc: '按住 Fn 键即可开始语音输入，松开即停止。无需切换输入法，无需点击按钮，在任何文本框中都能使用。',
      localModel: '本地模型支持',
      localModelDesc: '支持本地语音识别模型，速度快，识别率高，无需联网，完全保护你的隐私数据。',
      persona: '人设定制',
      personaDesc: '创建不同的人设，为工作、学习、社交等场景分别优化，让语音识别更贴合你的使用情境。',
      minimal: '简约设计',
      minimalDesc: '极简的界面设计，不干扰你的工作流程。安静地待在菜单栏，需要时一键唤起。',
    },
    agent: {
      badge: '随便问',
      title: '不只是输入，\n更是你的 AI 助手',
      subtitle: '连按两次 Fn 键，唤起「随便问」功能。通过语音与 AI Agent 对话，实现问答、内容改写和更复杂的操作。',
      feature1Title: '语音问答',
      feature1Desc: '直接开口提问，获取即时回答',
      feature2Title: '内容改写',
      feature2Desc: '选中文本，用语音指令改写、翻译、总结',
      feature3Title: '复杂操作',
      feature3Desc: '通过自然语言完成更复杂的工作流程',
      chatHint: 'Fn x2',
      agentLabel: 'Typeflux Agent',
      userExample: '帮我把这段话翻译成英文，用更正式的语气',
      agentResponse: '好的，我来帮你翻译并调整语气。以下是正式版本：',
    },
    personas: {
      title: '为每个场景定制人设',
      subtitle: '通过创建不同的人设，为不同的使用场景进行优化。在工作中保持专业，在社交中保持轻松。',
      work: '工作',
      workDesc: '专业术语识别优化，正式文风输出，适合撰写邮件、报告和文档。',
      study: '学习',
      studyDesc: '学术词汇增强识别，支持笔记速记，适合课堂与阅读等情境。',
      social: '社交',
      socialDesc: '口语化表达，轻松自然的语气，适合聊天和社交媒体。',
      custom: '自定义',
      customDesc: '完全自定义人设参数，根据你的独特需求打造专属输入体验。',
    },
    privacy: {
      title: '隐私为先',
      subtitle: '你的声音数据，只属于你自己。',
      local: '本地处理',
      localDesc: '支持本地语音识别模型，语音数据无需上传云端。',
      noData: '数据不留存',
      noDataDesc: '不收集、不存储、不分析你的任何语音或文字数据。',
      openSource: '开源透明',
      openSourceDesc: '完全开源的代码，任何人都可以审查，确保没有后门。',
    },
    opensource: {
      title: '开源免费，为社区而生',
      desc: 'Typeflux 是一个完全开源的项目。我们相信，优秀的工具应该属于每一个人。欢迎参与贡献，一起让语音输入变得更好。',
      githubBtn: '在 GitHub 上查看',
      downloadBtn: '下载最新版本',
    },
    cta: {
      title: '释放你的双手，\n用声音书写',
      subtitle: 'Typeflux 让语音输入成为你最自然的表达方式。',
      downloadBtn: '免费下载 Typeflux',
    },
    billingPlans: {
      eyebrow: 'Typeflux 套餐',
      title: '选择适合你的套餐',
      loadingTitle: '正在加载套餐',
      loadingSummary: '正在安全获取你的 Typeflux 账户可用套餐',
      missingTitle: '请从 Typeflux 打开此页面',
      missingSummary: '账单链接缺少安全访问 token。请返回 Typeflux 应用，再次选择「订阅」。',
      expiredTitle: '账单链接已过期',
      expiredSummary: '为保护账户安全，账单链接仅短时有效。请返回 Typeflux 重新获取链接。',
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
      desc: '开源免费的 macOS 语音助手',
      product: '产品',
      features: '功能介绍',
      agent: '随便问',
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
        title: 'Typeflux — 免费开源的 macOS 语音输入工具，支持本地模型',
        description:
          '按住 Fn 开口说话，文字即刻出现在任意应用中。Typeflux 免费、开源，支持本地语音识别模型，离线可用，语音数据不上传云端。',
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
          q: 'Typeflux 是免费的吗？',
          a: '是的。Typeflux 是免费开源的软件，采用 AGPL-3.0 许可证。核心语音输入功能完全免费；如果你的 AI 用量较大，可以选择付费的 Pro 套餐。',
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
      ],
    },
  },
  'zh-TW': {
    nav: {
      features: '功能',
      agent: '隨便問',
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
    hero: {
      title1: '你說內容。',
      title2: '我來打字。',
      subtitle: '按下 Fn 鍵自然說話，Typeflux 能將極速且精準的語音轉文字，直接輸入到任何應用程式中。更棒的是，它免費、開源，並且支援本地模型。',
      downloadBtn: '免費下載',
      sourceBtn: '查看原始碼',
    },
    features: {
      title: '按下 Fn，開口說話',
      subtitle: '簡單的按鍵觸發，自然的語音輸入。Typeflux 在任何你需要打字的地方都能工作。',
      card1Title: '一鍵語音輸入',
      card1Desc: '按住 Fn 鍵即可開始語音輸入，鬆開即停止。無需切換輸入法，無需點擊按鈕，在任何文字框中都能使用。',
      localModel: '本地模型支援',
      localModelDesc: '支援本地語音識別模型，速度快，識別率高，無需連網，完全保護你的隱私資料。',
      persona: '人設定制',
      personaDesc: '建立不同的人設，為工作、學習、社交等場景分別優化，讓語音識別更貼合你的使用情境。',
      minimal: '簡約設計',
      minimalDesc: '極簡的介面設計，不干擾你的工作流程。安靜地待在選單列，需要時一鍵喚起。',
    },
    agent: {
      badge: '隨便問',
      title: '不只是輸入，\n更是你的 AI 助手',
      subtitle: '連按兩次 Fn 鍵，喚起「隨便問」功能。透過語音與 AI Agent 對話，實現問答、內容改寫和更複雜的操作。',
      feature1Title: '語音問答',
      feature1Desc: '直接開口提問，獲取即時回答',
      feature2Title: '內容改寫',
      feature2Desc: '選中文字，用語音指令改寫、翻譯、總結',
      feature3Title: '複雜操作',
      feature3Desc: '透過自然語言完成更複雜的工作流程',
      chatHint: 'Fn x2',
      agentLabel: 'Typeflux Agent',
      userExample: '幫我把這段話翻譯成英文，用更正式的語氣',
      agentResponse: '好的，我來幫你翻譯並調整語氣。以下是正式版本：',
    },
    personas: {
      title: '為每個場景定制人設',
      subtitle: '透過建立不同的人設，為不同的使用場景進行優化。在工作中保持專業，在社交中保持輕鬆。',
      work: '工作',
      workDesc: '專業術語識別優化，正式文風輸出，適合撰寫郵件、報告和文件。',
      study: '學習',
      studyDesc: '學術詞彙增強識別，支援筆記速記，適合課堂與閱讀等情境。',
      social: '社交',
      socialDesc: '口語化表達，輕鬆自然的語氣，適合聊天和社交媒體。',
      custom: '自訂',
      customDesc: '完全自訂人設參數，根據你的獨特需求打造專屬輸入體驗。',
    },
    privacy: {
      title: '隱私為先',
      subtitle: '你的聲音資料，只屬於你自己。',
      local: '本地處理',
      localDesc: '支援本地語音識別模型，語音資料無需上傳雲端。',
      noData: '資料不留存',
      noDataDesc: '不收集、不儲存、不分析你的任何語音或文字資料。',
      openSource: '開源透明',
      openSourceDesc: '完全開源的程式碼，任何人都可以審查，確保沒有後門。',
    },
    opensource: {
      title: '開源免費，為社群而生',
      desc: 'Typeflux 是一個完全開源的專案。我們相信，優秀的工具應該屬於每一個人。歡迎參與貢獻，一起讓語音輸入變得更好。',
      githubBtn: '在 GitHub 上查看',
      downloadBtn: '下載最新版本',
    },
    cta: {
      title: '釋放你的雙手，\n用聲音書寫',
      subtitle: 'Typeflux 讓語音輸入成為你最自然的表達方式。',
      downloadBtn: '免費下載 Typeflux',
    },
    billingPlans: {
      eyebrow: 'Typeflux 方案',
      title: '選擇適合你的方案。',
      loadingTitle: '正在載入方案',
      loadingSummary: '正在安全取得你的 Typeflux 帳戶可用方案。',
      missingTitle: '請從 Typeflux 開啟此頁面',
      missingSummary: '帳單連結缺少安全存取 token。請返回 Typeflux 應用程式，再次選擇「訂閱」。',
      expiredTitle: '帳單連結已過期',
      expiredSummary: '為保護帳戶安全，帳單連結僅短時間有效。請返回 Typeflux 重新取得連結。',
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
      desc: '開源免費的 macOS 語音助手',
      product: '產品',
      features: '功能介紹',
      agent: '隨便問',
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
        title: 'Typeflux — 免費開源的 macOS 語音輸入工具，支援本地模型',
        description:
          '按住 Fn 開口說話，文字即刻出現在任意應用程式中。Typeflux 免費、開源，支援本地語音識別模型，離線可用，語音資料不上傳雲端。',
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
          q: 'Typeflux 是免費的嗎？',
          a: '是的。Typeflux 是免費開源的軟體，採用 AGPL-3.0 授權條款。核心語音輸入功能完全免費；如果你的 AI 用量較大，可以選擇付費的 Pro 方案。',
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
      ],
    },
  },
  ja: {
    nav: {
      features: '機能',
      agent: 'エージェント',
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
    hero: {
      title1: '声に出すだけで、',
      title2: 'あとは自動でタイピング。',
      subtitle: 'Fnキーを押して自然に話しかけてください。Typefluxは、あらゆるアプリで正確かつ超高速な音声入力（文字起こし）を実現します。しかも無料、オープンソースで、ローカルモデルにも対応。',
      downloadBtn: '無料ダウンロード',
      sourceBtn: 'ソースコード',
    },
    features: {
      title: 'Fnキーを押して話すだけ',
      subtitle: 'シンプルなキートリガー、自然な音声入力。Typefluxはタイピングが必要な場所ならどこでも動作します。',
      card1Title: 'ワンクリック音声入力',
      card1Desc: 'Fnキーを押し続けると音声入力が開始され、離すと停止します。入力切り替え不要、ボタンクリック不要、あらゆるテキストフィールドで使用可能。',
      localModel: 'ローカルモデル対応',
      localModelDesc: 'ローカル音声認識モデルをサポート。高速で高精度、インターネット不要で、プライバシーも完全に保護されます。',
      persona: 'ペルソナカスタマイズ',
      personaDesc: '異なるペルソナを作成し、仕事、学習、SNSなどのシーンに最適化。使い方に合わせた音声認識を実現。',
      minimal: 'ミニマルデザイン',
      minimalDesc: '極限までシンプルなインターフェース。作業の邪魔をせず、メニューバーに静かに待機。必要な時にワンクリックで呼び出し。',
    },
    agent: {
      badge: 'Ask Anything',
      title: '入力だけでなく、\nあなたのAIアシスタント',
      subtitle: 'Fnキーを2回押して「Ask Anything」を起動。音声でAIエージェントと対話し、Q&A、内容のリライト、複雑な操作までスムーズに行えます。',
      feature1Title: '音声Q&A',
      feature1Desc: '声で質問するだけで、即座に回答を得られます',
      feature2Title: '内容の書き換え',
      feature2Desc: 'テキストを選択し、音声コマンドでリライト、翻訳、要約が可能',
      feature3Title: '複雑な操作',
      feature3Desc: '自然言語だけで複雑な作業フローをこなせます',
      chatHint: 'Fn x2',
      agentLabel: 'Typeflux Agent',
      userExample: 'これを英語に翻訳して、もっとフォーマルな表現にしてくれますか？',
      agentResponse: '承知いたしました。翻訳してトーンを調整しました。フォーマルな表現は以下の通りです：',
    },
    personas: {
      title: 'シーンに合わせたカスタムペルソナ',
      subtitle: '異なるペルソナを作成し、異なる使用シーンに最適化。仕事ではプロフェッショナルに、SNSではリラックスして。',
      work: '仕事',
      workDesc: '専門用語認識の最適化、フォーマルな文章スタイル。メール、レポート、文書作成に最適。',
      study: '学習',
      studyDesc: '学術用語の認識強化、メモの速記サポート。授業や読書などに最適です。',
      social: 'SNS',
      socialDesc: 'カジュアルな表現、リラックスした自然なトーン。チャットやSNSに最適。',
      custom: 'カスタム',
      customDesc: 'ペルソナパラメータを完全にカスタマイズ。あなたの独自のニーズに応じた専用入力体験を構築。',
    },
    privacy: {
      title: 'プライバシー第一',
      subtitle: 'あなたの音声データは、あなただけのものです。',
      local: 'ローカル処理',
      localDesc: 'ローカル音声認識モデルをサポート。音声データはクラウドにアップロードされません。',
      noData: 'データ保持なし',
      noDataDesc: '音声データやテキストデータの収集、保存、分析は一切行いません。',
      openSource: 'オープンソース透明性',
      openSourceDesc: '完全にオープンソースのコード。誰でも監査でき、バックドアがないことを確認できます。',
    },
    opensource: {
      title: 'オープンソース＆無料、コミュニティのために',
      desc: 'Typefluxは完全なオープンソースプロジェクトです。優れたツールは誰にでも開かれているべきだと私たちは考えています。皆様の貢献を歓迎し、一緒に音声入力をより良くしていきませんか。',
      githubBtn: 'GitHubで見る',
      downloadBtn: '最新版をダウンロード',
    },
    cta: {
      title: '両手を解放し、\n声でタイピング',
      subtitle: 'Typefluxで、音声入力を最も自然な自己表現の方法に。',
      downloadBtn: 'Typefluxを無料ダウンロード',
    },
    billingPlans: {
      eyebrow: 'Typeflux プラン',
      title: 'あなたに合うプランを。',
      loadingTitle: 'プランを読み込んでいます',
      loadingSummary: 'Typeflux アカウントで利用できるプランを安全に取得しています。',
      missingTitle: 'Typeflux からこのページを開いてください',
      missingSummary: '請求リンクに安全なアクセストークンがありません。Typeflux に戻り、もう一度「購読」を選択してください。',
      expiredTitle: '請求リンクの有効期限が切れました',
      expiredSummary: 'セキュリティのため、請求リンクは短時間のみ有効です。Typeflux から新しいリンクを取得してください。',
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
      desc: 'オープンソース無料のmacOS音声アシスタント',
      product: '製品',
      features: '機能紹介',
      agent: 'Ask Anything',
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
        title: 'Typeflux — 無料オープンソースの macOS 音声入力ツール',
        description:
          'Fn キーを押して話すだけで、どのアプリにも音声入力。Typeflux は無料・オープンソースで、ローカル音声認識モデル対応。オフラインでも使え、音声データはクラウドに送信されません。',
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
          q: 'Typeflux は無料で使えますか？',
          a: 'はい。Typeflux は AGPL-3.0 ライセンスの無料オープンソースソフトウェアです。音声入力の基本機能はすべて無料で、AI を多用する方向けに有料の Pro プランも用意しています。',
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
      ],
    },
  },
  ko: {
    nav: {
      features: '기능',
      agent: '에이전트',
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
    hero: {
      title1: '말씀만 하세요.',
      title2: '타이핑은 저희가 할게요.',
      subtitle: 'Fn 키를 누르고 자연스럽게 말해 보세요. Typeflux는 모든 앱에서 아주 빠르고 정확한 음성 입력을 제공합니다. 가장 큰 장점은요? 무료이고, 오픈소스이며, 로컬 모델을 지원한다는 점입니다.',
      downloadBtn: '무료 다운로드',
      sourceBtn: '소스코드 보기',
    },
    features: {
      title: 'Fn 키를 누르고 말씀해 보세요',
      subtitle: '간단한 키 트리거, 자연스러운 음성 입력. Typeflux는 타이핑이 필요한 모든 곳에서 작동합니다.',
      card1Title: '원클릭 음성 입력',
      card1Desc: 'Fn 키를 누르고 있으면 음성 입력이 시작되고, 놓으면 중지됩니다. 입력기 전환이나 버튼 클릭 전혀 없이, 어떤 텍스트 필드에서든 즉시 사용할 수 있습니다.',
      localModel: '로컬 모델 지원',
      localModelDesc: '로컬 음성 인식 모델을 지원합니다. 빠르고 정확하며, 인터넷 없이도 작동하여 개인정보를 완전히 보호합니다.',
      persona: '페르소나 커스터마이징',
      personaDesc: '다양한 페르소나를 생성하여 업무, 학습, 소셜 등 상황에 맞게 최적화하세요. 사용 상황에 맞는 음성 인식을 경험하세요.',
      minimal: '미니멀 디자인',
      minimalDesc: '극도로 단순한 인터페이스 디자인으로 작업 흐름을 방해하지 않습니다. 메뉴 바에 조용히 머물다가 필요할 때 원클릭으로 호출합니다.',
    },
    agent: {
      badge: 'Ask Anything',
      title: '입력 그 이상,\n당신의 AI 어시스턴트',
      subtitle: 'Fn 키를 두 번 눌러 "Ask Anything"을 활성화하세요. 음성으로 AI 에이전트와 대화하며 Q&A, 콘텐츠 재작성이나 복잡한 작업을 손쉽게 수행하세요.',
      feature1Title: '음성 Q&A',
      feature1Desc: '음성으로 바로 질문하고 즉각적인 답변을 받아보세요',
      feature2Title: '콘텐츠 재작성',
      feature2Desc: '텍스트를 선택한 후 음성 명령으로 글을 다시 쓰거나, 번역하고, 요약해 보세요',
      feature3Title: '복잡한 작업',
      feature3Desc: '자연어만으로도 복잡한 작업 과정을 손쉽게 마칠 수 있습니다',
      chatHint: 'Fn x2',
      agentLabel: 'Typeflux Agent',
      userExample: '이 문장을 영어로 번역해 주고, 좀 더 격식 있는 말투로 바꿔줘',
      agentResponse: '네, 알겠습니다. 번역 및 어투를 조정해 드릴게요. 다음과 같이 격식 있는 버전으로 준비했습니다:',
    },
    personas: {
      title: '모든 상황을 위한 커스텀 페르소나',
      subtitle: '다양한 페르소나를 생성하여 다양한 사용 상황에 최적화하세요. 업무에서는 전문적으로, 소셜에서는 편안하게.',
      work: '업무',
      workDesc: '전문 용어 인식 최적화, 공식적인 문체 출력. 이메일, 보고서, 문서 작성에 적합합니다.',
      study: '학습',
      studyDesc: '학술 어휘 인식 강화, 노트 필기 지원. 강의나 독서 중에 사용하기 좋습니다.',
      social: '소셜',
      socialDesc: '구어체 표현, 편안하고 자연스러운 어조. 채팅과 소셜 미디어에 적합합니다.',
      custom: '커스텀',
      customDesc: '페르소나 파라미터를 완전히 커스터마이징하세요. 당신의 고유한 요구에 맞는 전용 입력 경험을 만드세요.',
    },
    privacy: {
      title: '개인정보 보호 우선',
      subtitle: '당신의 음성 데이터는 오직 당신만의 것입니다.',
      local: '로컬 처리',
      localDesc: '로컬 음성 인식 모델을 지원합니다. 음성 데이터가 클라우드에 업로드되지 않습니다.',
      noData: '데이터 미보관',
      noDataDesc: '어떤 음성이나 텍스트 데이터도 수집, 저장, 분석하지 않습니다.',
      openSource: '오픈소스 투명성',
      openSourceDesc: '완전히 오픈소스인 코드입니다. 누구나 감사할 수 있어 백도어가 없음을 확인할 수 있습니다.',
    },
    opensource: {
      title: '오픈소스 & 무료, 커뮤니티를 위해',
      desc: 'Typeflux는 완전한 오픈소스 프로젝트입니다. 우리는 훌륭한 도구는 모두의 것이 되어야 한다고 믿습니다. 여러분의 기여를 언제나 환영하며, 다 함께 더 나은 음성 입력기를 만들어가요.',
      githubBtn: 'GitHub에서 보기',
      downloadBtn: '최신 버전 다운로드',
    },
    cta: {
      title: '두 손을 자유롭게,\n이제 목소리로 글을 쓰세요',
      subtitle: 'Typeflux를 통해 음성 입력을 가장 자연스러운 표현 방식으로 만들어 보세요.',
      downloadBtn: 'Typeflux 무료 다운로드',
    },
    billingPlans: {
      eyebrow: 'Typeflux 요금제',
      title: '나에게 맞는 요금제를 선택하세요.',
      loadingTitle: '요금제를 불러오는 중입니다',
      loadingSummary: 'Typeflux 계정에서 이용할 수 있는 요금제를 안전하게 가져오고 있습니다.',
      missingTitle: 'Typeflux에서 이 페이지를 열어 주세요',
      missingSummary: '결제 링크에 보안 액세스 토큰이 없습니다. Typeflux 앱으로 돌아가 다시 구독을 선택해 주세요.',
      expiredTitle: '결제 링크가 만료되었습니다',
      expiredSummary: '보안을 위해 결제 링크는 짧은 시간만 유효합니다. Typeflux에서 새 링크를 받아 주세요.',
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
      desc: '오픈소스 무료 macOS 음성 비서',
      product: '제품',
      features: '기능 소개',
      agent: 'Ask Anything',
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
        title: 'Typeflux — 무료 오픈소스 macOS 음성 입력 도구',
        description:
          'Fn 키를 누르고 말하면 어떤 앱에서든 바로 텍스트로 입력됩니다. Typeflux는 무료·오픈소스이며 로컬 음성 인식 모델을 지원해 오프라인에서도 사용할 수 있습니다.',
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
          q: 'Typeflux는 무료인가요?',
          a: '네. Typeflux는 AGPL-3.0 라이선스의 무료 오픈소스 소프트웨어입니다. 핵심 음성 입력 기능은 무료이며, AI 사용량이 많은 분을 위한 Pro 요금제도 제공합니다.',
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
  const [lang, setLang] = useState(() => parsePath(getPathname()).lang)
  const isReady = true

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  useEffect(() => {
    const pathname = window.location.pathname
    if (hasLangPrefix(pathname)) return
    const preferred = detectPreferredLang()
    if (preferred !== DEFAULT_LANG) {
      const { route } = parsePath(pathname)
      window.location.replace(`${localizedPath(preferred, route)}${window.location.search}${window.location.hash}`)
    }
  }, [])

  const setLanguage = useCallback((newLang) => {
    if (!translations[newLang]) return
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newLang)
      const { lang: current, route } = parsePath(window.location.pathname)
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
