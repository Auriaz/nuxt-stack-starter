import type { EmailPayload, EmailSendResult } from './email.types'

export interface EmailProvider {
  send(payload: EmailPayload): Promise<EmailSendResult>
}
