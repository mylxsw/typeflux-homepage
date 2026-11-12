const apiOrigin = 'https://api.typeflux.app'
const webAuthPrefix = '/api/v1/auth/web/'
const emailDiscoveryPath = '/api/v1/auth/enter-email'
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
    if (url.pathname.startsWith(webAuthPrefix) || url.pathname === emailDiscoveryPath) {
      const upstream = new URL(url.pathname + url.search, apiOrigin)
      const forwarded = new Request(upstream, request)
      forwarded.headers.delete('Host')
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
