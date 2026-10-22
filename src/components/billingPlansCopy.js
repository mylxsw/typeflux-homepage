// Plan estimator and FAQ copy for /billing/plans, covering every locale.
const copy = {
  en: {
    estimator: {
      eyebrow: 'Find your plan in 30 seconds',
      title: 'How much do you talk each day?',
      lead: 'Drag the slider and we estimate your monthly credits with the real billing rules.',
      minutesLabel: 'Daily dictation',
      minutes: '{value} min',
      hours: '{value} h',
      aiLabel: 'AI rewrite & Chat',
      ai: {
        none: 'Rarely',
        some: 'Sometimes',
        heavy: 'Often',
      },
      need: 'Estimated {credits} credits / month',
      fit: 'Uses about {used}% of its credits, leaving {left}% headroom for busy months.',
      fitUnlimited: 'Unlimited credits — no need to watch your usage.',
      over: 'About {credits} credits a month beyond {plan}. Pair it with an add-on pack.',
      overTitle: '{plan} + add-on',
      choose: 'Choose {plan}',
      note: 'Estimate assumes 1 credit per second of cloud audio; AI usage varies by model.',
    },
    faq: {
      title: 'Questions?',
      items: [
        {
          q: 'Can I keep using Typeflux for free?',
          a: 'Yes. Typeflux is open source and local models are free forever. The free plan also includes monthly credits for cloud AI processing.',
        },
        {
          q: 'What happens when I run out of credits?',
          a: 'You are never charged extra. Add-on credits are used automatically if you have any; otherwise switch to local models, buy an add-on pack, or upgrade.',
        },
        {
          q: 'Do monthly credits roll over?',
          a: 'No. Monthly credits reset each billing period. Add-on credits are the way to keep a reserve.',
        },
        {
          q: 'How do I cancel?',
          a: 'Manage your subscription from Typeflux. After canceling you keep your plan until the current period ends.',
        },
      ],
    },
  },
  'zh-CN': {
    estimator: {
      eyebrow: '30 秒找到合适的套餐',
      title: '你每天会说多少话？',
      lead: '拖动滑块，我们按真实计费规则帮你估算每月积分。',
      minutesLabel: '每天语音输入时长',
      minutes: '{value} 分钟',
      hours: '{value} 小时',
      aiLabel: 'AI 改写 / 对话 使用频率',
      ai: {
        none: '几乎不用',
        some: '偶尔',
        heavy: '经常',
      },
      need: '预计每月消耗 {credits} 积分',
      fit: '用量约为额度的 {used}%，还有 {left}% 余量应对忙碌月份。',
      fitUnlimited: '积分不限量，无需关心用量。',
      over: '每月超出{plan}约 {credits} 积分，建议搭配加购额度包。',
      overTitle: '{plan} + 加购',
      choose: '选择{plan}',
      note: '按云端音频每秒 1 积分估算；AI 用量因模型而异。',
    },
    faq: {
      title: '还有疑问？',
      items: [
        {
          q: '不付费可以一直用吗？',
          a: '可以。Typeflux 是开源软件，本地模型永久免费；免费版每月还附赠积分，用于云端 AI 处理。',
        },
        {
          q: '积分用完了会怎样？',
          a: '不会额外扣费。有加购额度时会自动使用；否则可以切换到本地模型，或购买加购额度、升级套餐。',
        },
        {
          q: '月度积分会累积到下个月吗？',
          a: '不会。月度积分每个计费周期重置；想长期储备额度，可以购买加购额度。',
        },
        {
          q: '如何取消订阅？',
          a: '在 Typeflux 中管理订阅即可取消，取消后当前计费周期结束前仍可正常使用。',
        },
      ],
    },
  },
  'zh-TW': {
    estimator: {
      eyebrow: '30 秒找到合適的方案',
      title: '你每天會說多少話？',
      lead: '拖動滑桿，我們依實際計費規則幫你估算每月點數。',
      minutesLabel: '每天語音輸入時長',
      minutes: '{value} 分鐘',
      hours: '{value} 小時',
      aiLabel: 'AI 改寫 / 對話 使用頻率',
      ai: {
        none: '幾乎不用',
        some: '偶爾',
        heavy: '經常',
      },
      need: '預計每月消耗 {credits} 點數',
      fit: '用量約為額度的 {used}%，還有 {left}% 餘裕應付忙碌月份。',
      fitUnlimited: '點數不限量，無需在意用量。',
      over: '每月超出{plan}約 {credits} 點數，建議搭配加購點數包。',
      overTitle: '{plan} + 加購',
      choose: '選擇{plan}',
      note: '依雲端音訊每秒 1 點數估算；AI 用量因模型而異。',
    },
    faq: {
      title: '還有疑問？',
      items: [
        {
          q: '不付費可以一直使用嗎？',
          a: '可以。Typeflux 是開源軟體，本機模型永久免費；免費版每月還附贈點數，用於雲端 AI 處理。',
        },
        {
          q: '點數用完了會怎樣？',
          a: '不會額外收費。有加購點數時會自動使用；否則可以切換到本機模型，或購買加購點數、升級方案。',
        },
        {
          q: '每月點數會累積到下個月嗎？',
          a: '不會。每月點數每個計費週期重置；想長期儲備，可以購買加購點數。',
        },
        {
          q: '如何取消訂閱？',
          a: '在 Typeflux 中管理訂閱即可取消，取消後在當前計費週期結束前仍可正常使用。',
        },
      ],
    },
  },
  ja: {
    estimator: {
      eyebrow: '30 秒でぴったりのプランを',
      title: '1 日にどれくらい話しますか？',
      lead: 'スライダーを動かすと、実際の課金ルールで月間クレジットを試算します。',
      minutesLabel: '1 日の音声入力時間',
      minutes: '{value} 分',
      hours: '{value} 時間',
      aiLabel: 'AI リライト / チャット の頻度',
      ai: {
        none: 'ほぼ使わない',
        some: 'ときどき',
        heavy: 'よく使う',
      },
      need: '月間の推定消費 {credits} クレジット',
      fit: 'クレジットの約 {used}% を使用し、忙しい月にも {left}% の余裕があります。',
      fitUnlimited: 'クレジット無制限なので使用量を気にする必要はありません。',
      over: '{plan}を毎月約 {credits} クレジット超えます。追加パックとの併用がおすすめです。',
      overTitle: '{plan} + 追加',
      choose: '{plan}を選ぶ',
      note: 'クラウド音声 1 秒 = 1 クレジットで試算。AI の使用量はモデルによって異なります。',
    },
    faq: {
      title: 'よくある質問',
      items: [
        {
          q: 'ずっと無料で使えますか？',
          a: 'はい。Typeflux はオープンソースで、ローカルモデルは永久無料です。無料プランにはクラウド AI 処理用の月間クレジットも含まれます。',
        },
        {
          q: 'クレジットを使い切るとどうなりますか？',
          a: '追加料金は発生しません。追加クレジットがあれば自動で使われ、なければローカルモデルへの切り替え、追加パックの購入、アップグレードを選べます。',
        },
        {
          q: '月間クレジットは繰り越せますか？',
          a: 'いいえ。月間クレジットは請求期間ごとにリセットされます。残高を蓄えたい場合は追加クレジットをご利用ください。',
        },
        {
          q: '解約方法は？',
          a: 'Typeflux のサブスクリプション管理から解約できます。解約後も現在の請求期間が終わるまで利用できます。',
        },
      ],
    },
  },
  ko: {
    estimator: {
      eyebrow: '30초 만에 맞는 요금제 찾기',
      title: '하루에 얼마나 말하시나요?',
      lead: '슬라이더를 움직이면 실제 과금 규칙으로 월간 크레딧을 추정합니다.',
      minutesLabel: '하루 음성 입력 시간',
      minutes: '{value}분',
      hours: '{value}시간',
      aiLabel: 'AI 다듬기 / 대화 사용 빈도',
      ai: {
        none: '거의 안 함',
        some: '가끔',
        heavy: '자주',
      },
      need: '월 예상 사용량 {credits} 크레딧',
      fit: '크레딧의 약 {used}%를 사용하며, 바쁜 달을 위해 {left}% 여유가 있습니다.',
      fitUnlimited: '크레딧 무제한이라 사용량을 신경 쓸 필요가 없습니다.',
      over: '매달 {plan}보다 약 {credits} 크레딧이 더 필요합니다. 추가 크레딧 팩과 함께 사용하세요.',
      overTitle: '{plan} + 추가',
      choose: '{plan} 선택',
      note: '클라우드 오디오 1초당 1 크레딧 기준 추정이며, AI 사용량은 모델에 따라 다릅니다.',
    },
    faq: {
      title: '궁금한 점이 있으신가요?',
      items: [
        {
          q: '무료로 계속 사용할 수 있나요?',
          a: '네. Typeflux는 오픈 소스이며 로컬 모델은 영구 무료입니다. 무료 요금제에는 클라우드 AI 처리용 월간 크레딧도 포함됩니다.',
        },
        {
          q: '크레딧을 다 쓰면 어떻게 되나요?',
          a: '추가 요금은 없습니다. 추가 크레딧이 있으면 자동으로 사용되고, 없으면 로컬 모델로 전환하거나 추가 팩 구매 또는 업그레이드를 할 수 있습니다.',
        },
        {
          q: '월간 크레딧이 이월되나요?',
          a: '아니요. 월간 크레딧은 결제 기간마다 초기화됩니다. 여유분을 모아 두려면 추가 크레딧을 이용하세요.',
        },
        {
          q: '어떻게 해지하나요?',
          a: 'Typeflux의 구독 관리에서 해지할 수 있으며, 해지 후에도 현재 결제 기간이 끝날 때까지 사용할 수 있습니다.',
        },
      ],
    },
  },
}

export function billingPlansCopy(lang) {
  return copy[lang] || copy.en
}
