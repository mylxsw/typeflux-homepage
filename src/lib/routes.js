// Public routes that get prerendered to static HTML. Everything else
// (billing, settings, unknown paths) falls back to client-side rendering.
export const PUBLIC_ROUTES = ['/', '/releases', '/privacy', '/terms']

export function isPublicRoute(route) {
  return PUBLIC_ROUTES.includes(route)
}
