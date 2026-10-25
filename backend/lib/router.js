// Finds the route for "METHOD /path". A part like :id becomes a parameter.
export function findRoute(routes, method, pathname) {
  const exact = routes[method + ' ' + pathname]
  if (exact) return { handler: exact, params: {} }
  for (const key of Object.keys(routes)) {
    if (!key.includes(':')) continue
    const [routeMethod, routePath] = key.split(' ')
    if (routeMethod !== method) continue
    const names = []
    const pattern = new RegExp(
      '^' + routePath.replace(/:([a-z]+)/g, (_, name) => (names.push(name), '([A-Za-z0-9-]+)')) + '$'
    )
    const m = pattern.exec(pathname)
    if (m) return { handler: routes[key], params: Object.fromEntries(names.map((n, i) => [n, m[i + 1]])) }
  }
  return null
}
