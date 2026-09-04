// Public routes that get prerendered to static HTML. Everything else
// (billing, settings, unknown paths) falls back to client-side rendering.
export const PUBLIC_ROUTES = ['/', '/releases', '/privacy', '/terms']

// Blog routes are dynamic: /blog plus one page per post slug. They only exist
// when content is present (see src/lib/posts.js), so the prerenderer asks the
// SSR bundle for the full list at build time.
export function isPublicRoute(route) {
  return PUBLIC_ROUTES.includes(route) || route === '/blog' || route.startsWith('/blog/')
}
