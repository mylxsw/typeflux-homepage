const apiOrigin = 'https://api.typeflux.app'
// Public API, download and tracked outbound routes must bypass the SPA.
const redirectPath = /^\/(?:zh-CN\/|zh-TW\/|ja\/|ko\/)?((?:go|d)\/.*)$/
const loginPage = /^\/(?:zh-CN\/|zh-TW\/|ja\/|ko\/)?login(?:\/complete)?\/?$/
const loginCSP = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'"

function protect(response, headers = {}) {
  const protectedResponse = new Response(response.body, response)
  protectedResponse.headers.set('Cache-Control', 'no-store')
  protectedResponse.headers.set('Referrer-Policy', 'no-referrer')
  for (const [name, value] of Object.entries(headers)) protectedResponse.headers.set(name, value)
  return protectedResponse
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const redirect = url.pathname.match(redirectPath)
    if (url.pathname.startsWith('/api/') || redirect) {
      const upstreamPath = redirect ? `/${redirect[1]}` : url.pathname
      const upstream = new URL(upstreamPath + url.search, apiOrigin)
      const forwarded = new Request(upstream, request)
      forwarded.headers.delete('Host')
      const clientIP = request.headers.get('CF-Connecting-IP')
      if (clientIP) forwarded.headers.set('X-Real-IP', clientIP)
      else forwarded.headers.delete('X-Real-IP')
      return protect(await fetch(forwarded, { redirect: 'manual', cache: 'no-store' }))
    }
    if (loginPage.test(url.pathname)) {
      // The assets service exposes auth.html at its canonical extensionless path.
      const response = await env.ASSETS.fetch(new Request(new URL('/auth', url), { method: request.method }))
      return protect(response, {
        'Content-Security-Policy': loginCSP,
        'X-Robots-Tag': 'noindex, nofollow',
        'X-Content-Type-Options': 'nosniff',
      })
    }
    return protect(new Response('Not found', { status: 404 }))
  },
}
