import styles from './CTA.module.css'

export default function CTA() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.title}>
          释放你的双手，<br/>用声音书写
        </h2>
        <p className={styles.subtitle}>Typeflux 让语音输入成为你最自然的表达方式。</p>
        <a href="https://github.com/mylxsw/typeflux/releases" target="_blank" rel="noopener" className="btn btn-primary btn-xl">
          <svg width="24" height="24" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v10m0 0l-3.5-3.5M8 11l3.5-3.5M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          免费下载 Typeflux
        </a>
      </div>
    </section>
  )
}
