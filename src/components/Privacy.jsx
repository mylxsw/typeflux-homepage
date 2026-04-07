import { useScrollAnimation } from '../hooks/useScrollAnimation'
import styles from './Privacy.module.css'

const items = [
  { icon: '🏠', title: '本地处理', desc: '支持本地语音识别模型，语音数据无需上传云端。' },
  { icon: '🔒', title: '数据不留存', desc: '不收集、不存储、不分析你的任何语音或文字数据。' },
  { icon: '📖', title: '开源透明', desc: '完全开源的代码，任何人都可以审查，确保没有后门。' },
]

export default function Privacy() {
  const [visualRef, visualVisible] = useScrollAnimation()
  const [contentRef, contentVisible] = useScrollAnimation()

  return (
    <section className={styles.section} id="privacy">
      <div className="container">
        <div className={styles.layout}>
          <div
            ref={visualRef}
            className={`${styles.visual} animate-hidden ${visualVisible ? 'animate-visible' : ''}`}
          >
            <div className={styles.shield}>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                <path d="M60 10L15 30v30c0 27.6 19.2 53.4 45 60 25.8-6.6 45-32.4 45-60V30L60 10z" fill="#1D1A1A" opacity="0.05"/>
                <path d="M60 20L22 37v25c0 23.4 16.2 45.2 38 50.8 21.8-5.6 38-27.4 38-50.8V37L60 20z" fill="#1D1A1A" opacity="0.08"/>
                <path d="M48 58l8 8 16-16" stroke="#1D1A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div
            ref={contentRef}
            className={`${styles.content} animate-hidden ${contentVisible ? 'animate-visible' : ''}`}
          >
            <h2 className="section-title">隐私为先</h2>
            <p className="section-subtitle">你的声音数据，只属于你自己。</p>
            <div className={styles.features}>
              {items.map(item => (
                <div className={styles.item} key={item.title}>
                  <div className={styles.itemIcon}>{item.icon}</div>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
