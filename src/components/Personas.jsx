import { useScrollAnimation } from '../hooks/useScrollAnimation'
import styles from './Personas.module.css'

const personas = [
  { emoji: '💼', title: '工作', desc: '专业术语识别优化，正式文风输出，适合撰写邮件、报告和文档。' },
  { emoji: '📚', title: '学习', desc: '学术词汇增强识别，支持笔记速记，适合课堂和阅读场景。' },
  { emoji: '💬', title: '社交', desc: '口语化表达，轻松自然的语气，适合聊天和社交媒体。' },
  { emoji: '🛠️', title: '自定义', desc: '完全自定义人设参数，根据你的独特需求打造专属输入体验。' },
]

export default function Personas() {
  return (
    <section className={styles.section} id="personas">
      <div className="container">
        <h2 className={`section-title ${styles.centered}`}>为每个场景定制人设</h2>
        <p className={`section-subtitle ${styles.centered}`}>
          通过创建不同的人设，为不同的使用场景进行优化。在工作中保持专业，在社交中保持轻松。
        </p>
        <div className={styles.grid}>
          {personas.map((p, i) => (
            <PersonaCard key={p.title} persona={p} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function PersonaCard({ persona, delay }) {
  const [ref, isVisible] = useScrollAnimation()
  return (
    <div
      ref={ref}
      className={`${styles.card} animate-hidden ${isVisible ? 'animate-visible' : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className={styles.emoji}>{persona.emoji}</div>
      <h3>{persona.title}</h3>
      <p>{persona.desc}</p>
    </div>
  )
}
