import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useI18n } from "../i18n/index.jsx";
import { getAllReleases } from "../lib/releases";
import styles from "./ReleasesPage.module.css";

const releases = getAllReleases();
const latestRelease = releases[0] || null;
const historicalReleases = releases.slice(1);
const visibleHistoricalReleases = historicalReleases.slice(0, 3);
const hasMoreHistory = historicalReleases.length > 3;

export default function ReleasesPage() {
  const { t, lang } = useI18n();
  const latestOverview = latestRelease
    ? buildLatestOverview(latestRelease)
    : null;

  return (
    <main className={styles.page}>
      <section className={styles.releaseSection}>
        <div className="container">
          {latestRelease ? (
            <div className={styles.releaseList}>
              <article className={styles.latestRelease}>
                <div className={styles.latestReleaseShell}>
                  <div className={styles.latestHero}>
                    <div className={styles.latestMetaBar}>
                      <span className={styles.releaseTag}>
                        {t("releases.latestLabel")}
                      </span>
                      <span className={styles.latestDateText}>
                        {formatReleaseDate(latestRelease.releaseDate, lang)}
                      </span>
                    </div>

                    <h1 className={styles.latestHeroTitle}>
                      {formatLatestHeadline(latestRelease)}
                    </h1>

                    {latestRelease.title ? (
                      <p className={styles.latestSummary}>
                        {latestRelease.title}
                      </p>
                    ) : null}

                    {latestRelease.downloadUrl ? (
                      <a
                        href={latestRelease.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`btn btn-primary ${styles.latestDownload}`}
                      >
                        <MacIcon />
                        {t("releases.latestDownload")}
                      </a>
                    ) : null}
                  </div>

                  <div className={styles.latestDivider} />

                  {latestOverview?.sections.length ? (
                    <section className={styles.latestSections}>
                      <div className={styles.sectionHeaderRow}>
                        <h2 className={styles.sectionTitle}>
                          {t("releases.keyImprovements")}
                        </h2>
                      </div>

                      <div className={styles.sectionList}>
                        {latestOverview.sections.map((section) => (
                          <article
                            key={section.title}
                            className={styles.sectionBlock}
                          >
                            <div className={styles.sectionHeadingRow}>
                              <span
                                className={styles.sectionIcon}
                                aria-hidden="true"
                              >
                                {getSectionIcon(section.title)}
                              </span>
                              <h3 className={styles.sectionBlockTitle}>
                                {section.title}
                              </h3>
                            </div>

                            {section.paragraphs.map((paragraph) => (
                              <p
                                key={paragraph}
                                className={styles.sectionParagraph}
                              >
                                {paragraph}
                              </p>
                            ))}

                            {section.listItems.length ? (
                              <ul className={styles.sectionListItems}>
                                {section.listItems.map((item) => (
                                  <li key={item}>{item}</li>
                                ))}
                              </ul>
                            ) : null}
                          </article>
                        ))}
                      </div>
                    </section>
                  ) : (
                    <div
                      className={`${styles.markdownBody} ${styles.latestMarkdownBody}`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                            />
                          ),
                        }}
                      >
                        {latestRelease.content}
                      </ReactMarkdown>
                    </div>
                  )}

                  {historicalReleases.length ? (
                    <section className={styles.historySection}>
                      <div className={styles.historyHeader}>
                        <h2 className={styles.historyHeading}>
                          {t("releases.historyTitle")}
                        </h2>
                      </div>

                      <div className={styles.timeline}>
                        {visibleHistoricalReleases.map((release) => {
                          const preview = buildReleasePreview(release);

                          return (
                            <article
                              key={release.id}
                              className={styles.timelineItem}
                            >
                              <div
                                className={styles.timelineRail}
                                aria-hidden="true"
                              >
                                <span className={styles.timelineDot} />
                                <span className={styles.timelineLine} />
                              </div>

                              <div className={styles.releaseCard}>
                                <div className={styles.historyCardHeader}>
                                  <div className={styles.historyTitleRow}>
                                    <h3
                                      className={`${styles.releaseTitle} ${styles.historyTitle}`}
                                    >
                                      {release.version} {release.title}
                                    </h3>
                                  </div>
                                  <span className={styles.historyDate}>
                                    {formatReleaseDate(release.releaseDate, lang)}
                                  </span>
                                </div>

                                {preview.summary ? (
                                  <p className={styles.historySummary}>
                                    {preview.summary}
                                  </p>
                                ) : null}

                                {preview.items.length ? (
                                  <ul className={styles.historyItems}>
                                    {preview.items.map((item) => (
                                      <li key={item}>{item}</li>
                                    ))}
                                  </ul>
                                ) : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>

                      {hasMoreHistory ? (
                        <div className={styles.historyFooter}>
                          <a
                            href="https://github.com/mylxsw/typeflux/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.moreHistoryLink}
                          >
                            {t("releases.moreHistory")}
                          </a>
                        </div>
                      ) : null}
                    </section>
                  ) : null}
                </div>
              </article>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <h2>{t("releases.emptyTitle")}</h2>
              <p>{t("releases.emptyDescription")}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function formatReleaseDate(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: "long" }).format(date);
  } catch {
    return new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(date);
  }
}

function formatLatestHeadline(release) {
  return `Typeflux ${release.version}`;
}

function buildLatestOverview(release) {
  const blocks = release.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  let summary = "";
  const sections = [];
  let currentSection = null;

  for (const block of blocks) {
    if (block.startsWith("## ")) {
      if (currentSection) {
        sections.push(currentSection);
      }

      currentSection = {
        title: block.replace(/^##\s+/, "").trim(),
        paragraphs: [],
        listItems: [],
      };
      continue;
    }

    if (!summary && !block.startsWith("#") && !block.startsWith("- ")) {
      summary = cleanupInlineMarkdown(block);
      continue;
    }

    if (!currentSection) {
      continue;
    }

    if (block.startsWith("- ")) {
      const items = block
        .split("\n")
        .map((item) => item.replace(/^-\s+/, "").trim())
        .filter(Boolean)
        .map(cleanupInlineMarkdown);
      currentSection.listItems.push(...items);
    } else {
      currentSection.paragraphs.push(cleanupInlineMarkdown(block));
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    summary,
    sections,
  };
}

function buildReleasePreview(release) {
  const blocks = release.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const summaryBlock = blocks.find(
    (block) => !block.startsWith("#") && !block.startsWith("- "),
  );
  const listItems = blocks
    .flatMap((block) =>
      block.startsWith("- ")
        ? block
            .split("\n")
            .map((item) => item.replace(/^-\s+/, "").trim())
            .filter(Boolean)
        : [],
    )
    .slice(0, 3)
    .map(cleanupInlineMarkdown);

  return {
    summary: summaryBlock ? cleanupInlineMarkdown(summaryBlock) : "",
    items: listItems,
  };
}

function cleanupInlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .trim();
}

function getSectionIcon(title) {
  if (/隐私|privacy/i.test(title)) {
    return <LockIcon />;
  }

  if (/agent|编辑|editing/i.test(title)) {
    return <SparklesIcon />;
  }

  return <ShortcutIcon />;
}

function ShortcutIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 7V5a3 3 0 1 0-3 3h14a3 3 0 1 1-3 3v8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17v2a3 3 0 1 0 3-3H5a3 3 0 1 1 3-3V5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M18.5 14.5l.7 2 .3.8.8.3 2 .7-2 .7-.8.3-.3.8-.7 2-.7-2-.3-.8-.8-.3-2-.7 2-.7.8-.3.3-.8.7-2Z"
        fill="currentColor"
      />
      <path
        d="M5.5 14.5l.9 2.5L9 18l-2.6 1-.9 2.5-.9-2.5L2 18l2.6-1 .9-2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function MacIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.2 4.2c.5-.7.8-1.6.7-2.5-.8 0-1.8.5-2.4 1.2-.5.6-.9 1.6-.8 2.4.9.1 1.8-.4 2.5-1.1Z"
        fill="currentColor"
      />
      <path
        d="M18.7 12.8c0-2.8 2.3-4.2 2.4-4.3-1.3-1.9-3.4-2.2-4.1-2.2-1.8-.2-3.4 1-4.3 1-1 0-2.3-1-3.8-.9-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.7 1.4 11.3 1 1.3 2.1 2.8 3.6 2.7 1.5-.1 2-.9 3.8-.9 1.8 0 2.3.9 3.8.8 1.6 0 2.6-1.4 3.5-2.7 1.2-1.7 1.7-3.3 1.7-3.4 0 0-3.2-1.2-3.3-5.2Z"
        fill="currentColor"
      />
    </svg>
  );
}
