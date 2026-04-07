import styles from './SpeedSection.module.css'

export default function SpeedSection() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.compare}>
          <div className={styles.card}>
            <div className={styles.icon}>⌨️</div>
            <div className={styles.label}>键盘打字</div>
            <div className={styles.value}>~50 <span>字/分钟</span></div>
          </div>
          <div className={styles.vs}>→</div>
          <div className={`${styles.card} ${styles.highlight}`}>
            <div className={styles.icon}>🎙️</div>
            <div className={styles.label}>Typeflux 语音输入</div>
            <div className={styles.value}>~200 <span>字/分钟</span></div>
            <div className={styles.badge}>快 4 倍</div>
          </div>
        </div>
      </div>
    </section>
  )
}
