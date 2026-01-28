import nodemailer, { type Transporter } from 'nodemailer'
import type {
  EmailPayload,
  EmailProviderErrorCode,
  EmailRuntimeConfig,
  EmailSendResult
} from './email.types'
import type { EmailProvider } from './email.provider'

function mapNodemailerErrorToCode(error: unknown): EmailProviderErrorCode {
  const err = error as NodeJS.ErrnoException & { code?: string, responseCode?: number }
  const code = err.code ?? ''

  if (code === 'EAUTH') {
    return 'SMTP_AUTH_FAILED'
  }

  if (code === 'ECONNECTION' || code === 'ENOTFOUND' || code === 'ECONNREFUSED') {
    return 'SMTP_CONNECTION_FAILED'
  }

  if (code === 'ETIMEDOUT') {
    return 'SMTP_TIMEOUT'
  }

  return 'UNKNOWN'
}

export function createNodemailerProvider(config: EmailRuntimeConfig): EmailProvider {
  let transport: Transporter | null = null

  const getTransport = () => {
    if (!transport) {
      transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: config.user && config.pass
          ? {
              user: config.user,
              pass: config.pass
            }
          : undefined,
        // Bezpieczne, ale rozsądne timeouty – nie blokujemy requestu w nieskończoność
        connectionTimeout: 20_000,
        greetingTimeout: 20_000,
        socketTimeout: 20_000
      })
    }

    return transport
  }

  return {
    async send(payload: EmailPayload): Promise<EmailSendResult> {
      const transporter = getTransport()

      const to = Array.isArray(payload.to) ? payload.to : [payload.to]
      const from = payload.from ?? config.from
      const replyTo = payload.replyTo ?? config.replyToDefault

      try {
        const info = await transporter.sendMail({
          from,
          to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
          replyTo,
          headers: payload.headers
        })

        const accepted = (info.accepted ?? []) as string[]
        const rejected = (info.rejected ?? []) as string[]

        return {
          messageId: info.messageId,
          accepted,
          rejected,
          provider: 'smtp'
        }
      } catch (error) {
        const code = mapNodemailerErrorToCode(error)

        // Rzucamy błąd dalej – warstwa API zmapuje go na kontrakt błędów
        const err = error as Error & { providerCode?: EmailProviderErrorCode }
        err.providerCode = code
        throw err
      }
    }
  }
}
