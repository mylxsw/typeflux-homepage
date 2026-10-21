// English home page copy. Every other locale mirrors this structure exactly
// (enforced by homeCopy.test.js). `ui` holds the text shown inside the
// redrawn app interfaces.
export default {
  hero: {
    eyebrow: 'Free & open source · for macOS',
    title: 'Your Mac,\none keystroke from done.',
    subtitle: 'A full AI agent, a launcher that finds and runs anything, voice typing, screenshots and clipboard history. One app, one keystroke away, right where you are working.',
    download: 'Download for Mac',
    source: 'Star on GitHub',
    requirement: 'macOS 13+ · Apple silicon & Intel · works without an account',
    demoLabel: 'Typeflux demo',
    scenes: {
      agent: {
        label: 'Ask',
      },
      launcher: {
        label: 'Find & do',
      },
      voice: {
        label: 'Speak',
        text: 'Move the design review to Thursday at 3 PM and share the agenda with the team.',
      },
      ring: {
        label: 'Point',
        hint: 'Flick toward an action and let go',
      },
    },
  },
  replaces: {
    title: 'One app instead of seven',
    items: {
      dictation: 'Dictation app',
      launcher: 'Launcher',
      chat: 'AI chat',
      capture: 'Screenshot tool',
      recorder: 'Screen recorder',
      clipboard: 'Clipboard manager',
      translator: 'Translator',
    },
  },
  entrances: {
    title: 'Four ways in, each a keystroke away.',
    subtitle: 'Each one opens right where you are working, so you never switch apps. Every shortcut can be changed in Settings.',
    items: {
      agent: {
        name: 'AI Agent',
        action: 'Ask anything',
        desc: 'Chats, searches, browses, runs commands and works with your files.',
      },
      launcher: {
        name: 'Launcher',
        action: 'Type to find & do',
        desc: 'Any app, any file, any command, or a question for AI.',
      },
      voice: {
        name: 'Voice Input',
        action: 'Hold to speak',
        desc: 'Dictate into any text field, or select text and say how to change it.',
      },
      ring: {
        name: 'Ring',
        action: 'Flick at the pointer',
        desc: 'Your favorite actions in a radial menu right under the mouse.',
      },
    },
    more: 'Learn more',
  },
  agent: {
    badge: 'AI Agent',
    title: 'A complete AI agent that can actually do things',
    subtitle: 'Not just a chat box. Typeflux talks, searches, opens web pages, reads and edits files, runs commands and operates apps to finish the job. Ask it to tidy your Downloads folder, find out why your Mac is slow, or turn a meeting note into a weekly report.',
    capabilities: {
      chat: {
        title: 'Conversation',
        desc: 'Long threads with history, attachments, screenshots and diagrams.',
      },
      web: {
        title: 'Web search',
        desc: 'Looks things up and cites what it found.',
      },
      browser: {
        title: 'Built-in browser',
        desc: 'Opens sites, reads pages and fills forms in a side panel.',
      },
      files: {
        title: 'Your files',
        desc: 'Reads and writes inside folders you grant.',
      },
      commands: {
        title: 'Commands',
        desc: 'Runs shell commands and scripts on your Mac.',
      },
      computer: {
        title: 'Operates apps',
        desc: 'Looks at the screen, clicks and types for you.',
      },
      code: {
        title: 'Code & projects',
        desc: 'Runs code, edits projects and previews what it builds.',
      },
      images: {
        title: 'Images',
        desc: 'Generates images with the provider you choose.',
      },
      memory: {
        title: 'Memory & notes',
        desc: 'Remembers preferences and saves answers to your notebook.',
      },
      skills: {
        title: 'Skills',
        desc: 'Install skills from GitHub to teach it new jobs.',
      },
      mcp: {
        title: 'MCP',
        desc: 'Connects to external tools and data sources.',
      },
      models: {
        title: 'Any model',
        desc: 'Typeflux Cloud or your own OpenAI, Anthropic or Ollama keys.',
      },
    },
    examplesTitle: 'Try asking',
    examples: [
      'Clean up my Downloads folder by file type',
      'Why is my Mac running hot?',
      'Summarize these three PDFs and save the notes',
      'Check GitHub notifications and make a to-do list',
      'Build me a tool that converts timestamps',
      'Rename these photos by the date they were taken',
    ],
    modesTitle: 'You decide how much it can do on its own',
    modes: {
      strict: {
        name: 'Ask every time',
        desc: 'Every tool call waits for your approval.',
      },
      standard: {
        name: 'Standard',
        desc: 'Reads on its own, asks before changing anything.',
      },
      auto: {
        name: 'Full auto',
        desc: 'Runs every step for trusted, long tasks.',
      },
    },
    demo: {
      user: 'Tidy up my Downloads folder: sort files into folders by type and delete installers older than a month.',
      steps: [
        {
          label: 'Listed 214 files in ~/Downloads',
          state: 'done',
        },
        {
          label: 'Created Images, Documents, Archives',
          state: 'done',
        },
        {
          label: 'Delete 12 old installers (3.1 GB)',
          state: 'approve',
        },
      ],
      approve: 'Allow',
      answer: 'Sorted 202 files into 5 folders. Waiting for your OK to delete 12 installers.',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: 'Launcher',
    title: 'Type a few letters. Find anything, run anything.',
    subtitle: 'One box for every app and file on your Mac, the text inside your documents, shell commands, and AI. It opens centered like Spotlight or wherever you last dragged it, as a slim search bar or a full results window.',
    capabilities: {
      files: {
        title: 'Every file',
        desc: 'Instant name search across your Mac, with pinyin and path matching.',
      },
      content: {
        title: 'Inside documents',
        desc: 'Finds words inside PDFs, Markdown and text files, on device (Apple silicon).',
      },
      commands: {
        title: 'Any command',
        desc: 'Run a shell command in a floating terminal or in Terminal and iTerm.',
      },
      ask: {
        title: 'One key to AI',
        desc: 'Press ⌘↩ on anything you typed to start a conversation.',
      },
      apps: {
        title: 'Apps & windows',
        desc: 'Open, switch to or quit apps without touching the mouse.',
      },
      system: {
        title: 'System controls',
        desc: 'Sleep, dark mode, Bluetooth, system info and a live monitor.',
      },
      web: {
        title: 'Web & browser',
        desc: 'Search the web or jump to an open tab or bookmark.',
      },
      calc: {
        title: 'Instant answers',
        desc: 'Math, base conversion, translation and dates as you type.',
      },
    },
    demos: {
      apps: 'Open apps',
      files: 'Find files',
      cmd: 'Run commands',
      translate: 'Translate',
      quickAsk: 'Quick answers',
      calendar: 'Calendar',
      monitor: 'System monitor',
      system: 'Mac specs',
    },
    placeholder: 'Search or ask anything…',
    demosTitle: 'See it in action',
  },
  forms: {
    badge: 'Looks',
    title: 'Shows up the way you like it',
    subtitle: 'Pick where the voice capsule appears and how the chat opens. Everything stays out of the way until you call it.',
    tabs: {
      capsule: 'Voice capsule',
      chat: 'Chat & launcher',
    },
    capsule: {
      bottom: {
        name: 'Bottom capsule',
        desc: 'A small pill at the bottom of the screen. Light and quiet on any display.',
      },
      orb: {
        name: 'Orb capsule',
        desc: 'A glowing orb that moves with your voice; buttons appear on hover.',
      },
      corner: {
        name: 'Corner card',
        desc: 'Like Siri, under the menu bar on the left or right, with the live transcript.',
      },
      notch: {
        name: 'Notch island',
        desc: 'Grows out of the MacBook notch so your eyes stay at the top of the screen.',
      },
    },
    chat: {
      launcher: {
        name: 'Full launcher',
        desc: 'Centered like Spotlight, or wherever you last dragged it.',
      },
      compact: {
        name: 'Search bar',
        desc: 'Just one slim bar until you start typing.',
      },
      quick: {
        name: 'Quick answer',
        desc: 'Get an answer right inside the launcher, no new window.',
      },
      workspace: {
        name: 'Workspace',
        desc: 'History, chat and a side panel for the browser and previews.',
      },
    },
    sample: {
      search: 'Search or ask anything…',
    },
  },
  voice: {
    badge: 'Voice Input',
    title: 'Talk at the speed of thought, in any app',
    subtitle: 'Hold the key, speak naturally, let go. Clean, punctuated text lands at your cursor in browsers, editors, terminals and chat apps alike. Roughly four times faster than typing.',
    points: [
      {
        title: 'Works everywhere you type',
        desc: 'No plugins or integrations. If an app has a text field, Typeflux can write into it.',
      },
      {
        title: 'Rewrite by voice',
        desc: 'Select text and say “make it shorter” or “translate to English”. The result replaces your selection.',
      },
      {
        title: 'Personas for every context',
        desc: 'Different tone and vocabulary for work email, notes or chat, plus a second shortcut with its own persona.',
      },
      {
        title: 'Local or cloud engines',
        desc: 'Run SenseVoice, Whisper or Qwen3-ASR offline, or use real-time cloud recognition in more than 60 languages.',
      },
    ],
    stats: [
      {
        value: '~200',
        label: 'words per minute',
      },
      {
        value: '60+',
        label: 'languages',
      },
      {
        value: '100%',
        label: 'offline capable',
      },
    ],
    demo: {
      app: 'Mail',
      draft: 'Hi team, quick update: the beta ships Friday, and feedback is due by Wednesday.',
      status: 'Listening…',
      persona: 'Persona: Work email',
    },
  },
  capture: {
    badge: 'Screenshots',
    title: 'Screenshots, long screenshots and screen recordings',
    subtitle: 'Frame a region, the whole screen, or a page that scrolls on and on. Record the screen with sound and camera, export MP4 or GIF, then mark it up and share.',
    modes: {
      region: {
        name: 'Region',
        desc: 'Drag to frame exactly what you need, with a magnifier for pixel-perfect edges.',
      },
      fullScreen: {
        name: 'Full screen',
        desc: 'Capture the whole display in one press.',
      },
      scrolling: {
        name: 'Long screenshot',
        desc: 'Scrolls the page for you and stitches it into one tall image.',
      },
      recording: {
        name: 'Screen recording',
        desc: 'System audio, microphone and a camera bubble, with pause and trim.',
      },
      gif: {
        name: 'GIF',
        desc: 'Turn a short recording into a GIF that plays anywhere.',
      },
    },
    toolsTitle: 'Then, in the editor',
    tools: [
      'Arrows, shapes & callouts',
      'Numbered steps',
      'Mosaic & blur',
      'Spot & hide phone numbers',
      'Pretty backgrounds',
      'Pin to screen',
      'Copy text (OCR)',
      'Translate',
      'Ask AI about it',
    ],
  },
  clipboard: {
    badge: 'Clipboard',
    title: 'Everything you copied, as far back as you want',
    subtitle: 'Press ⇧⌘V and your clipboard history slides up as cards: text, links, code and images, searchable and ready to paste.',
    points: [
      {
        title: 'Keep it for a day or forever',
        desc: 'Choose how long history lasts. Pinned items and snippets never expire.',
      },
      {
        title: 'Find it in a second',
        desc: 'Search everything, filter by app, or press ⌘1–9 to paste.',
      },
      {
        title: 'Snippets',
        desc: 'Save text you reuse, like addresses or replies, and paste it anywhere.',
      },
    ],
    retentionTitle: 'Keep history for',
    retention: ['1 day', '1 week', '1 month', '1 year', 'Forever'],
    cards: {
      text: {
        kind: 'Text',
        time: 'Pinned',
        body: 'Shipping address: 88 Market Street, Suite 1203, San Francisco',
      },
      link: {
        kind: 'Link',
        time: '2 min ago',
        body: 'typeflux.app/releases',
      },
      code: {
        kind: 'Code',
        time: '5 min ago',
        body: 'git commit -m "Reposition the homepage"',
      },
      image: {
        kind: 'Image',
        time: '12 min ago',
        body: '1920 × 1080 · 842 KB',
      },
      note: {
        kind: 'Text',
        time: 'Yesterday',
        body: 'Design review moved to Thursday 3 PM',
      },
    },
    search: 'Search clipboard',
  },
  ring: {
    badge: 'Ring',
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
  more: {
    title: 'And dozens of small things you will use every day',
    subtitle: 'Each one is a keyword away in the launcher.',
    items: {
      translate: {
        name: 'Translation',
        desc: 'Several engines side by side, for selections or screen regions.',
      },
      wordBook: {
        name: 'Word book',
        desc: 'Save words you look up and review them later.',
      },
      calendar: {
        name: 'Calendar',
        desc: 'Months, holidays, lunar dates and your events.',
      },
      monitor: {
        name: 'System monitor',
        desc: 'CPU, memory, disk, network and processes.',
      },
      terminal: {
        name: 'Terminal',
        desc: 'One-off commands in a small floating terminal.',
      },
      notebook: {
        name: 'Notebook',
        desc: 'Markdown notes from chats, AI results and screenshots.',
      },
      emoji: {
        name: 'Emoji',
        desc: 'Search and paste emoji by name.',
      },
      tabs: {
        name: 'Tabs & bookmarks',
        desc: 'Safari, Chrome, Arc, Edge and Dia.',
      },
    },
  },
  custom: {
    badge: 'Make it yours',
    title: 'Missing a feature? Build it in a minute.',
    subtitle: 'Typeflux is a platform, not a fixed list of tools. Ask the agent to build a tool for you, write your own workflows, or plug in skills and MCP servers.',
    items: {
      aiBuild: {
        title: 'Let AI build it',
        desc: 'Describe a tool in chat. The agent writes it, tests it and adds it to your launcher.',
      },
      workflows: {
        title: 'Workflows in any language',
        desc: 'Python, Node, Shell and more: one folder, one manifest, one keyword.',
      },
      gallery: {
        title: '18 ready-made workflows',
        desc: 'Timestamps, JSON, QR codes, UUIDs, currency, cron and more.',
      },
      alfred: {
        title: 'Bring Alfred workflows',
        desc: 'Import the workflows you already rely on.',
      },
      aiCommands: {
        title: 'Your own AI commands',
        desc: 'Turn a prompt into a keyword, like rw to polish or sum to summarize.',
      },
      hotkeys: {
        title: 'Hotkeys for anything',
        desc: 'Bind any keyword to a global shortcut that runs it directly.',
      },
      skills: {
        title: 'Agent skills',
        desc: 'Install skills from GitHub to teach the agent new jobs.',
      },
      mcp: {
        title: 'MCP servers',
        desc: 'Connect the agent to your own tools and data.',
      },
    },
    demo: {
      user: 'Build me a tool: type ts and a Unix timestamp to see the local date.',
      steps: ['Wrote workflow “ts” in Python', 'Tested with 1760000000', 'Ready to save'],
      result: 'ts 1760000000 → 2025-10-09 08:53:20 UTC',
      save: 'Save to launcher',
    },
  },
  scenarios: {
    title: 'One app, from morning to night',
    subtitle: 'A few ways people combine it all.',
    tabs: {
      developer: {
        name: 'Developers',
        steps: [
          'Type > git status in the launcher, without opening a terminal.',
          'Ask the agent to read a log file and explain the failing test.',
          'Dictate a commit message or code review comment straight into the editor.',
          'Take a long screenshot of the bug and paste it into the issue.',
        ],
      },
      writer: {
        name: 'Writers & marketers',
        steps: [
          'Let the agent research a topic in the browser and save notes.',
          'Find last quarter’s report by a phrase inside it.',
          'Speak a first draft at full speed, then say “tighten this”.',
          'Pull earlier snippets back from the clipboard shelf.',
        ],
      },
      student: {
        name: 'Students & researchers',
        steps: [
          'Ask the agent to compare three papers and outline the differences.',
          'Copy text out of a slide or scanned PDF with screen OCR.',
          'Record a short screen demo as a GIF for your group.',
          'Save new vocabulary to the word book while you read.',
        ],
      },
      global: {
        name: 'Cross-language work',
        steps: [
          'Select a message and type fy to read it in your language.',
          'Reply by voice and let a translation persona write it in theirs.',
          'Translate any region of the screen, from images to subtitles.',
          'Ask the agent to draft a reply in the other person’s language.',
        ],
      },
    },
  },
  privacy: {
    title: 'Powerful, and still yours',
    subtitle: 'You choose where every request goes and how much the agent may do on its own.',
    items: [
      {
        title: 'Runs on your Mac',
        desc: 'Local speech models work offline; your voice never has to leave the device.',
      },
      {
        title: 'Bring your own models',
        desc: 'Use OpenAI-compatible, Anthropic, Responses or Ollama endpoints with your own keys.',
      },
      {
        title: 'Private conversations',
        desc: 'Keep an agent conversation and its history only on this Mac.',
      },
      {
        title: 'You set the limits',
        desc: 'By default the agent asks before changing files or running commands, scoped to folders you grant.',
      },
      {
        title: 'No data retention',
        desc: 'We do not collect, store or analyze your voice or text.',
      },
      {
        title: 'Open source',
        desc: 'Every line is public under AGPL-3.0, so anyone can audit it.',
      },
    ],
  },
  ios: {
    badge: 'Coming soon',
    title: 'Typeflux for iPhone is on the way',
    desc: 'Pick up your conversations on iPhone, dictate by voice, and use Typeflux Cloud or your own models. We are preparing the release now.',
  },
  closing: {
    title: 'Get it done with one keystroke',
    subtitle: 'Free and open source under AGPL-3.0. Download it, press ⌘Space and ask for something.',
    download: 'Download Typeflux Free',
    github: 'Star on GitHub',
  },
  ui: {
    launcher: {
      hints: ['↑ Recent', '⌘↩ Ask AI', '⌘K Context'],
      appsGroup: 'Applications',
      filesGroup: 'Files',
      aiGroup: 'AI',
      askAi: 'Ask AI',
      open: 'Open',
    },
    apps: {
      items: ['Mail', 'Notes', 'Calendar', 'Music', 'Photos', 'Terminal', 'Preview'],
    },
    files: {
      query: 'invoice',
      items: [
        ['invoice-2026-09.pdf', '~/Documents/Finance'],
        ['invoice-2026-08.pdf', '~/Downloads'],
        ['expenses-q3.xlsx', '~/Documents/Finance'],
      ],
      contentGroup: 'Matches inside files',
      contentItem: ['meeting-notes.md', '…send the September invoice to finance by Friday…'],
    },
    monitor: {
      chip: 'System monitor',
      placeholder: 'Filter processes: name or PID',
      live: 'Live · every second · Apple M3 Max · 14 cores · 36 GB',
      uptime: 'Battery 99% · Thermal normal',
      cards: {
        cpu: ['CPU', '14 cores · load 3.10'],
        mem: ['Memory', '22.4 GB / 36 GB'],
        disk: ['Disk', 'read 12 MB/s · write 640 KB/s'],
        net: ['Network', '↑ 4.2 KB/s'],
      },
      processes: 'Processes · 612',
      sorts: ['By CPU', 'By memory', 'By disk'],
      cols: ['Name', 'CPU', 'Memory', 'Disk', 'PID'],
      hints: '↑↓ Select · ⇥ Switch metric · ⌘O Own window · esc Back',
    },
    calendar: {
      chip: 'Calendar',
      placeholder: 'Dates, holidays or events: 12-25, next Friday…',
      month: 'October 2026',
      monthSub: 'Q4 2026',
      weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      todayButton: 'Today ⌘T',
      dayTitle: 'October 21',
      dayWeek: 'Wed',
      today: 'Today',
      dayMeta: 'Week 43 · Day 294',
      eventsTitle: 'Events',
      events: [['10:00', 'Product review'], ['15:30', 'Design review']],
      newEvent: 'New event ⌘N',
      legend: ['Day off', 'Make-up workday'],
      marks: [[12, 'Columbus Day'], [31, 'Halloween']],
      holidayPlan: false,
      hints: '←→↑↓ Pick a date · ⌘←→ Month · ⇥ Events · ↩ Open · esc Back',
    },
    system: {
      chip: 'Mac specs',
      placeholder: 'Search specs: IP, serial, resolution, battery…',
      nav: ['Overview', 'Processor', 'Memory', 'Storage', 'Displays', 'Network', 'Battery', 'System'],
      device: 'MacBook Pro (14-inch)',
      deviceSub: 'Apple M3 Max · macOS 26',
      tiles: [
        ['Processor', 'Apple M3 Max', '14-core CPU · 30-core GPU'],
        ['Memory', '36 GB', 'Unified memory'],
        ['Storage', '995 GB', '509 GB available'],
        ['Display', '3024 × 1964', '120 Hz'],
        ['Network', 'Wi-Fi', '192.168.1.20'],
        ['Battery', '99%', 'On battery'],
      ],
      status: 'Read just now',
      hints: '↑↓ Select · ↩ Copy · ⌘1–8 Section',
      copyReport: '⇧⌘C Copy report',
    },
    translate: {
      chip: 'Translate',
      query: 'bonjour',
      detected: 'Detected French',
      target: 'English',
      engine: 'AI · Typeflux Cloud',
      wordBook: 'Word book',
      word: 'bonjour',
      meaning: 'hello',
      phonetics: ['/bɔ̃.ʒuʁ/', 'bon-ZHOOR'],
      defs: [['interj.', 'hello; good morning; good day'], ['n.', 'a greeting; a hello']],
      example: ['Bonjour, comment ça va ?', 'Hello, how are you?'],
      synonymsLabel: 'Similar',
      synonyms: ['salut', 'coucou', 'bonsoir'],
      compare: 'Compare',
      local: 'On-device',
      localTag: 'Stays on this Mac',
      localResult: 'hello',
      hints: '↩ Copy first · ⌘1–9 Copy nth · ⌥↩ Insert · ⇥ Swap languages',
    },
    quickAsk: {
      chip: 'Quick answer',
      query: 'How do I make my MacBook battery last longer?',
      title: 'A few things that help most',
      sections: [
        [
          'Settings',
          [
            'Turn on Low Power Mode when you are away from power.',
            'Lower screen brightness a step or two; the display uses the most energy.',
          ],
        ],
        [
          'Habits',
          [
            'Quit apps you are not using, especially browser tabs with video.',
            'Keep macOS updated for the latest battery fixes.',
          ],
        ],
      ],
      tail: 'Want me to check which apps are using the most energy right now?',
      actions: ['Copy', 'Follow up'],
      actionsRight: ['Open in chat', 'New question'],
    },
    terminal: {
      title: '$ git log --oneline -5',
      running: 'Running',
      shell: 'zsh · login + interactive',
      interrupt: '^C Interrupt',
      stop: 'Stop',
    },
    chat: {
      newChat: 'New chat',
      search: 'Search chats',
      scopes: ['All', 'Cloud', 'This Mac'],
      groups: ['Today', 'Yesterday', 'Earlier'],
      conversations: [
        ['Tidy up Downloads', '20:47'],
        ['Weekly report draft', '15:52'],
        ['Text from a screenshot', '13:15'],
        ['Build a Tetris game', '22:38'],
        ['How to name a puppy', '22:38'],
        ['Set up SSH to a server', '20:41'],
        ['Plan a weekend trip', 'Oct 18'],
        ['Rewrite this headline', 'Oct 18'],
      ],
      composer: 'Ask anything, / for commands',
      user: 'Alex',
      empty: 'What would you like to ask?',
      emptyHint: 'Press ⌘Space anywhere · hold Fn to speak',
    },
    clipboard: {
      forms: ['List', 'Shelf'],
      tabs: ['Clipboard', 'Transcripts', 'Snippets'],
      items: [
        ['Launch checklist', 'Text · 18 words · Notes · 2 min ago'],
        ['https://typeflux.app/releases', 'Link · typeflux.app · Safari · 5 min ago'],
        ['PNG · 1280×720 · 642 KB', 'Preview · 21 min ago'],
        ['Design review moved to Thursday 3 PM', 'Text · 7 words · Mail · 1 hr ago'],
      ],
      count: '500 items',
      actions: [['Quick Look', '⌘Y'], ['Pin', '⌘P'], ['Paste', '↩']],
      shelfHints: '↩ Paste · ⌘↩ Plain text · Space Preview · ⌘P Pin · ⌘1–9 Quick paste',
    },
    capture: {
      size: '640 × 360 pt · 1280 × 720 px',
      sources: ['Region', 'Window', 'Full screen'],
      options: 'Options',
      recover: 'Recover (2)',
      start: 'Start recording',
      recordInfo: '1280 × 720 · MP4 · 30 FPS · countdown 3 s',
      recordHints: '↩ Start · esc Cancel · ⇥ Switch source',
      editorTitle: 'Recording 2026-10-21 10.24.35',
      setCurrent: 'Set to current',
      keep: 'Keep 6.0 s (full)',
      meta: '1280 × 720 · 30 FPS · about 2.4 MB',
      metaSub: 'Video · with sound',
      saveTo: 'Save to Desktop',
      copy: 'Copy',
      saveMp4: 'Save MP4',
      saveGif: 'Save GIF',
      scrolling: 'Auto-scrolling · move the mouse to take over',
      stitched: '3 screens stitched',
      trimStart: 'Start',
      trimEnd: 'End',
    },
    voice: {
      app: 'Notes',
      listening: 'Listening',
      transcript: 'Hello, can you help me?',
      cancel: 'Cancel',
      done: 'Done',
    },
    ring: {
      actionsCount: '6 ACTIONS',
    },
    desktop: {
      menus: ['File', 'Edit', 'View', 'Window', 'Help'],
      clock: 'Wed Oct 21  10:24',
    },
  },
}
