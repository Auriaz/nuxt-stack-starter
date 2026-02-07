export default defineNitroPlugin((nitroApp) => {
  if (process.env.NODE_ENV === 'production') return

  nitroApp.hooks.hook('error', (error, { event }) => {
    const path = event?.path || event?.node?.req?.url || 'unknown'
    // Minimalny log błędu SSR/endpointów dla diagnozy 500
    // eslint-disable-next-line no-console
    console.error('[nitro:error]', path, error)
  })
})
