export default {
  hero: {
    eyebrow: '开源免费 · 为 Mac 打造',
    title: '查资料、找文件、写东西，\n随时叫出 Typeflux。',
    subtitle: '把 AI 助手、启动器、语音输入、截图录屏和剪贴板历史装进一个应用。想问什么、找什么、做什么，按下快捷键就能开始。',
    download: '下载 Mac 版',
    source: '查看源码',
    requirement: '支持 macOS 13 及以上版本 · 支持 Apple 芯片和 Intel · 无需注册即可开始使用',
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
    title: '常用的几样工具，这里都有。',
    items: {
      dictation: '语音输入',
      launcher: '启动器',
      chat: 'AI 助手',
      capture: '截图工具',
      recorder: '录屏工具',
      clipboard: '剪贴板历史',
      translator: '翻译工具',
    },
  },
  entrances: {
    title: '打字、说话，还是动动鼠标，都顺手。',
    subtitle: '快捷键都可以自己设置，按你的习惯来。',
    items: {
      agent: {
        name: 'AI 助手',
        action: '随便问',
        desc: '有问题直接问，有任务交给它。查资料、处理文件，也能帮你操作应用。',
      },
      launcher: {
        name: '启动器',
        action: '敲几个字就能找',
        desc: '输入几个字，找应用、找文件，或运行一条命令。',
      },
      voice: {
        name: '语音输入',
        action: '按住说话',
        desc: '按住说话，松开后文字就出现在光标处；选中文字，还能直接说怎么改。',
      },
      ring: {
        name: '操作圆环',
        action: '朝想用的那一项划一下',
        desc: '按住快捷键，在鼠标旁展开常用操作，划一下就能执行。',
      },
    },
    more: '了解更多',
  },
  agent: {
    badge: 'AI 助手（Agent）',
    title: '不光能聊，还能动手帮你做。',
    subtitle: '查资料、读文档、整理文件、运行命令，Typeflux 都能帮忙。你可以让它把会议纪要整理成周报，也可以让它看看日志，找找程序出错的原因。',
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
        desc: '运行代码、修改项目，并预览运行结果。',
      },
      images: {
        title: '生成图片',
        desc: '通过你配置的图片生成服务创作图片。',
      },
      memory: {
        title: '记忆与笔记',
        desc: '记住你的偏好，把回答存进笔记本。',
      },
      skills: {
        title: '技能（Skills）',
        desc: '从 GitHub 安装技能，为 AI 添加特定任务的操作指南。',
      },
      mcp: {
        title: '连接外部工具（MCP）',
        desc: '连接外部工具和数据源。',
      },
      models: {
        title: '选择模型',
        desc: '使用 Typeflux Cloud，或接入 OpenAI、Anthropic、Ollama 等模型服务。',
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
    modesTitle: '哪些操作要先问你，由你来定。',
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
        desc: '自动批准工具调用，适合你信任的任务。',
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
      agentLabel: 'Typeflux AI 助手',
    },
  },
  launcher: {
    badge: '启动器',
    title: '想找什么，敲几个字。',
    subtitle: '打开应用、查找文件、搜索文档里的内容，都从这个输入框开始。也能算个数、翻译一句话，或直接向 AI 提问。',
    capabilities: {
      files: {
        title: '查找文件',
        desc: '按文件名搜索，支持拼音和路径匹配。',
      },
      content: {
        title: '文档内容',
        desc: '在本机搜索 PDF、Markdown、文本里的文字（Apple 芯片）。',
      },
      commands: {
        title: '运行命令',
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
    badge: '窗口样式',
    title: '放在哪儿，长什么样，按你的习惯来。',
    subtitle: '语音输入可以显示在屏幕底部、角落或刘海处。搜索时用简洁的小窗口，需要查看历史对话、浏览网页时，再展开工作区。',
    tabs: {
      capsule: '语音胶囊',
      chat: '聊天与启动器',
    },
    capsule: {
      bottom: {
        name: '底部胶囊',
        desc: '显示在屏幕底部中央，随时查看语音输入状态。',
      },
      orb: {
        name: '光球胶囊',
        desc: '光球随声音律动，鼠标悬停时才显示按钮。',
      },
      corner: {
        name: '顶角卡片',
        desc: '像 Siri 一样出现在菜单栏下方的左上角或右上角，实时显示识别出的文字。',
      },
      notch: {
        name: '刘海岛',
        desc: '在 MacBook 刘海处展开，语音输入状态抬眼就能看到。',
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
        desc: '在同一个窗口里查看历史对话、浏览网页和预览文件。',
      },
    },
    sample: {
      search: '搜索或随便问…',
    },
  },
  voice: {
    badge: '语音输入',
    title: '懒得打字，就直接说。',
    subtitle: '按住快捷键说话，松开后，识别好的文字就会输入到光标处。写邮件、记笔记、回消息，都能用。',
    points: [
      {
        title: '直接输入到当前应用',
        desc: '不用安装额外插件，在邮件、笔记、聊天等应用里直接说话输入。',
      },
      {
        title: '写好了，也能说着改。',
        desc: '选中一段文字，说「精简一点」或「翻译成英文」，就能用修改后的内容替换原文。',
      },
      {
        title: '写邮件和回消息，可以用不同的语气。',
        desc: '按场景设置措辞和处理方式，也可以分别绑定快捷键。',
      },
      {
        title: '本地或云端引擎',
        desc: 'SenseVoice、Whisper、Qwen3-ASR 可离线运行；也可以用支持 60 多种语言的云端实时识别。',
      },
    ],
    stats: [
      {
        value: '按住说话',
        label: '语音输入',
      },
      {
        value: '60+',
        label: '云端识别语言',
      },
      {
        value: '支持离线',
        label: '本地语音识别',
      },
    ],
    demo: {
      app: '邮件',
      draft: '大家好，同步一下：测试版周五发布，反馈请在周三前提交。',
      status: '正在聆听…',
      persona: '语气：工作邮件',
    },
  },
  capture: {
    badge: '截图录屏',
    title: '截图、截长图、录屏，都在这里。',
    subtitle: '截一块区域、一个窗口，或把长页面拼成一张图。需要演示操作时，还能录下屏幕、声音和摄像头画面，导出视频或 GIF。',
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
    toolsTitle: '截完接着处理。',
    tools: ['箭头、形状和标注框', '步骤编号', '马赛克', '识别并遮盖手机号', '美化背景', '贴到屏幕', '截图取字', '截图翻译', '截图问 AI'],
  },
  clipboard: {
    badge: '剪贴板',
    title: '刚才复制的，还找得到。',
    subtitle: '按 ⇧⌘V 打开剪贴板历史。文字、链接、代码、图片，复制后都能在历史记录里查找，再次粘贴。',
    points: [
      {
        title: '留多久，你说了算。',
        desc: '保留一天、一周，或长期保存；重要内容还可以固定下来。',
      },
      {
        title: '搜索后再次粘贴',
        desc: '全文搜索，按应用筛选，或按 ⌘1–9 直接粘贴。',
      },
      {
        title: '常用片段',
        desc: '把常用的地址和回复单独存好，下次直接用。',
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
    badge: '操作圆环',
    title: '鼠标在哪，操作就在哪',
    subtitle: '按住快捷键，朝想用的操作划一下，松开就能执行。截图、翻译、语音输入，或打开常用应用，都可以放进圆环。移回圆心再松开，就能取消。最多可设置 8 项操作。',
    tryTitle: '在这里试一下',
    centerTitle: 'Typeflux',
    ran: '已执行「{action}」',
    actions: {
      dictation: '语音输入',
      ask: '随便问',
      translate: '翻译选中文字',
      screenshot: '截图',
      screenshotText: '截图取字',
      clipboard: '剪贴板历史',
    },
    label: '圆环演示。按住即可在指针处打开圆环。',
    steps: [
      ['按住', '下方桌面任意位置（或按住空格）：圆环出现在指针处。'],
      ['朝一个方向划动', '，扇区随之高亮；越过外圈时，边缘会被拉向指针。'],
      ['松开', '即执行；移回中心再松开则取消。'],
      ['只点一下', '（或轻按空格）圆环保持打开，可点击扇区、按 1–6 或方向键加回车。'],
    ],
    holding: '按住中…',
    effects: {
      dictation: '在光标处开始语音输入',
      ask: '在鼠标附近打开启动器，选中的文字已作为上下文',
      translate: '已翻译选中的文字',
      screenshot: '开始框选截图',
      screenshotText: '已识别并复制区域中的文字',
      clipboard: '已打开剪贴板历史',
    },
    doc: {
      title: '周会纪要',
      heading: '产品周会 · 10/21',
      lines: ['1. 圆环替换鼠标语音输入，本周出交互稿。', '3. 启动器关键词支持在圆环里直接调用。', '4. 下周评审 Liquid Glass 样式在 macOS 26 上的表现。'],
      selected: '常用操作就在鼠标旁边，划一下就能用。',
    },
  },
  more: {
    title: '还有这些小工具，平时也用得上。',
    subtitle: '翻译、查单词、看日历、记笔记、查看系统状态，在启动器里输入关键词就能打开。',
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
    title: '少个顺手的工具？自己加一个。',
    subtitle: '把需求告诉 AI，让它帮你编写小工具；也可以自己写脚本、添加工作流，把常用操作放进启动器。',
    items: {
      aiBuild: {
        title: '让 AI 帮你写',
        desc: '说清楚想做什么，让 AI 帮你编写和测试，确认后保存到启动器。',
      },
      workflows: {
        title: '把脚本变成工具',
        desc: '支持 Python、Node.js 和 Shell，设置一个关键词就能调用。',
      },
      gallery: {
        title: '从现成工作流开始',
        desc: '时间戳转换、JSON 格式化、生成二维码等，装好就能用。',
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
        title: '为常用操作设置快捷键',
        desc: '给任意关键字绑定全局快捷键，按下就直接执行。',
      },
      skills: {
        title: 'AI 技能（Skills）',
        desc: '为 AI 添加特定任务的操作指南，支持从 GitHub 安装。',
      },
      mcp: {
        title: '连接外部工具（MCP）',
        desc: '让 AI 连接你配置的外部工具和数据。',
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
    title: '放到你的日常工作里，试试看。',
    subtitle: '看看不同的人怎么用它。',
    tabs: {
      developer: {
        name: '开发者',
        steps: [
          '在启动器里输入 > git status，不用打开终端。',
          '让 AI 读日志文件，解释测试为什么失败。',
          '直接在编辑器里口述提交信息或代码评审意见。',
          '用长截图截下整个出错页面，贴进 Issue。',
        ],
      },
      writer: {
        name: '写作与运营',
        steps: ['让 AI 在浏览器里查资料，并把要点存成笔记。', '只记得报告里的一句话？搜这句话，找回那份文件。', '先把想法说出来，写成初稿后再慢慢改。', '从剪贴板卡片里找回之前复制的片段。'],
      },
      student: {
        name: '学生与研究',
        steps: ['让 AI 对比三篇论文，列出差异。', '用截图取字，从幻灯片或扫描版 PDF 里复制文字。', '录一段屏幕操作，导出 GIF 发给同学。', '阅读时把生词存进单词本。'],
      },
      global: {
        name: '跨语言工作',
        steps: ['选中消息，在启动器里输入 fy，翻译成你熟悉的语言。', '用中文说出回复，再翻译成对方的语言。', '翻译屏幕上的任意区域，图片、视频字幕都可以。', '让 AI 用对方的语言起草一封回信。'],
      },
    },
  },
  privacy: {
    title: '数据怎么处理，AI 能做什么，你来决定。',
    subtitle: '选择本地模型或云端服务，设置文件访问范围，以及哪些操作需要先征求你的同意。',
    items: [
      {
        title: '在本机运行',
        desc: '本地语音模型可离线使用，你的声音不必离开这台设备。',
      },
      {
        title: '接入自己的模型服务',
        desc: '支持 OpenAI 兼容接口、Anthropic、OpenAI Responses 和 Ollama，可配置自己的 API 密钥或本地服务。',
      },
      {
        title: '私密对话',
        desc: '私密对话的记录只保存在本机；使用远程模型时，对话内容仍会发送给所选服务商处理。',
      },
      {
        title: '边界由你设定',
        desc: '默认情况下，修改文件、执行命令前都会先问你，范围限定在你授权的文件夹。',
      },
      {
        title: '按所选服务处理数据',
        desc: '本地语音识别在设备上完成；使用云端功能时，相关内容会发送至对应服务处理。',
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
    title: '下载试试，从一件小事开始。',
    subtitle: '找一份文件，口述一段文字，或者把手头的任务交给 AI。',
    download: '免费下载 Typeflux',
    github: '查看 GitHub 项目',
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
      detected: '检测到英语',
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
      saveTo: '保存到桌面',
      copy: '复制',
      saveMp4: '保存 MP4',
      saveGif: '保存 GIF',
      scrolling: '正在自动滚动 · 移动鼠标即可手动滚动',
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
    desktop: {
      menus: ['文件', '编辑', '显示', '窗口', '帮助'],
      clock: '10月21日 周三 10:24',
    },
  },
}
