import { useRuntimeConfig } from '#imports'
import type { ContactFormInput } from '#shared/types/api'
import type { EmailPayload, EmailRuntimeConfig, EmailSendResult } from './email.types'
import type { EmailProvider } from './email.provider'
import { createNodemailerProvider } from './nodemailer.provider'

let provider: EmailProvider | null = null
let emailConfig: EmailRuntimeConfig | null = null

function getEmailConfig(): EmailRuntimeConfig {
  if (!emailConfig) {
    const runtimeConfig = useRuntimeConfig()
    // Avoid `any` usage by explicitly typing runtimeConfig as { email?: Partial<EmailRuntimeConfig> }
    const typedConfig = runtimeConfig as { email?: Partial<EmailRuntimeConfig> }
    const cfg = typedConfig.email

    if (!cfg || !cfg.host || !cfg.port || !cfg.from || !cfg.toContact || !cfg.replyToDefault) {
      throw new Error('Email configuration is missing. Please check runtimeConfig.email and ENV.')
    }

    emailConfig = {
      host: cfg.host,
      port: Number(cfg.port),
      secure: Boolean(cfg.secure),
      user: cfg.user,
      pass: cfg.pass,
      from: cfg.from,
      replyToDefault: cfg.replyToDefault,
      toContact: cfg.toContact
    }
  }

  return emailConfig
}

function getProvider(): EmailProvider {
  if (!provider) {
    provider = createNodemailerProvider(getEmailConfig())
  }

  return provider
}

function buildContactEmailTemplate(input: ContactFormInput & { createdAt: Date, pageUrl?: string }): EmailPayload {
  const createdAtIso = input.createdAt.toISOString()
  const subject = `[Kontakt] ${input.name} <${input.email}>`

  const lines: string[] = [
    `Nowa wiadomość z formularza kontaktowego:`,
    '',
    `Imię i nazwisko: ${input.name}`,
    `Email: ${input.email}`,
    '',
    'Wiadomość:',
    input.message,
    '',
    `Data: ${createdAtIso}`
  ]

  if (input.pageUrl) {
    lines.push(`Strona: ${input.pageUrl}`)
  }

  const text = lines.join('\n')

  const htmlLines: string[] = [
    '<p>Nowa wiadomość z formularza kontaktowego:</p>',
    '<ul>',
    `<li><strong>Imię i nazwisko:</strong> ${input.name}</li>`,
    `<li><strong>Email:</strong> ${input.email}</li>`,
    `<li><strong>Data:</strong> ${createdAtIso}</li>`
  ]

  if (input.pageUrl) {
    htmlLines.push(`<li><strong>Strona:</strong> <a href="${input.pageUrl}">${input.pageUrl}</a></li>`)
  }

  htmlLines.push('</ul>')
  htmlLines.push('<p><strong>Wiadomość:</strong></p>')
  htmlLines.push(`<p>${input.message.replace(/\n/g, '<br/>')}</p>`)

  const html = htmlLines.join('\n')

  const config = getEmailConfig()

  return {
    to: config.toContact,
    subject,
    text,
    html,
    replyTo: input.email
  }
}

export async function sendContactEmail(
  input: ContactFormInput & { createdAt: Date, pageUrl?: string }
): Promise<EmailSendResult> {
  const payload = buildContactEmailTemplate(input)
  const emailProvider = getProvider()
  return await emailProvider.send(payload)
}
