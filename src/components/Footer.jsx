import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.inner}>
          <div className={styles.brand}>
            <span className={styles.logoText}>Typeflux</span>
            <p className={styles.desc}>开源免费的 macOS 语音输入法</p>
          </div>
          <div className={styles.links}>
            <div className={styles.col}>
              <h4>产品</h4>
              <a href="#features">功能介绍</a>
              <a href="#agent">随口说</a>
              <a href="#privacy">隐私保护</a>
            </div>
            <div className={styles.col}>
              <h4>资源</h4>
              <a
                href="https://github.com/mylxsw/typeflux"
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
              <a
                href="https://github.com/mylxsw/typeflux/releases"
                target="_blank"
                rel="noopener"
              >
                下载
              </a>
              <a
                href="https://github.com/mylxsw/typeflux/issues"
                target="_blank"
                rel="noopener"
              >
                反馈
              </a>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <p>© 2026 Typeflux. 开源项目，使用 AGPL-3.0 许可证。</p>
        </div>
      </div>
    </footer>
  );
}
