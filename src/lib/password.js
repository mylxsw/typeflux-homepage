// Go's minimum is UTF-8 bytes; Unicode upper/lower/digit categories match
// validatePasswordStrength. Bcrypt accepts no more than 72 UTF-8 bytes.
export function passwordRules(value) {
  const bytes = new TextEncoder().encode(value).length
  return [bytes >= 8, /\p{Lu}/u.test(value), /\p{Ll}/u.test(value), /\p{Nd}/u.test(value), bytes <= 72]
}

export function validPassword(value) { return passwordRules(value).every(Boolean) }
