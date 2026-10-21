export default {
  hero: {
    eyebrow: '無料・オープンソース · macOS アプリ',
    title: 'ワンキーで、\nMac の用事が片づく。',
    subtitle: '本格的な AI エージェント、何でも探して何でも実行できるランチャー、そして音声入力、スクリーンショットと画面録画、クリップボード履歴。ひとつのアプリが、ワンキーで、今いる場所に現れます。',
    download: 'Mac 版をダウンロード',
    source: 'GitHub でスター',
    requirement: 'macOS 13+ · Apple シリコン / Intel 対応 · アカウント不要',
    demoLabel: 'Typeflux デモ',
    scenes: {
      agent: {
        label: '聞く',
      },
      launcher: {
        label: '探す・実行',
      },
      voice: {
        label: '話す',
        text: 'デザインレビューを木曜の 15 時に移して、議題をチームに共有してください。',
      },
      ring: {
        label: '指す',
        hint: 'アクションの方向へ動かして離す',
      },
    },
  },
  replaces: {
    title: '7 つのアプリが、ひとつに',
    items: {
      dictation: '音声入力',
      launcher: 'ランチャー',
      chat: 'AI チャット',
      capture: 'スクリーンショット',
      recorder: '画面録画',
      clipboard: 'クリップボード管理',
      translator: '翻訳',
    },
  },
  entrances: {
    title: '4つの入口、どれもキーひとつで',
    subtitle: 'どれも作業中の場所で開くので、アプリを切り替える必要はありません。ショートカットはすべて設定で変更できます。',
    items: {
      agent: {
        name: 'AI エージェント',
        action: '何でも聞く',
        desc: '会話、検索、Web 閲覧、コマンド実行、ファイル操作までこなします。',
      },
      launcher: {
        name: 'ランチャー',
        action: '入力して探す・実行',
        desc: 'どのアプリも、どのファイルも、どのコマンドも。AI への質問も。',
      },
      voice: {
        name: '音声入力',
        action: '押したまま話す',
        desc: 'どの入力欄にも音声で入力。選択した文章を声で書き直すこともできます。',
      },
      ring: {
        name: 'リング',
        action: 'ポインタの位置でひと振り',
        desc: 'よく使う操作を、マウスのすぐ下の放射状メニューに。',
      },
    },
    more: '詳しく見る',
  },
  agent: {
    badge: 'AI エージェント',
    title: '本当に仕事を片づけてくれる AI エージェント',
    subtitle: 'ただのチャット欄ではありません。Typeflux は会話し、Web を検索し、ページを開き、ファイルを読み書きし、コマンドを実行し、アプリを操作して、最後までやり遂げます。ダウンロードフォルダの整理、Mac が重い原因の調査、議事録から週報への書き換えも任せられます。',
    capabilities: {
      chat: {
        title: '会話',
        desc: '長い会話、履歴、添付ファイル、スクリーンショット、図に対応。',
      },
      web: {
        title: 'Web 検索',
        desc: '調べものをして、情報源も示します。',
      },
      browser: {
        title: '内蔵ブラウザ',
        desc: 'サイドパネルでサイトを開き、読み取り、フォームを入力。',
      },
      files: {
        title: 'あなたのファイル',
        desc: '許可したフォルダ内で読み書きします。',
      },
      commands: {
        title: 'コマンド実行',
        desc: 'Mac 上でシェルコマンドやスクリプトを実行。',
      },
      computer: {
        title: 'アプリを操作',
        desc: '画面を見て、クリックして、入力します。',
      },
      code: {
        title: 'コードとプロジェクト',
        desc: 'コードを実行し、プロジェクトを編集し、作ったものをプレビュー。',
      },
      images: {
        title: '画像生成',
        desc: '選んだプロバイダで画像を生成。',
      },
      memory: {
        title: 'メモリとノート',
        desc: '好みを覚え、回答をノートに保存。',
      },
      skills: {
        title: 'Skills',
        desc: 'GitHub からスキルを追加して、新しい仕事を教えられます。',
      },
      mcp: {
        title: 'MCP',
        desc: '外部のツールやデータソースに接続。',
      },
      models: {
        title: 'どのモデルでも',
        desc: 'Typeflux Cloud、または自分の OpenAI・Anthropic・Ollama。',
      },
    },
    examplesTitle: 'こんなふうに聞いてみて',
    examples: [
      'ダウンロードフォルダを種類別に整理して',
      'Mac が熱いのはなぜ？',
      'この 3 つの PDF を要約してノートに保存して',
      'GitHub の未読通知を ToDo リストにして',
      'タイムスタンプを変換するツールを作って',
      'この写真を撮影日でリネームして',
    ],
    modesTitle: 'どこまで任せるかは、あなたが決める',
    modes: {
      strict: {
        name: '毎回確認',
        desc: 'ツールを使うたびに承認を求めます。',
      },
      standard: {
        name: '標準',
        desc: '読み取りは自動、変更の前には確認します。',
      },
      auto: {
        name: '全自動',
        desc: '安心して任せられる長い作業を、すべて自動で実行。',
      },
    },
    demo: {
      user: 'ダウンロードフォルダを整理して。種類別にフォルダに分けて、1 か月以上前のインストーラは削除して。',
      steps: [
        {
          label: '~/Downloads の 214 ファイルを一覧',
          state: 'done',
        },
        {
          label: '画像・書類・アーカイブのフォルダを作成',
          state: 'done',
        },
        {
          label: '古いインストーラ 12 個を削除（3.1 GB）',
          state: 'approve',
        },
      ],
      approve: '許可',
      answer: '202 ファイルを 5 つのフォルダに整理しました。インストーラ 12 個の削除はあなたの確認待ちです。',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: 'ランチャー',
    title: '数文字打てば、何でも見つかり、何でも実行できる',
    subtitle: 'Mac のすべてのアプリとファイル、書類の中身、シェルコマンド、そして AI をひとつの入力欄に。Spotlight のように画面中央にも、最後にドラッグした位置にも開き、細い検索バーにも、結果を一覧する大きなウインドウにもなります。',
    capabilities: {
      files: {
        title: 'すべてのファイル',
        desc: 'Mac 全体をファイル名で一瞬で検索。パスでも一致します。',
      },
      content: {
        title: '書類の中身',
        desc: 'PDF、Markdown、テキストの中の言葉をデバイス上で検索（Apple シリコン）。',
      },
      commands: {
        title: 'どんなコマンドも',
        desc: 'フローティングターミナル、またはターミナルや iTerm で実行。',
      },
      ask: {
        title: 'ワンキーで AI',
        desc: '入力した内容で ⌘↩ を押せば、そのまま会話を開始。',
      },
      apps: {
        title: 'アプリとウインドウ',
        desc: 'マウスなしでアプリを開く、切り替える、終了する。',
      },
      system: {
        title: 'システム操作',
        desc: 'スリープ、ダークモード、Bluetooth、システム情報、リアルタイムモニタ。',
      },
      web: {
        title: 'Web とブラウザ',
        desc: 'Web を検索したり、開いているタブやブックマークへ移動したり。',
      },
      calc: {
        title: 'すぐに答え',
        desc: '計算、進数変換、翻訳、日付が入力しながら表示されます。',
      },
    },
    demos: {
      apps: 'アプリを開く',
      files: 'ファイル検索',
      cmd: 'コマンド実行',
      translate: '翻訳',
      quickAsk: 'クイック回答',
      calendar: 'カレンダー',
      monitor: 'システムモニタ',
      system: 'この Mac の構成',
    },
    placeholder: '検索、または何でも聞く…',
    demosTitle: '実際に見てみよう',
  },
  forms: {
    badge: '見た目',
    title: '好きなかたちで現れる',
    subtitle: '音声カプセルを出す場所も、チャットの開き方も選べます。呼ぶまでは邪魔しません。',
    tabs: {
      capsule: '音声カプセル',
      chat: 'チャットとランチャー',
    },
    capsule: {
      bottom: {
        name: '下部カプセル',
        desc: '画面下中央の小さなカプセル。軽く控えめで、どのディスプレイにも合います。',
      },
      orb: {
        name: 'オーブカプセル',
        desc: '声に合わせて光るオーブ。ボタンはホバーしたときだけ表示。',
      },
      corner: {
        name: 'コーナーカード',
        desc: 'Siri のようにメニューバーの下の左上または右上に現れ、文字起こしを表示。',
      },
      notch: {
        name: 'ノッチアイランド',
        desc: 'MacBook のノッチから伸びて、視線を画面上部から動かさずに済みます。',
      },
    },
    chat: {
      launcher: {
        name: 'フルランチャー',
        desc: 'Spotlight のように中央に、または最後にドラッグした位置に。',
      },
      compact: {
        name: '検索バー',
        desc: '入力を始めるまでは細いバーひとつだけ。',
      },
      quick: {
        name: 'クイック回答',
        desc: '新しいウインドウを開かず、ランチャーの中で答えを表示。',
      },
      workspace: {
        name: 'ワークスペース',
        desc: '履歴、チャット、ブラウザやプレビュー用のサイドパネル。',
      },
    },
    sample: {
      search: '検索、または何でも聞く…',
    },
  },
  voice: {
    badge: '音声入力',
    title: '考えるスピードで、どのアプリにも入力',
    subtitle: 'キーを押したまま自然に話し、離すだけ。句読点付きのテキストがカーソル位置に入ります。ブラウザ、エディタ、ターミナル、チャットでも同じです。タイピングの約 4 倍の速さです。',
    points: [
      {
        title: '入力できる場所ならどこでも',
        desc: 'プラグインや連携は不要。入力欄があれば Typeflux が書き込みます。',
      },
      {
        title: '声で書き直す',
        desc: '文章を選択して「もっと短く」「英語にして」と話すと、選択範囲が置き換わります。',
      },
      {
        title: '場面ごとのペルソナ',
        desc: '仕事のメール、メモ、チャットで口調や語彙を切り替え。2 つ目のショートカットに別のペルソナも設定できます。',
      },
      {
        title: 'ローカルでもクラウドでも',
        desc: 'SenseVoice、Whisper、Qwen3-ASR をオフラインで実行。60 以上の言語に対応するクラウドのリアルタイム認識も使えます。',
      },
    ],
    stats: [
      {
        value: '~200',
        label: '語 / 分',
      },
      {
        value: '60+',
        label: '言語',
      },
      {
        value: '100%',
        label: 'オフライン対応',
      },
    ],
    demo: {
      app: 'メール',
      draft: 'チームの皆さん、ベータ版は金曜にリリースします。フィードバックは水曜までにお願いします。',
      status: '聞いています…',
      persona: 'ペルソナ：仕事のメール',
    },
  },
  capture: {
    badge: 'スクリーンショット',
    title: 'スクリーンショットも、長いページも、画面録画も',
    subtitle: '範囲を選んで、画面全体を、あるいはどこまでも続くページを 1 枚に。システム音声とカメラ付きで画面を録画し、MP4 や GIF に書き出して、注釈を付けて共有できます。',
    modes: {
      region: {
        name: '範囲',
        desc: 'ドラッグで必要な部分だけを。拡大鏡でピクセル単位まで合わせられます。',
      },
      fullScreen: {
        name: '全画面',
        desc: 'ワンキーで画面全体をキャプチャ。',
      },
      scrolling: {
        name: 'スクロール撮影',
        desc: 'ページを自動でスクロールし、1 枚の長い画像につなげます。',
      },
      recording: {
        name: '画面録画',
        desc: 'システム音声、マイク、カメラの小窓付き。一時停止やトリミングも。',
      },
      gif: {
        name: 'GIF',
        desc: '短い録画を、どこでも再生できる GIF に。',
      },
    },
    toolsTitle: '撮ったあとは、エディタで',
    tools: ['矢印・図形・吹き出し', '番号付きステップ', 'モザイク', '電話番号を見つけて隠す', '背景で見栄えよく', '画面にピン留め', '文字をコピー（OCR）', '翻訳', 'AI に聞く'],
  },
  clipboard: {
    badge: 'クリップボード',
    title: 'コピーしたものすべてを、好きなだけ過去まで',
    subtitle: '⇧⌘V を押すと、クリップボード履歴がカードになって下から現れます。テキスト、リンク、コード、画像を検索して、すぐに貼り付け。',
    points: [
      {
        title: '1 日だけでも、ずっとでも',
        desc: '履歴の保存期間は自由に。ピン留めとスニペットは期限なし。',
      },
      {
        title: '一瞬で見つかる',
        desc: '全文検索、アプリで絞り込み、⌘1–9 ですぐ貼り付け。',
      },
      {
        title: 'スニペット',
        desc: '住所や定型文を保存して、どこにでも貼り付け。',
      },
    ],
    retentionTitle: '履歴の保存期間',
    retention: ['1 日', '1 週間', '1 か月', '1 年', '無期限'],
    cards: {
      text: {
        kind: 'テキスト',
        time: 'ピン留め',
        body: 'お届け先：東京都渋谷区神南 1-2-3 1203 号室',
      },
      link: {
        kind: 'リンク',
        time: '2 分前',
        body: 'typeflux.app/releases',
      },
      code: {
        kind: 'コード',
        time: '5 分前',
        body: 'git commit -m "Reposition the homepage"',
      },
      image: {
        kind: '画像',
        time: '12 分前',
        body: '1920 × 1080 · 842 KB',
      },
      note: {
        kind: 'テキスト',
        time: '昨日',
        body: 'デザインレビューは木曜 15 時に変更',
      },
    },
    search: 'クリップボードを検索',
  },
  ring: {
    badge: 'リング',
    title: 'ポインタのすぐそばにアクションリング',
    subtitle: 'ショートカットを押したままにすると、マウスの下にリングが開きます。アクションの方向へ動かして離せば実行、中央に戻して離せばキャンセル。最大 8 枠に Typeflux の機能、アプリ、Web サイト、フォルダ、キー操作、ショートカット、システム設定を配置できます。',
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
  more: {
    title: '毎日使える小さな便利機能も、たくさん',
    subtitle: 'どれもランチャーでキーワードを入力するだけ。',
    items: {
      translate: {
        name: '翻訳',
        desc: '複数の翻訳エンジンを並べて比較。選択範囲も画面の一部も。',
      },
      wordBook: {
        name: '単語帳',
        desc: '調べた単語を保存して、あとで復習。',
      },
      calendar: {
        name: 'カレンダー',
        desc: '月表示、祝日、旧暦、あなたの予定。',
      },
      monitor: {
        name: 'システムモニタ',
        desc: 'CPU、メモリ、ディスク、ネットワーク、プロセス。',
      },
      terminal: {
        name: 'ターミナル',
        desc: '小さなフローティングターミナルでコマンドを一度だけ実行。',
      },
      notebook: {
        name: 'ノート',
        desc: 'チャット、AI の結果、画面の文字を Markdown ノートに。',
      },
      emoji: {
        name: '絵文字',
        desc: '名前で絵文字を検索して貼り付け。',
      },
      tabs: {
        name: 'タブとブックマーク',
        desc: 'Safari、Chrome、Arc、Edge、Dia に対応。',
      },
    },
  },
  custom: {
    badge: 'カスタマイズ',
    title: '欲しい機能がない？1 分で作れます。',
    subtitle: 'Typeflux は決まった機能の一覧ではなく、プラットフォームです。エージェントにツールを作らせる、自分でワークフローを書く、Skills や MCP サーバーをつなぐ。',
    items: {
      aiBuild: {
        title: 'AI に作らせる',
        desc: '欲しいツールをチャットで説明するだけ。エージェントが書いて、テストして、ランチャーに追加します。',
      },
      workflows: {
        title: 'どの言語でもワークフロー',
        desc: 'Python、Node、Shell など。フォルダひとつ、マニフェストひとつ、キーワードひとつ。',
      },
      gallery: {
        title: 'すぐ使えるワークフロー 18 個',
        desc: 'タイムスタンプ、JSON、QR コード、UUID、為替、cron など。',
      },
      alfred: {
        title: 'Alfred のワークフローも',
        desc: '使い慣れたワークフローをそのまま取り込めます。',
      },
      aiCommands: {
        title: '自分だけの AI コマンド',
        desc: 'プロンプトをキーワードに。rw で推敲、sum で要約のように。',
      },
      hotkeys: {
        title: 'どんな機能もショートカットに',
        desc: '好きなキーワードをグローバルショートカットに割り当てて直接実行。',
      },
      skills: {
        title: 'エージェントのスキル',
        desc: 'GitHub から Skills を追加して、新しい仕事を教えられます。',
      },
      mcp: {
        title: 'MCP サーバー',
        desc: 'エージェントを自分のツールやデータにつなげます。',
      },
    },
    demo: {
      user: 'ツールを作って：ts と Unix タイムスタンプを入力したら日付を表示して。',
      steps: ['Python でワークフロー「ts」を作成', '1760000000 でテスト済み', '保存できます'],
      result: 'ts 1760000000 → 2025-10-09 17:53:20（日本時間）',
      save: 'ランチャーに保存',
    },
  },
  scenarios: {
    title: '朝から夜まで、アプリはこれひとつ',
    subtitle: '使い方の例をいくつか。',
    tabs: {
      developer: {
        name: '開発者',
        steps: [
          'ランチャーで > git status。ターミナルを開く必要はありません。',
          'エージェントにログファイルを読ませ、テストが失敗する理由を説明させる。',
          'コミットメッセージやレビューコメントをエディタに直接口述。',
          'エラーのページ全体をスクロール撮影して Issue に貼る。',
        ],
      },
      writer: {
        name: 'ライター・マーケター',
        steps: [
          'エージェントにブラウザで調べてもらい、要点をノートに保存。',
          '中に書かれた一文から、前四半期のレポートを見つける。',
          '下書きを一気に口述して、「もっと引き締めて」と一言。',
          '以前コピーした断片をクリップボードのカードから取り出す。',
        ],
      },
      student: {
        name: '学生・研究者',
        steps: [
          'エージェントに 3 本の論文を比較させ、違いを整理。',
          'スライドやスキャン PDF から画面 OCR で文字をコピー。',
          '画面操作を録画して GIF でグループに共有。',
          '読みながら新しい単語を単語帳へ。',
        ],
      },
      global: {
        name: '多言語の仕事',
        steps: [
          'メッセージを選んで fy と入力し、母語で読む。',
          '声で返信し、翻訳ペルソナに相手の言語で書いてもらう。',
          '画像や動画の字幕など、画面のどこでも翻訳。',
          'エージェントに相手の言語で返信の下書きを作らせる。',
        ],
      },
    },
  },
  privacy: {
    title: '高機能でも、主導権はあなたに',
    subtitle: 'リクエストの送り先も、エージェントにどこまで任せるかも、あなたが決めます。',
    items: [
      {
        title: 'Mac の中で動く',
        desc: 'ローカル音声モデルはオフラインで動作。声がデバイスの外に出る必要はありません。',
      },
      {
        title: '自分のモデルを使う',
        desc: 'OpenAI 互換、Anthropic、Responses、Ollama のエンドポイントを自分のキーで。',
      },
      {
        title: 'プライベートな会話',
        desc: 'エージェントとの会話と履歴をこの Mac だけに保存できます。',
      },
      {
        title: '範囲はあなたが決める',
        desc: '標準では、ファイルの変更やコマンドの実行前に確認し、許可したフォルダ内に限定します。',
      },
      {
        title: 'データを保持しない',
        desc: '音声やテキストを収集・保存・分析しません。',
      },
      {
        title: 'オープンソース',
        desc: 'すべてのコードを AGPL-3.0 で公開。誰でも監査できます。',
      },
    ],
  },
  ios: {
    badge: '近日公開',
    title: 'Typeflux for iPhone を準備中',
    desc: 'iPhone で会話の続きを、音声入力で、Typeflux Cloud または自分のモデルで。現在リリースに向けて準備しています。',
  },
  closing: {
    title: 'ワンキーで、用事を片づけよう',
    subtitle: 'AGPL-3.0 のオープンソースで無料。ダウンロードしたら ⌘Space を押して、何か頼んでみてください。',
    download: 'Typeflux を無料ダウンロード',
    github: 'GitHub でスター',
  },
  ui: {
    launcher: {
      hints: ['↑ 最近の入力', '⌘↩ AI に聞く', '⌘K コンテキスト'],
      appsGroup: 'アプリケーション',
      filesGroup: 'ファイル',
      aiGroup: 'AI',
      askAi: 'AI に聞く',
      open: '開く',
    },
    apps: {
      items: ['メール', 'メモ', 'カレンダー', 'ミュージック', '写真', 'ターミナル', 'プレビュー'],
    },
    files: {
      query: 'invoice',
      items: [['invoice-2026-09.pdf', '~/書類/経理'], ['invoice-2026-08.pdf', '~/ダウンロード'], ['経費-第3四半期.xlsx', '~/書類/経理']],
      contentGroup: 'ファイルの中身',
      contentItem: ['議事録.md', '…金曜までに 9 月の請求書を経理へ…'],
    },
    monitor: {
      chip: 'システムモニタ',
      placeholder: 'プロセスを絞り込む：名前または PID',
      live: 'ライブ · 1 秒ごと · Apple M3 Max · 14 コア · 36 GB',
      uptime: 'バッテリー 99% · 温度 正常',
      cards: {
        cpu: ['CPU', '14 コア · 負荷 3.10'],
        mem: ['メモリ', '22.4 GB / 36 GB'],
        disk: ['ディスク', '読 12MB/s · 書 640K/s'],
        net: ['ネットワーク', '↑ 4.2 KB/s'],
      },
      processes: 'プロセス 612 個',
      sorts: ['CPU 順', 'メモリ順', 'ディスク順'],
      cols: ['名前', 'CPU', 'メモリ', 'ディスク', 'PID'],
      hints: '↑↓ 選択 · ⇥ 指標を切替 · ⌘O 別ウインドウ · esc 戻る',
    },
    calendar: {
      chip: 'カレンダー',
      placeholder: '日付、祝日、予定：12-25、来週金曜…',
      month: '2026年10月',
      monthSub: '令和8年',
      weekdays: ['日', '月', '火', '水', '木', '金', '土'],
      todayButton: '今日 ⌘T',
      dayTitle: '10月21日',
      dayWeek: '水',
      today: '今日',
      dayMeta: '第 43 週 · 294 日目',
      eventsTitle: '予定',
      events: [['10:00', 'プロダクトレビュー'], ['15:30', 'デザインレビュー']],
      newEvent: 'カレンダーで新規作成 ⌘N',
      legend: ['休日', '振替出勤'],
      marks: [[12, 'スポーツの日'], [31, 'ハロウィン']],
      holidayPlan: false,
      hints: '←→↑↓ 日付を選択 · ⌘←→ 月を切替 · ⇥ 予定 · ↩ 開く · esc 戻る',
    },
    system: {
      chip: 'この Mac の構成',
      placeholder: '構成を検索：IP、シリアル、解像度、バッテリー…',
      nav: ['概要', 'プロセッサ', 'メモリ', 'ストレージ', 'ディスプレイ', 'ネットワーク', 'バッテリー', 'システム'],
      device: 'MacBook Pro (14インチ)',
      deviceSub: 'Apple M3 Max · macOS 26',
      tiles: [
        ['プロセッサ', 'Apple M3 Max', '14 コア CPU · 30 コア GPU'],
        ['メモリ', '36 GB', 'ユニファイドメモリ'],
        ['ストレージ', '995 GB', '空き 509 GB'],
        ['ディスプレイ', '3024 × 1964', '120 Hz'],
        ['ネットワーク', 'Wi-Fi', '192.168.1.20'],
        ['バッテリー', '99%', 'バッテリー駆動'],
      ],
      status: '読み取り済み · たった今',
      hints: '↑↓ 選択 · ↩ コピー · ⌘1–8 セクション',
      copyReport: '⇧⌘C レポートをコピー',
    },
    translate: {
      chip: '翻訳',
      query: 'hello',
      detected: '英語を検出',
      target: '日本語',
      engine: 'AI · Typeflux Cloud',
      wordBook: '単語帳',
      word: 'hello',
      meaning: 'こんにちは',
      phonetics: ['UK /həˈləʊ/', 'US /həˈloʊ/'],
      defs: [['interj.', 'こんにちは；もしもし（電話や呼びかけで）'], ['n.', 'あいさつ；「こんにちは」という言葉']],
      example: ['She smiled and said hello to me.', '彼女はほほえんで「こんにちは」と言った。'],
      synonymsLabel: '類義語',
      synonyms: ['hi', 'hey', 'greetings'],
      compare: '比較',
      local: 'デバイス上の翻訳',
      localTag: 'Mac の外に出ません',
      localResult: 'こんにちは',
      hints: '↩ 先頭をコピー · ⌘1–9 n 番目をコピー · ⌥↩ 挿入 · ⇥ 言語を入れ替え',
    },
    quickAsk: {
      chip: 'クイック回答',
      query: 'MacBook のバッテリーを長持ちさせるには？',
      title: '効果の大きい方法',
      sections: [
        ['設定', ['電源から離れるときは低電力モードをオンに。', '画面の明るさを 1〜2 段階下げる。ディスプレイが最も電力を使います。']],
        ['習慣', ['使っていないアプリ、特に動画を再生しているタブは閉じる。', 'macOS を最新にして、バッテリー関連の修正を取り込む。']],
      ],
      tail: '今どのアプリが電力を多く使っているか確認しましょうか？',
      actions: ['コピー', '続けて質問'],
      actionsRight: ['チャットで開く', '新しい質問'],
    },
    terminal: {
      title: '$ git log --oneline -5',
      running: '実行中',
      shell: 'zsh · ログイン + 対話',
      interrupt: '^C 中断',
      stop: '停止',
    },
    chat: {
      newChat: '新しいチャット',
      search: 'チャットを検索',
      scopes: ['すべて', 'クラウド', 'この Mac'],
      groups: ['今日', '昨日', 'それ以前'],
      conversations: [
        ['ダウンロードを整理', '20:47'],
        ['週報の下書き', '15:52'],
        ['スクリーンショットの文字', '13:15'],
        ['テトリスを作って', '22:38'],
        ['子犬の名前を考えて', '22:38'],
        ['SSH でサーバーに接続', '20:41'],
        ['週末の旅行プラン', '10月18日'],
        ['見出しを書き直して', '10月18日'],
      ],
      composer: '質問を入力、/ でコマンド',
      user: 'Alex',
      empty: '何を聞きたいですか？',
      emptyHint: 'どこでも ⌘Space で呼び出し · Fn を押したまま音声入力',
    },
    clipboard: {
      forms: ['リスト', 'カード'],
      tabs: ['クリップボード', '文字起こし', 'スニペット'],
      items: [
        ['リリース前チェックリスト', 'テキスト · 18 文字 · メモ · 2 分前'],
        ['https://typeflux.app/releases', 'リンク · typeflux.app · Safari · 5 分前'],
        ['PNG · 1280×720 · 642 KB', 'プレビュー · 21 分前'],
        ['デザインレビューは木曜 15 時に変更', 'テキスト · 17 文字 · メール · 1 時間前'],
      ],
      count: '500 項目',
      actions: [['クイックルック', '⌘Y'], ['ピン留め', '⌘P'], ['ペースト', '↩']],
      shelfHints: '↩ ペースト · ⌘↩ プレーンテキスト · Space プレビュー · ⌘P ピン留め · ⌘1–9 クイックペースト',
    },
    capture: {
      size: '640 × 360 pt · 1280 × 720 px',
      sources: ['範囲', 'ウインドウ', '全画面'],
      options: 'オプション',
      recover: '録画を復元 (2)',
      start: '録画を開始',
      recordInfo: '1280 × 720 · MP4 · 30 FPS · カウントダウン 3 秒',
      recordHints: '↩ 開始 · esc キャンセル · ⇥ ソース切替',
      editorTitle: '画面録画 2026-10-21 10.24.35',
      setCurrent: '現在位置に',
      keep: '6.0 秒を保持（全体）',
      meta: '1280 × 720 · 30 FPS · 約 2.4 MB',
      metaSub: 'ビデオ · 音声あり',
      saveTo: 'デスクトップに保存',
      copy: 'コピー',
      saveMp4: 'MP4 を保存',
      saveGif: 'GIF を保存',
      scrolling: '自動スクロール中 · マウスを動かすと手動に',
      stitched: '3 画面をつなぎました',
      trimStart: '開始点',
      trimEnd: '終了点',
    },
    voice: {
      app: 'メモ',
      listening: '聞いています',
      transcript: '会議を木曜の午後に移して',
      cancel: 'キャンセル',
      done: '完了',
    },
    ring: {
      actionsCount: '6 つの操作',
    },
  },
}
