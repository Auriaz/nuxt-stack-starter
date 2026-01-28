import { safeParse } from 'valibot'
import { ContactFormInputSchema } from '#shared/schemas/api'
import type { ContactFormInput } from '#shared/types/api'
import { prisma } from '../utils/db'
import { sendContactEmail } from '../services/email/email.service'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parseResult = safeParse(ContactFormInputSchema, body)

  if (!parseResult.success) {
    throw createError({
      status: 422,
      statusText: 'Invalid input',
      data: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          status: 422,
          issues: parseResult.issues
        }
      }
    })
  }

  const input = parseResult.output as ContactFormInput

  // Honeypot – jeśli wypełnione, udajemy sukces bez dalszego przetwarzania
  if (input.honeypot && input.honeypot.trim().length > 0) {
    return {
      data: {
        ok: true
      }
    }
  }

  const createdAt = new Date()

  // Zapisz wiadomość w bazie
  const message = await prisma.contactMessage.create({
    data: {
      name: input.name,
      email: input.email,
      message: input.message,
      createdAt
    }
  })

  try {
    await sendContactEmail({
      ...input,
      createdAt
    })

    await prisma.contactMessage.update({
      where: { id: message.id },
      data: {
        emailSent: true,
        emailErrorCode: null
      }
    })
  } catch (error) {
    const err = error as Error & { providerCode?: string }

    await prisma.contactMessage.update({
      where: { id: message.id },
      data: {
        emailSent: false,
        emailErrorCode: err.providerCode ?? 'UNKNOWN'
      }
    })

    throw createError({
      status: 500,
      statusText: 'Email send failed',
      data: {
        error: {
          code: err.providerCode ?? 'INTERNAL_SERVER_ERROR',
          message: 'Email send failed',
          status: 500
        }
      }
    })
  }

  return {
    data: {
      ok: true
    }
  }
})
