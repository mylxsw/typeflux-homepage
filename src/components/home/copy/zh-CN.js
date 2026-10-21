export default {
  hero: {
    eyebrow: '开源免费 · macOS 应用',
    title: '一个快捷键，\nMac 上的事就办了。',
    subtitle: '一个全能的 AI Agent，一个什么都能找到、什么都能执行的启动器，再加上语音输入、截图录屏和剪贴板历史。一个应用，一个快捷键，就在你正在用的地方。',
    download: '下载 Mac 版',
    source: '在 GitHub 上点 Star',
    requirement: 'macOS 13+ · 支持 Apple 芯片与 Intel · 无需注册即可使用',
    demoLabel: 'Typeflux 演示',
    scenes: {
      agent: {
        label: '问',
      },
      launcher: {
        label: '找 / 做',
      },
      voice: {
        label: '说',
        text: '把设计评审改到周四下午三点，再把议程发给大家。',
      },
      ring: {
        label: '点',
        hint: '划向一个操作，松开即可',
      },
    },
  },
  replaces: {
    title: '一个应用，顶七个',
    items: {
      dictation: '语音输入法',
      launcher: '启动器',
      chat: 'AI 聊天',
      capture: '截图工具',
      recorder: '录屏工具',
      clipboard: '剪贴板管理',
      translator: '翻译工具',
    },
  },
  entrances: {
    title: '四个入口，都只差一个快捷键',
    subtitle: '每个入口都在你当前的位置打开，不用切换应用。所有快捷键都可以在设置里修改。',
    items: {
      agent: {
        name: 'AI Agent',
        action: '随便问',
        desc: '能聊天、搜索、浏览网页、执行命令、处理你的文件。',
      },
      launcher: {
        name: '启动器',
        action: '输入即可找到、办到',
        desc: '任何应用、任何文件、任何命令，或者直接问 AI。',
      },
      voice: {
        name: '语音输入',
        action: '按住说话',
        desc: '在任意输入框里说话打字，或选中文字后说出怎么改。',
      },
      ring: {
        name: '圆环',
        action: '在鼠标处一划',
        desc: '常用操作排成一圈，就在鼠标下方弹出。',
      },
    },
    more: '了解更多',
  },
  agent: {
    badge: 'AI Agent',
    title: '真正能帮你把事办完的 AI Agent',
    subtitle: '不只是一个聊天框。Typeflux 会聊天、联网搜索、打开网页、读写文件、执行命令，还能操作应用，直到把事情办完。让它帮你整理「下载」文件夹、查出 Mac 为什么卡，或者把会议纪要改成周报。',
    capabilities: {
      chat: {
        title: '对话',
        desc: '支持长对话、历史记录、附件、截图和图表。',
      },
      web: {
        title: '联网搜索',
        desc: '帮你查资料，并注明信息来源。',
      },
      browser: {
        title: '内置浏览器',
        desc: '在侧边栏打开网站、读取页面、填写表单。',
      },
      files: {
        title: '你的文件',
        desc: '在你授权的文件夹里读写文件。',
      },
      commands: {
        title: '执行命令',
        desc: '在你的 Mac 上运行终端命令和脚本。',
      },
      computer: {
        title: '操作应用',
        desc: '看屏幕、点击、输入，替你完成操作。',
      },
      code: {
        title: '代码与项目',
        desc: '运行代码、修改项目，并预览做出来的东西。',
      },
      images: {
        title: '生成图片',
        desc: '用你选择的服务商生成图片。',
      },
      memory: {
        title: '记忆与笔记',
        desc: '记住你的偏好，把回答存进笔记本。',
      },
      skills: {
        title: 'Skills',
        desc: '从 GitHub 安装技能，教它做新的事。',
      },
      mcp: {
        title: 'MCP',
        desc: '连接外部工具和数据源。',
      },
      models: {
        title: '任意模型',
        desc: 'Typeflux Cloud，或你自己的 OpenAI、Anthropic、Ollama。',
      },
    },
    examplesTitle: '试着这样问',
    examples: [
      '把「下载」文件夹按文件类型整理一下',
      '我的 Mac 为什么这么烫？',
      '总结这三份 PDF，把要点存进笔记',
      '看看 GitHub 上的未读通知，整理成待办',
      '帮我做一个时间戳转换的小工具',
      '按拍摄日期给这些照片重命名',
    ],
    modesTitle: '它能自己做多少，由你决定',
    modes: {
      strict: {
        name: '每步都问',
        desc: '每次调用工具都要你批准。',
      },
      standard: {
        name: '标准',
        desc: '读取类操作自动进行，改动之前先问你。',
      },
      auto: {
        name: '全自动',
        desc: '每一步都自动执行，适合放心交给它的长任务。',
      },
    },
    demo: {
      user: '帮我整理「下载」文件夹：按类型分到不同文件夹，并删掉一个月前的安装包。',
      steps: [
        {
          label: '已列出 ~/Downloads 中的 214 个文件',
          state: 'done',
        },
        {
          label: '已创建 图片、文档、压缩包 文件夹',
          state: 'done',
        },
        {
          label: '删除 12 个旧安装包（3.1 GB）',
          state: 'approve',
        },
      ],
      approve: '允许',
      answer: '已把 202 个文件分到 5 个文件夹。删除 12 个安装包前需要你确认。',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: '启动器',
    title: '敲几个字，什么都能找到、都能执行',
    subtitle: '一个输入框，搜遍 Mac 上的应用和文件、文档里的文字，还能执行终端命令、直接问 AI。它可以像 Spotlight 一样在屏幕中央打开，也可以停在你上次拖到的位置；可以是一条简洁的搜索栏，也可以是完整的结果窗口。',
    capabilities: {
      files: {
        title: '任何文件',
        desc: '全盘文件名秒搜，支持拼音和路径匹配。',
      },
      content: {
        title: '文档内容',
        desc: '在本机搜索 PDF、Markdown、文本里的文字（Apple 芯片）。',
      },
      commands: {
        title: '任何命令',
        desc: '在悬浮终端里运行，或交给「终端」和 iTerm。',
      },
      ask: {
        title: '一键问 AI',
        desc: '输入任何内容后按 ⌘↩，直接发起对话。',
      },
      apps: {
        title: '应用与窗口',
        desc: '打开、切换、退出应用，不用碰鼠标。',
      },
      system: {
        title: '系统控制',
        desc: '睡眠、深色模式、蓝牙、系统信息和实时监控。',
      },
      web: {
        title: '网页与浏览器',
        desc: '搜索网页，或直接跳到已打开的标签页和书签。',
      },
      calc: {
        title: '即时结果',
        desc: '边输入边出结果：计算、进制转换、翻译、日期。',
      },
    },
    demos: {
      apps: '打开应用',
      files: '找文件',
      cmd: '执行命令',
      translate: '翻译',
      quickAsk: '快速提问',
      calendar: '日历',
      monitor: '系统监控',
      system: '本机配置',
    },
    placeholder: '搜索或随便问…',
    demosTitle: '看看它能做什么',
  },
  forms: {
    badge: '形态',
    title: '按你喜欢的样子出现',
    subtitle: '语音胶囊出现在哪里、聊天以什么形态打开，都由你选。不用的时候，它们从不打扰你。',
    tabs: {
      capsule: '语音胶囊',
      chat: '聊天与启动器',
    },
    capsule: {
      bottom: {
        name: '底部胶囊',
        desc: '屏幕底部居中的小胶囊，轻巧不打扰，适合所有显示器。',
      },
      orb: {
        name: '光球胶囊',
        desc: '光球随声音律动，鼠标悬停时才显示按钮。',
      },
      corner: {
        name: '顶角卡片',
        desc: '像 Siri 一样出现在菜单栏下方的左上角或右上角，实时显示转写。',
      },
      notch: {
        name: '刘海岛',
        desc: '从 MacBook 刘海中生长出来，视线无需离开屏幕顶部。',
      },
    },
    chat: {
      launcher: {
        name: '完整启动器',
        desc: '像 Spotlight 一样居中，或停在你上次拖到的位置。',
      },
      compact: {
        name: '简约搜索栏',
        desc: '开始输入前只是一条细细的搜索栏。',
      },
      quick: {
        name: '快速回答',
        desc: '答案直接显示在启动器里，不用打开新窗口。',
      },
      workspace: {
        name: '工作区',
        desc: '历史对话、聊天区，以及放浏览器和预览的侧边栏。',
      },
    },
    sample: {
      search: '搜索或随便问…',
    },
  },
  voice: {
    badge: '语音输入',
    title: '想到哪说到哪，任何应用都能输入',
    subtitle: '按住快捷键，自然地说，松开。带标点的文字直接出现在光标处，浏览器、编辑器、终端、聊天软件都一样。比打字快约四倍。',
    points: [
      {
        title: '能打字的地方都能用',
        desc: '不需要插件或集成。只要有输入框，Typeflux 就能写进去。',
      },
      {
        title: '用语音改写',
        desc: '选中文字，说「再精简一点」或「翻译成英文」，结果直接替换选区。',
      },
      {
        title: '不同场景，不同人设',
        desc: '工作邮件、笔记、聊天各用一套语气和词汇；还能给第二个快捷键单独配一个人设。',
      },
      {
        title: '本地或云端引擎',
        desc: 'SenseVoice、Whisper、Qwen3-ASR 可离线运行；也可以用支持 60 多种语言的云端实时识别。',
      },
    ],
    stats: [
      {
        value: '~200',
        label: '字词 / 分钟',
      },
      {
        value: '60+',
        label: '种语言',
      },
      {
        value: '100%',
        label: '可离线运行',
      },
    ],
    demo: {
      app: '邮件',
      draft: '大家好，同步一下：测试版周五发布，反馈请在周三前提交。',
      status: '正在聆听…',
      persona: '人设：工作邮件',
    },
  },
  capture: {
    badge: '截图录屏',
    title: '截图、长截图、录屏，一个就够',
    subtitle: '框选一块区域、截下整个屏幕，或者把一直往下滚的长页面拼成一张图。录屏可以带上系统声音和摄像头，导出 MP4 或 GIF，再标注、分享。',
    modes: {
      region: {
        name: '框选截图',
        desc: '拖出想要的区域，放大镜帮你对齐到像素。',
      },
      fullScreen: {
        name: '全屏截图',
        desc: '一键截下整个屏幕。',
      },
      scrolling: {
        name: '长截图',
        desc: '自动帮你滚动页面，拼成一张完整的长图。',
      },
      recording: {
        name: '录屏',
        desc: '支持系统声音、麦克风和摄像头画中画，可以暂停和裁剪。',
      },
      gif: {
        name: 'GIF',
        desc: '把一段短录屏变成随处可播的 GIF。',
      },
    },
    toolsTitle: '截完之后，还能',
    tools: ['箭头、形状和标注框', '序号步骤', '马赛克', '识别并遮盖手机号', '美化背景', '贴到屏幕', '截图取字', '截图翻译', '截图问 AI'],
  },
  clipboard: {
    badge: '剪贴板',
    title: '复制过的一切，想保留多久就多久',
    subtitle: '按 ⇧⌘V，剪贴板历史以卡片形式从屏幕底部滑出：文字、链接、代码、图片，都能搜索、随时粘贴。',
    points: [
      {
        title: '保留一天，或者永久',
        desc: '历史保留多久由你决定。固定的记录和片段永不过期。',
      },
      {
        title: '一秒找到',
        desc: '全文搜索，按应用筛选，或按 ⌘1–9 直接粘贴。',
      },
      {
        title: '常用片段',
        desc: '把地址、常用回复存成片段，在哪里都能粘贴。',
      },
    ],
    retentionTitle: '历史保留',
    retention: ['1 天', '1 周', '1 个月', '1 年', '永久'],
    cards: {
      text: {
        kind: '文本',
        time: '已固定',
        body: '收货地址：上海市徐汇区漕溪北路 88 号 1203 室',
      },
      link: {
        kind: '链接',
        time: '2 分钟前',
        body: 'typeflux.app/releases',
      },
      code: {
        kind: '代码',
        time: '5 分钟前',
        body: 'git commit -m "Reposition the homepage"',
      },
      image: {
        kind: '图片',
        time: '12 分钟前',
        body: '1920 × 1080 · 842 KB',
      },
      note: {
        kind: '文本',
        time: '昨天',
        body: '设计评审改到周四下午三点',
      },
    },
    search: '搜索剪贴板',
  },
  ring: {
    badge: '圆环',
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
  more: {
    title: '还有许多每天都用得上的小功能',
    subtitle: '在启动器里输入一个关键字就能打开。',
    items: {
      translate: {
        name: '翻译',
        desc: '多个翻译引擎并排对比，选中文字或屏幕区域都能翻。',
      },
      wordBook: {
        name: '单词本',
        desc: '查过的词存下来，随时复习。',
      },
      calendar: {
        name: '日历',
        desc: '月历、节假日、农历和你的日程。',
      },
      monitor: {
        name: '系统监控',
        desc: 'CPU、内存、磁盘、网络和进程。',
      },
      terminal: {
        name: '终端',
        desc: '在小型悬浮终端里运行一次性命令。',
      },
      notebook: {
        name: '笔记本',
        desc: '对话、AI 结果、截图文字都能存成 Markdown 笔记。',
      },
      emoji: {
        name: '表情',
        desc: '按名称搜索并粘贴表情。',
      },
      tabs: {
        name: '标签页与书签',
        desc: '支持 Safari、Chrome、Arc、Edge 和 Dia。',
      },
    },
  },
  custom: {
    badge: '自定义',
    title: '缺个功能？一分钟做一个。',
    subtitle: 'Typeflux 不是一份固定的功能清单，而是一个平台。让 Agent 帮你做工具，自己写工作流，或者装上 Skills、接入 MCP。',
    items: {
      aiBuild: {
        title: '让 AI 帮你做',
        desc: '在聊天里描述你想要的工具，Agent 会写好、测试好，并加到启动器里。',
      },
      workflows: {
        title: '用任何语言写工作流',
        desc: 'Python、Node、Shell 都行：一个文件夹，一份清单，一个关键字。',
      },
      gallery: {
        title: '18 个现成工作流',
        desc: '时间戳、JSON、二维码、UUID、汇率、Cron 等等。',
      },
      alfred: {
        title: '导入 Alfred 工作流',
        desc: '你已经在用的工作流，可以直接带过来。',
      },
      aiCommands: {
        title: '自定义 AI 指令',
        desc: '把一段提示词变成关键字，比如 rw 润色、sum 总结。',
      },
      hotkeys: {
        title: '任何功能都能绑快捷键',
        desc: '给任意关键字绑定全局快捷键，按下就直接执行。',
      },
      skills: {
        title: 'Agent 技能',
        desc: '从 GitHub 安装 Skills，教 Agent 做新的事。',
      },
      mcp: {
        title: 'MCP 服务',
        desc: '把 Agent 接到你自己的工具和数据上。',
      },
    },
    demo: {
      user: '帮我做个工具：输入 ts 加一个 Unix 时间戳，就显示对应的日期。',
      steps: ['已用 Python 写好工作流「ts」', '已用 1760000000 测试通过', '可以保存了'],
      result: 'ts 1760000000 → 2025-10-09 16:53:20（北京时间）',
      save: '保存到启动器',
    },
  },
  scenarios: {
    title: '从早到晚，一个应用就够了',
    subtitle: '看看不同的人怎么用它。',
    tabs: {
      developer: {
        name: '开发者',
        steps: [
          '在启动器里输入 > git status，不用打开终端。',
          '让 Agent 读日志文件，解释测试为什么失败。',
          '直接在编辑器里口述提交信息或代码评审意见。',
          '用长截图截下整个出错页面，贴进 Issue。',
        ],
      },
      writer: {
        name: '写作与运营',
        steps: ['让 Agent 在浏览器里查资料，并把要点存成笔记。', '凭里面的一句话，找到上个季度的报告。', '全速口述初稿，再说一句「再紧凑一点」。', '从剪贴板卡片里找回之前复制的片段。'],
      },
      student: {
        name: '学生与研究',
        steps: ['让 Agent 对比三篇论文，列出差异。', '用截图取字，从幻灯片或扫描版 PDF 里复制文字。', '录一段屏幕操作，导出 GIF 发给同学。', '阅读时把生词存进单词本。'],
      },
      global: {
        name: '跨语言工作',
        steps: ['选中一条消息，输入 fy，用母语读懂它。', '用语音回复，让翻译人设帮你写成对方的语言。', '翻译屏幕上的任意区域，图片、视频字幕都可以。', '让 Agent 用对方的语言起草一封回信。'],
      },
    },
  },
  privacy: {
    title: '能力很强，控制权仍在你手里',
    subtitle: '每个请求发到哪里、Agent 能自己做多少，都由你决定。',
    items: [
      {
        title: '在本机运行',
        desc: '本地语音模型可离线使用，你的声音不必离开这台设备。',
      },
      {
        title: '自带模型',
        desc: '支持 OpenAI 兼容、Anthropic、Responses 和 Ollama 接口，使用你自己的 Key。',
      },
      {
        title: '私密对话',
        desc: 'Agent 对话及其历史可以只保存在这台 Mac 上。',
      },
      {
        title: '边界由你设定',
        desc: '默认情况下，修改文件、执行命令前都会先问你，范围限定在你授权的文件夹。',
      },
      {
        title: '不留存数据',
        desc: '我们不收集、不存储、不分析你的语音和文字。',
      },
      {
        title: '开源',
        desc: '全部代码以 AGPL-3.0 公开，任何人都可以审计。',
      },
    ],
  },
  ios: {
    badge: '即将上线',
    title: 'Typeflux iPhone 版正在筹备中',
    desc: '在 iPhone 上继续你的对话，用语音输入，使用 Typeflux Cloud 或你自己的模型。我们正在准备上线。',
  },
  closing: {
    title: '一个快捷键，把事办了',
    subtitle: '基于 AGPL-3.0 开源、免费。下载之后按下 ⌘Space，让它帮你做点什么。',
    download: '免费下载 Typeflux',
    github: '在 GitHub 上点 Star',
  },
  ui: {
    launcher: {
      hints: ['↑ 最近输入', '⌘↩ 问 AI', '⌘K 上下文'],
      appsGroup: '应用',
      filesGroup: '文件',
      aiGroup: 'AI',
      askAi: '问 AI',
      open: '打开',
    },
    apps: {
      items: ['邮件', '备忘录', '日历', '音乐', '照片', '终端', '预览'],
    },
    files: {
      query: '发票',
      items: [['发票-2026-09.pdf', '~/文稿/财务'], ['发票-2026-08.pdf', '~/下载'], ['三季度报销.xlsx', '~/文稿/财务']],
      contentGroup: '文件内容',
      contentItem: ['会议纪要.md', '…周五前把 9 月发票交给财务…'],
    },
    monitor: {
      chip: '系统监控',
      placeholder: '筛选进程：名称或 PID',
      live: '实时 · 每 1 秒 · Apple M3 Max · 14 核 · 36 GB',
      uptime: '电池 99% · 散热 正常',
      cards: {
        cpu: ['CPU', '14 核 · 负载 3.10'],
        mem: ['内存', '22.4 GB / 36 GB'],
        disk: ['磁盘', '读 12MB/s · 写 640K/s'],
        net: ['网络', '↑ 4.2 KB/s'],
      },
      processes: '进程 共 612 个',
      sorts: ['按 CPU', '按内存', '按磁盘'],
      cols: ['名称', 'CPU', '内存', '磁盘', 'PID'],
      hints: '↑↓ 选择进程 · ⇥ 切换指标 · ⌘O 独立窗口 · esc 返回',
    },
    calendar: {
      chip: '日历',
      placeholder: '日期、节日或日程：12-25、下周五、春节…',
      month: '2026年10月',
      monthSub: '丙午年 · 马年',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      todayButton: '今天 ⌘T',
      dayTitle: '10月21日',
      dayWeek: '周三',
      today: '今天',
      dayMeta: '农历九月十二 · 第 43 周 · 第 294 天',
      eventsTitle: '日程',
      events: [['10:00', '产品评审'], ['15:30', '设计评审']],
      newEvent: '在日历中新建 ⌘N',
      legend: ['放假', '调休上班'],
      marks: [[1, '国庆节'], [18, '重阳节']],
      holidayPlan: true,
      hints: '←→↑↓ 选择日期 · ⌘←→ 切换月份 · ⇥ 日程 · ↩ 打开 · esc 返回',
    },
    system: {
      chip: '本机配置',
      placeholder: '搜索配置项：IP、序列号、分辨率、电池…',
      nav: ['概览', '处理器', '内存', '存储', '显示与图形', '网络', '电池', '系统'],
      device: 'MacBook Pro (14 英寸)',
      deviceSub: 'Apple M3 Max · macOS 26',
      tiles: [
        ['处理器', 'Apple M3 Max', '14 核 CPU · 30 核 GPU'],
        ['内存', '36 GB', '统一内存'],
        ['存储', '995 GB', '可用 509 GB'],
        ['显示与图形', '3024 × 1964', '120 Hz'],
        ['网络', 'Wi-Fi', '192.168.1.20'],
        ['电池', '99%', '使用电池'],
      ],
      status: '已读取 · 刚刚',
      hints: '↑↓ 选择 · ↩ 复制 · ⌘1–8 切换分区',
      copyReport: '⇧⌘C 复制报告',
    },
    translate: {
      chip: '翻译',
      query: 'hello',
      detected: '检测到 英语',
      target: '简体中文',
      engine: 'AI · Typeflux Cloud',
      wordBook: '单词本',
      word: 'hello',
      meaning: '你好',
      phonetics: ['UK /həˈləʊ/', 'US /həˈloʊ/'],
      defs: [['interj.', '你好；喂（打电话或引起注意时用）'], ['n.', '问候；招呼；“你好”这句话']],
      example: ['She smiled and said hello to me.', '她微笑着对我说了声“你好”。'],
      synonymsLabel: '近义',
      synonyms: ['hi', 'hey', 'greetings'],
      compare: '对照',
      local: '本机翻译',
      localTag: '不出本机',
      localResult: '你好',
      hints: '↩ 复制第一项 · ⌘1–9 复制第 n 项 · ⌥↩ 插入 · ⇥ 换语言',
    },
    quickAsk: {
      chip: '快速提问',
      query: '怎么让 MacBook 电池更耐用？',
      title: '最有效的几个办法',
      sections: [
        ['设置', ['离开电源时打开低电量模式。', '把屏幕亮度调低一两档，屏幕是最耗电的部件。']],
        ['习惯', ['退出不用的应用，尤其是在播视频的浏览器标签页。', '保持 macOS 为最新版本，及时获得电池相关的修复。']],
      ],
      tail: '要我帮你看看现在哪些应用最耗电吗？',
      actions: ['复制', '继续追问'],
      actionsRight: ['在聊天中打开', '新问题'],
    },
    terminal: {
      title: '$ git log --oneline -5',
      running: '运行中',
      shell: 'zsh · 登录 + 交互',
      interrupt: '^C 中断',
      stop: '停止',
    },
    chat: {
      newChat: '新对话',
      search: '搜索对话',
      scopes: ['全部', '云端', '仅本机'],
      groups: ['今天', '昨天', '更早'],
      conversations: [
        ['整理下载文件夹', '20:47'],
        ['周报初稿', '15:52'],
        ['提取截图中的文字', '13:15'],
        ['帮我做一个俄罗斯方块', '22:38'],
        ['给小狗起个名字', '22:38'],
        ['配置 SSH 登录服务器', '20:41'],
        ['周末出游计划', '10月18日'],
        ['帮我改写这个标题', '10月18日'],
      ],
      composer: '输入问题，/ 调用命令',
      user: 'Alex',
      empty: '有什么想问的？',
      emptyHint: '随时按 ⌘Space 唤起 · 按住 Fn 语音输入',
    },
    clipboard: {
      forms: ['列表', '卡片架'],
      tabs: ['剪贴板', '转写', '片段'],
      items: [
        ['发布前检查清单', '文本 · 18 字 · 备忘录 · 2 分钟前'],
        ['https://typeflux.app/releases', '链接 · typeflux.app · Safari · 5 分钟前'],
        ['PNG · 1280×720 · 642 KB', '预览 · 21 分钟前'],
        ['设计评审改到周四下午三点', '文本 · 12 字 · 邮件 · 1 小时前'],
      ],
      count: '500 项',
      actions: [['快速查看', '⌘Y'], ['固定', '⌘P'], ['粘贴', '↩']],
      shelfHints: '↩ 粘贴 · ⌘↩ 粘贴为纯文本 · Space 预览 · ⌘P 固定 · ⌘1–9 快速粘贴',
    },
    capture: {
      size: '640 × 360 pt · 1280 × 720 px',
      sources: ['区域', '窗口', '全屏'],
      options: '选项',
      recover: '恢复录制 (2)',
      start: '开始录制',
      recordInfo: '1280 × 720 · MP4 · 30 FPS · 倒计时 3 秒',
      recordHints: '↩ 开始 · esc 取消 · ⇥ 切换来源',
      editorTitle: '录屏 2026-10-21 10.24.35',
      setCurrent: '设为当前',
      keep: '保留 6.0 秒（完整）',
      meta: '1280 × 720 · 30 FPS · 约 2.4 MB',
      metaSub: '视频 · 含声音',
      saveTo: '保存到 桌面',
      copy: '复制',
      saveMp4: '保存 MP4',
      saveGif: '保存 GIF',
      scrolling: '正在自动滚动 · 动鼠标即可接管',
      stitched: '已拼接 3 屏',
      trimStart: '起点',
      trimEnd: '终点',
    },
    voice: {
      app: '备忘录',
      listening: '正在聆听',
      transcript: '帮我把会议改到周四下午',
      cancel: '取消',
      done: '完成',
    },
    ring: {
      actionsCount: '6 个操作',
    },
  },
}
