import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './Hero.module.css'

const DEMO_TEXTS = [
  '今天下午三点有一个产品评审会议，请帮我准备一下会议议程。',
  'Typeflux 让语音输入变得如此简单，按下 Fn 键就能开始说话。',
  '这份报告的数据部分需要更新，请把第三季度的销售数据加进去。',
  '给团队发一封邮件，告诉他们项目进展顺利，预计下周完成。',
]

export default function Hero() {
  const [typedText, setTypedText] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textIdx = useRef(0)
  const charIdx = useRef(0)
  const timer = useRef(null)

  const typeNext = useCallback(() => {
    const text = DEMO_TEXTS[textIdx.current]
    if (charIdx.current < text.length) {
      charIdx.current++
      setTypedText(text.substring(0, charIdx.current))
      const speed = 40 + Math.random() * 40
      timer.current = setTimeout(typeNext, speed)
    } else {
      setIsListening(false)
      timer.current = setTimeout(() => {
        textIdx.current = (textIdx.current + 1) % DEMO_TEXTS.length
        charIdx.current = 0
        setTypedText('')
        timer.current = setTimeout(startTyping, 800)
      }, 2500)
    }
  }, [])

  const startTyping = useCallback(() => {
    setIsListening(true)
    charIdx.current = 0
    setTypedText('')
    typeNext()
  }, [typeNext])

  useEffect(() => {
    timer.current = setTimeout(startTyping, 1200)
    return () => clearTimeout(timer.current)
  }, [startTyping])

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              <span className={styles.titleLine}>说话，</span>
              <span className={`${styles.titleLine} ${styles.titleAccent}`}>不打字</span>
            </h1>
            <p className={styles.subtitle}>
              按下 <kbd>Fn</kbd> 键，开口说话。Typeflux 将你的语音精准转为文字，在任何应用中即时输入。开源免费，支持本地模型。
            </p>
            <div className={styles.actions}>
              <a href="https://github.com/mylxsw/typeflux/releases" target="_blank" rel="noopener" className="btn btn-primary btn-lg">
                <DownloadIcon size={20} />
                免费下载
              </a>
              <a href="https://github.com/mylxsw/typeflux" target="_blank" rel="noopener" className="btn btn-secondary btn-lg">
                <GitHubIcon size={20} />
                查看源码
              </a>
            </div>
          </div>

          <div className={styles.visual}>
            <div className={styles.demoWindow}>
              <div className={styles.toolbar}>
                <span className={`${styles.dot} ${styles.red}`} />
                <span className={`${styles.dot} ${styles.yellow}`} />
                <span className={`${styles.dot} ${styles.green}`} />
                <span className={styles.toolbarTitle}>Typeflux</span>
              </div>
              <div className={styles.body}>
                <div className={styles.textArea}>
                  <div className={styles.inputLine}>
                    <span>{typedText}</span>
                    <span className={styles.cursor}>|</span>
                  </div>
                </div>
                <div className={styles.statusBar}>
                  <div className={`${styles.voiceIndicator} ${isListening ? styles.active : ''}`}>
                    <div className={styles.voiceWave}>
                      <span /><span /><span /><span /><span />
                    </div>
                    <span className={styles.voiceLabel}>正在聆听...</span>
                  </div>
                  <div className={styles.keyHint}>
                    <kbd>Fn</kbd> 语音输入
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function DownloadIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 1v10m0 0l-3.5-3.5M8 11l3.5-3.5M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function GitHubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
    </svg>
  )
}
