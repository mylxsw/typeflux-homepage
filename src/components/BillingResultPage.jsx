import { useMemo } from 'react'
import { useI18n } from '../i18n/index.jsx'
import styles from './BillingResultPage.module.css'

const pageCopy = {
  en: {
    success: {
      eyebrow: 'Checkout complete',
      title: 'Your payment was successful.',
      summary: 'Stripe has confirmed the checkout. Your Typeflux billing status should update shortly.',
      tone: 'success',
      details: [
        'If you just upgraded, reopen Typeflux or refresh your account state in the app.',
        'A receipt and subscription details will be sent by Stripe when available.',
      ],
      primaryLabel: 'Download Typeflux',
      primaryHref: '/releases',
      secondaryLabel: 'Back to home',
      secondaryHref: '/',
    },
    cancel: {
      eyebrow: 'Checkout canceled',
      title: 'No payment was made.',
      summary: 'You left Stripe Checkout before completing payment. Nothing has changed on your account.',
      tone: 'neutral',
      details: [
        'You can start checkout again from Typeflux whenever you are ready.',
        'If this was unexpected, check your payment method or try again later.',
      ],
      primaryLabel: 'Back to Typeflux',
      primaryHref: '/',
      secondaryLabel: 'View releases',
      secondaryHref: '/releases',
    },
    portal: {
      eyebrow: 'Billing portal',
      title: 'Billing changes saved.',
      summary: 'You have returned from the Stripe billing portal. Your subscription details may take a moment to sync.',
      tone: 'info',
      details: [
        'Open Typeflux and refresh billing settings to see the latest subscription state.',
        'Stripe will email receipts, invoices, and plan-change notices when applicable.',
      ],
      primaryLabel: 'Back to Typeflux',
      primaryHref: '/',
      secondaryLabel: 'Privacy policy',
      secondaryHref: '/privacy',
    },
  },
  'zh-CN': {
    success: {
      eyebrow: '支付完成',
      title: '支付已成功。',
      summary: 'Stripe 已确认这次 Checkout。Typeflux 中的订阅状态稍后会自动更新。',
      tone: 'success',
      details: [
        '如果你刚刚完成升级，请重新打开 Typeflux，或在应用内刷新账户状态。',
        '收据和订阅详情会由 Stripe 在可用时发送到你的邮箱。',
      ],
      primaryLabel: '下载 Typeflux',
      primaryHref: '/releases',
      secondaryLabel: '返回首页',
      secondaryHref: '/',
    },
    cancel: {
      eyebrow: '支付已取消',
      title: '本次没有产生支付。',
      summary: '你在完成支付前离开了 Stripe Checkout，账户状态不会发生变化。',
      tone: 'neutral',
      details: [
        '准备好之后，可以随时从 Typeflux 里重新发起 Checkout。',
        '如果这是异常情况，请检查支付方式，或稍后再试。',
      ],
      primaryLabel: '返回 Typeflux',
      primaryHref: '/',
      secondaryLabel: '查看版本',
      secondaryHref: '/releases',
    },
    portal: {
      eyebrow: '账单管理',
      title: '账单设置已保存。',
      summary: '你已从 Stripe 账单管理页面返回。订阅信息同步可能需要一点时间。',
      tone: 'info',
      details: [
        '请打开 Typeflux，并在账单设置中刷新，以查看最新订阅状态。',
        '如果产生收据、发票或套餐变更通知，Stripe 会通过邮件发送。',
      ],
      primaryLabel: '返回 Typeflux',
      primaryHref: '/',
      secondaryLabel: '隐私政策',
      secondaryHref: '/privacy',
    },
  },
  'zh-TW': {
    success: {
      eyebrow: '付款完成',
      title: '付款已成功。',
      summary: 'Stripe 已確認這次 Checkout。Typeflux 中的訂閱狀態稍後會自動更新。',
      tone: 'success',
      details: [
        '如果你剛剛完成升級，請重新開啟 Typeflux，或在應用程式內刷新帳戶狀態。',
        '收據和訂閱詳情會由 Stripe 在可用時寄送到你的信箱。',
      ],
      primaryLabel: '下載 Typeflux',
      primaryHref: '/releases',
      secondaryLabel: '返回首頁',
      secondaryHref: '/',
    },
    cancel: {
      eyebrow: '付款已取消',
      title: '本次沒有產生付款。',
      summary: '你在完成付款前離開了 Stripe Checkout，帳戶狀態不會發生變化。',
      tone: 'neutral',
      details: [
        '準備好之後，可以隨時從 Typeflux 重新發起 Checkout。',
        '如果這是異常情況，請檢查付款方式，或稍後再試。',
      ],
      primaryLabel: '返回 Typeflux',
      primaryHref: '/',
      secondaryLabel: '查看版本',
      secondaryHref: '/releases',
    },
    portal: {
      eyebrow: '帳單管理',
      title: '帳單設定已儲存。',
      summary: '你已從 Stripe 帳單管理頁面返回。訂閱資訊同步可能需要一點時間。',
      tone: 'info',
      details: [
        '請開啟 Typeflux，並在帳單設定中刷新，以查看最新訂閱狀態。',
        '如果產生收據、發票或方案變更通知，Stripe 會透過郵件寄送。',
      ],
      primaryLabel: '返回 Typeflux',
      primaryHref: '/',
      secondaryLabel: '隱私政策',
      secondaryHref: '/privacy',
    },
  },
  ja: {
    success: {
      eyebrow: 'Checkout complete',
      title: 'お支払いが完了しました。',
      summary: 'Stripe がチェックアウトを確認しました。Typeflux の請求状態はまもなく更新されます。',
      tone: 'success',
      details: [
        'アップグレード直後の場合は、Typeflux を開き直すか、アプリ内でアカウント状態を更新してください。',
        '領収書やサブスクリプション詳細は、利用可能になり次第 Stripe からメールで送信されます。',
      ],
      primaryLabel: 'Typeflux をダウンロード',
      primaryHref: '/releases',
      secondaryLabel: 'ホームへ戻る',
      secondaryHref: '/',
    },
    cancel: {
      eyebrow: 'Checkout canceled',
      title: 'お支払いは発生していません。',
      summary: '支払い完了前に Stripe Checkout を離れました。アカウントに変更はありません。',
      tone: 'neutral',
      details: [
        '準備ができたら、Typeflux からいつでも再度チェックアウトを開始できます。',
        '想定外の場合は、支払い方法を確認するか、時間をおいて再度お試しください。',
      ],
      primaryLabel: 'Typeflux へ戻る',
      primaryHref: '/',
      secondaryLabel: 'リリースを見る',
      secondaryHref: '/releases',
    },
    portal: {
      eyebrow: 'Billing portal',
      title: '請求設定を保存しました。',
      summary: 'Stripe の請求ポータルから戻りました。サブスクリプション情報の同期には少し時間がかかる場合があります。',
      tone: 'info',
      details: [
        'Typeflux を開き、請求設定を更新して最新の状態を確認してください。',
        '領収書、請求書、プラン変更通知がある場合は Stripe からメールで送信されます。',
      ],
      primaryLabel: 'Typeflux へ戻る',
      primaryHref: '/',
      secondaryLabel: 'プライバシーポリシー',
      secondaryHref: '/privacy',
    },
  },
  ko: {
    success: {
      eyebrow: 'Checkout complete',
      title: '결제가 완료되었습니다.',
      summary: 'Stripe에서 체크아웃을 확인했습니다. Typeflux의 결제 상태가 곧 업데이트됩니다.',
      tone: 'success',
      details: [
        '방금 업그레이드했다면 Typeflux를 다시 열거나 앱에서 계정 상태를 새로고침해 주세요.',
        '영수증과 구독 정보는 준비되는 대로 Stripe에서 이메일로 발송됩니다.',
      ],
      primaryLabel: 'Typeflux 다운로드',
      primaryHref: '/releases',
      secondaryLabel: '홈으로 돌아가기',
      secondaryHref: '/',
    },
    cancel: {
      eyebrow: 'Checkout canceled',
      title: '결제가 이루어지지 않았습니다.',
      summary: '결제를 완료하기 전에 Stripe Checkout을 떠났습니다. 계정에는 변경 사항이 없습니다.',
      tone: 'neutral',
      details: [
        '준비가 되면 Typeflux에서 언제든지 다시 체크아웃을 시작할 수 있습니다.',
        '예상치 못한 상황이라면 결제 수단을 확인하거나 잠시 후 다시 시도해 주세요.',
      ],
      primaryLabel: 'Typeflux로 돌아가기',
      primaryHref: '/',
      secondaryLabel: '릴리스 보기',
      secondaryHref: '/releases',
    },
    portal: {
      eyebrow: 'Billing portal',
      title: '결제 설정이 저장되었습니다.',
      summary: 'Stripe 결제 포털에서 돌아왔습니다. 구독 정보가 동기화되는 데 시간이 조금 걸릴 수 있습니다.',
      tone: 'info',
      details: [
        'Typeflux를 열고 결제 설정을 새로고침해 최신 구독 상태를 확인해 주세요.',
        '영수증, 청구서, 요금제 변경 알림은 해당하는 경우 Stripe에서 이메일로 발송됩니다.',
      ],
      primaryLabel: 'Typeflux로 돌아가기',
      primaryHref: '/',
      secondaryLabel: '개인정보 처리방침',
      secondaryHref: '/privacy',
    },
  },
}

export default function BillingResultPage({ type }) {
  const { lang } = useI18n()
  const content = useMemo(() => {
    const localized = pageCopy[lang] || pageCopy.en
    return localized[type] || localized.portal
  }, [lang, type])

  return (
    <main className={styles.page}>
      <section className={styles.resultSection}>
        <div className="container">
          <div className={styles.resultShell}>
            <div className={`${styles.statusIcon} ${styles[content.tone]}`} aria-hidden="true">
              {getIcon(content.tone)}
            </div>
            <p className={styles.eyebrow}>{content.eyebrow}</p>
            <h1>{content.title}</h1>
            <p className={styles.summary}>{content.summary}</p>
          </div>
        </div>
      </section>
    </main>
  )
}

function getIcon(tone) {
  if (tone === 'success') {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (tone === 'info') {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M12 11v6m0-10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
