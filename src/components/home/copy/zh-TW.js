export default {
  hero: {
    eyebrow: '開源免費 · macOS App',
    title: '一個快捷鍵，\nMac 上的事就搞定。',
    subtitle: '一個全能的 AI Agent，一個什麼都找得到、什麼都能執行的啟動器，再加上語音輸入、截圖錄影和剪貼簿紀錄。一個 App，一個快捷鍵，就在你正在用的地方。',
    download: '下載 Mac 版',
    source: '在 GitHub 上按 Star',
    requirement: 'macOS 13+ · 支援 Apple 晶片與 Intel · 不需註冊即可使用',
    demoLabel: 'Typeflux 示範',
    scenes: {
      agent: {
        label: '問',
      },
      launcher: {
        label: '找 / 做',
      },
      voice: {
        label: '說',
        text: '把設計審查改到週四下午三點，再把議程寄給大家。',
      },
      ring: {
        label: '點',
        hint: '劃向一個操作，放開即可',
      },
    },
  },
  replaces: {
    title: '一個 App，抵七個',
    items: {
      dictation: '語音輸入',
      launcher: '啟動器',
      chat: 'AI 聊天',
      capture: '截圖工具',
      recorder: '螢幕錄影',
      clipboard: '剪貼簿管理',
      translator: '翻譯工具',
    },
  },
  entrances: {
    title: '四個入口，都只差一個快捷鍵',
    subtitle: '每個入口都在你目前的位置打開，不用切換 App。所有快捷鍵都可以在設定中修改。',
    items: {
      agent: {
        name: 'AI Agent',
        action: '對話',
        desc: '能聊天、搜尋、瀏覽網頁、執行指令、處理你的檔案。',
      },
      launcher: {
        name: '啟動器',
        action: '輸入就能找到、辦到',
        desc: '任何 App、任何檔案、任何指令，或直接問 AI。',
      },
      voice: {
        name: '語音輸入',
        action: '按住說話',
        desc: '在任何輸入框裡說話打字，或選取文字後說出要怎麼改。',
      },
      ring: {
        name: '圓環',
        action: '在滑鼠處一劃',
        desc: '常用操作排成一圈，就在滑鼠下方彈出。',
      },
    },
    more: '了解更多',
  },
  agent: {
    badge: 'AI Agent',
    title: '真正能幫你把事做完的 AI Agent',
    subtitle: '不只是聊天框。Typeflux 會聊天、上網搜尋、開啟網頁、讀寫檔案、執行指令，還能操作 App，直到把事情做完。讓它幫你整理「下載項目」資料夾、查出 Mac 為什麼慢，或把會議紀錄改成週報。',
    capabilities: {
      chat: {
        title: '對話',
        desc: '支援長對話、歷史紀錄、附件、截圖和圖表。',
      },
      web: {
        title: '上網搜尋',
        desc: '幫你查資料，並註明資訊來源。',
      },
      browser: {
        title: '內建瀏覽器',
        desc: '在側邊欄開啟網站、讀取頁面、填寫表單。',
      },
      files: {
        title: '你的檔案',
        desc: '在你授權的資料夾裡讀寫檔案。',
      },
      commands: {
        title: '執行指令',
        desc: '在你的 Mac 上執行終端機指令和腳本。',
      },
      computer: {
        title: '操作 App',
        desc: '看螢幕、點擊、輸入，替你完成操作。',
      },
      code: {
        title: '程式碼與專案',
        desc: '執行程式碼、修改專案，並預覽做出來的東西。',
      },
      images: {
        title: '產生圖片',
        desc: '用你選擇的服務商產生圖片。',
      },
      memory: {
        title: '記憶與筆記',
        desc: '記住你的偏好，把回答存進筆記本。',
      },
      skills: {
        title: 'Skills',
        desc: '從 GitHub 安裝技能，教它做新的事。',
      },
      mcp: {
        title: 'MCP',
        desc: '連接外部工具和資料來源。',
      },
      models: {
        title: '任何模型',
        desc: 'Typeflux Cloud，或你自己的 OpenAI、Anthropic、Ollama。',
      },
    },
    examplesTitle: '試著這樣問',
    examples: [
      '把「下載項目」資料夾依檔案類型整理一下',
      '我的 Mac 為什麼這麼燙？',
      '總結這三份 PDF，把重點存進筆記',
      '看看 GitHub 上的未讀通知，整理成待辦',
      '幫我做一個時間戳轉換的小工具',
      '依拍攝日期替這些照片重新命名',
    ],
    modesTitle: '它能自己做多少，由你決定',
    modes: {
      strict: {
        name: '每步都問',
        desc: '每次呼叫工具都要你核准。',
      },
      standard: {
        name: '標準',
        desc: '讀取類操作自動進行，修改前先問你。',
      },
      auto: {
        name: '全自動',
        desc: '每一步都自動執行，適合放心交給它的長任務。',
      },
    },
    demo: {
      user: '幫我整理「下載項目」資料夾：依類型分到不同資料夾，並刪掉一個月前的安裝檔。',
      steps: [
        {
          label: '已列出 ~/Downloads 中的 214 個檔案',
          state: 'done',
        },
        {
          label: '已建立 圖片、文件、壓縮檔 資料夾',
          state: 'done',
        },
        {
          label: '刪除 12 個舊安裝檔（3.1 GB）',
          state: 'approve',
        },
      ],
      approve: '允許',
      answer: '已把 202 個檔案分到 5 個資料夾。刪除 12 個安裝檔前需要你確認。',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: '啟動器',
    title: '打幾個字，什麼都找得到、都能執行',
    subtitle: '一個輸入框，搜遍 Mac 上的 App 和檔案、文件裡的文字，還能執行終端機指令、直接問 AI。它可以像 Spotlight 一樣在螢幕中央打開，也可以停在你上次拖到的位置；可以是一條簡潔的搜尋列，也可以是完整的結果視窗。',
    capabilities: {
      files: {
        title: '任何檔案',
        desc: '全碟檔名秒搜，支援拼音和路徑比對。',
      },
      content: {
        title: '文件內容',
        desc: '在本機搜尋 PDF、Markdown、文字檔裡的內容（Apple 晶片）。',
      },
      commands: {
        title: '任何指令',
        desc: '在浮動終端機裡執行，或交給「終端機」和 iTerm。',
      },
      ask: {
        title: '一鍵問 AI',
        desc: '輸入任何內容後按 ⌘↩，直接開始對話。',
      },
      apps: {
        title: 'App 與視窗',
        desc: '開啟、切換、結束 App，不用碰滑鼠。',
      },
      system: {
        title: '系統控制',
        desc: '睡眠、深色模式、藍牙、系統資訊和即時監控。',
      },
      web: {
        title: '網頁與瀏覽器',
        desc: '搜尋網頁，或直接跳到已開啟的分頁和書籤。',
      },
      calc: {
        title: '即時結果',
        desc: '邊輸入邊出結果：計算、進位轉換、翻譯、日期。',
      },
    },
    demos: {
      apps: '開啟 App',
      files: '找檔案',
      cmd: '執行指令',
      translate: '翻譯',
      quickAsk: '快速提問',
      calendar: '行事曆',
      monitor: '系統監控',
      system: '本機配置',
    },
    placeholder: '搜尋或對話…',
    demosTitle: '看看它能做什麼',
  },
  forms: {
    badge: '形態',
    title: '照你喜歡的樣子出現',
    subtitle: '語音膠囊出現在哪裡、聊天以什麼形態打開，都由你選。不用的時候，它們從不打擾你。',
    tabs: {
      capsule: '語音膠囊',
      chat: '聊天與啟動器',
    },
    capsule: {
      bottom: {
        name: '底部膠囊',
        desc: '螢幕底部置中的小膠囊，輕巧不打擾，適合所有顯示器。',
      },
      orb: {
        name: '光球膠囊',
        desc: '光球隨聲音律動，滑鼠停留時才顯示按鈕。',
      },
      corner: {
        name: '頂角卡片',
        desc: '像 Siri 一樣出現在選單列下方的左上角或右上角，即時顯示轉寫。',
      },
      notch: {
        name: '瀏海島',
        desc: '從 MacBook 瀏海中長出來，視線不必離開螢幕頂端。',
      },
    },
    chat: {
      launcher: {
        name: '完整啟動器',
        desc: '像 Spotlight 一樣置中，或停在你上次拖到的位置。',
      },
      compact: {
        name: '簡約搜尋列',
        desc: '開始輸入前只是一條細細的搜尋列。',
      },
      quick: {
        name: '快速回答',
        desc: '答案直接顯示在啟動器裡，不用開新視窗。',
      },
      workspace: {
        name: '工作區',
        desc: '歷史對話、聊天區，以及放瀏覽器和預覽的側邊欄。',
      },
    },
    sample: {
      search: '搜尋或對話…',
    },
  },
  voice: {
    badge: '語音輸入',
    title: '想到哪說到哪，任何 App 都能輸入',
    subtitle: '按住快捷鍵，自然地說，放開。帶標點的文字直接出現在游標處，瀏覽器、編輯器、終端機、聊天軟體都一樣。比打字快約四倍。',
    points: [
      {
        title: '能打字的地方都能用',
        desc: '不需要外掛或整合。只要有輸入框，Typeflux 就能寫進去。',
      },
      {
        title: '用語音改寫',
        desc: '選取文字，說「再精簡一點」或「翻成英文」，結果直接取代選取內容。',
      },
      {
        title: '不同情境，不同人設',
        desc: '工作信件、筆記、聊天各用一套語氣和詞彙；還能替第二個快捷鍵單獨設定人設。',
      },
      {
        title: '本機或雲端引擎',
        desc: 'SenseVoice、Whisper、Qwen3-ASR 可離線執行；也可以用支援 60 多種語言的雲端即時辨識。',
      },
    ],
    stats: [
      {
        value: '~200',
        label: '字詞 / 分鐘',
      },
      {
        value: '60+',
        label: '種語言',
      },
      {
        value: '100%',
        label: '可離線執行',
      },
    ],
    demo: {
      app: '郵件',
      draft: '大家好，同步一下：測試版週五發布，回饋請在週三前提交。',
      status: '正在聆聽…',
      persona: '人設：工作信件',
    },
  },
  capture: {
    badge: '截圖錄影',
    title: '截圖、長截圖、螢幕錄影，一個就夠',
    subtitle: '框選一塊區域、截下整個螢幕，或把一直往下捲的長頁面拼成一張圖。錄影可以帶上系統聲音和攝影機，匯出 MP4 或 GIF，再標註、分享。',
    modes: {
      region: {
        name: '框選截圖',
        desc: '拖出想要的區域，放大鏡幫你對齊到像素。',
      },
      fullScreen: {
        name: '全螢幕截圖',
        desc: '一鍵截下整個螢幕。',
      },
      scrolling: {
        name: '長截圖',
        desc: '自動幫你捲動頁面，拼成一張完整的長圖。',
      },
      recording: {
        name: '螢幕錄影',
        desc: '支援系統聲音、麥克風和攝影機子母畫面，可以暫停和裁剪。',
      },
      gif: {
        name: 'GIF',
        desc: '把一段短錄影變成隨處可播的 GIF。',
      },
    },
    toolsTitle: '截完之後，還能',
    tools: ['箭頭、形狀和標註框', '序號步驟', '馬賽克', '辨識並遮蓋手機號碼', '美化背景', '釘選到螢幕', '截圖取字', '截圖翻譯', '截圖問 AI'],
  },
  clipboard: {
    badge: '剪貼簿',
    title: '拷貝過的一切，想保留多久就多久',
    subtitle: '按 ⌥⌘O，剪貼簿紀錄以卡片形式從螢幕底部滑出：文字、連結、程式碼、圖片，都能搜尋、隨時貼上。',
    points: [
      {
        title: '保留一天，或者永久',
        desc: '紀錄保留多久由你決定。釘選的項目和片段永不過期。',
      },
      {
        title: '一秒找到',
        desc: '全文搜尋，依 App 篩選，或按 ⌘1–9 直接貼上。',
      },
      {
        title: '常用片段',
        desc: '把地址、常用回覆存成片段，在哪裡都能貼上。',
      },
    ],
    retentionTitle: '紀錄保留',
    retention: ['1 天', '1 週', '1 個月', '1 年', '永久'],
    cards: {
      text: {
        kind: '文字',
        time: '已釘選',
        body: '收件地址：台北市信義區市府路 45 號 12 樓',
      },
      link: {
        kind: '連結',
        time: '2 分鐘前',
        body: 'typeflux.app/releases',
      },
      code: {
        kind: '程式碼',
        time: '5 分鐘前',
        body: 'git commit -m "Reposition the homepage"',
      },
      image: {
        kind: '圖片',
        time: '12 分鐘前',
        body: '1920 × 1080 · 842 KB',
      },
      note: {
        kind: '文字',
        time: '昨天',
        body: '設計審查改到週四下午三點',
      },
    },
    search: '搜尋剪貼簿',
  },
  ring: {
    badge: '圓環',
    title: '滑鼠在哪，操作就在哪',
    subtitle: '按住快捷鍵，圓環在滑鼠下方彈出。劃向一個操作後放開就會執行，移回中間再放開就取消。最多 8 格，可以放 Typeflux 功能、App、網址、資料夾、組合鍵、捷徑或系統開關。',
    tryTitle: '在這裡試一下',
    centerTitle: 'Typeflux',
    ran: '已執行「{action}」',
    actions: {
      dictation: '語音輸入',
      ask: '對話',
      translate: '翻譯選取文字',
      screenshot: '截圖',
      screenshotText: '截圖取字',
      clipboard: '剪貼簿紀錄',
    },
    label: '圓環示範。按住即可在指標處打開圓環。',
    steps: [
      ['按住', '下方桌面任意位置（或按住空白鍵）：圓環出現在指標處。'],
      ['朝一個方向劃動', '，扇區隨之高亮；越過外圈時，邊緣會被拉向指標。'],
      ['放開', '即執行；移回中心再放開則取消。'],
      ['只點一下', '（或輕按空白鍵）圓環保持打開，可點擊扇區、按 1–6 或方向鍵加 Return。'],
    ],
    holding: '按住中…',
    effects: {
      dictation: '在游標處開始語音輸入',
      ask: '在滑鼠附近打開啟動器，選取的文字已作為脈絡',
      translate: '已翻譯選取的文字',
      screenshot: '開始框選截圖',
      screenshotText: '已辨識並拷貝區域中的文字',
      clipboard: '已打開剪貼簿紀錄',
    },
    doc: {
      title: '週會紀錄',
      heading: '產品週會 · 10/21',
      lines: ['1. 圓環取代滑鼠語音輸入，本週出互動稿。', '3. 啟動器關鍵字支援在圓環裡直接呼叫。', '4. 下週審查 Liquid Glass 樣式在 macOS 26 上的表現。'],
      selected: '圓環就在指標下方打開，每個操作都只差一劃。',
    },
  },
  more: {
    title: '還有許多每天都用得到的小功能',
    subtitle: '在啟動器裡輸入一個關鍵字就能打開。',
    items: {
      translate: {
        name: '翻譯',
        desc: '多個翻譯引擎並排比較，選取文字或螢幕區域都能翻。',
      },
      wordBook: {
        name: '單字本',
        desc: '查過的字存下來，隨時複習。',
      },
      calendar: {
        name: '行事曆',
        desc: '月曆、假日、農曆和你的行程。',
      },
      monitor: {
        name: '系統監控',
        desc: 'CPU、記憶體、磁碟、網路和處理程序。',
      },
      terminal: {
        name: '終端機',
        desc: '在小型浮動終端機裡執行一次性指令。',
      },
      notebook: {
        name: '筆記本',
        desc: '對話、AI 結果、截圖文字都能存成 Markdown 筆記。',
      },
      emoji: {
        name: '表情符號',
        desc: '依名稱搜尋並貼上表情符號。',
      },
      tabs: {
        name: '分頁與書籤',
        desc: '支援 Safari、Chrome、Arc、Edge 和 Dia。',
      },
    },
  },
  custom: {
    badge: '自訂',
    title: '少了個功能？一分鐘做一個。',
    subtitle: 'Typeflux 不是一份固定的功能清單，而是一個平台。讓 Agent 幫你做工具、自己寫工作流程，或是裝上 Skills、接入 MCP。',
    items: {
      aiBuild: {
        title: '讓 AI 幫你做',
        desc: '在聊天裡描述你想要的工具，Agent 會寫好、測試好，並加到啟動器裡。',
      },
      workflows: {
        title: '用任何語言寫工作流程',
        desc: 'Python、Node、Shell 都行：一個資料夾，一份清單，一個關鍵字。',
      },
      gallery: {
        title: '18 個現成工作流程',
        desc: '時間戳、JSON、QR Code、UUID、匯率、Cron 等等。',
      },
      alfred: {
        title: '相容 Alfred 腳本',
        desc: '支援 Alfred Script Filter 的 JSON 輸出格式，現有腳本可以直接沿用。',
      },
      aiCommands: {
        title: '自訂 AI 指令',
        desc: '把一段提示詞變成關鍵字，例如 rw 潤飾、sum 摘要。',
      },
      hotkeys: {
        title: '任何功能都能綁快捷鍵',
        desc: '替任何關鍵字綁定全域快捷鍵，按下就直接執行。',
      },
      skills: {
        title: 'Agent 技能',
        desc: '從 GitHub 安裝 Skills，教 Agent 做新的事。',
      },
      mcp: {
        title: 'MCP 服務',
        desc: '把 Agent 接到你自己的工具和資料上。',
      },
    },
    demo: {
      user: '幫我做個工具：輸入 ts 加一個 Unix 時間戳，就顯示對應的日期。',
      steps: ['已用 Python 寫好工作流程「ts」', '已用 1760000000 測試通過', '可以儲存了'],
      result: 'ts 1760000000 → 2025-10-09 16:53:20（台北時間）',
      save: '儲存到啟動器',
    },
  },
  scenarios: {
    title: '從早到晚，一個 App 就夠了',
    subtitle: '看看不同的人怎麼用它。',
    tabs: {
      developer: {
        name: '開發者',
        steps: [
          '在啟動器裡輸入 > git status，不用打開終端機。',
          '讓 Agent 讀取日誌檔，解釋測試為什麼失敗。',
          '直接在編輯器裡口述 commit 訊息或程式碼審查意見。',
          '用長截圖截下整個出錯頁面，貼進 Issue。',
        ],
      },
      writer: {
        name: '寫作與行銷',
        steps: ['讓 Agent 在瀏覽器裡查資料，並把重點存成筆記。', '憑裡面的一句話，找到上一季的報告。', '全速口述初稿，再說一句「再緊湊一點」。', '從剪貼簿卡片裡找回之前拷貝的片段。'],
      },
      student: {
        name: '學生與研究',
        steps: ['讓 Agent 比較三篇論文，列出差異。', '用截圖取字，從投影片或掃描版 PDF 裡拷貝文字。', '錄一段螢幕操作，匯出 GIF 傳給同學。', '閱讀時把生字存進單字本。'],
      },
      global: {
        name: '跨語言工作',
        steps: ['選取一則訊息，輸入 fy，用母語讀懂它。', '用語音回覆，讓翻譯人設幫你寫成對方的語言。', '翻譯螢幕上的任意區域，圖片、影片字幕都可以。', '讓 Agent 用對方的語言草擬一封回信。'],
      },
    },
  },
  privacy: {
    title: '能力很強，控制權仍在你手上',
    subtitle: '每個請求送到哪裡、Agent 能自己做多少，都由你決定。',
    items: [
      {
        title: '在本機執行',
        desc: '本機語音模型可離線使用，你的聲音不必離開這台裝置。',
      },
      {
        title: '自帶模型',
        desc: '支援 OpenAI 相容、Anthropic、Responses 和 Ollama 介面，使用你自己的 Key。',
      },
      {
        title: '私密對話',
        desc: 'Agent 對話及其紀錄可以只保存在這台 Mac 上。',
      },
      {
        title: '界線由你設定',
        desc: '預設情況下，修改檔案、執行指令前都會先問你，範圍限定在你授權的資料夾。',
      },
      {
        title: '不留存資料',
        desc: '我們不收集、不儲存、不分析你的語音和文字。',
      },
      {
        title: '開源',
        desc: '全部程式碼以 AGPL-3.0 公開，任何人都可以稽核。',
      },
    ],
  },
  ios: {
    badge: '即將推出',
    title: 'Typeflux iPhone 版正在籌備中',
    desc: '在 iPhone 上繼續你的對話，用語音輸入，使用 Typeflux Cloud 或你自己的模型。我們正在準備上架。',
  },
  closing: {
    title: '一個快捷鍵，把事搞定',
    subtitle: '以 AGPL-3.0 開源、免費。下載後按下 ⌘Space，讓它幫你做點什麼。',
    download: '免費下載 Typeflux',
    github: '在 GitHub 上按 Star',
  },
  ui: {
    launcher: {
      hints: ['↑ 最近輸入', '⌘↩ 問 AI', '⌘K 脈絡'],
      appsGroup: 'App',
      filesGroup: '檔案',
      aiGroup: 'AI',
      askAi: '問 AI',
      open: '開啟',
    },
    apps: {
      items: ['郵件', '備忘錄', '行事曆', '音樂', '照片', '終端機', '預覽程式'],
    },
    files: {
      query: '發票',
      items: [['發票-2026-09.pdf', '~/文件/財務'], ['發票-2026-08.pdf', '~/下載項目'], ['第三季報帳.xlsx', '~/文件/財務']],
      contentGroup: '檔案內容',
      contentItem: ['會議紀錄.md', '…週五前把 9 月發票交給財務…'],
    },
    monitor: {
      chip: '系統監控',
      placeholder: '篩選處理程序：名稱或 PID',
      live: '即時 · 每 1 秒 · Apple M3 Max · 14 核 · 36 GB',
      uptime: '電池 99% · 散熱 正常',
      cards: {
        cpu: ['CPU', '14 核 · 負載 3.10'],
        mem: ['記憶體', '22.4 GB / 36 GB'],
        disk: ['磁碟', '讀 12MB/s · 寫 640K/s'],
        net: ['網路', '↑ 4.2 KB/s'],
      },
      processes: '處理程序 共 612 個',
      sorts: ['依 CPU', '依記憶體', '依磁碟'],
      cols: ['名稱', 'CPU', '記憶體', '磁碟', 'PID'],
      hints: '↑↓ 選擇處理程序 · ⇥ 切換指標 · ⌘O 獨立視窗 · esc 返回',
    },
    calendar: {
      chip: '行事曆',
      placeholder: '日期、節日或行程：12-25、下週五、春節…',
      month: '2026年10月',
      monthSub: '丙午年 · 馬年',
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      todayButton: '今天 ⌘T',
      dayTitle: '10月21日',
      dayWeek: '週三',
      today: '今天',
      dayMeta: '農曆九月十二 · 第 43 週 · 第 294 天',
      eventsTitle: '行程',
      events: [['10:00', '產品審查'], ['15:30', '設計審查']],
      newEvent: '在行事曆中新增 ⌘N',
      legend: ['放假', '補班'],
      marks: [[10, '國慶日'], [18, '重陽節']],
      holidayPlan: false,
      hints: '←→↑↓ 選擇日期 · ⌘←→ 切換月份 · ⇥ 行程 · ↩ 開啟 · esc 返回',
    },
    system: {
      chip: '本機配置',
      placeholder: '搜尋配置項：IP、序號、解析度、電池…',
      nav: ['概覽', '處理器', '記憶體', '儲存空間', '顯示與圖形', '網路', '電池', '系統'],
      device: 'MacBook Pro (14 吋)',
      deviceSub: 'Apple M3 Max · macOS 26',
      tiles: [
        ['處理器', 'Apple M3 Max', '14 核 CPU · 30 核 GPU'],
        ['記憶體', '36 GB', '統一記憶體'],
        ['儲存空間', '995 GB', '可用 509 GB'],
        ['顯示與圖形', '3024 × 1964', '120 Hz'],
        ['網路', 'Wi-Fi', '192.168.1.20'],
        ['電池', '99%', '使用電池'],
      ],
      status: '已讀取 · 剛剛',
      hints: '↑↓ 選擇 · ↩ 拷貝 · ⌘1–8 切換分區',
      copyReport: '⇧⌘C 拷貝報告',
    },
    translate: {
      chip: '翻譯',
      query: 'hello',
      detected: '偵測到 英文',
      target: '繁體中文',
      engine: 'AI · Typeflux Cloud',
      wordBook: '單字本',
      word: 'hello',
      meaning: '你好',
      phonetics: ['UK /həˈləʊ/', 'US /həˈloʊ/'],
      defs: [['interj.', '你好；喂（打電話或引起注意時用）'], ['n.', '問候；招呼；「你好」這句話']],
      example: ['She smiled and said hello to me.', '她微笑著對我說了聲「你好」。'],
      synonymsLabel: '近義',
      synonyms: ['hi', 'hey', 'greetings'],
      compare: '對照',
      local: '本機翻譯',
      localTag: '不離開本機',
      localResult: '你好',
      hints: '↩ 拷貝第一項 · ⌘1–9 拷貝第 n 項 · ⌥↩ 插入 · ⇥ 換語言',
    },
    quickAsk: {
      chip: '快速提問',
      query: '怎麼讓 MacBook 電池更耐用？',
      title: '最有效的幾個方法',
      sections: [
        ['設定', ['離開電源時開啟低耗電模式。', '把螢幕亮度調低一兩格，螢幕是最耗電的部件。']],
        ['習慣', ['結束不用的 App，尤其是正在播影片的瀏覽器分頁。', '保持 macOS 為最新版本，及時取得電池相關的修正。']],
      ],
      tail: '要我幫你看看現在哪些 App 最耗電嗎？',
      actions: ['拷貝', '繼續追問'],
      actionsRight: ['在聊天中開啟', '新問題'],
    },
    terminal: {
      title: '$ git log --oneline -5',
      running: '執行中',
      shell: 'zsh · 登入 + 互動',
      interrupt: '^C 中斷',
      stop: '停止',
    },
    chat: {
      newChat: '新對話',
      search: '搜尋對話',
      scopes: ['全部', '雲端', '僅本機'],
      groups: ['今天', '昨天', '更早'],
      conversations: [
        ['整理下載項目', '20:47'],
        ['週報初稿', '15:52'],
        ['擷取截圖中的文字', '13:15'],
        ['幫我做一個俄羅斯方塊', '22:38'],
        ['幫小狗取名字', '22:38'],
        ['設定 SSH 登入伺服器', '20:41'],
        ['週末出遊計畫', '10月18日'],
        ['幫我改寫這個標題', '10月18日'],
      ],
      composer: '輸入問題，/ 呼叫指令',
      user: 'Alex',
      empty: '有什麼想問的？',
      emptyHint: '隨時按 ⌘Space 喚起 · 按住 Fn 語音輸入',
    },
    clipboard: {
      forms: ['列表', '卡片架'],
      tabs: ['剪貼簿', '轉寫', '片段'],
      items: [
        ['發布前檢查清單', '文字 · 18 字 · 備忘錄 · 2 分鐘前'],
        ['https://typeflux.app/releases', '連結 · typeflux.app · Safari · 5 分鐘前'],
        ['PNG · 1280×720 · 642 KB', '預覽程式 · 21 分鐘前'],
        ['設計審查改到週四下午三點', '文字 · 12 字 · 郵件 · 1 小時前'],
      ],
      count: '500 項',
      actions: [['快速查看', '⌘Y'], ['釘選', '⌘P'], ['貼上', '↩']],
      shelfHints: '↩ 貼上 · ⌘↩ 貼上純文字 · Space 預覽 · ⌘P 釘選 · ⌘1–9 快速貼上',
    },
    capture: {
      size: '640 × 360 pt · 1280 × 720 px',
      sources: ['區域', '視窗', '全螢幕'],
      options: '選項',
      recover: '恢復錄影 (2)',
      start: '開始錄影',
      recordInfo: '1280 × 720 · MP4 · 30 FPS · 倒數 3 秒',
      recordHints: '↩ 開始 · esc 取消 · ⇥ 切換來源',
      editorTitle: '錄影 2026-10-21 10.24.35',
      setCurrent: '設為目前',
      keep: '保留 6.0 秒（完整）',
      meta: '1280 × 720 · 30 FPS · 約 2.4 MB',
      metaSub: '影片 · 含聲音',
      saveTo: '儲存到 桌面',
      copy: '拷貝',
      saveMp4: '儲存 MP4',
      saveGif: '儲存 GIF',
      scrolling: '正在自動捲動 · 移動滑鼠即可接手',
      stitched: '已拼接 3 屏',
      trimStart: '起點',
      trimEnd: '終點',
    },
    voice: {
      app: '備忘錄',
      listening: '正在聆聽',
      transcript: '幫我把會議改到週四下午',
      cancel: '取消',
      done: '完成',
    },
    ring: {
      actionsCount: '6 個操作',
    },
    desktop: {
      menus: ['檔案', '編輯', '顯示方式', '視窗', '輔助說明'],
      clock: '10月21日 週三 10:24',
    },
  },
}
