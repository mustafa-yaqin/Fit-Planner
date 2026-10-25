// A tiny route to check that the server is running: GET /api/health.
export const healthRoutes = {
  'GET /api/health': async () => ({ ok: true }),
}
