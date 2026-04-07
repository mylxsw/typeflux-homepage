import { createContext, useContext, useState, useEffect, useCallback } from 'react'

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
      github: 'GitHub',
      download: 'Download Free',
    },
    // Hero
    hero: {
      title1: 'Speak,',
      title2: 'Don\'t Type',
      subtitle: 'Press the Fn key and start speaking. Typeflux converts your voice to text accurately, instantly inputting anywhere. Open source and free, with local model support.',
      downloadBtn: 'Download Free',
      sourceBtn: 'View Source',
    },
    // Features
    features: {
      title: 'Press Fn, Start Speaking',
      subtitle: 'Simple key trigger, natural voice input. Typeflux works wherever you need to type.',
      card1Title: 'One-Click Voice Input',
      card1Desc: 'Hold the Fn key to start voice input, release to stop. No need to switch input methods, no need to click buttons, works in any text field.',
      localModel: 'Local Model Support',
      localModelDesc: 'Supports local speech recognition models, fast and accurate, no internet required, fully protecting your privacy.',
      persona: 'Persona Customization',
      personaDesc: 'Create different personas optimized for work, study, social scenarios, making speech recognition fit your context.',
      minimal: 'Minimal Design',
      minimalDesc: 'Clean interface design that doesn\'t interrupt your workflow. Quietly stays in the menu bar, ready with one click.',
    },
    // Agent
    agent: {
      badge: 'Voice Agent',
      title: 'More Than Input,\nYour AI Assistant',
      subtitle: 'Press Fn + Space to activate "Voice Agent". Talk to the AI Agent via voice for Q&A, content rewriting, and complex operations.',
      feature1Title: 'Voice Q&A',
      feature1Desc: 'Ask questions directly by voice, get instant answers',
      feature2Title: 'Content Rewrite',
      feature2Desc: 'Select text, use voice commands to rewrite, translate, summarize',
      feature3Title: 'Complex Operations',
      feature3Desc: 'Complete complex workflows through natural language',
      chatHint: 'Fn+Space',
      agentLabel: 'Typeflux Agent',
      userExample: 'Help me translate this into English, in a more formal tone',
      agentResponse: 'Sure, I\'ll help you translate and adjust the tone. Here is the formal version:',
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
    // Footer
    footer: {
      desc: 'Open source free macOS voice input method',
      product: 'Product',
      features: 'Features',
      agent: 'Voice Agent',
      privacy: 'Privacy',
      resources: 'Resources',
      download: 'Download',
      feedback: 'Feedback',
      copyright: '© 2026 Typeflux. Open source project under AGPL-3.0 license.',
    },
  },
  'zh-CN': {
    nav: {
      features: '功能',
      agent: '随口说',
      privacy: '隐私',
      github: 'GitHub',
      download: '免费下载',
    },
    hero: {
      title1: '说话，',
      title2: '不打字',
      subtitle: '按下 Fn 键，开口说话。Typeflux 将你的语音精准转为文字，在任何应用中即时输入。开源免费，支持本地模型。',
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
      badge: '随口说',
      title: '不只是输入，\n更是你的 AI 助手',
      subtitle: '按下 Fn + Space，唤起「随口说」功能。通过语音与 AI Agent 对话，实现问答、内容改写和更复杂的操作。',
      feature1Title: '语音问答',
      feature1Desc: '直接开口提问，获取即时回答',
      feature2Title: '内容改写',
      feature2Desc: '选中文本，用语音指令改写、翻译、总结',
      feature3Title: '复杂操作',
      feature3Desc: '通过自然语言完成更复杂的工作流程',
      chatHint: 'Fn+Space',
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
      studyDesc: '学术词汇增强识别，支持笔记速记，适合课堂和阅读场景。',
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
    footer: {
      desc: '开源免费的 macOS 语音输入法',
      product: '产品',
      features: '功能介绍',
      agent: '随口说',
      privacy: '隐私保护',
      resources: '资源',
      download: '下载',
      feedback: '反馈',
      copyright: '© 2026 Typeflux. 开源项目，使用 AGPL-3.0 许可证。',
    },
  },
  'zh-TW': {
    nav: {
      features: '功能',
      agent: '隨口說',
      privacy: '隱私',
      github: 'GitHub',
      download: '免費下載',
    },
    hero: {
      title1: '說話，',
      title2: '不打字',
      subtitle: '按下 Fn 鍵，開口說話。Typeflux 將你的語音精準轉為文字，在任何應用中即時輸入。開源免費，支援本地模型。',
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
      badge: '隨口說',
      title: '不只是輸入，\n更是你的 AI 助手',
      subtitle: '按下 Fn + Space，喚起「隨口說」功能。透過語音與 AI Agent 對話，實現問答、內容改寫和更複雜的操作。',
      feature1Title: '語音問答',
      feature1Desc: '直接開口提問，獲取即時回答',
      feature2Title: '內容改寫',
      feature2Desc: '選中文字，用語音指令改寫、翻譯、總結',
      feature3Title: '複雜操作',
      feature3Desc: '透過自然語言完成更複雜的工作流程',
      chatHint: 'Fn+Space',
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
      studyDesc: '學術詞彙增強識別，支援筆記速記，適合課堂和閱讀場景。',
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
    footer: {
      desc: '開源免費的 macOS 語音輸入法',
      product: '產品',
      features: '功能介紹',
      agent: '隨口說',
      privacy: '隱私保護',
      resources: '資源',
      download: '下載',
      feedback: '反饋',
      copyright: '© 2026 Typeflux. 開源專案，使用 AGPL-3.0 授權條款。',
    },
  },
  ja: {
    nav: {
      features: '機能',
      agent: 'エージェント',
      privacy: 'プライバシー',
      github: 'GitHub',
      download: '無料ダウンロード',
    },
    hero: {
      title1: '話す、',
      title2: 'タイプしない',
      subtitle: 'Fnキーを押して話し始めます。Typefluxは音声を正確にテキストに変換し、どのアプリでも即座に入力できます。オープンソースで無料、ローカルモデル対応。',
      downloadBtn: '無料ダウンロード',
      sourceBtn: 'ソースコード',
    },
    features: {
      title: 'Fnを押して、話し始める',
      subtitle: 'シンプルなキートリガー、自然な音声入力。Typefluxはタイピングが必要な場所ならどこでも動作します。',
      card1Title: 'ワンクリック音声入力',
      card1Desc: 'Fnキーを押し続けると音声入力が開始され、離すと停止します。入力切り替え不要、ボタンクリック不要、あらゆるテキストフィールドで使用可能。',
      localModel: 'ローカルモデル対応',
      localModelDesc: 'ローカル音声認識モデルをサポート。高速で高精度、インターネット不要、プライバシーを完全に保護。',
      persona: 'ペルソナカスタマイズ',
      personaDesc: '異なるペルソナを作成し、仕事、学習、SNSなどのシーンに最適化。使い方に合わせた音声認識を実現。',
      minimal: 'ミニマルデザイン',
      minimalDesc: '極限までシンプルなインターフェース。作業の邪魔をせず、メニューバーに静かに待機。必要な時にワンクリックで呼び出し。',
    },
    agent: {
      badge: '音声エージェント',
      title: '入力だけでなく、\nあなたのAIアシスタント',
      subtitle: 'Fn + Spaceで「音声エージェント」を起動。音声でAIエージェントと対話し、Q&A、内容の書き換え、複雑な操作を実現。',
      feature1Title: '音声Q&A',
      feature1Desc: 'そのまま質問すれば、即座に回答を取得',
      feature2Title: '内容の書き換え',
      feature2Desc: 'テキストを選択し、音声コマンドで書き換え、翻訳、要約',
      feature3Title: '複雑な操作',
      feature3Desc: '自然言語で複雑なワークフローを完了',
      chatHint: 'Fn+Space',
      agentLabel: 'Typeflux Agent',
      userExample: 'これを英語に翻訳して、もっとフォーマルな口調にしてください',
      agentResponse: '承知しました。翻訳してトーンを調整します。フォーマルバージョンは以下の通りです：',
    },
    personas: {
      title: 'シーンごとにカスタムペルソナ',
      subtitle: '異なるペルソナを作成し、異なる使用シーンに最適化。仕事ではプロフェッショナルに、SNSではリラックスして。',
      work: '仕事',
      workDesc: '専門用語認識の最適化、フォーマルな文章スタイル。メール、レポート、文書作成に最適。',
      study: '学習',
      studyDesc: '学術用語の認識強化、メモの速記サポート。授業や読書シーンに最適。',
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
      desc: 'Typefluxは完全にオープンソースのプロジェクトです。優れたツールは誰にでも属すべきだと信じています。貢献を歓迎し、一緒に音声入力を向上させましょう。',
      githubBtn: 'GitHubで見る',
      downloadBtn: '最新版をダウンロード',
    },
    cta: {
      title: '手を解放し、\n声で書く',
      subtitle: 'Typefluxは音声入力を最も自然な表現方法にします。',
      downloadBtn: 'Typefluxを無料ダウンロード',
    },
    footer: {
      desc: 'オープンソース無料のmacOS音声入力メソッド',
      product: '製品',
      features: '機能紹介',
      agent: '音声エージェント',
      privacy: 'プライバシー保護',
      resources: 'リソース',
      download: 'ダウンロード',
      feedback: 'フィードバック',
      copyright: '© 2026 Typeflux. AGPL-3.0ライセンスのオープンソースプロジェクト。',
    },
  },
  ko: {
    nav: {
      features: '기능',
      agent: '에이전트',
      privacy: '개인정보',
      github: 'GitHub',
      download: '무료 다운로드',
    },
    hero: {
      title1: '말하고,',
      title2: '타이핑하지 마세요',
      subtitle: 'Fn 키를 누르고 말을 시작하세요. Typeflux는 음성을 정확하게 텍스트로 변환하여 모든 앱에서 즉시 입력합니다. 오픈소스이며 무료이며 로컬 모델을 지원합니다.',
      downloadBtn: '무료 다운로드',
      sourceBtn: '소스코드 보기',
    },
    features: {
      title: 'Fn을 누르고, 말을 시작하세요',
      subtitle: '간단한 키 트리거, 자연스러운 음성 입력. Typeflux는 타이핑이 필요한 어디에서나 작동합니다.',
      card1Title: '원클릭 음성 입력',
      card1Desc: 'Fn 키를 누르고 있으면 음성 입력이 시작되고, 놓으면 중지됩니다. 입력기 전환 없이, 버튼 클릭 없이, 모든 텍스트 필드에서 사용 가능합니다.',
      localModel: '로컬 모델 지원',
      localModelDesc: '로컬 음성 인식 모델을 지원합니다. 빠르고 정확하며, 인터넷 없이도 작동하여 개인정보를 완전히 보호합니다.',
      persona: '페르소나 커스터마이징',
      personaDesc: '다양한 페르소나를 생성하여 업무, 학습, 소셜 등 상황에 맞게 최적화하세요. 사용 상황에 맞는 음성 인식을 경험하세요.',
      minimal: '미니멀 디자인',
      minimalDesc: '극도로 단순한 인터페이스 디자인으로 작업 흐름을 방해하지 않습니다. 메뉴 바에 조용히 머물다가 필요할 때 원클릭으로 호출합니다.',
    },
    agent: {
      badge: '음성 에이전트',
      title: '입력 그 이상,\n당신의 AI 어시스턴트',
      subtitle: 'Fn + Space로 "음성 에이전트"를 활성화하세요. 음성으로 AI 에이전트와 대화하여 Q&A, 콘텐츠 재작성, 복잡한 작업을 수행하세요.',
      feature1Title: '음성 Q&A',
      feature1Desc: '바로 질문하면 즉시 답변을 받습니다',
      feature2Title: '콘텐츠 재작성',
      feature2Desc: '텍스트를 선택하고 음성 명령으로 재작성, 번역, 요약하세요',
      feature3Title: '복잡한 작업',
      feature3Desc: '자연어로 복잡한 워크플로우를 완료하세요',
      chatHint: 'Fn+Space',
      agentLabel: 'Typeflux Agent',
      userExample: '이 문장을 영어로 번역하고 더 공식적인 어조로 바꿔주세요',
      agentResponse: '알겠습니다. 번역하고 어조를 조정하겠습니다. 공식 버전은 다음과 같습니다:',
    },
    personas: {
      title: '모든 상황을 위한 커스텀 페르소나',
      subtitle: '다양한 페르소나를 생성하여 다양한 사용 상황에 최적화하세요. 업무에서는 전문적으로, 소셜에서는 편안하게.',
      work: '업무',
      workDesc: '전문 용어 인식 최적화, 공식적인 문체 출력. 이메일, 보고서, 문서 작성에 적합합니다.',
      study: '학습',
      studyDesc: '학술 어휘 인식 강화, 노트 필기 지원. 수업과 독서 상황에 적합합니다.',
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
      desc: 'Typeflux는 완전히 오픈소스 프로젝트입니다. 우리는 훌륭한 도구가 모두에게 속해야 한다고 믿습니다. 기여를 환영하며, 함께 음성 입력을 개선해 나갑시다.',
      githubBtn: 'GitHub에서 보기',
      downloadBtn: '최신 버전 다운로드',
    },
    cta: {
      title: '당신의 손을 자유롭게,\n목소리로 글을 쓰세요',
      subtitle: 'Typeflux는 음성 입력을 가장 자연스러운 표현 방식으로 만듭니다.',
      downloadBtn: 'Typeflux 무료 다운로드',
    },
    footer: {
      desc: '오픈소스 무료 macOS 음성 입력기',
      product: '제품',
      features: '기능 소개',
      agent: '음성 에이전트',
      privacy: '개인정보 보호',
      resources: '리소스',
      download: '다운로드',
      feedback: '피드백',
      copyright: '© 2026 Typeflux. AGPL-3.0 라이선스의 오픈소스 프로젝트입니다.',
    },
  },
}

const I18nContext = createContext()

const STORAGE_KEY = 'typeflux-language'

export function I18nProvider({ children }) {
  const [lang, setLang] = useState('en')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && translations[saved]) {
      setLang(saved)
    } else {
      const browserLang = navigator.language
      if (translations[browserLang]) {
        setLang(browserLang)
      } else if (browserLang.startsWith('zh')) {
        setLang('zh-CN')
      }
    }
    setIsReady(true)
  }, [])

  const setLanguage = useCallback((newLang) => {
    if (translations[newLang]) {
      setLang(newLang)
      localStorage.setItem(STORAGE_KEY, newLang)
      document.documentElement.lang = newLang
    }
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
