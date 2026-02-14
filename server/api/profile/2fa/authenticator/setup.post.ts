/**
 * POST /api/profile/2fa/authenticator/setup
 * TODO: Implementacja 2FA.
 */
export default defineEventHandler(() => {
  return {
    data: {
      secret: '',
      qr_code_url: '',
      message: 'TODO: 2FA is not implemented yet.'
    }
  }
})
