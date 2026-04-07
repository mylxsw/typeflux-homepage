import { useScrollAnimation } from '../hooks/useScrollAnimation'
import styles from './Features.module.css'

const features = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#F0F0F0"/>
        <path d="M24 14v10m0 0l-4-4m4 4l4-4" stroke="#1D1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 28c0 4.418 3.582 8 8 8s8-3.582 8-8" stroke="#1D1A1A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: '本地模型支持',
    desc: '支持本地语音识别模型，速度快，识别率高，无需联网，完全保护你的隐私数据。',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#F0F0F0"/>
        <circle cx="24" cy="20" r="6" stroke="#1D1A1A" strokeWidth="2"/>
        <path d="M14 36c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#1D1A1A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: '人设定制',
    desc: '创建不同的人设，为工作、学习、社交等场景分别优化，让语音识别更贴合你的使用情境。',
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#F0F0F0"/>
        <rect x="14" y="14" width="20" height="20" rx="4" stroke="#1D1A1A" strokeWidth="2"/>
        <path d="M20 22h8m-8 4h5" stroke="#1D1A1A" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    title: '简约设计',
    desc: '极简的界面设计，不干扰你的工作流程。安静地待在菜单栏，需要时一键唤起。',
  },
]

function AnimatedCard({ children, delay = 0, className }) {
  const [ref, isVisible] = useScrollAnimation()
  return (
    <div
      ref={ref}
      className={`${className} animate-hidden ${isVisible ? 'animate-visible' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  )
}

export default function Features() {
  const [heroRef, heroVisible] = useScrollAnimation()

  return (
    <section className={styles.section} id="features">
      <div className="container">
        <h2 className={`section-title ${styles.centered}`}>按下 Fn，开口说话</h2>
        <p className={`section-subtitle ${styles.centered}`}>
          简单的按键触发，自然的语音输入。Typeflux 在任何你需要打字的地方都能工作。
        </p>

        <div className={styles.grid}>
          {/* Hero card */}
          <div
            ref={heroRef}
            className={`${styles.card} ${styles.cardLarge} animate-hidden ${heroVisible ? 'animate-visible' : ''}`}
          >
            <div className={styles.keyVisual}>
              <div className={styles.keyCombo}>
                <kbd className={styles.keyLg}>Fn</kbd>
              </div>
              <div className={styles.keyArrow}>→</div>
              <div className={styles.waveVisual}>
                <div className={styles.waveCircle} />
                <div className={styles.waveCircle} />
                <div className={styles.waveCircle} />
              </div>
            </div>
            <h3>一键语音输入</h3>
            <p>按住 Fn 键即可开始语音输入，松开即停止。无需切换输入法，无需点击按钮，在任何文本框中都能使用。</p>
          </div>

          {features.map((f, i) => (
            <AnimatedCard key={f.title} delay={(i + 1) * 0.1} className={styles.card}>
              <div className={styles.cardIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </section>
  )
}
