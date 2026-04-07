import { useScrollAnimation } from '../hooks/useScrollAnimation'
import styles from './Agent.module.css'

export default function Agent() {
  const [contentRef, contentVisible] = useScrollAnimation()
  const [visualRef, visualVisible] = useScrollAnimation()

  return (
    <section className={styles.section} id="agent">
      <div className="container">
        <div className={styles.layout}>
          <div
            ref={contentRef}
            className={`${styles.content} animate-hidden ${contentVisible ? 'animate-visible' : ''}`}
          >
            <span className="section-badge">随口说</span>
            <h2 className="section-title">
              不只是输入，<br/>更是你的 AI 助手
            </h2>
            <p className="section-subtitle">
              按下 <kbd>Fn</kbd> + <kbd>Space</kbd>，唤起「随口说」功能。通过语音与 AI Agent 对话，实现问答、内容改写和更复杂的操作。
            </p>
            <div className={styles.features}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>💬</div>
                <div>
                  <strong>语音问答</strong>
                  <p>直接开口提问，获取即时回答</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>✍️</div>
                <div>
                  <strong>内容改写</strong>
                  <p>选中文本，用语音指令改写、翻译、总结</p>
                </div>
              </div>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>🔄</div>
                <div>
                  <strong>复杂操作</strong>
                  <p>通过自然语言完成更复杂的工作流程</p>
                </div>
              </div>
            </div>
          </div>

          <div
            ref={visualRef}
            className={`${styles.visual} animate-hidden ${visualVisible ? 'animate-visible' : ''}`}
          >
            <div className={styles.demo}>
              <div className={`${styles.bubble} ${styles.user}`}>
                <div className={styles.chatKeyHint}><kbd>Fn</kbd>+<kbd>Space</kbd></div>
                帮我把这段话翻译成英文，用更正式的语气
              </div>
              <div className={`${styles.bubble} ${styles.agent}`}>
                <div className={styles.agentLabel}>
                  <span className={styles.agentDot} />
                  Typeflux Agent
                </div>
                好的，我来帮你翻译并调整语气。以下是正式版本：
                <div className={styles.result}>
                  "We are pleased to inform you that the project has been successfully completed ahead of schedule..."
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
