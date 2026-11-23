import Heading, { Reveal } from './Heading'
import Icon from './Icon'
import { CUSTOM_ITEMS, MORE_TOOLS, REPLACES } from './homeModel'
import styles from './Showcase.module.css'

// "One app instead of seven": the categories Typeflux covers.
export function Replaces({ copy }) {
  return (
    <section className={styles.replaces} aria-labelledby="replaces-title">
      <div className="container">
        <p className={styles.replacesTitle} id="replaces-title">{copy.title}</p>
        <ul className={styles.replacesList}>
          {REPLACES.map((id) => <li key={id}>{copy.items[id]}</li>)}
        </ul>
      </div>
    </section>
  )
}

export function MoreTools({ copy }) {
  return (
    <section className={`${styles.section} ${styles.tinted}`} id="more">
      <div className="container">
        <Heading title={copy.title} subtitle={copy.subtitle} />
        <ul className={styles.toolGrid}>
          {MORE_TOOLS.map(({ id, icon }) => (
            <li key={id} className={styles.tool}>
              <Icon name={icon} size={20} />
              <strong>{copy.items[id].name}</strong>
              <p>{copy.items[id].desc}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function CustomSection({ copy }) {
  const { demo } = copy
  return (
    <section className={styles.section} id="custom" data-accent="ring">
      <div className="container">
        <Heading badge={copy.badge} title={copy.title} subtitle={copy.subtitle} />
        <div className={styles.customLayout}>
          <ul className={styles.customGrid}>
            {CUSTOM_ITEMS.map(({ id, icon }) => (
              <li key={id} className={styles.customItem}>
                <span className={styles.capabilityIcon}><Icon name={icon} size={18} /></span>
                <div>
                  <strong>{copy.items[id].title}</strong>
                  <p>{copy.items[id].desc}</p>
                </div>
              </li>
            ))}
          </ul>
          <Reveal className={styles.buildCard}>
            <p className={styles.buildUser}>{demo.user}</p>
            <ul className={styles.buildSteps}>
              {demo.steps.map((step) => <li key={step}><Icon name="checkSmall" size={15} />{step}</li>)}
            </ul>
            <code className={styles.buildResult}>{demo.result}</code>
            <span className={styles.buildSave}><Icon name="download" size={15} />{demo.save}</span>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
