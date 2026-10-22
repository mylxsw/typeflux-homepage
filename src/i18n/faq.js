// Home page FAQ, grouped by topic. The visible FAQ section and the FAQPage
// structured data both read these groups (see getFaqItems in ./index.jsx),
// so every question here is also what search engines see.
// Group ids are shared across languages and used as anchors (#faq-<id>).

export const FAQ_GROUP_IDS = ['basics', 'agent', 'voice', 'privacy', 'compare']

export const FAQ_COPY = {
  en: {
    title: 'Frequently asked questions',
    subtitle: 'What Typeflux does, how it handles your data, and how it compares with the apps you use today.',
    jump: 'Topics',
    help: {
      title: 'Still have a question?',
      desc: 'Ask on GitHub. Bug reports and feature ideas are welcome too.',
      link: 'Open an issue',
    },
    groups: [
      {
        id: 'basics',
        title: 'Getting started',
        items: [
          {
            q: 'What is Typeflux?',
            a: 'Typeflux is a free, open-source AI layer for macOS. One app gives you an AI agent that gets tasks done, a launcher that finds and runs anything, voice input in any app and a ring of actions at your pointer, plus screenshots, screen recording, clipboard history, translation and a calendar. Each one is a single shortcut away, right where you are working.',
          },
          {
            q: 'Is Typeflux free to use?',
            a: 'Yes. Typeflux is free and open source under the AGPL-3.0 license, and every feature works without payment. Local models and your own API keys cost nothing extra; Typeflux Cloud is optional.',
          },
          {
            q: 'What do I need to run Typeflux?',
            a: 'A Mac with macOS 13 or later, on Apple silicon or Intel. You can start without an account. Some features ask for a macOS permission the first time you use them, such as Accessibility to insert text or Screen Recording for screenshots. Searching inside documents requires Apple silicon.',
          },
          {
            q: 'Is there an iPhone app?',
            a: 'Typeflux for iPhone is in preparation and coming soon. It will let you continue your conversations, dictate by voice and use Typeflux Cloud or your own models.',
          },
        ],
      },
      {
        id: 'agent',
        title: 'AI agent and launcher',
        items: [
          {
            q: 'Can the AI agent change things on my Mac without asking?',
            a: 'Not unless you allow it. In the default mode the agent reads on its own but asks before it changes files, runs commands or operates apps, and file access is limited to folders you grant. You can switch a conversation to ask every time, or to full auto for trusted tasks.',
          },
          {
            q: 'Which AI models can I use?',
            a: 'Typeflux Cloud works out of the box, or bring your own: any OpenAI-compatible API, Anthropic, the OpenAI Responses API, or local models through Ollama. You choose the model per conversation, and a private conversation stays on your Mac with your own models.',
          },
          {
            q: 'Can I add my own tools and workflows?',
            a: 'Yes. Describe a tool in chat and the agent writes, tests and saves it to the launcher. You can also write workflows in Python, Node or Shell, import Alfred workflows, install agent Skills from GitHub, connect MCP servers, and bind any feature or keyword to a global shortcut.',
          },
        ],
      },
      {
        id: 'voice',
        title: 'Voice input',
        items: [
          {
            q: 'Which apps does voice input work in?',
            a: 'Any app you can type in. Hold Fn, speak, and the text is inserted at the cursor of the active field, with no plugins or integrations. Select text first and say how to change it, such as "make it shorter" or "translate to English", to rewrite it in place.',
          },
          {
            q: 'What languages can Typeflux recognize?',
            a: 'It depends on the engine you choose. Cloud recognition covers more than 60 languages, and local models such as Whisper, SenseVoice and Qwen3-ASR cover Chinese, English, Japanese, Korean and more.',
          },
          {
            q: 'Can I use voice input offline?',
            a: 'Yes. Once a local speech model is downloaded, voice input works without an internet connection, with no word caps or weekly quotas.',
          },
          {
            q: 'Does Typeflux use Whisper?',
            a: 'Yes. You can run OpenAI Whisper models (medium and large-v3) on your Mac through WhisperKit on Apple Core ML, alongside SenseVoice, Qwen3-ASR and FunASR. Cloud engines are available too.',
          },
        ],
      },
      {
        id: 'privacy',
        title: 'Privacy and data',
        items: [
          {
            q: 'Does Typeflux upload my voice data?',
            a: 'Not with a local model: your voice never leaves your Mac. When you choose a cloud recognition provider, the audio goes to that provider for recognition, and Typeflux itself does not collect, store or analyze your voice or text.',
          },
          {
            q: 'Where are my conversations and clipboard history stored?',
            a: 'Clipboard history is kept in a local database on your Mac, for as long as you choose, from a day to forever. For conversations you choose per chat: a private conversation is stored only on this Mac and uses your own models, while a Typeflux Cloud conversation uses Typeflux Cloud.',
          },
        ],
      },
      {
        id: 'compare',
        title: 'Compared with other apps',
        items: [
          {
            q: 'Does Typeflux replace Raycast or Alfred?',
            a: 'For many people, yes. The launcher opens apps and files, searches file contents, browser tabs and bookmarks, translates, calculates, runs commands and shows your calendar by keyword, and it can import Alfred workflows. The AI agent is built in rather than an add-on. You can also run them side by side.',
          },
          {
            q: 'Is Typeflux a free alternative to Wispr Flow, SuperWhisper or Typeless?',
            a: 'Yes. Typeflux covers the same core job, system-wide AI voice typing on macOS, and is free and open source. Its local models have no word caps or weekly quotas, and the same app also gives you an agent, a launcher, screenshots and clipboard history.',
          },
          {
            q: 'Is Typeflux the same app as Typeless?',
            a: 'No. Typeless is a separate, similarly named product from a different team. Typeflux is the free, open-source AI app for macOS: this website and the github.com/mylxsw/typeflux repository are its only official sources.',
          },
          {
            q: 'How is Typeflux different from the ChatGPT or Claude desktop apps?',
            a: 'Those apps are built around one provider’s models. Typeflux works with the models you choose, including local ones, and its agent acts on your Mac, reading and writing files, running commands, operating apps and browsing, within the permissions you grant. It also opens from the launcher, so a question is one shortcut away.',
          },
          {
            q: 'Do I still need CleanShot X, Paste or Maccy?',
            a: 'Many people won’t. Typeflux includes region, full-screen and scrolling screenshots, annotation, text recognition and translation of captures, screen recording to MP4 or GIF, and clipboard history with search, pinning and snippets. If you rely on a specialist feature of another tool, they can run side by side.',
          },
        ],
      },
    ],
  },
  'zh-CN': {
    title: '常见问题',
    subtitle: '怎么开始用、数据怎么处理，以及它和其他工具有什么不同。',
    jump: '分类',
    help: {
      title: '还有其他问题？',
      desc: '到 GitHub 上提问，也欢迎反馈问题和功能建议。',
      link: '提交 Issue',
    },
    groups: [
      {
        id: 'basics',
        title: '入门',
        items: [
          {
            q: 'Typeflux 是什么？',
            a: 'Typeflux 是一款开源免费的 Mac 应用，把 AI 助手、启动器、语音输入、截图录屏和剪贴板历史放在一起。查资料、找文件、写东西，按下快捷键就能开始。还有翻译、日历和操作圆环等日常工具。',
          },
          {
            q: 'Typeflux 是免费的吗？',
            a: 'Typeflux 应用开源免费，采用 AGPL-3.0 许可证。本地模型无需支付云端调用费用；使用自己的 API 密钥时，费用由对应服务商按其规则收取。Typeflux Cloud 是可选的云端服务，费用和额度以服务页面为准。',
          },
          {
            q: '运行 Typeflux 需要什么条件？',
            a: '需要一台运行 macOS 13 或更高版本的 Mac，支持 Apple 芯片和 Intel，无需注册即可开始使用。首次使用相关功能时，需要授予对应的系统权限，例如输入文字需要「辅助功能」权限，截图需要「屏幕录制」权限。搜索文档内容需要 Apple 芯片。',
          },
          {
            q: 'Typeflux 有 iPhone 版吗？',
            a: 'Typeflux iPhone 版正在筹备中，即将上线。届时你可以在 iPhone 上继续你的对话、用语音输入，并使用 Typeflux Cloud 或你自己的模型。',
          },
        ],
      },
      {
        id: 'agent',
        title: 'AI 助手与启动器',
        items: [
          {
            q: 'AI 会直接修改文件或操作应用吗？',
            a: '哪些操作要先问你，由你来定。默认模式下，AI 可以自行读取信息，修改文件、执行命令、操作应用前会请求确认，文件访问范围由你授权。你也可以为单个对话选择「每步都问」，或对信任的任务使用「全自动」模式，自动批准工具调用。',
          },
          {
            q: '可以使用哪些 AI 模型？',
            a: '可以使用 Typeflux Cloud，也可以配置自己的模型服务，包括 OpenAI 兼容接口、Anthropic、OpenAI Responses，或通过 Ollama 运行的本地模型。每个对话都可以单独选择模型。私密对话使用你配置的模型服务，记录只保存在本机；如果选择远程模型，内容仍会发送给对应服务商处理。',
          },
          {
            q: '可以添加自己的工具和工作流吗？',
            a: '可以。把需求告诉 AI，让它帮你编写和测试小工具，确认后保存到启动器。也可以用 Python、Node.js 或 Shell 编写工作流，或导入 Alfred 工作流。技能（Skills）可以为 AI 添加特定任务的操作指南；MCP 可以连接外部工具和数据。常用关键词还可以绑定全局快捷键。',
          },
        ],
      },
      {
        id: 'voice',
        title: '语音输入',
        items: [
          {
            q: '语音输入能在哪些应用里使用？',
            a: '可以在邮件、笔记、聊天等应用的输入框里使用，无需额外插件。按住 Fn 说话，松开后文字会输入到光标处，快捷键也可以自己设置。选中一段文字，再说「精简一点」或「翻译成英文」，还能用修改后的内容替换原文。',
          },
          {
            q: '支持识别哪些语言？',
            a: '取决于你选择的识别引擎。云端识别支持 60 多种语言；Whisper、SenseVoice、Qwen3-ASR 等本地模型覆盖中文、英文、日文、韩文等语言。',
          },
          {
            q: '没有网络也能语音输入吗？',
            a: '可以。下载并启用本地语音模型后，语音识别可以离线使用，没有字数上限或每周配额。如果还要通过云端模型润色或翻译，仍然需要联网。',
          },
          {
            q: 'Typeflux 使用 Whisper 吗？',
            a: '是的。你可以通过基于 Apple Core ML 的 WhisperKit，在 Mac 上本地运行 OpenAI Whisper 模型（medium 和 large-v3），也可以选择 SenseVoice、Qwen3-ASR 和 FunASR。同时也提供云端识别引擎。',
          },
        ],
      },
      {
        id: 'privacy',
        title: '隐私与数据',
        items: [
          {
            q: '我的语音数据会被上传吗？',
            a: '使用本地语音识别时，音频在这台 Mac 上处理。选择云端识别时，音频会发送至对应服务进行识别。如果再使用云端润色或翻译，识别出的文字也会发送至所选模型服务。数据处理和保留方式请查看对应服务的说明。',
          },
          {
            q: '我的对话和剪贴板历史保存在哪里？',
            a: '剪贴板历史保存在本机，可以设置保留一天、一周或长期保存，也可以固定重要内容。私密对话的记录只保存在这台 Mac 上；使用 Typeflux Cloud 的对话会通过云端服务处理。本地保存记录和本地运行模型是两回事：使用远程模型时，对话内容仍会发送给对应服务商。',
          },
        ],
      },
      {
        id: 'compare',
        title: '与其他应用对比',
        items: [
          {
            q: 'Typeflux 能替代 Raycast 或 Alfred 吗？',
            a: '如果你主要用它们打开应用、找文件、计算或运行命令，可以试试 Typeflux 的启动器。它也支持搜索文档内容、浏览器标签页和书签，查看日历，以及导入 Alfred 工作流。AI 助手已经内置，也可以和你现有的工具一起使用。',
          },
          {
            q: 'Typeflux 可以作为 Wispr Flow、SuperWhisper 或 Typeless 的免费替代品吗？',
            a: '如果你主要需要在 Mac 上说话输入文字，可以试试 Typeflux。应用开源免费，本地语音识别没有字数上限或每周配额，也支持选中文字后用语音修改。云端服务的费用另按对应服务规则计算，具体功能和使用体验可下载后比较。',
          },
          {
            q: 'Typeflux 和 Typeless 是同一个产品吗？',
            a: '不是。Typeless 是另一个团队开发的、名字相近的独立产品。Typeflux 是开源免费的 macOS AI 应用，本网站和 github.com/mylxsw/typeflux 仓库是它仅有的官方渠道。',
          },
          {
            q: 'Typeflux 和 ChatGPT、Claude 的桌面应用有什么区别？',
            a: 'Typeflux 把 AI 助手和 Mac 上的常用工具放在一起。除了对话，还能在你授权的范围内读写文件、运行命令、操作应用和浏览网页。你可以选择不同的模型服务，包括本地模型，也能在同一个应用里使用启动器、语音输入、截图录屏和剪贴板历史。',
          },
          {
            q: '有了 Typeflux，还需要 CleanShot X、Paste 或 Maccy 吗？',
            a: '看你常用哪些功能。Typeflux 支持区域截图、全屏截图、长截图、标注、截图取字和截图翻译，也能录屏并导出 MP4 或 GIF。剪贴板历史支持搜索、固定和保存常用片段。如果这些能满足日常需要，可以集中在 Typeflux 里使用；有其他专门需求时，也可以搭配现有工具。',
          },
        ],
      },
    ],
  },
  'zh-TW': {
    title: '常見問題',
    subtitle: 'Typeflux 能做什麼、如何處理你的資料，以及和你現在用的應用程式有什麼不同。',
    jump: '分類',
    help: {
      title: '還有其他問題？',
      desc: '到 GitHub 上提問，也歡迎回報問題和功能建議。',
      link: '提交 Issue',
    },
    groups: [
      {
        id: 'basics',
        title: '入門',
        items: [
          {
            q: 'Typeflux 是什麼？',
            a: 'Typeflux 是一款開源免費的 macOS AI 效率工具。一個應用程式裡有能把事辦完的 AI Agent、什麼都能找到和執行的啟動器、在任何應用程式裡都能用的語音輸入、滑鼠處彈出的操作圓環，還有截圖錄影、剪貼簿歷史、翻譯和行事曆。每個功能都只差一個快捷鍵，就在你正在用的地方打開。',
          },
          {
            q: 'Typeflux 是免費的嗎？',
            a: '是的。Typeflux 以 AGPL-3.0 授權開源、免費，所有功能都不需要付費。使用本機模型或你自己的 API Key 不會產生額外費用；Typeflux Cloud 是選用的。',
          },
          {
            q: '執行 Typeflux 需要什麼條件？',
            a: '一台 macOS 13 或更新版本的 Mac，Apple 晶片和 Intel 晶片都支援，不註冊帳號也能直接使用。部分功能第一次使用時會請求 macOS 權限，例如插入文字需要「輔助使用」權限，截圖需要「螢幕錄製」權限。搜尋文件內容需要 Apple 晶片。',
          },
          {
            q: 'Typeflux 有 iPhone 版嗎？',
            a: 'Typeflux iPhone 版正在籌備中，即將上線。屆時你可以在 iPhone 上繼續你的對話、用語音輸入，並使用 Typeflux Cloud 或你自己的模型。',
          },
        ],
      },
      {
        id: 'agent',
        title: 'AI Agent 與啟動器',
        items: [
          {
            q: 'AI Agent 會不會未經允許就改動我的 Mac？',
            a: '不會，除非你允許。預設模式下，Agent 可以自行讀取，但修改檔案、執行指令、操作應用程式之前都會先問你，檔案存取也只限於你授權的資料夾。你也可以把某個對話切換成「每步都問」，或在放心的任務裡切換成「全自動」。',
          },
          {
            q: '可以使用哪些 AI 模型？',
            a: 'Typeflux Cloud 開箱即用，你也可以接入自己的模型：任何 OpenAI 相容介面、Anthropic、OpenAI Responses 介面，或透過 Ollama 使用本機模型。每個對話都可以單獨選擇模型，私密對話只保存在你的 Mac 上，並使用你自己的模型。',
          },
          {
            q: '可以加入自己的工具和工作流程嗎？',
            a: '可以。在聊天裡描述你想要的工具，Agent 會寫好、測試好並加到啟動器裡。你也可以用 Python、Node 或 Shell 寫工作流程，匯入 Alfred 工作流程，從 GitHub 安裝 Agent Skills，接入 MCP 服務，還能為任何功能或關鍵字綁定全域快捷鍵。',
          },
        ],
      },
      {
        id: 'voice',
        title: '語音輸入',
        items: [
          {
            q: '語音輸入能在哪些應用程式裡使用？',
            a: '任何可以打字的應用程式。按住 Fn 說話，文字會插入到目前輸入框的游標處，不需要外掛或整合。先選取一段文字，再說出要怎麼改，例如「再精簡一點」或「翻譯成英文」，就能直接取代選取範圍。',
          },
          {
            q: '支援辨識哪些語言？',
            a: '取決於你選擇的辨識引擎。雲端辨識支援 60 多種語言；Whisper、SenseVoice、Qwen3-ASR 等本機模型涵蓋中文、英文、日文、韓文等語言。',
          },
          {
            q: '沒有網路也能語音輸入嗎？',
            a: '可以。下載本機語音模型之後，語音輸入無需連網即可使用，也沒有字數上限或每週配額。',
          },
          {
            q: 'Typeflux 使用 Whisper 嗎？',
            a: '是的。你可以透過基於 Apple Core ML 的 WhisperKit，在 Mac 上本機執行 OpenAI Whisper 模型（medium 和 large-v3），也可以選擇 SenseVoice、Qwen3-ASR 和 FunASR。同時也提供雲端辨識引擎。',
          },
        ],
      },
      {
        id: 'privacy',
        title: '隱私與資料',
        items: [
          {
            q: '我的語音資料會被上傳嗎？',
            a: '使用本機模型時不會，你的聲音不會離開這台 Mac。如果你選擇雲端辨識服務，音訊會傳送給該服務商進行辨識；Typeflux 本身不收集、不儲存、不分析你的語音和文字。',
          },
          {
            q: '我的對話和剪貼簿歷史保存在哪裡？',
            a: '剪貼簿歷史保存在你 Mac 上的本機資料庫裡，保留多久由你決定，從一天到永久都可以。對話可以逐一選擇：私密對話只保存在這台 Mac 上並使用你自己的模型，Typeflux Cloud 對話則使用 Typeflux Cloud。',
          },
        ],
      },
      {
        id: 'compare',
        title: '與其他應用程式比較',
        items: [
          {
            q: 'Typeflux 能取代 Raycast 或 Alfred 嗎？',
            a: '對很多人來說可以。啟動器能依關鍵字打開應用程式和檔案，搜尋檔案內容、瀏覽器分頁和書籤，翻譯、計算、執行指令、查看行事曆，還能匯入 Alfred 工作流程。AI Agent 是內建的，不需要額外外掛。你也可以和它們同時使用。',
          },
          {
            q: 'Typeflux 可以作為 Wispr Flow、SuperWhisper 或 Typeless 的免費替代品嗎？',
            a: '可以。Typeflux 能完成同樣的核心任務，也就是在 macOS 全域使用 AI 語音輸入，而且開源免費。本機模型沒有字數上限或每週配額；同一個應用程式裡還有 Agent、啟動器、截圖和剪貼簿歷史。',
          },
          {
            q: 'Typeflux 和 Typeless 是同一個產品嗎？',
            a: '不是。Typeless 是另一個團隊開發、名稱相近的獨立產品。Typeflux 是開源免費的 macOS AI 應用程式，本網站和 github.com/mylxsw/typeflux 儲存庫是它僅有的官方管道。',
          },
          {
            q: 'Typeflux 和 ChatGPT、Claude 的桌面應用程式有什麼不同？',
            a: '這些應用程式圍繞各自廠商的模型打造。Typeflux 可以使用你選擇的模型，包括本機模型；它的 Agent 能在你授權的範圍內直接在 Mac 上做事：讀寫檔案、執行指令、操作應用程式、瀏覽網頁。它還能從啟動器直接打開，提問只需要一個快捷鍵。',
          },
          {
            q: '有了 Typeflux，還需要 CleanShot X、Paste 或 Maccy 嗎？',
            a: '很多人不再需要。Typeflux 內建區域截圖、全螢幕截圖和長截圖，支援標註、截圖取字和截圖翻譯，可以錄影並匯出 MP4 或 GIF；剪貼簿歷史支援搜尋、釘選和常用片段。如果你依賴其他工具的某個專門功能，也可以和它們同時使用。',
          },
        ],
      },
    ],
  },
  ja: {
    title: 'よくある質問',
    subtitle: 'Typeflux でできること、データの扱い、いま使っているアプリとの違いをまとめました。',
    jump: 'トピック',
    help: {
      title: 'ほかに質問がありますか？',
      desc: 'GitHub で質問してください。不具合の報告や機能の提案も歓迎します。',
      link: 'Issue を作成',
    },
    groups: [
      {
        id: 'basics',
        title: 'はじめに',
        items: [
          {
            q: 'Typeflux とは何ですか？',
            a: 'Typeflux は、無料でオープンソースの macOS 向け AI ツールです。タスクをやり遂げる AI エージェント、何でも探して実行できるランチャー、どのアプリでも使える音声入力、ポインタの位置に開くアクションリングに加えて、スクリーンショット、画面収録、クリップボード履歴、翻訳、カレンダーをひとつのアプリで使えます。どれもショートカットひとつで、いま作業している場所に開きます。',
          },
          {
            q: 'Typeflux は無料ですか？',
            a: 'はい。Typeflux は AGPL-3.0 ライセンスのオープンソースで無料です。すべての機能を支払いなしで使えます。ローカルモデルや自分の API キーを使えば追加費用はかからず、Typeflux Cloud の利用は任意です。',
          },
          {
            q: 'Typeflux を使うには何が必要ですか？',
            a: 'macOS 13 以降の Mac が必要です。Apple シリコンと Intel のどちらにも対応し、アカウントなしで使い始められます。一部の機能は初回使用時に macOS の権限を求めます。たとえば文字の挿入には「アクセシビリティ」、スクリーンショットには「画面収録」の権限が必要です。書類の内容検索には Apple シリコンが必要です。',
          },
          {
            q: 'iPhone 版はありますか？',
            a: 'Typeflux の iPhone 版は現在準備中で、まもなく公開予定です。iPhone で会話の続きをしたり、音声で入力したり、Typeflux Cloud や自分のモデルを使ったりできるようになります。',
          },
        ],
      },
      {
        id: 'agent',
        title: 'AI エージェントとランチャー',
        items: [
          {
            q: 'AI エージェントが許可なく Mac を変更することはありますか？',
            a: '許可しない限りありません。標準モードでは、エージェントは自分で読み取りますが、ファイルの変更、コマンドの実行、アプリの操作の前には必ず確認し、ファイルへのアクセスも許可したフォルダに限られます。会話ごとに「毎回確認」や、信頼できるタスク向けの「全自動」に切り替えることもできます。',
          },
          {
            q: 'どの AI モデルを使えますか？',
            a: 'Typeflux Cloud をそのまま使うことも、自分のモデルを接続することもできます。OpenAI 互換 API、Anthropic、OpenAI Responses API、Ollama 経由のローカルモデルに対応しています。モデルは会話ごとに選べ、プライベートな会話は自分のモデルを使ってこの Mac だけに保存されます。',
          },
          {
            q: '自分のツールやワークフローを追加できますか？',
            a: 'はい。チャットで欲しいツールを説明すると、エージェントが作成とテストを行い、ランチャーに追加します。Python、Node、Shell でワークフローを書くことも、Alfred のワークフローを読み込むことも、GitHub からエージェントのスキルを入れることも、MCP サーバーを接続することもできます。どの機能やキーワードにもグローバルショートカットを割り当てられます。',
          },
        ],
      },
      {
        id: 'voice',
        title: '音声入力',
        items: [
          {
            q: '音声入力はどのアプリで使えますか？',
            a: '文字を入力できるアプリならどれでも使えます。Fn を押しながら話すと、アクティブな入力欄のカーソル位置に文字が挿入されます。プラグインや連携は不要です。先にテキストを選択して「もっと短く」「英語に翻訳して」のように話すと、その場で書き換えられます。',
          },
          {
            q: 'どの言語を認識できますか？',
            a: '選んだ認識エンジンによって異なります。クラウド認識は 60 以上の言語に対応し、Whisper、SenseVoice、Qwen3-ASR などのローカルモデルは日本語、英語、中国語、韓国語などに対応しています。',
          },
          {
            q: 'オフラインでも音声入力を使えますか？',
            a: 'はい。ローカルの音声モデルをダウンロードすれば、インターネット接続なしで音声入力を使えます。文字数の上限や週ごとの制限もありません。',
          },
          {
            q: 'Typeflux は Whisper を使っていますか？',
            a: 'はい。Apple Core ML 上の WhisperKit を通じて、OpenAI の Whisper モデル（medium と large-v3）を Mac 上で実行できます。SenseVoice、Qwen3-ASR、FunASR も選べ、クラウドの認識エンジンも利用できます。',
          },
        ],
      },
      {
        id: 'privacy',
        title: 'プライバシーとデータ',
        items: [
          {
            q: '音声データはアップロードされますか？',
            a: 'ローカルモデルを使う場合、声が Mac の外に出ることはありません。クラウドの認識サービスを選んだ場合は、認識のために音声がそのサービスに送られます。Typeflux 自体が音声やテキストを収集、保存、分析することはありません。',
          },
          {
            q: '会話とクリップボード履歴はどこに保存されますか？',
            a: 'クリップボード履歴は Mac 上のローカルデータベースに保存され、保存期間は 1 日から無期限まで自由に選べます。会話は会話ごとに選べます。プライベートな会話は自分のモデルを使ってこの Mac だけに保存され、Typeflux Cloud の会話は Typeflux Cloud を使います。',
          },
        ],
      },
      {
        id: 'compare',
        title: 'ほかのアプリとの比較',
        items: [
          {
            q: 'Typeflux は Raycast や Alfred の代わりになりますか？',
            a: '多くの人にとってはなります。ランチャーはキーワードでアプリやファイルを開き、ファイルの内容、ブラウザのタブやブックマークを検索し、翻訳、計算、コマンド実行、カレンダー表示ができます。Alfred のワークフローも読み込めます。AI エージェントは追加機能ではなく最初から組み込まれています。併用することもできます。',
          },
          {
            q: 'Typeflux は Wispr Flow、SuperWhisper、Typeless の無料の代替になりますか？',
            a: 'はい。Typeflux は同じ中心的な役割、つまり macOS 全体での AI 音声入力をこなし、しかも無料でオープンソースです。ローカルモデルには文字数の上限や週ごとの制限がなく、同じアプリでエージェント、ランチャー、スクリーンショット、クリップボード履歴も使えます。',
          },
          {
            q: 'Typeflux と Typeless は同じアプリですか？',
            a: 'いいえ。Typeless は別のチームが開発している、名前の似た別の製品です。Typeflux は無料でオープンソースの macOS 向け AI アプリで、公式な配布元はこのウェブサイトと github.com/mylxsw/typeflux リポジトリだけです。',
          },
          {
            q: 'ChatGPT や Claude のデスクトップアプリとはどう違いますか？',
            a: 'それらのアプリは各社のモデルを中心に作られています。Typeflux はローカルモデルを含め、自分で選んだモデルで動きます。エージェントは許可した範囲で、ファイルの読み書き、コマンドの実行、アプリの操作、ウェブの閲覧など、Mac 上で実際に作業します。ランチャーからすぐに開けるので、質問はショートカットひとつで始められます。',
          },
          {
            q: 'CleanShot X、Paste、Maccy はまだ必要ですか？',
            a: '多くの人には不要です。Typeflux には範囲指定、全画面、スクロールのスクリーンショット、注釈、キャプチャからの文字認識と翻訳、MP4 や GIF への画面収録、検索・ピン留め・スニペットに対応したクリップボード履歴が含まれています。ほかのツールの専門的な機能が必要なら、併用することもできます。',
          },
        ],
      },
    ],
  },
  ko: {
    title: '자주 묻는 질문',
    subtitle: 'Typeflux로 할 수 있는 일, 데이터를 다루는 방식, 지금 쓰는 앱과의 차이를 정리했습니다.',
    jump: '주제',
    help: {
      title: '다른 질문이 있으신가요?',
      desc: 'GitHub에서 질문해 주세요. 버그 제보와 기능 제안도 환영합니다.',
      link: 'Issue 작성',
    },
    groups: [
      {
        id: 'basics',
        title: '시작하기',
        items: [
          {
            q: 'Typeflux는 무엇인가요?',
            a: 'Typeflux는 무료 오픈 소스 macOS AI 도구입니다. 일을 끝까지 처리하는 AI 에이전트, 무엇이든 찾고 실행하는 런처, 어떤 앱에서나 쓸 수 있는 음성 입력, 포인터 위치에 열리는 동작 링에 더해 스크린샷, 화면 녹화, 클립보드 기록, 번역, 캘린더까지 앱 하나에 담았습니다. 모두 단축키 하나로, 지금 작업 중인 곳에서 열립니다.',
          },
          {
            q: 'Typeflux는 무료인가요?',
            a: '네. Typeflux는 AGPL-3.0 라이선스의 오픈 소스이며 무료입니다. 모든 기능을 결제 없이 사용할 수 있습니다. 로컬 모델이나 직접 발급한 API 키를 쓰면 추가 비용이 없으며, Typeflux Cloud는 선택 사항입니다.',
          },
          {
            q: 'Typeflux를 실행하려면 무엇이 필요한가요?',
            a: 'macOS 13 이상이 설치된 Mac이 필요합니다. Apple 실리콘과 Intel을 모두 지원하며, 계정 없이 바로 시작할 수 있습니다. 일부 기능은 처음 사용할 때 macOS 권한을 요청합니다. 예를 들어 텍스트 삽입에는 「손쉬운 사용」, 스크린샷에는 「화면 기록」 권한이 필요합니다. 문서 내용 검색에는 Apple 실리콘이 필요합니다.',
          },
          {
            q: 'iPhone 앱이 있나요?',
            a: 'Typeflux iPhone 앱은 현재 준비 중이며 곧 출시됩니다. iPhone에서 대화를 이어 가고, 음성으로 입력하고, Typeflux Cloud나 직접 설정한 모델을 사용할 수 있게 됩니다.',
          },
        ],
      },
      {
        id: 'agent',
        title: 'AI 에이전트와 런처',
        items: [
          {
            q: 'AI 에이전트가 허락 없이 Mac을 변경할 수 있나요?',
            a: '허락하지 않으면 그럴 수 없습니다. 기본 모드에서 에이전트는 스스로 읽기만 하고, 파일 수정, 명령 실행, 앱 조작 전에는 반드시 먼저 묻습니다. 파일 접근도 허용한 폴더로 제한됩니다. 대화마다 「매번 확인」으로 바꾸거나, 믿을 수 있는 작업에는 「완전 자동」으로 바꿀 수 있습니다.',
          },
          {
            q: '어떤 AI 모델을 쓸 수 있나요?',
            a: 'Typeflux Cloud를 바로 쓰거나 직접 모델을 연결할 수 있습니다. OpenAI 호환 API, Anthropic, OpenAI Responses API, Ollama를 통한 로컬 모델을 지원합니다. 대화마다 모델을 고를 수 있고, 비공개 대화는 직접 설정한 모델로 이 Mac에만 저장됩니다.',
          },
          {
            q: '나만의 도구와 워크플로를 추가할 수 있나요?',
            a: '네. 채팅에서 원하는 도구를 설명하면 에이전트가 만들고 테스트한 뒤 런처에 추가합니다. Python, Node, Shell로 워크플로를 작성하거나, Alfred 워크플로를 가져오거나, GitHub에서 에이전트 스킬을 설치하거나, MCP 서버를 연결할 수도 있습니다. 어떤 기능이나 키워드에도 전역 단축키를 지정할 수 있습니다.',
          },
        ],
      },
      {
        id: 'voice',
        title: '음성 입력',
        items: [
          {
            q: '음성 입력은 어떤 앱에서 쓸 수 있나요?',
            a: '글자를 입력할 수 있는 앱이라면 어디서나 됩니다. Fn을 누른 채 말하면 현재 입력란의 커서 위치에 텍스트가 들어갑니다. 플러그인이나 연동은 필요 없습니다. 먼저 텍스트를 선택하고 「더 짧게」, 「영어로 번역해 줘」처럼 말하면 그 자리에서 고쳐 씁니다.',
          },
          {
            q: '어떤 언어를 인식하나요?',
            a: '선택한 인식 엔진에 따라 다릅니다. 클라우드 인식은 60개 이상의 언어를 지원하고, Whisper, SenseVoice, Qwen3-ASR 같은 로컬 모델은 한국어, 영어, 중국어, 일본어 등을 지원합니다.',
          },
          {
            q: '오프라인에서도 음성 입력을 쓸 수 있나요?',
            a: '네. 로컬 음성 모델을 내려받으면 인터넷 연결 없이 음성 입력을 쓸 수 있고, 글자 수 제한이나 주간 한도도 없습니다.',
          },
          {
            q: 'Typeflux는 Whisper를 사용하나요?',
            a: '네. Apple Core ML 기반의 WhisperKit으로 OpenAI Whisper 모델(medium, large-v3)을 Mac에서 직접 실행할 수 있고, SenseVoice, Qwen3-ASR, FunASR도 선택할 수 있습니다. 클라우드 인식 엔진도 제공합니다.',
          },
        ],
      },
      {
        id: 'privacy',
        title: '개인정보와 데이터',
        items: [
          {
            q: '음성 데이터가 업로드되나요?',
            a: '로컬 모델을 쓰면 목소리가 Mac 밖으로 나가지 않습니다. 클라우드 인식 서비스를 선택하면 인식을 위해 음성이 해당 서비스로 전송되며, Typeflux 자체는 음성이나 텍스트를 수집, 저장, 분석하지 않습니다.',
          },
          {
            q: '대화와 클립보드 기록은 어디에 저장되나요?',
            a: '클립보드 기록은 Mac의 로컬 데이터베이스에 저장되며, 보관 기간은 하루부터 영구까지 직접 정할 수 있습니다. 대화는 대화마다 선택합니다. 비공개 대화는 직접 설정한 모델로 이 Mac에만 저장되고, Typeflux Cloud 대화는 Typeflux Cloud를 사용합니다.',
          },
        ],
      },
      {
        id: 'compare',
        title: '다른 앱과 비교',
        items: [
          {
            q: 'Typeflux가 Raycast나 Alfred를 대신할 수 있나요?',
            a: '많은 분들에게는 그렇습니다. 런처는 키워드로 앱과 파일을 열고, 파일 내용과 브라우저 탭, 북마크를 검색하며, 번역, 계산, 명령 실행, 캘린더 확인까지 할 수 있고 Alfred 워크플로도 가져올 수 있습니다. AI 에이전트는 추가 기능이 아니라 기본으로 들어 있습니다. 함께 사용해도 됩니다.',
          },
          {
            q: 'Typeflux는 Wispr Flow, SuperWhisper, Typeless의 무료 대안인가요?',
            a: '네. Typeflux는 같은 핵심 기능, 즉 macOS 전체에서 쓰는 AI 음성 입력을 제공하면서 무료 오픈 소스입니다. 로컬 모델에는 글자 수 제한이나 주간 한도가 없고, 같은 앱에서 에이전트, 런처, 스크린샷, 클립보드 기록도 쓸 수 있습니다.',
          },
          {
            q: 'Typeflux와 Typeless는 같은 앱인가요?',
            a: '아닙니다. Typeless는 다른 팀이 만든, 이름이 비슷한 별개의 제품입니다. Typeflux는 무료 오픈 소스 macOS AI 앱이며, 공식 배포처는 이 웹사이트와 github.com/mylxsw/typeflux 저장소뿐입니다.',
          },
          {
            q: 'ChatGPT나 Claude 데스크톱 앱과 무엇이 다른가요?',
            a: '그 앱들은 각 회사의 모델을 중심으로 만들어졌습니다. Typeflux는 로컬 모델을 포함해 직접 고른 모델로 동작하고, 에이전트는 허용한 범위 안에서 파일 읽기와 쓰기, 명령 실행, 앱 조작, 웹 탐색처럼 Mac에서 실제로 일을 합니다. 런처에서 바로 열 수 있어 질문은 단축키 하나면 시작됩니다.',
          },
          {
            q: 'CleanShot X, Paste, Maccy가 아직 필요한가요?',
            a: '많은 분들에게는 필요 없습니다. Typeflux에는 영역, 전체 화면, 스크롤 스크린샷과 주석, 캡처 텍스트 인식과 번역, MP4·GIF 화면 녹화, 검색·고정·스니펫을 지원하는 클립보드 기록이 들어 있습니다. 다른 도구의 전문 기능이 필요하다면 함께 사용할 수 있습니다.',
          },
        ],
      },
    ],
  },
}
