/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { DEFAULT_LANG, LANG_CODES, localizedPath, parsePath } from '../lib/localePath'
import { getPathname } from '../lib/serverContext'
import { isAuthRoute } from '../lib/authNavigation'
import { FAQ_COPY } from './faq'

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
        title: 'Typeflux — Free AI Agent, Launcher & Voice Typing for Mac',
        description:
          'An AI agent that gets things done, a launcher, voice typing in any app, screenshots and clipboard history, each one shortcut away. Free and open source for Mac.',
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
        title: 'Typeflux Blog — Guides to AI on Your Mac',
        description:
          'Guides, tips and engineering notes on the AI agent, launcher, voice typing, local models and more in Typeflux for macOS.',
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
    faq: FAQ_COPY.en,
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
        title: 'Typeflux — 开源免费的 Mac AI Agent、启动器与语音输入',
        description:
          '能把事办完的 AI Agent、什么都能找到的启动器、任意应用里的语音输入，还有截图录屏和剪贴板历史，都只差一个快捷键。开源免费，支持本地模型。',
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
        title: 'Typeflux 博客 — 在 Mac 上用好 AI 的指南',
        description:
          '关于 AI Agent、启动器、语音输入、本地模型等 Typeflux 功能的使用指南、技巧和技术随笔。',
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
    faq: FAQ_COPY['zh-CN'],
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
        title: 'Typeflux — 開源免費的 Mac AI Agent、啟動器與語音輸入',
        description:
          '能把事辦完的 AI Agent、什麼都能找到的啟動器、任何應用程式裡的語音輸入，還有截圖錄影和剪貼簿歷史，都只差一個快捷鍵。開源免費，支援本機模型。',
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
        title: 'Typeflux 部落格 — 在 Mac 上用好 AI 的指南',
        description:
          '關於 AI Agent、啟動器、語音輸入、本機模型等 Typeflux 功能的使用指南、技巧和技術隨筆。',
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
    faq: FAQ_COPY['zh-TW'],
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
        title: 'Typeflux — 無料・オープンソースの Mac 向け AI エージェント、ランチャー、音声入力',
        description:
          'タスクをやり遂げる AI エージェント、ランチャー、どのアプリでも使える音声入力、スクリーンショット、クリップボード履歴をショートカットひとつで。無料・オープンソースで、ローカルモデルにも対応。',
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
        title: 'Typeflux ブログ — Mac で AI を使いこなすガイド',
        description:
          'AI エージェント、ランチャー、音声入力、ローカルモデルなど、Typeflux の機能に関するガイド、ヒント、技術ノート。',
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
    faq: FAQ_COPY.ja,
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
        title: 'Typeflux — 무료 오픈 소스 Mac AI 에이전트, 런처, 음성 입력',
        description:
          '일을 끝까지 처리하는 AI 에이전트, 런처, 어떤 앱에서나 쓰는 음성 입력, 스크린샷과 클립보드 기록을 단축키 하나로. 무료 오픈 소스이며 로컬 모델을 지원합니다.',
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
        title: 'Typeflux 블로그 — Mac에서 AI를 잘 쓰는 가이드',
        description:
          'AI 에이전트, 런처, 음성 입력, 로컬 모델 등 Typeflux 기능에 대한 가이드, 팁, 기술 노트.',
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
    faq: FAQ_COPY.ko,
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

// FAQ groups for one language, shown by the visible FAQ section. Falls back
// to English for languages without translations.
export function getFaqGroups(lang) {
  const table = translations[lang] || translations[DEFAULT_LANG]
  return table.faq?.groups || translations[DEFAULT_LANG].faq.groups
}

// Every FAQ question for one language, in page order, for the FAQPage
// structured data. Built from the same groups as the visible section.
export function getFaqItems(lang) {
  return getFaqGroups(lang).flatMap((group) => group.items)
}
