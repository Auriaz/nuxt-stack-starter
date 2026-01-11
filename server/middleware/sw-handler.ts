export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Obsługa ścieżek service worker, aby Vue Router nie próbował ich obsługiwać
  // To eliminuje ostrzeżenia "No match found for location with path '/sw.js'"
  if (url.pathname === '/sw.js' || url.pathname.startsWith('/sw.js')) {
    setResponseStatus(event, 404)
    setHeader(event, 'Content-Type', 'text/javascript')
    return '// Service worker not found'
  }
})
