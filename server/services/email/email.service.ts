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

function buildVerificationEmailTemplate(to: string, verificationLink: string): EmailPayload {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public as { siteUrl?: string }

  const baseUrl = publicConfig.siteUrl || 'http://localhost:3000'
  const finalLink = verificationLink.startsWith('http') ? verificationLink : `${baseUrl}${verificationLink}`

  const subject = 'Potwierdź swój adres e-mail'

  const textLines: string[] = [
    'Dziękujemy za rejestrację.',
    '',
    'Aby dokończyć zakładanie konta, potwierdź swój adres e-mail, klikając w poniższy link:',
    finalLink,
    '',
    'Jeśli nie zakładałeś konta, zignoruj tę wiadomość.'
  ]

  const text = textLines.join('\n')

  const htmlLines: string[] = [
    '<p>Dziękujemy za rejestrację.</p>',
    '<p>Aby dokończyć zakładanie konta, potwierdź swój adres e-mail, klikając w przycisk poniżej:</p>',
    `<p><a href="${finalLink}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:4px;">Potwierdź adres e-mail</a></p>`,
    `<p>Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:</p>`,
    `<p><a href="${finalLink}">${finalLink}</a></p>`,
    '<p>Jeśli nie zakładałeś konta, zignoruj tę wiadomość.</p>'
  ]

  const html = htmlLines.join('\n')

  const config = getEmailConfig()

  return {
    to,
    subject,
    text,
    html,
    from: config.from,
    replyTo: config.replyToDefault
  }
}

export async function sendVerificationEmail(
  to: string,
  verificationPath: string
): Promise<EmailSendResult> {
  const payload = buildVerificationEmailTemplate(to, verificationPath)
  const emailProvider = getProvider()
  return await emailProvider.send(payload)
}

function buildPasswordResetEmailTemplate(to: string, resetLink: string): EmailPayload {
  const runtimeConfig = useRuntimeConfig()
  const publicConfig = runtimeConfig.public as { siteUrl?: string }
  const baseUrl = publicConfig.siteUrl || 'http://localhost:3000'
  const finalLink = resetLink.startsWith('http') ? resetLink : `${baseUrl}${resetLink}`

  const subject = 'Reset hasła'

  const textLines: string[] = [
    'Otrzymaliśmy żądanie resetu hasła dla Twojego konta.',
    '',
    'Aby zresetować hasło, kliknij w poniższy link:',
    finalLink,
    '',
    'Link jest ważny przez 60 minut.',
    '',
    'Jeśli nie żądałeś resetu hasła, zignoruj tę wiadomość.'
  ]

  const text = textLines.join('\n')

  const htmlLines: string[] = [
    '<p>Otrzymaliśmy żądanie resetu hasła dla Twojego konta.</p>',
    '<p>Aby zresetować hasło, kliknij w przycisk poniżej:</p>',
    `<p><a href="${finalLink}" style="display:inline-block;padding:10px 16px;background:#0f766e;color:#ffffff;text-decoration:none;border-radius:4px;">Zresetuj hasło</a></p>`,
    `<p>Jeśli przycisk nie działa, skopiuj i wklej poniższy link do przeglądarki:</p>`,
    `<p><a href="${finalLink}">${finalLink}</a></p>`,
    '<p><strong>Link jest ważny przez 60 minut.</strong></p>',
    '<p>Jeśli nie żądałeś resetu hasła, zignoruj tę wiadomość.</p>'
  ]

  const html = htmlLines.join('\n')

  const config = getEmailConfig()

  return {
    to,
    subject,
    text,
    html,
    from: config.from,
    replyTo: config.replyToDefault
  }
}

export async function sendPasswordResetEmail(
  to: string,
  resetPath: string
): Promise<EmailSendResult> {
  const payload = buildPasswordResetEmailTemplate(to, resetPath)
  const emailProvider = getProvider()
  return await emailProvider.send(payload)
}
