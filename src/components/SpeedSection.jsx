import { useI18n } from '../i18n/index.jsx'
import styles from './SpeedSection.module.css'

export default function SpeedSection() {
  const { t, lang } = useI18n()

  const content = {
    en: {
      typing: 'Typing',
      typingSpeed: '~50',
      unit: 'wpm',
      voice: 'Typeflux Voice',
      voiceSpeed: '~200',
      badge: '4x Faster',
    },
    'zh-CN': {
      typing: '键盘打字',
      typingSpeed: '~50',
      unit: '字/分钟',
      voice: 'Typeflux 语音输入',
      voiceSpeed: '~200',
      badge: '快 4 倍',
    },
    'zh-TW': {
      typing: '鍵盤打字',
      typingSpeed: '~50',
      unit: '字/分鐘',
      voice: 'Typeflux 語音輸入',
      voiceSpeed: '~200',
      badge: '快 4 倍',
    },
    ja: {
      typing: 'タイピング',
      typingSpeed: '~50',
      unit: '文字/分',
      voice: 'Typeflux 音声入力',
      voiceSpeed: '~200',
      badge: '4倍速い',
    },
    ko: {
      typing: '키보드 타이핑',
      typingSpeed: '~50',
      unit: '자/분',
      voice: 'Typeflux 음성 입력',
      voiceSpeed: '~200',
      badge: '4배 빠름',
    },
  }

  const c = content[lang] || content.en

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.compare}>
          <div className={styles.card}>
            <div className={styles.icon}>⌨️</div>
            <div className={styles.label}>{c.typing}</div>
            <div className={styles.value}>{c.typingSpeed} <span>{c.unit}</span></div>
          </div>
          <div className={styles.vs}>→</div>
          <div className={`${styles.card} ${styles.highlight}`}>
            <div className={styles.icon}>🎙️</div>
            <div className={styles.label}>{c.voice}</div>
            <div className={styles.value}>{c.voiceSpeed} <span>{c.unit}</span></div>
            <div className={styles.badge}>{c.badge}</div>
          </div>
        </div>
      </div>
    </section>
  )
}
