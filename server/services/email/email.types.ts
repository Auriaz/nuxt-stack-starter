export type EmailAddress = string

export interface EmailPayload {
  to: EmailAddress | EmailAddress[]
  subject: string
  text?: string
  html?: string
  from?: EmailAddress
  replyTo?: EmailAddress
  headers?: Record<string, string>
}

export type EmailProviderName = 'smtp'

export type EmailProviderErrorCode
  = | 'SMTP_AUTH_FAILED'
    | 'SMTP_CONNECTION_FAILED'
    | 'SMTP_TIMEOUT'
    | 'EMAIL_REJECTED'
    | 'UNKNOWN'

export interface EmailSendResult {
  messageId: string
  accepted: EmailAddress[]
  rejected: EmailAddress[]
  provider: EmailProviderName
}

export interface EmailRuntimeConfig {
  host: string
  port: number
  secure: boolean
  user?: string
  pass?: string
  from: EmailAddress
  replyToDefault: EmailAddress
  toContact: EmailAddress
}
