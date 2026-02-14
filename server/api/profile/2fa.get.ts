/**
 * GET /api/profile/2fa
 * TODO: Implementacja 2FA.
 */
export default defineEventHandler(() => {
  return {
    data: {
      enabled: false,
      recovery_codes_count: 0
    }
  }
})
