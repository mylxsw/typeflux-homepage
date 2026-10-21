export default {
  hero: {
    eyebrow: '무료 오픈 소스 · macOS 앱',
    title: '키 하나로,\nMac의 일을 끝내세요.',
    subtitle: '제대로 일하는 AI 에이전트, 무엇이든 찾고 실행하는 런처, 그리고 음성 입력, 스크린샷과 화면 녹화, 클립보드 기록까지. 앱 하나가 키 하나로, 지금 작업 중인 바로 그곳에 나타납니다.',
    download: 'Mac용 다운로드',
    source: 'GitHub에서 Star',
    requirement: 'macOS 13+ · Apple 실리콘 및 Intel 지원 · 계정 없이 사용 가능',
    demoLabel: 'Typeflux 데모',
    scenes: {
      agent: {
        label: '묻기',
      },
      launcher: {
        label: '찾기·실행',
      },
      voice: {
        label: '말하기',
        text: '디자인 리뷰를 목요일 오후 3시로 옮기고 팀에 안건을 공유해 주세요.',
      },
      ring: {
        label: '가리키기',
        hint: '원하는 방향으로 움직인 뒤 놓으세요',
      },
    },
  },
  replaces: {
    title: '앱 일곱 개를 하나로',
    items: {
      dictation: '음성 입력',
      launcher: '런처',
      chat: 'AI 채팅',
      capture: '스크린샷',
      recorder: '화면 녹화',
      clipboard: '클립보드 관리',
      translator: '번역기',
    },
  },
  entrances: {
    title: '네 가지 입구, 모두 키 하나로',
    subtitle: '모두 지금 작업 중인 곳에서 열리므로 앱을 바꿀 필요가 없습니다. 모든 단축키는 설정에서 바꿀 수 있습니다.',
    items: {
      agent: {
        name: 'AI 에이전트',
        action: '무엇이든 묻기',
        desc: '대화하고, 검색하고, 웹을 탐색하고, 명령을 실행하고, 파일을 다룹니다.',
      },
      launcher: {
        name: '런처',
        action: '입력해서 찾고 실행',
        desc: '어떤 앱이든, 어떤 파일이든, 어떤 명령이든. AI에게 묻기까지.',
      },
      voice: {
        name: '음성 입력',
        action: '누른 채 말하기',
        desc: '어떤 입력란에든 말로 입력하고, 선택한 글을 말로 고칠 수도 있습니다.',
      },
      ring: {
        name: '링',
        action: '포인터에서 한 번에',
        desc: '자주 쓰는 동작을 마우스 바로 아래 원형 메뉴로.',
      },
    },
    more: '자세히 보기',
  },
  agent: {
    badge: 'AI 에이전트',
    title: '정말로 일을 끝내 주는 AI 에이전트',
    subtitle: '단순한 채팅창이 아닙니다. Typeflux는 대화하고, 웹을 검색하고, 페이지를 열고, 파일을 읽고 쓰고, 명령을 실행하고, 앱을 조작해서 끝까지 해냅니다. 다운로드 폴더 정리, Mac이 느린 이유 찾기, 회의록을 주간 보고서로 바꾸기도 맡겨 보세요.',
    capabilities: {
      chat: {
        title: '대화',
        desc: '긴 대화, 기록, 첨부 파일, 스크린샷, 다이어그램 지원.',
      },
      web: {
        title: '웹 검색',
        desc: '자료를 찾고 출처를 함께 알려 줍니다.',
      },
      browser: {
        title: '내장 브라우저',
        desc: '사이드 패널에서 사이트를 열고, 읽고, 양식을 채웁니다.',
      },
      files: {
        title: '내 파일',
        desc: '허용한 폴더 안에서 읽고 씁니다.',
      },
      commands: {
        title: '명령 실행',
        desc: 'Mac에서 셸 명령과 스크립트를 실행합니다.',
      },
      computer: {
        title: '앱 조작',
        desc: '화면을 보고 클릭하고 입력해 줍니다.',
      },
      code: {
        title: '코드와 프로젝트',
        desc: '코드를 실행하고 프로젝트를 수정하고 결과를 미리 봅니다.',
      },
      images: {
        title: '이미지 생성',
        desc: '선택한 제공자로 이미지를 만듭니다.',
      },
      memory: {
        title: '메모리와 노트',
        desc: '취향을 기억하고 답변을 노트에 저장합니다.',
      },
      skills: {
        title: 'Skills',
        desc: 'GitHub에서 스킬을 설치해 새로운 일을 가르칩니다.',
      },
      mcp: {
        title: 'MCP',
        desc: '외부 도구와 데이터 소스에 연결합니다.',
      },
      models: {
        title: '어떤 모델이든',
        desc: 'Typeflux Cloud 또는 내 OpenAI, Anthropic, Ollama 키.',
      },
    },
    examplesTitle: '이렇게 물어보세요',
    examples: [
      '다운로드 폴더를 파일 종류별로 정리해 줘',
      '내 Mac이 왜 이렇게 뜨겁지?',
      '이 PDF 세 개를 요약해서 노트에 저장해 줘',
      'GitHub 알림을 확인하고 할 일 목록을 만들어 줘',
      '타임스탬프 변환 도구를 만들어 줘',
      '이 사진들을 촬영 날짜로 이름을 바꿔 줘',
    ],
    modesTitle: '얼마나 스스로 할지는 직접 정하세요',
    modes: {
      strict: {
        name: '매번 확인',
        desc: '도구를 쓸 때마다 승인을 기다립니다.',
      },
      standard: {
        name: '표준',
        desc: '읽기는 알아서, 바꾸기 전에는 물어봅니다.',
      },
      auto: {
        name: '완전 자동',
        desc: '믿고 맡기는 긴 작업을 모든 단계 자동으로.',
      },
    },
    demo: {
      user: '다운로드 폴더를 정리해 줘. 종류별로 폴더에 나누고, 한 달 넘은 설치 파일은 지워 줘.',
      steps: [
        {
          label: '~/Downloads의 파일 214개 확인',
          state: 'done',
        },
        {
          label: '이미지, 문서, 압축 파일 폴더 생성',
          state: 'done',
        },
        {
          label: '오래된 설치 파일 12개 삭제 (3.1GB)',
          state: 'approve',
        },
      ],
      approve: '허용',
      answer: '파일 202개를 폴더 5개로 정리했어요. 설치 파일 12개 삭제는 확인을 기다리고 있어요.',
      agentLabel: 'Typeflux Agent',
    },
  },
  launcher: {
    badge: '런처',
    title: '몇 글자만 치면, 무엇이든 찾고 무엇이든 실행',
    subtitle: 'Mac의 모든 앱과 파일, 문서 속 내용, 셸 명령, 그리고 AI를 하나의 입력창에. Spotlight처럼 화면 가운데에, 또는 마지막으로 끌어다 놓은 곳에 열리고, 얇은 검색 막대나 넉넉한 결과 창이 됩니다.',
    capabilities: {
      files: {
        title: '모든 파일',
        desc: 'Mac 전체를 파일 이름으로 즉시 검색. 경로로도 찾습니다.',
      },
      content: {
        title: '문서 속 내용',
        desc: 'PDF, Markdown, 텍스트 안의 단어를 기기에서 검색 (Apple 실리콘).',
      },
      commands: {
        title: '어떤 명령이든',
        desc: '플로팅 터미널, 또는 터미널과 iTerm에서 실행.',
      },
      ask: {
        title: '키 하나로 AI',
        desc: '입력한 내용에서 ⌘↩를 누르면 바로 대화 시작.',
      },
      apps: {
        title: '앱과 창',
        desc: '마우스 없이 앱을 열고, 전환하고, 종료합니다.',
      },
      system: {
        title: '시스템 제어',
        desc: '잠자기, 다크 모드, Bluetooth, 시스템 정보, 실시간 모니터.',
      },
      web: {
        title: '웹과 브라우저',
        desc: '웹을 검색하거나 열린 탭과 북마크로 바로 이동.',
      },
      calc: {
        title: '즉시 결과',
        desc: '계산, 진법 변환, 번역, 날짜가 입력하는 동안 나타납니다.',
      },
    },
    demos: {
      apps: '앱 열기',
      files: '파일 찾기',
      cmd: '명령 실행',
      translate: '번역',
      quickAsk: '빠른 답변',
      calendar: '달력',
      monitor: '시스템 모니터',
      system: '내 Mac 사양',
    },
    placeholder: '검색하거나 무엇이든 물어보세요…',
    demosTitle: '직접 보세요',
  },
  forms: {
    badge: '모양',
    title: '원하는 모습으로 나타납니다',
    subtitle: '음성 캡슐이 나타날 위치와 채팅이 열리는 방식을 고르세요. 부르기 전까지는 방해하지 않습니다.',
    tabs: {
      capsule: '음성 캡슐',
      chat: '채팅과 런처',
    },
    capsule: {
      bottom: {
        name: '하단 캡슐',
        desc: '화면 아래 가운데의 작은 캡슐. 가볍고 조용하며 어떤 디스플레이에도 어울립니다.',
      },
      orb: {
        name: '오브 캡슐',
        desc: '목소리에 맞춰 빛나는 오브. 버튼은 마우스를 올렸을 때만 보입니다.',
      },
      corner: {
        name: '코너 카드',
        desc: 'Siri처럼 메뉴 막대 아래 왼쪽이나 오른쪽 위에 나타나 받아쓰기를 보여 줍니다.',
      },
      notch: {
        name: '노치 아일랜드',
        desc: 'MacBook 노치에서 자라나 시선을 화면 위에 그대로 둘 수 있습니다.',
      },
    },
    chat: {
      launcher: {
        name: '전체 런처',
        desc: 'Spotlight처럼 가운데에, 또는 마지막으로 끌어다 놓은 곳에.',
      },
      compact: {
        name: '검색 막대',
        desc: '입력을 시작하기 전까지는 얇은 막대 하나뿐.',
      },
      quick: {
        name: '빠른 답변',
        desc: '새 창 없이 런처 안에서 바로 답을 보여 줍니다.',
      },
      workspace: {
        name: '작업 공간',
        desc: '기록, 채팅, 브라우저와 미리보기를 위한 사이드 패널.',
      },
    },
    sample: {
      search: '검색하거나 무엇이든 물어보세요…',
    },
  },
  voice: {
    badge: '음성 입력',
    title: '생각하는 속도로, 어떤 앱에서든 입력',
    subtitle: '키를 누른 채 자연스럽게 말하고 떼세요. 문장 부호가 들어간 텍스트가 커서 위치에 입력됩니다. 브라우저, 에디터, 터미널, 메신저 모두 똑같습니다. 타이핑보다 약 네 배 빠릅니다.',
    points: [
      {
        title: '입력할 수 있는 곳이면 어디서나',
        desc: '플러그인이나 연동이 필요 없습니다. 입력란만 있으면 Typeflux가 씁니다.',
      },
      {
        title: '말로 고쳐 쓰기',
        desc: '글을 선택하고 "더 짧게" 또는 "영어로 번역해 줘"라고 말하면 선택 영역이 바뀝니다.',
      },
      {
        title: '상황별 페르소나',
        desc: '업무 메일, 메모, 채팅마다 다른 어조와 어휘. 두 번째 단축키에 별도 페르소나도 지정할 수 있습니다.',
      },
      {
        title: '로컬 또는 클라우드 엔진',
        desc: 'SenseVoice, Whisper, Qwen3-ASR을 오프라인으로 실행하거나, 60개 이상 언어를 지원하는 클라우드 실시간 인식을 사용하세요.',
      },
    ],
    stats: [
      {
        value: '~200',
        label: '단어 / 분',
      },
      {
        value: '60+',
        label: '개 언어',
      },
      {
        value: '100%',
        label: '오프라인 지원',
      },
    ],
    demo: {
      app: '메일',
      draft: '팀 여러분, 베타는 금요일에 출시됩니다. 피드백은 수요일까지 부탁드립니다.',
      status: '듣고 있습니다…',
      persona: '페르소나: 업무 메일',
    },
  },
  capture: {
    badge: '스크린샷',
    title: '스크린샷, 긴 스크린샷, 화면 녹화까지',
    subtitle: '영역을 고르거나, 화면 전체를, 혹은 끝없이 이어지는 페이지를 한 장으로. 시스템 소리와 카메라를 넣어 화면을 녹화하고, MP4나 GIF로 내보낸 뒤 표시하고 공유하세요.',
    modes: {
      region: {
        name: '영역',
        desc: '필요한 부분만 끌어서 선택. 돋보기로 픽셀 단위까지 맞춥니다.',
      },
      fullScreen: {
        name: '전체 화면',
        desc: '키 하나로 화면 전체를 캡처.',
      },
      scrolling: {
        name: '긴 스크린샷',
        desc: '페이지를 자동으로 스크롤해 한 장의 긴 이미지로 이어 붙입니다.',
      },
      recording: {
        name: '화면 녹화',
        desc: '시스템 오디오, 마이크, 카메라 화면 포함. 일시 정지와 다듬기도.',
      },
      gif: {
        name: 'GIF',
        desc: '짧은 녹화를 어디서나 재생되는 GIF로.',
      },
    },
    toolsTitle: '캡처한 다음 편집기에서',
    tools: ['화살표·도형·말풍선', '번호 단계', '모자이크', '전화번호 찾아 가리기', '보기 좋은 배경', '화면에 고정', '텍스트 복사 (OCR)', '번역', 'AI에게 묻기'],
  },
  clipboard: {
    badge: '클립보드',
    title: '복사한 모든 것을, 원하는 만큼 오래',
    subtitle: '⇧⌘V를 누르면 클립보드 기록이 카드로 아래에서 올라옵니다. 텍스트, 링크, 코드, 이미지를 검색하고 바로 붙여 넣으세요.',
    points: [
      {
        title: '하루만, 또는 영원히',
        desc: '기록 보관 기간을 직접 정하세요. 고정한 항목과 스니펫은 만료되지 않습니다.',
      },
      {
        title: '1초 만에 찾기',
        desc: '전체 검색, 앱별 필터, ⌘1–9로 바로 붙여 넣기.',
      },
      {
        title: '스니펫',
        desc: '주소나 자주 쓰는 답장을 저장해 어디서나 붙여 넣으세요.',
      },
    ],
    retentionTitle: '기록 보관',
    retention: ['1일', '1주', '1개월', '1년', '영구'],
    cards: {
      text: {
        kind: '텍스트',
        time: '고정됨',
        body: '배송지: 서울시 강남구 테헤란로 88, 1203호',
      },
      link: {
        kind: '링크',
        time: '2분 전',
        body: 'typeflux.app/releases',
      },
      code: {
        kind: '코드',
        time: '5분 전',
        body: 'git commit -m "Reposition the homepage"',
      },
      image: {
        kind: '이미지',
        time: '12분 전',
        body: '1920 × 1080 · 842 KB',
      },
      note: {
        kind: '텍스트',
        time: '어제',
        body: '디자인 리뷰는 목요일 오후 3시로 변경',
      },
    },
    search: '클립보드 검색',
  },
  ring: {
    badge: '링',
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
  more: {
    title: '매일 쓰게 될 작은 기능도 가득',
    subtitle: '모두 런처에서 키워드 하나면 열립니다.',
    items: {
      translate: {
        name: '번역',
        desc: '여러 번역 엔진을 나란히 비교. 선택한 글도, 화면 일부도.',
      },
      wordBook: {
        name: '단어장',
        desc: '찾아본 단어를 저장하고 나중에 복습.',
      },
      calendar: {
        name: '달력',
        desc: '월 보기, 공휴일, 음력, 내 일정.',
      },
      monitor: {
        name: '시스템 모니터',
        desc: 'CPU, 메모리, 디스크, 네트워크, 프로세스.',
      },
      terminal: {
        name: '터미널',
        desc: '작은 플로팅 터미널에서 명령을 한 번 실행.',
      },
      notebook: {
        name: '노트',
        desc: '대화, AI 결과, 화면 텍스트를 Markdown 노트로.',
      },
      emoji: {
        name: '이모지',
        desc: '이름으로 이모지를 찾아 붙여 넣기.',
      },
      tabs: {
        name: '탭과 북마크',
        desc: 'Safari, Chrome, Arc, Edge, Dia 지원.',
      },
    },
  },
  custom: {
    badge: '나만의 설정',
    title: '필요한 기능이 없다면? 1분이면 만듭니다.',
    subtitle: 'Typeflux는 정해진 기능 목록이 아니라 플랫폼입니다. 에이전트에게 도구를 만들게 하거나, 워크플로를 직접 쓰거나, Skills와 MCP 서버를 연결하세요.',
    items: {
      aiBuild: {
        title: 'AI가 만들어 줍니다',
        desc: '원하는 도구를 채팅으로 설명하면, 에이전트가 작성하고 테스트해 런처에 추가합니다.',
      },
      workflows: {
        title: '어떤 언어로든 워크플로',
        desc: 'Python, Node, Shell 등. 폴더 하나, 매니페스트 하나, 키워드 하나.',
      },
      gallery: {
        title: '바로 쓰는 워크플로 18개',
        desc: '타임스탬프, JSON, QR 코드, UUID, 환율, cron 등.',
      },
      alfred: {
        title: 'Alfred 워크플로 가져오기',
        desc: '이미 쓰던 워크플로를 그대로 가져올 수 있습니다.',
      },
      aiCommands: {
        title: '나만의 AI 명령',
        desc: '프롬프트를 키워드로. rw로 다듬기, sum으로 요약하기처럼.',
      },
      hotkeys: {
        title: '무엇이든 단축키로',
        desc: '원하는 키워드를 전역 단축키에 연결해 바로 실행.',
      },
      skills: {
        title: '에이전트 스킬',
        desc: 'GitHub에서 Skills를 설치해 에이전트에게 새 일을 가르치세요.',
      },
      mcp: {
        title: 'MCP 서버',
        desc: '에이전트를 내 도구와 데이터에 연결합니다.',
      },
    },
    demo: {
      user: '도구를 만들어 줘: ts와 Unix 타임스탬프를 입력하면 날짜를 보여 줘.',
      steps: ['Python으로 워크플로 "ts" 작성', '1760000000으로 테스트 완료', '저장할 준비 완료'],
      result: 'ts 1760000000 → 2025-10-09 17:53:20 (한국 시간)',
      save: '런처에 저장',
    },
  },
  scenarios: {
    title: '아침부터 밤까지, 앱 하나로',
    subtitle: '이렇게 활용할 수 있어요.',
    tabs: {
      developer: {
        name: '개발자',
        steps: [
          '런처에서 > git status. 터미널을 열 필요가 없습니다.',
          '에이전트에게 로그 파일을 읽고 테스트 실패 원인을 설명하게 하기.',
          '커밋 메시지나 코드 리뷰 의견을 에디터에 바로 말로 입력.',
          '오류 페이지 전체를 긴 스크린샷으로 찍어 이슈에 붙이기.',
        ],
      },
      writer: {
        name: '작가·마케터',
        steps: [
          '에이전트가 브라우저에서 자료를 찾고 요점을 노트에 저장.',
          '안에 적힌 한 문장으로 지난 분기 보고서 찾기.',
          '초안을 빠르게 구술하고 "더 간결하게" 한마디.',
          '예전에 복사한 조각을 클립보드 카드에서 다시 꺼내기.',
        ],
      },
      student: {
        name: '학생·연구자',
        steps: [
          '에이전트에게 논문 세 편을 비교해 차이를 정리하게 하기.',
          '슬라이드나 스캔 PDF에서 화면 OCR로 텍스트 복사.',
          '화면 조작을 녹화해 GIF로 팀에 공유.',
          '읽으면서 새 단어를 단어장에 저장.',
        ],
      },
      global: {
        name: '다국어 업무',
        steps: [
          '메시지를 선택하고 fy를 입력해 모국어로 읽기.',
          '말로 답하고 번역 페르소나가 상대 언어로 쓰게 하기.',
          '이미지, 영상 자막 등 화면 어디든 번역.',
          '에이전트에게 상대 언어로 답장 초안을 쓰게 하기.',
        ],
      },
    },
  },
  privacy: {
    title: '강력하지만, 주도권은 여전히 당신에게',
    subtitle: '요청이 어디로 갈지, 에이전트가 스스로 얼마나 할지 직접 정합니다.',
    items: [
      {
        title: 'Mac 안에서 실행',
        desc: '로컬 음성 모델은 오프라인으로 동작해 목소리가 기기 밖으로 나가지 않아도 됩니다.',
      },
      {
        title: '내 모델 사용',
        desc: 'OpenAI 호환, Anthropic, Responses, Ollama 엔드포인트를 내 키로 사용합니다.',
      },
      {
        title: '비공개 대화',
        desc: '에이전트 대화와 기록을 이 Mac에만 보관할 수 있습니다.',
      },
      {
        title: '범위는 내가 정한다',
        desc: '기본 설정에서는 파일을 바꾸거나 명령을 실행하기 전에 묻고, 허용한 폴더로 범위를 제한합니다.',
      },
      {
        title: '데이터 미보관',
        desc: '음성이나 텍스트를 수집, 저장, 분석하지 않습니다.',
      },
      {
        title: '오픈 소스',
        desc: '모든 코드가 AGPL-3.0으로 공개되어 누구나 검토할 수 있습니다.',
      },
    ],
  },
  ios: {
    badge: '출시 예정',
    title: 'iPhone용 Typeflux를 준비하고 있습니다',
    desc: 'iPhone에서 대화를 이어 가고, 음성으로 입력하고, Typeflux Cloud나 내 모델을 사용하세요. 지금 출시를 준비하고 있습니다.',
  },
  closing: {
    title: '키 하나로 일을 끝내세요',
    subtitle: 'AGPL-3.0 오픈 소스이며 무료입니다. 다운로드하고 ⌘Space를 눌러 무언가를 부탁해 보세요.',
    download: 'Typeflux 무료 다운로드',
    github: 'GitHub에서 Star',
  },
  ui: {
    launcher: {
      hints: ['↑ 최근 입력', '⌘↩ AI에게 묻기', '⌘K 컨텍스트'],
      appsGroup: '응용 프로그램',
      filesGroup: '파일',
      aiGroup: 'AI',
      askAi: 'AI에게 묻기',
      open: '열기',
    },
    apps: {
      items: ['메일', '메모', '캘린더', '음악', '사진', '터미널', '미리보기'],
    },
    files: {
      query: 'invoice',
      items: [['invoice-2026-09.pdf', '~/문서/재무'], ['invoice-2026-08.pdf', '~/다운로드'], ['3분기-경비.xlsx', '~/문서/재무']],
      contentGroup: '파일 내용',
      contentItem: ['회의록.md', '…금요일까지 9월 청구서를 재무팀에…'],
    },
    monitor: {
      chip: '시스템 모니터',
      placeholder: '프로세스 필터: 이름 또는 PID',
      live: '실시간 · 1초마다 · Apple M3 Max · 14코어 · 36 GB',
      uptime: '배터리 99% · 발열 정상',
      cards: {
        cpu: ['CPU', '14코어 · 부하 3.10'],
        mem: ['메모리', '22.4 GB / 36 GB'],
        disk: ['디스크', '읽기 12MB/s · 쓰기 640K/s'],
        net: ['네트워크', '↑ 4.2 KB/s'],
      },
      processes: '프로세스 612개',
      sorts: ['CPU순', '메모리순', '디스크순'],
      cols: ['이름', 'CPU', '메모리', '디스크', 'PID'],
      hints: '↑↓ 선택 · ⇥ 지표 전환 · ⌘O 별도 창 · esc 뒤로',
    },
    calendar: {
      chip: '달력',
      placeholder: '날짜, 공휴일, 일정: 12-25, 다음 주 금요일…',
      month: '2026년 10월',
      monthSub: '2026년 4분기',
      weekdays: ['일', '월', '화', '수', '목', '금', '토'],
      todayButton: '오늘 ⌘T',
      dayTitle: '10월 21일',
      dayWeek: '수',
      today: '오늘',
      dayMeta: '43주차 · 294일째',
      eventsTitle: '일정',
      events: [['10:00', '제품 리뷰'], ['15:30', '디자인 리뷰']],
      newEvent: '캘린더에서 새로 만들기 ⌘N',
      legend: ['휴일', '대체 근무'],
      marks: [[3, '개천절'], [9, '한글날']],
      holidayPlan: false,
      hints: '←→↑↓ 날짜 선택 · ⌘←→ 월 전환 · ⇥ 일정 · ↩ 열기 · esc 뒤로',
    },
    system: {
      chip: '내 Mac 사양',
      placeholder: '사양 검색: IP, 일련번호, 해상도, 배터리…',
      nav: ['개요', '프로세서', '메모리', '저장 공간', '디스플레이', '네트워크', '배터리', '시스템'],
      device: 'MacBook Pro (14형)',
      deviceSub: 'Apple M3 Max · macOS 26',
      tiles: [
        ['프로세서', 'Apple M3 Max', '14코어 CPU · 30코어 GPU'],
        ['메모리', '36 GB', '통합 메모리'],
        ['저장 공간', '995 GB', '509 GB 사용 가능'],
        ['디스플레이', '3024 × 1964', '120 Hz'],
        ['네트워크', 'Wi-Fi', '192.168.1.20'],
        ['배터리', '99%', '배터리 사용 중'],
      ],
      status: '읽음 · 방금',
      hints: '↑↓ 선택 · ↩ 복사 · ⌘1–8 섹션',
      copyReport: '⇧⌘C 보고서 복사',
    },
    translate: {
      chip: '번역',
      query: 'hello',
      detected: '영어 감지됨',
      target: '한국어',
      engine: 'AI · Typeflux Cloud',
      wordBook: '단어장',
      word: 'hello',
      meaning: '안녕하세요',
      phonetics: ['UK /həˈləʊ/', 'US /həˈloʊ/'],
      defs: [['interj.', '안녕하세요; 여보세요 (전화하거나 주의를 끌 때)'], ['n.', '인사; "안녕하세요"라는 말']],
      example: ['She smiled and said hello to me.', '그녀는 웃으며 내게 "안녕"이라고 말했다.'],
      synonymsLabel: '유의어',
      synonyms: ['hi', 'hey', 'greetings'],
      compare: '비교',
      local: '기기 내 번역',
      localTag: 'Mac 밖으로 나가지 않음',
      localResult: '안녕하세요',
      hints: '↩ 첫 항목 복사 · ⌘1–9 n번째 복사 · ⌥↩ 삽입 · ⇥ 언어 바꾸기',
    },
    quickAsk: {
      chip: '빠른 답변',
      query: 'MacBook 배터리를 오래 쓰려면?',
      title: '효과가 큰 방법',
      sections: [
        ['설정', ['전원에서 멀어질 때는 저전력 모드를 켜세요.', '화면 밝기를 한두 단계 낮추세요. 디스플레이가 전력을 가장 많이 씁니다.']],
        ['습관', ['쓰지 않는 앱, 특히 동영상이 재생 중인 탭은 닫으세요.', 'macOS를 최신으로 유지해 배터리 관련 수정을 받으세요.']],
      ],
      tail: '지금 어떤 앱이 전력을 가장 많이 쓰는지 확인해 볼까요?',
      actions: ['복사', '이어서 묻기'],
      actionsRight: ['채팅에서 열기', '새 질문'],
    },
    terminal: {
      title: '$ git log --oneline -5',
      running: '실행 중',
      shell: 'zsh · 로그인 + 대화형',
      interrupt: '^C 중단',
      stop: '중지',
    },
    chat: {
      newChat: '새 채팅',
      search: '채팅 검색',
      scopes: ['전체', '클라우드', '이 Mac'],
      groups: ['오늘', '어제', '이전'],
      conversations: [
        ['다운로드 폴더 정리', '20:47'],
        ['주간 보고서 초안', '15:52'],
        ['스크린샷 속 텍스트', '13:15'],
        ['테트리스 만들어 줘', '22:38'],
        ['강아지 이름 짓기', '22:38'],
        ['SSH로 서버 접속 설정', '20:41'],
        ['주말 여행 계획', '10월 18일'],
        ['제목 다시 쓰기', '10월 18일'],
      ],
      composer: '질문을 입력하거나 / 로 명령',
      user: 'Alex',
      empty: '무엇이 궁금하세요?',
      emptyHint: '어디서나 ⌘Space로 호출 · Fn을 누른 채 음성 입력',
    },
    clipboard: {
      forms: ['목록', '카드'],
      tabs: ['클립보드', '받아쓰기', '스니펫'],
      items: [
        ['출시 전 체크리스트', '텍스트 · 18자 · 메모 · 2분 전'],
        ['https://typeflux.app/releases', '링크 · typeflux.app · Safari · 5분 전'],
        ['PNG · 1280×720 · 642 KB', '미리보기 · 21분 전'],
        ['디자인 리뷰는 목요일 오후 3시로 변경', '텍스트 · 20자 · 메일 · 1시간 전'],
      ],
      count: '500개',
      actions: [['훑어보기', '⌘Y'], ['고정', '⌘P'], ['붙여넣기', '↩']],
      shelfHints: '↩ 붙여넣기 · ⌘↩ 일반 텍스트 · Space 미리보기 · ⌘P 고정 · ⌘1–9 빠른 붙여넣기',
    },
    capture: {
      size: '640 × 360 pt · 1280 × 720 px',
      sources: ['영역', '윈도우', '전체 화면'],
      options: '옵션',
      recover: '녹화 복구 (2)',
      start: '녹화 시작',
      recordInfo: '1280 × 720 · MP4 · 30 FPS · 카운트다운 3초',
      recordHints: '↩ 시작 · esc 취소 · ⇥ 소스 전환',
      editorTitle: '화면 녹화 2026-10-21 10.24.35',
      setCurrent: '현재 위치로',
      keep: '6.0초 유지 (전체)',
      meta: '1280 × 720 · 30 FPS · 약 2.4 MB',
      metaSub: '비디오 · 소리 포함',
      saveTo: '데스크탑에 저장',
      copy: '복사',
      saveMp4: 'MP4 저장',
      saveGif: 'GIF 저장',
      scrolling: '자동 스크롤 중 · 마우스를 움직이면 직접 조작',
      stitched: '화면 3개를 이어 붙임',
      trimStart: '시작점',
      trimEnd: '끝점',
    },
    voice: {
      app: '메모',
      listening: '듣는 중',
      transcript: '회의를 목요일 오후로 옮겨 줘',
      cancel: '취소',
      done: '완료',
    },
    ring: {
      actionsCount: '6개 동작',
    },
    desktop: {
      menus: ['파일', '편집', '보기', '윈도우', '도움말'],
      clock: '10월 21일 (수) 오전 10:24',
    },
  },
}
