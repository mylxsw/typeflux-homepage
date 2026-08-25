export function formatPostDate(date, lang) {
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`))
  } catch {
    return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(`${date}T00:00:00`))
  }
}
