import { describe, expect, it } from 'vitest'
import { getAllPosts, getPost, getPostLanguages, getPostSlugs, hasPosts } from './posts'

describe('posts', () => {
  it('loads posts from src/content/blog', () => {
    expect(hasPosts()).toBe(true)
    expect(getPostSlugs()).toContain('local-models-offline-voice-typing')
  })

  it('parses frontmatter fields', () => {
    const post = getPost('local-models-offline-voice-typing')
    expect(post.title).toContain('Offline Voice Typing')
    expect(post.description.length).toBeGreaterThan(20)
    expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(post.content).toContain('WhisperKit')
  })

  it('sorts posts newest first', () => {
    const dates = getAllPosts().map((post) => post.date)
    expect([...dates].sort((a, b) => b.localeCompare(a))).toEqual(dates)
  })

  it('returns null for unknown slugs', () => {
    expect(getPost('does-not-exist')).toBeNull()
  })

  it('uses the localized override when one exists', () => {
    const post = getPost('local-models-offline-voice-typing', 'zh-CN')
    expect(post.title).toContain('离线语音输入')
    expect(post.contentLanguage).toBe('zh-CN')
  })

  it('falls back to English content for languages without an override', () => {
    const post = getPost('local-models-offline-voice-typing', 'ja')
    expect(post.title).toContain('Offline Voice Typing')
    expect(post.contentLanguage).toBe('en')
  })

  it('publishes the refactor retrospective in English and Chinese', () => {
    const slug = 'ai-full-ui-refactor-rollback'
    const chinese = getPost(slug, 'zh-CN')
    const english = getPost(slug, 'en')
    expect(chinese.title).toContain('全量 UI 重构')
    expect(chinese.contentLanguage).toBe('zh-CN')
    expect(english.title).toContain('AI UI Refactor')
    expect(english.content).toContain('git reset --hard')
    expect(english.contentLanguage).toBe('en')
    expect(english.image).toBe(chinese.image)
    expect(getPostLanguages(slug)).toEqual(['en', 'zh-CN'])
    expect(getAllPosts('zh-CN').map((entry) => entry.slug)).toContain(slug)
    expect(getAllPosts('en').map((entry) => entry.slug)).toContain(slug)
    expect(getPost(slug, 'ja')).toBeNull()
  })
})
