// Home page copy for every locale. Shortcuts, keyword names and other
// language-neutral tokens live in homeModel.js so translations cannot drift
// from what the app actually ships.
import { DEFAULT_LANG } from '../../lib/localePath'

const en = {
  hero: {
    eyebrow: 'The AI layer for your Mac',
    title: 'Your Mac,\none keystroke from done.',
    subtitle: 'Speak to type, ask an AI agent, launch anything, or flick a ring of actions at your pointer. Typeflux works wherever you already are. Free, open source, and able to run entirely on your Mac.',
    download: 'Download Free',
    source: 'View Source',
    requirement: 'macOS 13+ · Apple silicon & Intel',
    demoLabel: 'Typeflux demo',
    scenes: {
      voice: {
        label: 'Speak',
        status: 'Listening…',
        text: 'Move the design review to Thursday at 3 PM and share the agenda with the team.',
      },
      agent: {
        label: 'Ask',
        question: 'Summarize this page in three bullets',
        steps: ['Reading the current page', 'Drafting a summary'],
        answer: 'Launch moved to May 12 · Budget approved · Two roles still open',
      },
      launcher: {
        label: 'Find & do',
        query: 'fy good morning',
        results: ['Translate: 早上好', 'Open “Good Morning.md”', 'Ask AI: good morning'],
      },
      ring: {
        label: 'Point',
        hint: 'Flick toward an action and let go',
      },
    },
  },
  entrances: {
    title: 'Four ways in, each a keystroke away.',
    subtitle: 'Each one opens right where you are working, with no switching apps. Every shortcut can be changed in Settings.',
    items: {
      voice: { name: 'Voice Input', action: 'Hold to speak', desc: 'Dictate into any text field, or select text and say how to change it.' },
      agent: { name: 'AI Agent', action: 'Ask anything', desc: 'An agent that sees your screen and selection, and takes actions with your approval.' },
      launcher: { name: 'Launcher', action: 'Type to find & do', desc: 'Apps, files, translation, quick answers, commands and your own workflows.' },
      ring: { name: 'Ring', action: 'Flick at the pointer', desc: 'Up to eight actions in a radial menu that opens wherever your mouse is.' },
    },
    more: 'Learn more',
  },
  voice: {
    badge: 'Speak',
    title: 'Talk at the speed of thought, in any app',
    subtitle: 'Hold the key, speak naturally, let go. Clean, punctuated text lands at your cursor in browsers, editors, terminals and chat apps alike. Roughly four times faster than typing.',
    points: [
      { title: 'Works everywhere you type', desc: 'No plugins or integrations. If an app has a text field, Typeflux can write into it.' },
      { title: 'Rewrite by voice', desc: 'Select text and say “make it shorter” or “translate to English”. The result replaces your selection.' },
      { title: 'Personas for every context', desc: 'Different tone and vocabulary for work email, notes or chat, plus a second shortcut with its own persona.' },
      { title: 'Local or cloud engines', desc: 'Run SenseVoice, Whisper or Qwen3-ASR offline, or use real-time cloud recognition in more than 60 languages.' },
    ],
    stats: [
      { value: '~200', label: 'words per minute' },
      { value: '60+', label: 'languages' },
      { value: '100%', label: 'offline capable' },
    ],
    demo: {
      app: 'Mail',
      draft: 'Hi team, quick update: the beta ships Friday, and feedback is due by Wednesday.',
      status: 'Listening…',
      persona: 'Persona: Work email',
    },
  },
  agent: {
    badge: 'Ask',
    title: 'An agent that sees what you see, and acts when you say so',
    subtitle: 'Type or speak a question in the launcher. Typeflux brings along your screen, selected text and current app, then opens a full workspace when the task needs more than one answer.',
    points: [
      { title: 'Knows your context', desc: 'Screenshots, selections, attachments and the app you came from travel with your question.' },
      { title: 'Does the work', desc: 'Browses the web, reads and edits files in folders you grant, runs code and generates images. Each action waits for your approval.' },
      { title: 'Works your way', desc: 'Install Skills, connect MCP servers, keep memories and notebooks, and pick the model and reasoning effort.' },
      { title: 'Private when it matters', desc: 'Keep a conversation entirely on this Mac with your own models and API keys.' },
    ],
    demo: {
      user: 'Compare the three PDFs in Downloads and save a summary to my notebook.',
      steps: [
        { label: 'Read 3 files in ~/Downloads', state: 'done' },
        { label: 'Save note “Vendor comparison”', state: 'approve' },
      ],
      approve: 'Allow',
      answer: 'Vendor B is the cheapest at scale; vendor C has the shortest contract. Saved to your notebook.',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: 'Find & do',
    title: 'A launcher that speaks keywords and plain language',
    subtitle: 'Search apps, files and even file contents. Type a keyword to translate, polish, ask, run a command or check your calendar. Anything else goes straight to AI.',
    points: [
      { title: 'Keywords for everyday jobs', desc: 'Rename any keyword, add aliases, or bind one to a global shortcut that runs without opening the launcher.' },
      { title: 'Search beyond file names', desc: 'Find apps, files, document contents, open browser tabs and bookmarks from one box.' },
      { title: 'Build your own workflows', desc: 'Write plugins in Python, Node or Shell, or import Alfred workflows, and run them by keyword.' },
    ],
    keywordsTitle: 'Try a keyword',
    keywords: {
      fy: 'Translate text or a selection',
      rw: 'Polish selected text with AI',
      qa: 'Quick answer without leaving the launcher',
      cmd: 'Run a shell command',
      cal: 'Calendar, holidays and events',
      top: 'Live CPU, memory and processes',
      tab: 'Jump to an open browser tab',
      gif: 'Record the screen as GIF or MP4',
    },
    placeholder: 'Search or ask anything…',
  },
  ring: {
    badge: 'Point',
    title: 'A ring of actions, right at your pointer',
    subtitle: 'Hold the shortcut and the ring opens under your mouse. Flick toward an action and let go, or let go in the middle to cancel. Fill up to eight slots with Typeflux features, apps, websites, folders, key combos, Shortcuts or system toggles.',
    tryTitle: 'Try it here',
    tryHint: 'Press and hold the ring, drag toward an action, then release. Or press 1–6.',
    centerTitle: 'Typeflux',
    ran: 'Ran: {action}',
    idle: 'Nothing selected',
    actions: {
      dictation: 'Voice input',
      ask: 'Ask AI',
      translate: 'Translate',
      screenshot: 'Screenshot',
      screenshotText: 'Copy text from screen',
      clipboard: 'Clipboard',
    },
  },
  toolbox: {
    title: 'The tools you used to install separately',
    subtitle: 'Each opens from a keyword, a shortcut or the ring, and shares the same models and privacy settings.',
    items: {
      screenshot: { name: 'Screenshot & annotate', desc: 'Arrows, mosaic, callouts, pinning, OCR and translation.' },
      recording: { name: 'Screen recording', desc: 'MP4 or GIF with system audio, mic and camera overlay.' },
      clipboard: { name: 'Clipboard history', desc: 'A card shelf of everything you copied, images included.' },
      translate: { name: 'Translation & word book', desc: 'Compare engines side by side and keep words you look up.' },
      notebook: { name: 'Notebook', desc: 'Markdown notes from chats, AI results and screenshots.' },
      monitor: { name: 'System monitor', desc: 'CPU, memory, disk, network and processes at a glance.' },
      calendar: { name: 'Calendar', desc: 'Lunar dates, holidays and your events in the launcher.' },
      terminal: { name: 'Terminal', desc: 'Run one-off commands in a small floating terminal.' },
    },
  },
  scenarios: {
    title: 'One app, from morning to night',
    subtitle: 'A few ways people combine the four entry points.',
    tabs: {
      developer: {
        name: 'Developers',
        steps: [
          'Dictate a commit message or code review comment straight into the editor.',
          'Type cmd git status in the launcher, without opening a terminal.',
          'Ask the agent to read a log file and explain the failing test.',
          'Flick the ring to grab a screenshot of the bug for the issue.',
        ],
      },
      writer: {
        name: 'Writers & marketers',
        steps: [
          'Speak a first draft at full speed with a “Long-form” persona.',
          'Select a paragraph and say “tighten this and keep the tone”.',
          'Let the agent research a topic in the browser and save notes.',
          'Pull earlier snippets back from the clipboard shelf.',
        ],
      },
      student: {
        name: 'Students & researchers',
        steps: [
          'Capture lecture thoughts by voice, with local models offline.',
          'Copy text out of a slide or scanned PDF with screen OCR.',
          'Ask the agent to compare three papers and outline the differences.',
          'Save new vocabulary to the word book while you read.',
        ],
      },
      global: {
        name: 'Cross-language work',
        steps: [
          'Select a message and type fy to read it in your language.',
          'Reply by voice and let a translation persona write it in theirs.',
          'Translate any region of the screen, from images to video subtitles.',
          'Keep work in one language and chat in another with two voice shortcuts.',
        ],
      },
    },
  },
  privacy: {
    title: 'Powerful, and still yours',
    subtitle: 'You choose where every request goes, and the agent never acts on your Mac without your say.',
    items: [
      { title: 'Runs on your Mac', desc: 'Local speech models work offline; your voice never has to leave the device.' },
      { title: 'Bring your own models', desc: 'Use OpenAI-compatible, Anthropic, Responses or Ollama endpoints with your own keys.' },
      { title: 'Private conversations', desc: 'Keep an agent conversation and its history only on this Mac.' },
      { title: 'You approve every action', desc: 'File changes, browsing and code execution each ask first, scoped to folders you grant.' },
      { title: 'No data retention', desc: 'We do not collect, store or analyze your voice or text.' },
      { title: 'Open source', desc: 'Every line is public under AGPL-3.0, so anyone can audit it.' },
    ],
  },
  plans: {
    title: 'Free to start. Pro when you need more AI.',
    subtitle: 'Every feature is in the free app. Plans only change how much Typeflux Cloud AI you can use.',
    free: {
      name: 'Free',
      price: '$0',
      tagline: 'Everything, forever',
      points: ['All four entry points and every tool', 'Unlimited local models, no word caps', 'Bring your own API keys', 'Monthly Typeflux Cloud credits'],
      cta: 'Download Free',
    },
    pro: {
      name: 'Pro',
      tagline: 'For heavy AI users',
      points: ['Many more Typeflux Cloud credits each month', 'Add-on credit packs when you need a boost', 'Monthly or yearly billing', 'Card, Alipay or WeChat Pay'],
      note: 'Upgrade any time from the Account page in the app.',
    },
  },
  ios: {
    badge: 'Coming soon',
    title: 'Typeflux for iPhone is on the way',
    desc: 'Pick up your Ask conversations on iPhone, dictate by voice, and use Typeflux Cloud or your own models. We are preparing the release now.',
  },
  closing: {
    title: 'Get it done with one keystroke',
    subtitle: 'Free and open source under AGPL-3.0. Built in the open, and contributions are welcome.',
    download: 'Download Typeflux Free',
    github: 'Star on GitHub',
  },
}

const zhCN = {
  hero: {
    eyebrow: 'Mac 上的 AI 操作层',
    title: '一个快捷键，\nMac 上的事就办了。',
    subtitle: '说话输入、向 AI Agent 提问、启动和搜索、在鼠标边弹出圆环，都在你正在用的地方完成，不用切换应用。开源免费，也可以完全在本机运行。',
    download: '免费下载',
    source: '查看源码',
    requirement: 'macOS 13+ · 支持 Apple 芯片与 Intel',
    demoLabel: 'Typeflux 演示',
    scenes: {
      voice: {
        label: '说',
        status: '正在聆听…',
        text: '把设计评审改到周四下午三点，再把议程发给大家。',
      },
      agent: {
        label: '问',
        question: '用三句话总结这个页面',
        steps: ['读取当前页面', '整理要点'],
        answer: '发布推迟到 5 月 12 日 · 预算已批 · 还有两个岗位在招',
      },
      launcher: {
        label: '找 / 做',
        query: 'fy good morning',
        results: ['翻译：早上好', '打开「Good Morning.md」', '问 AI：good morning'],
      },
      ring: {
        label: '点',
        hint: '划向一个操作，松开即可',
      },
    },
  },
  entrances: {
    title: '四个入口，都只差一个快捷键',
    subtitle: '每个入口都在你当前的位置打开，不用切换应用。所有快捷键都可以在设置里修改。',
    items: {
      voice: { name: '语音输入', action: '按住说话', desc: '在任意输入框里说话打字，或选中文字后说出怎么改。' },
      agent: { name: 'AI Agent', action: '随便问', desc: '能看到你的屏幕和选区，经你批准后替你动手的 Agent。' },
      launcher: { name: '启动器', action: '输入即可找到、办到', desc: '应用、文件、翻译、快问、终端命令，还有你自己写的工作流。' },
      ring: { name: '圆环', action: '在鼠标处一划', desc: '最多 8 个操作的径向菜单，在鼠标所在位置弹出。' },
    },
    more: '了解更多',
  },
  voice: {
    badge: '说',
    title: '想到哪说到哪，任何应用都能输入',
    subtitle: '按住快捷键，自然地说，松开。带标点的文字直接出现在光标处，浏览器、编辑器、终端、聊天软件都一样。比打字快约四倍。',
    points: [
      { title: '能打字的地方都能用', desc: '不需要插件或集成。只要有输入框，Typeflux 就能写进去。' },
      { title: '用语音改写', desc: '选中文字，说「再精简一点」或「翻译成英文」，结果直接替换选区。' },
      { title: '不同场景，不同人设', desc: '工作邮件、笔记、聊天各用一套语气和词汇；还能给第二个快捷键单独配一个人设。' },
      { title: '本地或云端引擎', desc: 'SenseVoice、Whisper、Qwen3-ASR 可离线运行；也可以用支持 60 多种语言的云端实时识别。' },
    ],
    stats: [
      { value: '~200', label: '字词 / 分钟' },
      { value: '60+', label: '种语言' },
      { value: '100%', label: '可离线运行' },
    ],
    demo: {
      app: '邮件',
      draft: '大家好，同步一下：测试版周五发布，反馈请在周三前提交。',
      status: '正在聆听…',
      persona: '人设：工作邮件',
    },
  },
  agent: {
    badge: '问',
    title: '看得到你在看什么，经你同意再动手的 Agent',
    subtitle: '在启动器里打字或说出问题，Typeflux 会带上你的屏幕、选中的文字和当前应用。任务不止一句话能答完时，会打开完整的 Agent 工作区。',
    points: [
      { title: '懂你的上下文', desc: '截图、选区、附件和你来自哪个应用，都会随问题一起带上。' },
      { title: '真的会动手', desc: '浏览网页、读写你授权文件夹里的文件、运行代码、生成图片。每一步都要你批准。' },
      { title: '按你的方式工作', desc: '安装 Skills、连接 MCP 服务、保存记忆和笔记，自己选模型和思考强度。' },
      { title: '需要时完全私密', desc: '用自己的模型和 API Key，让整段对话只留在这台 Mac 上。' },
    ],
    demo: {
      user: '对比一下「下载」里的三份 PDF，把结论存到我的笔记本。',
      steps: [
        { label: '读取 ~/Downloads 中的 3 个文件', state: 'done' },
        { label: '保存笔记「供应商对比」', state: 'approve' },
      ],
      approve: '允许',
      answer: 'B 家规模化后最便宜，C 家合同期最短。结论已存到笔记本。',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: '找 / 做',
    title: '懂关键字，也懂人话的启动器',
    subtitle: '搜索应用、文件，甚至文件内容。输入关键字即可翻译、润色、快问、运行命令、查日历；其他输入直接交给 AI。',
    points: [
      { title: '日常操作都有关键字', desc: '关键字可以改名、加别名，也可以绑定全局快捷键，不打开启动器就直接执行。' },
      { title: '不只搜文件名', desc: '应用、文件、文档内容、浏览器标签页和书签，在一个输入框里找到。' },
      { title: '自己写工作流', desc: '用 Python、Node 或 Shell 写插件，也能导入 Alfred 工作流，用关键字运行。' },
    ],
    keywordsTitle: '试试这些关键字',
    keywords: {
      fy: '翻译文字或选区',
      rw: '用 AI 润色选中的文字',
      qa: '在启动器里直接得到回答',
      cmd: '运行一条终端命令',
      cal: '日历、节假日和日程',
      top: '实时 CPU、内存和进程',
      tab: '跳到已打开的浏览器标签页',
      gif: '录屏并导出 GIF 或 MP4',
    },
    placeholder: '搜索或随便问…',
  },
  ring: {
    badge: '点',
    title: '鼠标在哪，操作就在哪',
    subtitle: '按住快捷键，圆环在鼠标下方弹出。划向一个操作后松开即可执行，移回中间再松开就取消。最多 8 个格子，可以放 Typeflux 功能、应用、网址、文件夹、组合键、快捷指令或系统开关。',
    tryTitle: '在这里试一下',
    tryHint: '在圆环上按住，拖向一个操作再松开；也可以按 1–6。',
    centerTitle: 'Typeflux',
    ran: '已执行：{action}',
    idle: '未选择操作',
    actions: {
      dictation: '语音输入',
      ask: '问 AI',
      translate: '翻译',
      screenshot: '截图',
      screenshotText: '截图取字',
      clipboard: '剪贴板',
    },
  },
  toolbox: {
    title: '以前要单独装的工具，这里都有',
    subtitle: '都能通过关键字、快捷键或圆环直接打开，并且共用同一套模型和隐私设置。',
    items: {
      screenshot: { name: '截图与标注', desc: '箭头、马赛克、标注框、贴图、文字识别和翻译。' },
      recording: { name: '录屏', desc: '导出 MP4 或 GIF，支持系统声音、麦克风和摄像头画中画。' },
      clipboard: { name: '剪贴板历史', desc: '复制过的内容排成卡片，图片也在。' },
      translate: { name: '翻译与单词本', desc: '多个翻译引擎并排对比，查过的词可以收进单词本。' },
      notebook: { name: '笔记本', desc: '对话、AI 结果和截图文字，都能存成 Markdown 笔记。' },
      monitor: { name: '系统监控', desc: 'CPU、内存、磁盘、网络和进程，一眼看清。' },
      calendar: { name: '日历', desc: '农历、节假日和日程，在启动器里就能查。' },
      terminal: { name: '终端', desc: '在小型悬浮终端里运行一次性命令。' },
    },
  },
  scenarios: {
    title: '从早到晚，一个应用就够了',
    subtitle: '看看不同的人怎么组合这四个入口。',
    tabs: {
      developer: {
        name: '开发者',
        steps: [
          '直接在编辑器里口述提交信息或代码评审意见。',
          '在启动器里输入 cmd git status，不用打开终端。',
          '让 Agent 读日志文件，解释测试为什么失败。',
          '用圆环一划截下 Bug 画面，贴进 Issue。',
        ],
      },
      writer: {
        name: '写作与运营',
        steps: [
          '用「长文写作」人设，全速口述初稿。',
          '选中一段，说「再紧凑一点，语气不变」。',
          '让 Agent 在浏览器里查资料，并把要点存成笔记。',
          '从剪贴板卡片架里找回之前复制的片段。',
        ],
      },
      student: {
        name: '学生与研究',
        steps: [
          '用本地模型离线记录课堂想法。',
          '用截图取字，从幻灯片或扫描版 PDF 里复制文字。',
          '让 Agent 对比三篇论文，列出差异。',
          '阅读时把生词存进单词本。',
        ],
      },
      global: {
        name: '跨语言工作',
        steps: [
          '选中一条消息，输入 fy，用母语读懂它。',
          '用语音回复，让翻译人设帮你写成对方的语言。',
          '翻译屏幕上的任意区域，图片、视频字幕都可以。',
          '两个语音快捷键：一个写中文，一个直接出英文。',
        ],
      },
    },
  },
  privacy: {
    title: '能力很强，控制权仍在你手里',
    subtitle: '每个请求发到哪里由你决定；没有你的同意，Agent 不会在你的 Mac 上执行任何操作。',
    items: [
      { title: '在本机运行', desc: '本地语音模型可离线使用，你的声音不必离开这台设备。' },
      { title: '自带模型', desc: '支持 OpenAI 兼容、Anthropic、Responses 和 Ollama 接口，使用你自己的 Key。' },
      { title: '私密对话', desc: 'Agent 对话及其历史可以只保存在这台 Mac 上。' },
      { title: '每个操作都由你批准', desc: '修改文件、浏览网页、运行代码前都会先询问，范围限定在你授权的文件夹。' },
      { title: '不留存数据', desc: '我们不收集、不存储、不分析你的语音和文字。' },
      { title: '开源', desc: '全部代码以 AGPL-3.0 公开，任何人都可以审计。' },
    ],
  },
  plans: {
    title: '免费开始，AI 用得多再升级 Pro',
    subtitle: '所有功能都在免费版里。套餐只决定你能用多少 Typeflux Cloud 的 AI 额度。',
    free: {
      name: '免费版',
      price: '¥0',
      tagline: '全部功能，永久免费',
      points: ['四个入口和所有工具', '本地模型无限使用，不限字数', '可以用自己的 API Key', '每月赠送 Typeflux Cloud 额度'],
      cta: '免费下载',
    },
    pro: {
      name: 'Pro',
      tagline: '适合 AI 重度用户',
      points: ['每月更多 Typeflux Cloud 额度', '不够用时可以加购积分包', '按月或按年付费', '支持银行卡、支付宝和微信支付'],
      note: '随时可以在 App 的「账号」页升级。',
    },
  },
  ios: {
    badge: '即将上线',
    title: 'Typeflux iPhone 版正在筹备中',
    desc: '在 iPhone 上继续你的对话，用语音输入，使用 Typeflux Cloud 或你自己的模型。我们正在准备上线。',
  },
  closing: {
    title: '一个快捷键，把事办了',
    subtitle: '基于 AGPL-3.0 开源、免费。公开开发，欢迎参与贡献。',
    download: '免费下载 Typeflux',
    github: '在 GitHub 上点 Star',
  },
}

const zhTW = {
  hero: {
    eyebrow: 'Mac 上的 AI 操作層',
    title: '一個快捷鍵，\nMac 上的事就搞定。',
    subtitle: '說話輸入、向 AI Agent 提問、啟動和搜尋、在滑鼠旁彈出圓環，都在你正在用的地方完成，不用切換 App。開源免費，也可以完全在本機執行。',
    download: '免費下載',
    source: '查看原始碼',
    requirement: 'macOS 13+ · 支援 Apple 晶片與 Intel',
    demoLabel: 'Typeflux 示範',
    scenes: {
      voice: {
        label: '說',
        status: '正在聆聽…',
        text: '把設計審查改到週四下午三點，再把議程寄給大家。',
      },
      agent: {
        label: '問',
        question: '用三句話總結這個頁面',
        steps: ['讀取目前頁面', '整理重點'],
        answer: '發布延到 5 月 12 日 · 預算已核准 · 還有兩個職缺在招',
      },
      launcher: {
        label: '找 / 做',
        query: 'fy good morning',
        results: ['翻譯：早安', '開啟「Good Morning.md」', '問 AI：good morning'],
      },
      ring: {
        label: '點',
        hint: '劃向一個操作，放開即可',
      },
    },
  },
  entrances: {
    title: '四個入口，都只差一個快捷鍵',
    subtitle: '每個入口都在你目前的位置打開，不用切換 App。所有快捷鍵都可以在設定中修改。',
    items: {
      voice: { name: '語音輸入', action: '按住說話', desc: '在任何輸入框裡說話打字，或選取文字後說出要怎麼改。' },
      agent: { name: 'AI Agent', action: '隨便問', desc: '看得到你的螢幕和選取內容，經你同意後替你動手的 Agent。' },
      launcher: { name: '啟動器', action: '輸入就能找到、辦到', desc: 'App、檔案、翻譯、快問、終端機指令，還有你自己寫的工作流程。' },
      ring: { name: '圓環', action: '在滑鼠處一劃', desc: '最多 8 個操作的放射狀選單，在滑鼠所在位置彈出。' },
    },
    more: '了解更多',
  },
  voice: {
    badge: '說',
    title: '想到哪說到哪，任何 App 都能輸入',
    subtitle: '按住快捷鍵，自然地說，放開。帶標點的文字直接出現在游標處，瀏覽器、編輯器、終端機、聊天軟體都一樣。比打字快約四倍。',
    points: [
      { title: '能打字的地方都能用', desc: '不需要外掛或整合。只要有輸入框，Typeflux 就能寫進去。' },
      { title: '用語音改寫', desc: '選取文字，說「再精簡一點」或「翻成英文」，結果直接取代選取內容。' },
      { title: '不同情境，不同人設', desc: '工作信件、筆記、聊天各用一套語氣和詞彙；還能替第二個快捷鍵單獨設定人設。' },
      { title: '本機或雲端引擎', desc: 'SenseVoice、Whisper、Qwen3-ASR 可離線執行；也可以用支援 60 多種語言的雲端即時辨識。' },
    ],
    stats: [
      { value: '~200', label: '字詞 / 分鐘' },
      { value: '60+', label: '種語言' },
      { value: '100%', label: '可離線執行' },
    ],
    demo: {
      app: '郵件',
      draft: '大家好，同步一下：測試版週五發布，回饋請在週三前提交。',
      status: '正在聆聽…',
      persona: '人設：工作信件',
    },
  },
  agent: {
    badge: '問',
    title: '看得到你在看什麼，經你同意再動手的 Agent',
    subtitle: '在啟動器裡打字或說出問題，Typeflux 會帶上你的螢幕、選取的文字和目前的 App。任務不只一句話能答完時，會打開完整的 Agent 工作區。',
    points: [
      { title: '懂你的脈絡', desc: '截圖、選取內容、附件和你來自哪個 App，都會隨問題一起帶上。' },
      { title: '真的會動手', desc: '瀏覽網頁、讀寫你授權資料夾裡的檔案、執行程式碼、產生圖片。每一步都要你核准。' },
      { title: '照你的方式工作', desc: '安裝 Skills、連接 MCP 服務、保存記憶和筆記，自己選模型和思考強度。' },
      { title: '需要時完全私密', desc: '用自己的模型和 API Key，讓整段對話只留在這台 Mac 上。' },
    ],
    demo: {
      user: '比較「下載項目」裡的三份 PDF，把結論存到我的筆記本。',
      steps: [
        { label: '讀取 ~/Downloads 中的 3 個檔案', state: 'done' },
        { label: '儲存筆記「供應商比較」', state: 'approve' },
      ],
      approve: '允許',
      answer: 'B 家規模化後最便宜，C 家合約期最短。結論已存到筆記本。',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: '找 / 做',
    title: '懂關鍵字，也懂人話的啟動器',
    subtitle: '搜尋 App、檔案，甚至檔案內容。輸入關鍵字就能翻譯、潤飾、快問、執行指令、查行事曆；其他輸入直接交給 AI。',
    points: [
      { title: '日常操作都有關鍵字', desc: '關鍵字可以改名、加別名，也可以綁定全域快捷鍵，不打開啟動器就直接執行。' },
      { title: '不只搜尋檔名', desc: 'App、檔案、文件內容、瀏覽器分頁和書籤，在一個輸入框裡找到。' },
      { title: '自己寫工作流程', desc: '用 Python、Node 或 Shell 寫外掛，也能匯入 Alfred 工作流程，用關鍵字執行。' },
    ],
    keywordsTitle: '試試這些關鍵字',
    keywords: {
      fy: '翻譯文字或選取內容',
      rw: '用 AI 潤飾選取的文字',
      qa: '在啟動器裡直接得到回答',
      cmd: '執行一條終端機指令',
      cal: '行事曆、假日和行程',
      top: '即時 CPU、記憶體和處理程序',
      tab: '跳到已開啟的瀏覽器分頁',
      gif: '錄製螢幕並匯出 GIF 或 MP4',
    },
    placeholder: '搜尋或隨便問…',
  },
  ring: {
    badge: '點',
    title: '滑鼠在哪，操作就在哪',
    subtitle: '按住快捷鍵，圓環在滑鼠下方彈出。劃向一個操作後放開就會執行，移回中間再放開就取消。最多 8 格，可以放 Typeflux 功能、App、網址、資料夾、組合鍵、捷徑或系統開關。',
    tryTitle: '在這裡試一下',
    tryHint: '在圓環上按住，拖向一個操作再放開；也可以按 1–6。',
    centerTitle: 'Typeflux',
    ran: '已執行：{action}',
    idle: '未選擇操作',
    actions: {
      dictation: '語音輸入',
      ask: '問 AI',
      translate: '翻譯',
      screenshot: '截圖',
      screenshotText: '截圖取字',
      clipboard: '剪貼簿',
    },
  },
  toolbox: {
    title: '以前要另外裝的工具，這裡都有',
    subtitle: '都能透過關鍵字、快捷鍵或圓環直接打開，並且共用同一套模型和隱私設定。',
    items: {
      screenshot: { name: '截圖與標註', desc: '箭頭、馬賽克、標註框、釘選、文字辨識和翻譯。' },
      recording: { name: '螢幕錄影', desc: '匯出 MP4 或 GIF，支援系統聲音、麥克風和攝影機子母畫面。' },
      clipboard: { name: '剪貼簿紀錄', desc: '複製過的內容排成卡片，圖片也在。' },
      translate: { name: '翻譯與單字本', desc: '多個翻譯引擎並排比較，查過的字可以收進單字本。' },
      notebook: { name: '筆記本', desc: '對話、AI 結果和截圖文字，都能存成 Markdown 筆記。' },
      monitor: { name: '系統監控', desc: 'CPU、記憶體、磁碟、網路和處理程序，一目了然。' },
      calendar: { name: '行事曆', desc: '農曆、假日和行程，在啟動器裡就能查。' },
      terminal: { name: '終端機', desc: '在小型浮動終端機裡執行一次性指令。' },
    },
  },
  scenarios: {
    title: '從早到晚，一個 App 就夠了',
    subtitle: '看看不同的人怎麼組合這四個入口。',
    tabs: {
      developer: {
        name: '開發者',
        steps: [
          '直接在編輯器裡口述 commit 訊息或程式碼審查意見。',
          '在啟動器裡輸入 cmd git status，不用打開終端機。',
          '讓 Agent 讀取日誌檔，解釋測試為什麼失敗。',
          '用圓環一劃截下 Bug 畫面，貼進 Issue。',
        ],
      },
      writer: {
        name: '寫作與行銷',
        steps: [
          '用「長文寫作」人設，全速口述初稿。',
          '選取一段，說「再緊湊一點，語氣不變」。',
          '讓 Agent 在瀏覽器裡查資料，並把重點存成筆記。',
          '從剪貼簿卡片架裡找回之前複製的片段。',
        ],
      },
      student: {
        name: '學生與研究',
        steps: [
          '用本機模型離線記錄課堂想法。',
          '用截圖取字，從投影片或掃描版 PDF 裡複製文字。',
          '讓 Agent 比較三篇論文，列出差異。',
          '閱讀時把生字存進單字本。',
        ],
      },
      global: {
        name: '跨語言工作',
        steps: [
          '選取一則訊息，輸入 fy，用母語讀懂它。',
          '用語音回覆，讓翻譯人設幫你寫成對方的語言。',
          '翻譯螢幕上的任意區域，圖片、影片字幕都可以。',
          '兩個語音快捷鍵：一個寫中文，一個直接出英文。',
        ],
      },
    },
  },
  privacy: {
    title: '能力很強，控制權仍在你手上',
    subtitle: '每個請求送到哪裡由你決定；沒有你的同意，Agent 不會在你的 Mac 上執行任何操作。',
    items: [
      { title: '在本機執行', desc: '本機語音模型可離線使用，你的聲音不必離開這台裝置。' },
      { title: '自帶模型', desc: '支援 OpenAI 相容、Anthropic、Responses 和 Ollama 介面，使用你自己的 Key。' },
      { title: '私密對話', desc: 'Agent 對話及其紀錄可以只保存在這台 Mac 上。' },
      { title: '每個操作都由你核准', desc: '修改檔案、瀏覽網頁、執行程式碼前都會先詢問，範圍限定在你授權的資料夾。' },
      { title: '不留存資料', desc: '我們不收集、不儲存、不分析你的語音和文字。' },
      { title: '開源', desc: '全部程式碼以 AGPL-3.0 公開，任何人都可以稽核。' },
    ],
  },
  plans: {
    title: '免費開始，AI 用得多再升級 Pro',
    subtitle: '所有功能都在免費版裡。方案只決定你能用多少 Typeflux Cloud 的 AI 額度。',
    free: {
      name: '免費版',
      price: '$0',
      tagline: '全部功能，永久免費',
      points: ['四個入口和所有工具', '本機模型無限使用，不限字數', '可以用自己的 API Key', '每月贈送 Typeflux Cloud 額度'],
      cta: '免費下載',
    },
    pro: {
      name: 'Pro',
      tagline: '適合 AI 重度使用者',
      points: ['每月更多 Typeflux Cloud 額度', '不夠用時可以加購點數包', '按月或按年付費', '支援信用卡、支付寶和微信支付'],
      note: '隨時可以在 App 的「帳號」頁升級。',
    },
  },
  ios: {
    badge: '即將推出',
    title: 'Typeflux iPhone 版正在籌備中',
    desc: '在 iPhone 上繼續你的對話，用語音輸入，使用 Typeflux Cloud 或你自己的模型。我們正在準備上架。',
  },
  closing: {
    title: '一個快捷鍵，把事搞定',
    subtitle: '以 AGPL-3.0 開源、免費。公開開發，歡迎參與貢獻。',
    download: '免費下載 Typeflux',
    github: '在 GitHub 上按 Star',
  },
}

const ja = {
  hero: {
    eyebrow: 'Mac のための AI レイヤー',
    title: 'ワンキーで、\nMac の用事が片づく。',
    subtitle: '話して入力、AI エージェントに質問、何でも起動・検索、ポインタの位置にアクションリングを表示。どれも今いる場所でそのまま使えます。無料・オープンソースで、すべて Mac 上だけで動かすこともできます。',
    download: '無料ダウンロード',
    source: 'ソースを見る',
    requirement: 'macOS 13+ · Apple シリコン / Intel 対応',
    demoLabel: 'Typeflux デモ',
    scenes: {
      voice: {
        label: '話す',
        status: '聞いています…',
        text: 'デザインレビューを木曜の15時に移して、議題をチームに共有してください。',
      },
      agent: {
        label: '聞く',
        question: 'このページを3行で要約して',
        steps: ['表示中のページを読み込み', '要約を作成'],
        answer: 'リリースは5月12日に延期 · 予算は承認済み · 2職種を募集中',
      },
      launcher: {
        label: '探す・実行',
        query: 'fy good morning',
        results: ['翻訳：おはようございます', '「Good Morning.md」を開く', 'AI に聞く：good morning'],
      },
      ring: {
        label: '指す',
        hint: 'アクションの方向へ動かして離す',
      },
    },
  },
  entrances: {
    title: '4つの入口、どれもキーひとつで',
    subtitle: 'どれも作業中の場所で開き、アプリを切り替える必要はありません。ショートカットはすべて設定で変更できます。',
    items: {
      voice: { name: '音声入力', action: '押したまま話す', desc: 'どの入力欄にも音声で入力。選択した文章を声で書き直すこともできます。' },
      agent: { name: 'AI エージェント', action: '何でも聞く', desc: '画面や選択範囲を理解し、あなたの承認を得てから操作するエージェント。' },
      launcher: { name: 'ランチャー', action: '入力して探す・実行', desc: 'アプリ、ファイル、翻訳、クイック回答、コマンド、自作ワークフロー。' },
      ring: { name: 'リング', action: 'ポインタの位置でひと振り', desc: 'マウスの位置に開く、最大8つのアクションを持つ放射状メニュー。' },
    },
    more: '詳しく見る',
  },
  voice: {
    badge: '話す',
    title: '考えるスピードで、どのアプリにも入力',
    subtitle: 'キーを押したまま自然に話し、離すだけ。句読点付きのテキストがカーソル位置に入ります。ブラウザ、エディタ、ターミナル、チャットでも同じです。タイピングの約4倍の速さです。',
    points: [
      { title: '入力できる場所ならどこでも', desc: 'プラグインや連携は不要。入力欄があれば Typeflux が書き込みます。' },
      { title: '声で書き直す', desc: '文章を選択して「もっと短く」「英語にして」と話すと、選択範囲が置き換わります。' },
      { title: '場面ごとのペルソナ', desc: '仕事のメール、メモ、チャットで口調や語彙を切り替え。2つ目のショートカットに別のペルソナも設定できます。' },
      { title: 'ローカルでもクラウドでも', desc: 'SenseVoice、Whisper、Qwen3-ASR をオフラインで実行。60以上の言語に対応するクラウドのリアルタイム認識も使えます。' },
    ],
    stats: [
      { value: '~200', label: '語 / 分' },
      { value: '60+', label: '言語' },
      { value: '100%', label: 'オフライン対応' },
    ],
    demo: {
      app: 'メール',
      draft: 'チームの皆さん、ベータ版は金曜にリリースします。フィードバックは水曜までにお願いします。',
      status: '聞いています…',
      persona: 'ペルソナ：仕事のメール',
    },
  },
  agent: {
    badge: '聞く',
    title: 'あなたが見ているものを理解し、許可したときだけ動くエージェント',
    subtitle: 'ランチャーで質問を入力するか話しかけるだけ。画面、選択したテキスト、使用中のアプリを一緒に渡します。一度の回答で終わらない作業は、専用のワークスペースで進めます。',
    points: [
      { title: '文脈を理解', desc: 'スクリーンショット、選択範囲、添付ファイル、元のアプリが質問と一緒に届きます。' },
      { title: '実際に作業する', desc: 'Web の閲覧、許可したフォルダ内のファイルの読み書き、コード実行、画像生成。各操作はあなたの承認を待ちます。' },
      { title: 'あなた流に', desc: 'Skills の追加、MCP サーバーの接続、メモリとノート、モデルや推論レベルの選択。' },
      { title: '必要なときは完全プライベート', desc: '自分のモデルと API キーで、会話をこの Mac の中だけに留められます。' },
    ],
    demo: {
      user: 'ダウンロードにある3つの PDF を比較して、結果をノートに保存して。',
      steps: [
        { label: '~/Downloads の3ファイルを読み込み', state: 'done' },
        { label: 'ノート「ベンダー比較」を保存', state: 'approve' },
      ],
      approve: '許可',
      answer: '規模が大きいなら B 社が最安、契約期間が最短なのは C 社です。ノートに保存しました。',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: '探す・実行',
    title: 'キーワードも普通の言葉も通じるランチャー',
    subtitle: 'アプリ、ファイル、さらにファイルの中身まで検索。キーワードで翻訳、推敲、クイック回答、コマンド実行、カレンダー確認。それ以外の入力はそのまま AI へ。',
    points: [
      { title: '日常の作業にキーワード', desc: 'キーワードは名前の変更や別名の追加ができ、グローバルショートカットに割り当てればランチャーを開かずに実行できます。' },
      { title: 'ファイル名だけじゃない検索', desc: 'アプリ、ファイル、文書の中身、開いているブラウザのタブやブックマークを一つの入力欄から。' },
      { title: '自分だけのワークフロー', desc: 'Python、Node、Shell でプラグインを書くか、Alfred のワークフローを取り込んで、キーワードで実行。' },
    ],
    keywordsTitle: 'キーワードを試す',
    keywords: {
      fy: 'テキストや選択範囲を翻訳',
      rw: '選択したテキストを AI で推敲',
      qa: 'ランチャーの中ですぐ回答',
      cmd: 'シェルコマンドを実行',
      cal: 'カレンダー、祝日、予定',
      top: 'CPU、メモリ、プロセスをリアルタイム表示',
      tab: '開いているブラウザのタブへ移動',
      gif: '画面を録画して GIF / MP4 に',
    },
    placeholder: '検索、または何でも聞く…',
  },
  ring: {
    badge: '指す',
    title: 'ポインタのすぐそばにアクションリング',
    subtitle: 'ショートカットを押したままにすると、マウスの下にリングが開きます。アクションの方向へ動かして離せば実行、中央に戻して離せばキャンセル。最大8枠に Typeflux の機能、アプリ、Web サイト、フォルダ、キー操作、ショートカット、システム設定を配置できます。',
    tryTitle: 'ここで試す',
    tryHint: 'リングを押したままアクションの方向へドラッグして離します。1–6 キーでも選べます。',
    centerTitle: 'Typeflux',
    ran: '実行しました：{action}',
    idle: '未選択',
    actions: {
      dictation: '音声入力',
      ask: 'AI に聞く',
      translate: '翻訳',
      screenshot: 'スクリーンショット',
      screenshotText: '画面から文字をコピー',
      clipboard: 'クリップボード',
    },
  },
  toolbox: {
    title: '別々に入れていたツールが、ここにそろう',
    subtitle: 'キーワード、ショートカット、リングからすぐに開けて、モデルとプライバシー設定も共通です。',
    items: {
      screenshot: { name: 'スクリーンショットと注釈', desc: '矢印、モザイク、吹き出し、ピン留め、OCR、翻訳。' },
      recording: { name: '画面録画', desc: 'システム音声、マイク、カメラ映像付きで MP4 / GIF に。' },
      clipboard: { name: 'クリップボード履歴', desc: 'コピーしたものを画像も含めてカードで一覧。' },
      translate: { name: '翻訳と単語帳', desc: '複数の翻訳エンジンを並べて比較し、調べた単語を保存。' },
      notebook: { name: 'ノート', desc: 'チャット、AI の結果、画面の文字を Markdown ノートに。' },
      monitor: { name: 'システムモニタ', desc: 'CPU、メモリ、ディスク、ネットワーク、プロセスをひと目で。' },
      calendar: { name: 'カレンダー', desc: '旧暦、祝日、予定をランチャーで確認。' },
      terminal: { name: 'ターミナル', desc: '小さなフローティングターミナルでコマンドを一度だけ実行。' },
    },
  },
  scenarios: {
    title: '朝から夜まで、アプリはこれひとつ',
    subtitle: '4つの入口の組み合わせ方の例です。',
    tabs: {
      developer: {
        name: '開発者',
        steps: [
          'コミットメッセージやレビューコメントをエディタに直接口述。',
          'ランチャーで cmd git status。ターミナルを開く必要はありません。',
          'エージェントにログファイルを読ませ、テストが失敗する理由を説明させる。',
          'リングでバグ画面をスクリーンショットして Issue に貼る。',
        ],
      },
      writer: {
        name: 'ライター・マーケター',
        steps: [
          '「長文」ペルソナで下書きを一気に口述。',
          '段落を選んで「トーンはそのままで引き締めて」。',
          'エージェントにブラウザで調べてもらい、要点をノートに保存。',
          '以前コピーした断片をクリップボードの棚から取り出す。',
        ],
      },
      student: {
        name: '学生・研究者',
        steps: [
          'ローカルモデルで、講義中の考えをオフラインで記録。',
          'スライドやスキャン PDF から画面 OCR で文字をコピー。',
          'エージェントに3本の論文を比較させ、違いを整理。',
          '読みながら新しい単語を単語帳へ。',
        ],
      },
      global: {
        name: '多言語の仕事',
        steps: [
          'メッセージを選んで fy と入力し、母語で読む。',
          '声で返信し、翻訳ペルソナに相手の言語で書いてもらう。',
          '画像や動画の字幕など、画面のどこでも翻訳。',
          '2つの音声ショートカットで、日本語用と英語用を使い分け。',
        ],
      },
    },
  },
  privacy: {
    title: '高機能でも、主導権はあなたに',
    subtitle: 'リクエストの送り先はあなたが決めます。エージェントがあなたの許可なく Mac 上で操作することはありません。',
    items: [
      { title: 'Mac の中で動く', desc: 'ローカル音声モデルはオフラインで動作。声がデバイスの外に出る必要はありません。' },
      { title: '自分のモデルを使う', desc: 'OpenAI 互換、Anthropic、Responses、Ollama のエンドポイントを自分のキーで。' },
      { title: 'プライベートな会話', desc: 'エージェントとの会話と履歴をこの Mac だけに保存できます。' },
      { title: 'すべての操作に承認', desc: 'ファイルの変更、Web 閲覧、コード実行は事前に確認し、許可したフォルダ内に限定されます。' },
      { title: 'データを保持しない', desc: '音声やテキストを収集・保存・分析しません。' },
      { title: 'オープンソース', desc: 'すべてのコードを AGPL-3.0 で公開。誰でも監査できます。' },
    ],
  },
  plans: {
    title: '無料で始めて、AI をたくさん使うなら Pro',
    subtitle: 'すべての機能は無料版に入っています。プランで変わるのは Typeflux Cloud の AI 利用量だけです。',
    free: {
      name: '無料',
      price: '$0',
      tagline: 'すべての機能をずっと無料で',
      points: ['4つの入口とすべてのツール', 'ローカルモデルは無制限、文字数制限なし', '自分の API キーを利用可能', '毎月 Typeflux Cloud クレジット付き'],
      cta: '無料ダウンロード',
    },
    pro: {
      name: 'Pro',
      tagline: 'AI をよく使う人向け',
      points: ['毎月より多くの Typeflux Cloud クレジット', '足りないときは追加クレジットパック', '月払いまたは年払い', 'カード、Alipay、WeChat Pay に対応'],
      note: 'アプリの「アカウント」ページからいつでもアップグレードできます。',
    },
  },
  ios: {
    badge: '近日公開',
    title: 'Typeflux for iPhone を準備中',
    desc: 'iPhone で会話の続きを、音声入力で、Typeflux Cloud または自分のモデルで。現在リリースに向けて準備しています。',
  },
  closing: {
    title: 'ワンキーで、用事を片づけよう',
    subtitle: 'AGPL-3.0 のオープンソースで無料。オープンに開発しています。コントリビュート歓迎です。',
    download: 'Typeflux を無料ダウンロード',
    github: 'GitHub でスター',
  },
}

const ko = {
  hero: {
    eyebrow: 'Mac을 위한 AI 레이어',
    title: '키 하나로,\nMac의 일을 끝내세요.',
    subtitle: '말로 입력하고, AI 에이전트에게 묻고, 무엇이든 실행하고, 포인터 옆에서 액션 링을 펼치세요. 모두 지금 작업 중인 곳에서 바로 됩니다. 무료 오픈 소스이며, Mac 안에서만 동작하게 할 수도 있습니다.',
    download: '무료 다운로드',
    source: '소스 보기',
    requirement: 'macOS 13+ · Apple 실리콘 및 Intel 지원',
    demoLabel: 'Typeflux 데모',
    scenes: {
      voice: {
        label: '말하기',
        status: '듣고 있습니다…',
        text: '디자인 리뷰를 목요일 오후 3시로 옮기고 팀에 안건을 공유해 주세요.',
      },
      agent: {
        label: '묻기',
        question: '이 페이지를 세 줄로 요약해 줘',
        steps: ['현재 페이지 읽는 중', '요약 작성 중'],
        answer: '출시는 5월 12일로 연기 · 예산 승인 완료 · 두 자리 채용 중',
      },
      launcher: {
        label: '찾기·실행',
        query: 'fy good morning',
        results: ['번역: 좋은 아침입니다', '"Good Morning.md" 열기', 'AI에게 묻기: good morning'],
      },
      ring: {
        label: '가리키기',
        hint: '원하는 방향으로 움직인 뒤 놓으세요',
      },
    },
  },
  entrances: {
    title: '네 가지 입구, 모두 키 하나로',
    subtitle: '모두 지금 작업 중인 곳에서 열리므로 앱을 바꿀 필요가 없습니다. 모든 단축키는 설정에서 바꿀 수 있습니다.',
    items: {
      voice: { name: '음성 입력', action: '누른 채 말하기', desc: '어떤 입력란에든 말로 입력하고, 선택한 글을 말로 고칠 수도 있습니다.' },
      agent: { name: 'AI 에이전트', action: '무엇이든 묻기', desc: '화면과 선택 영역을 이해하고, 승인을 받은 뒤 작업하는 에이전트.' },
      launcher: { name: '런처', action: '입력해서 찾고 실행', desc: '앱, 파일, 번역, 빠른 답변, 명령어, 직접 만든 워크플로까지.' },
      ring: { name: '링', action: '포인터에서 한 번에', desc: '마우스 위치에 열리는, 최대 8개 액션의 원형 메뉴.' },
    },
    more: '자세히 보기',
  },
  voice: {
    badge: '말하기',
    title: '생각하는 속도로, 어떤 앱에서든 입력',
    subtitle: '키를 누른 채 자연스럽게 말하고 떼세요. 문장 부호가 들어간 텍스트가 커서 위치에 입력됩니다. 브라우저, 에디터, 터미널, 메신저 모두 똑같습니다. 타이핑보다 약 네 배 빠릅니다.',
    points: [
      { title: '입력할 수 있는 곳이면 어디서나', desc: '플러그인이나 연동이 필요 없습니다. 입력란만 있으면 Typeflux가 씁니다.' },
      { title: '말로 고쳐 쓰기', desc: '글을 선택하고 "더 짧게" 또는 "영어로 번역해 줘"라고 말하면 선택 영역이 바뀝니다.' },
      { title: '상황별 페르소나', desc: '업무 메일, 메모, 채팅마다 다른 어조와 어휘. 두 번째 단축키에 별도 페르소나도 지정할 수 있습니다.' },
      { title: '로컬 또는 클라우드 엔진', desc: 'SenseVoice, Whisper, Qwen3-ASR을 오프라인으로 실행하거나, 60개 이상 언어를 지원하는 클라우드 실시간 인식을 사용하세요.' },
    ],
    stats: [
      { value: '~200', label: '단어 / 분' },
      { value: '60+', label: '개 언어' },
      { value: '100%', label: '오프라인 지원' },
    ],
    demo: {
      app: '메일',
      draft: '팀 여러분, 베타는 금요일에 출시됩니다. 피드백은 수요일까지 부탁드립니다.',
      status: '듣고 있습니다…',
      persona: '페르소나: 업무 메일',
    },
  },
  agent: {
    badge: '묻기',
    title: '내가 보는 것을 이해하고, 허락할 때만 움직이는 에이전트',
    subtitle: '런처에서 질문을 입력하거나 말하세요. 화면, 선택한 텍스트, 사용 중인 앱을 함께 전달합니다. 한 번의 답으로 끝나지 않는 작업은 전용 작업 공간에서 이어집니다.',
    points: [
      { title: '맥락을 이해', desc: '스크린샷, 선택 영역, 첨부 파일, 원래 쓰던 앱이 질문과 함께 전달됩니다.' },
      { title: '실제로 작업', desc: '웹 탐색, 허용한 폴더의 파일 읽기·쓰기, 코드 실행, 이미지 생성. 모든 작업은 승인을 기다립니다.' },
      { title: '내 방식대로', desc: 'Skills 설치, MCP 서버 연결, 메모리와 노트, 모델과 추론 강도 선택.' },
      { title: '필요할 땐 완전히 비공개', desc: '내 모델과 API 키로 대화를 이 Mac 안에만 남길 수 있습니다.' },
    ],
    demo: {
      user: '다운로드 폴더의 PDF 세 개를 비교해서 결과를 노트에 저장해 줘.',
      steps: [
        { label: '~/Downloads의 파일 3개 읽기', state: 'done' },
        { label: '노트 "공급업체 비교" 저장', state: 'approve' },
      ],
      approve: '허용',
      answer: '규모가 커지면 B사가 가장 저렴하고, 계약 기간은 C사가 가장 짧습니다. 노트에 저장했습니다.',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: '찾기·실행',
    title: '키워드도, 평범한 말도 알아듣는 런처',
    subtitle: '앱, 파일, 파일 내용까지 검색하세요. 키워드로 번역, 다듬기, 빠른 답변, 명령 실행, 달력 확인을 하고, 나머지 입력은 바로 AI에게 보냅니다.',
    points: [
      { title: '일상 작업마다 키워드', desc: '키워드 이름을 바꾸거나 별칭을 추가하고, 전역 단축키에 연결하면 런처를 열지 않고 바로 실행됩니다.' },
      { title: '파일 이름 그 이상', desc: '앱, 파일, 문서 내용, 열린 브라우저 탭과 북마크를 하나의 입력창에서.' },
      { title: '나만의 워크플로', desc: 'Python, Node, Shell로 플러그인을 만들거나 Alfred 워크플로를 가져와 키워드로 실행하세요.' },
    ],
    keywordsTitle: '키워드 써 보기',
    keywords: {
      fy: '텍스트나 선택 영역 번역',
      rw: '선택한 글을 AI로 다듬기',
      qa: '런처 안에서 바로 답변',
      cmd: '셸 명령 실행',
      cal: '달력, 공휴일, 일정',
      top: 'CPU, 메모리, 프로세스 실시간 보기',
      tab: '열려 있는 브라우저 탭으로 이동',
      gif: '화면을 녹화해 GIF / MP4로',
    },
    placeholder: '검색하거나 무엇이든 물어보세요…',
  },
  ring: {
    badge: '가리키기',
    title: '포인터 바로 옆의 액션 링',
    subtitle: '단축키를 누르고 있으면 마우스 아래에 링이 열립니다. 원하는 액션 쪽으로 움직였다 놓으면 실행되고, 가운데로 돌아와 놓으면 취소됩니다. 최대 8칸에 Typeflux 기능, 앱, 웹사이트, 폴더, 키 조합, 단축어, 시스템 토글을 넣을 수 있습니다.',
    tryTitle: '여기서 써 보기',
    tryHint: '링을 누른 채 액션 쪽으로 끌었다가 놓으세요. 1–6 키로도 고를 수 있습니다.',
    centerTitle: 'Typeflux',
    ran: '실행함: {action}',
    idle: '선택 없음',
    actions: {
      dictation: '음성 입력',
      ask: 'AI에게 묻기',
      translate: '번역',
      screenshot: '스크린샷',
      screenshotText: '화면에서 텍스트 복사',
      clipboard: '클립보드',
    },
  },
  toolbox: {
    title: '따로 설치하던 도구가 모두 여기에',
    subtitle: '키워드, 단축키, 링에서 바로 열리며 같은 모델과 개인정보 설정을 공유합니다.',
    items: {
      screenshot: { name: '스크린샷과 주석', desc: '화살표, 모자이크, 말풍선, 고정, OCR, 번역.' },
      recording: { name: '화면 녹화', desc: '시스템 오디오, 마이크, 카메라 화면과 함께 MP4 / GIF로.' },
      clipboard: { name: '클립보드 기록', desc: '복사한 모든 것을 이미지까지 카드로 정리.' },
      translate: { name: '번역과 단어장', desc: '여러 번역 엔진을 나란히 비교하고 찾아본 단어를 저장.' },
      notebook: { name: '노트', desc: '대화, AI 결과, 화면 텍스트를 Markdown 노트로.' },
      monitor: { name: '시스템 모니터', desc: 'CPU, 메모리, 디스크, 네트워크, 프로세스를 한눈에.' },
      calendar: { name: '달력', desc: '음력, 공휴일, 일정을 런처에서 확인.' },
      terminal: { name: '터미널', desc: '작은 플로팅 터미널에서 명령을 한 번 실행.' },
    },
  },
  scenarios: {
    title: '아침부터 밤까지, 앱 하나로',
    subtitle: '네 가지 입구를 조합해 쓰는 몇 가지 방법입니다.',
    tabs: {
      developer: {
        name: '개발자',
        steps: [
          '커밋 메시지나 코드 리뷰 의견을 에디터에 바로 말로 입력.',
          '런처에서 cmd git status. 터미널을 열 필요가 없습니다.',
          '에이전트에게 로그 파일을 읽고 테스트 실패 원인을 설명하게 하기.',
          '링으로 버그 화면을 캡처해 이슈에 붙이기.',
        ],
      },
      writer: {
        name: '작가·마케터',
        steps: [
          '"긴 글" 페르소나로 초안을 빠르게 구술.',
          '문단을 선택하고 "어조는 유지하고 더 간결하게".',
          '에이전트가 브라우저에서 자료를 찾고 요점을 노트에 저장.',
          '예전에 복사한 조각을 클립보드 선반에서 다시 꺼내기.',
        ],
      },
      student: {
        name: '학생·연구자',
        steps: [
          '로컬 모델로 강의 중 떠오른 생각을 오프라인 기록.',
          '슬라이드나 스캔 PDF에서 화면 OCR로 텍스트 복사.',
          '에이전트에게 논문 세 편을 비교해 차이를 정리하게 하기.',
          '읽으면서 새 단어를 단어장에 저장.',
        ],
      },
      global: {
        name: '다국어 업무',
        steps: [
          '메시지를 선택하고 fy를 입력해 모국어로 읽기.',
          '말로 답하고 번역 페르소나가 상대 언어로 쓰게 하기.',
          '이미지, 영상 자막 등 화면 어디든 번역.',
          '음성 단축키 두 개로 한국어용과 영어용을 나눠 쓰기.',
        ],
      },
    },
  },
  privacy: {
    title: '강력하지만, 주도권은 여전히 당신에게',
    subtitle: '모든 요청이 어디로 갈지 직접 정합니다. 에이전트는 허락 없이 Mac에서 아무것도 실행하지 않습니다.',
    items: [
      { title: 'Mac 안에서 실행', desc: '로컬 음성 모델은 오프라인으로 동작해 목소리가 기기 밖으로 나가지 않아도 됩니다.' },
      { title: '내 모델 사용', desc: 'OpenAI 호환, Anthropic, Responses, Ollama 엔드포인트를 내 키로 사용합니다.' },
      { title: '비공개 대화', desc: '에이전트 대화와 기록을 이 Mac에만 보관할 수 있습니다.' },
      { title: '모든 작업은 승인 후', desc: '파일 변경, 웹 탐색, 코드 실행 전에 먼저 묻고, 허용한 폴더 안으로 범위를 제한합니다.' },
      { title: '데이터 미보관', desc: '음성이나 텍스트를 수집, 저장, 분석하지 않습니다.' },
      { title: '오픈 소스', desc: '모든 코드가 AGPL-3.0으로 공개되어 누구나 검토할 수 있습니다.' },
    ],
  },
  plans: {
    title: '무료로 시작하고, AI를 많이 쓰면 Pro로',
    subtitle: '모든 기능은 무료 앱에 들어 있습니다. 요금제는 Typeflux Cloud AI 사용량만 바꿉니다.',
    free: {
      name: '무료',
      price: '$0',
      tagline: '모든 기능을 계속 무료로',
      points: ['네 가지 진입점과 모든 도구', '로컬 모델 무제한, 글자 수 제한 없음', '내 API 키 사용 가능', '매월 Typeflux Cloud 크레딧 제공'],
      cta: '무료 다운로드',
    },
    pro: {
      name: 'Pro',
      tagline: 'AI를 많이 쓰는 분께',
      points: ['매월 훨씬 많은 Typeflux Cloud 크레딧', '부족할 땐 추가 크레딧 팩', '월간 또는 연간 결제', '카드, Alipay, WeChat Pay 지원'],
      note: '앱의 계정 페이지에서 언제든 업그레이드할 수 있습니다.',
    },
  },
  ios: {
    badge: '출시 예정',
    title: 'iPhone용 Typeflux를 준비하고 있습니다',
    desc: 'iPhone에서 대화를 이어 가고, 음성으로 입력하고, Typeflux Cloud나 내 모델을 사용하세요. 지금 출시를 준비하고 있습니다.',
  },
  closing: {
    title: '키 하나로 일을 끝내세요',
    subtitle: 'AGPL-3.0 오픈 소스이며 무료입니다. 공개적으로 개발하며 기여를 환영합니다.',
    download: 'Typeflux 무료 다운로드',
    github: 'GitHub에서 Star',
  },
}

export const HOME_COPY = {
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  ja,
  ko,
}

export function getHomeCopy(lang) {
  return HOME_COPY[lang] || HOME_COPY[DEFAULT_LANG]
}

// Replaces {name} placeholders; unknown names are left untouched.
export function formatCopy(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (match, name) => (name in values ? String(values[name]) : match))
}
