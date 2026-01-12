import * as v from 'valibot'
import { ContactFormSchema } from '#shared/schemas/api'

export default defineEventHandler(async (event) => {
  // Sprawdź metodę
  if (event.method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: 'Method Not Allowed',
    })
  }

  try {
    // Pobierz dane z body
    const body = await readBody(event)

    // Walidacja używając Valibot
    const validatedData = v.parse(ContactFormSchema, body)

    // Tutaj możesz dodać logikę wysyłania emaila
    // Przykład: await sendEmail(validatedData)

    // Logowanie w konsoli (w produkcji użyj właściwego loggera)
    // eslint-disable-next-line no-console
    console.log('Contact form submission:', {
      name: validatedData.name,
      email: validatedData.email,
      subject: validatedData.subject,
      timestamp: new Date().toISOString(),
    })

    // Symulacja opóźnienia (usuń w produkcji)
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      success: true,
      message: 'Wiadomość została wysłana pomyślnie. Skontaktujemy się z Tobą wkrótce.',
    }
  } catch (error) {
    // Obsługa błędów walidacji Valibot
    if (error instanceof v.ValiError) {
      // Użyj prostszego podejścia - zwróć pierwszy komunikat błędu lub wszystkie
      const errorMessages = error.issues.map((issue) => issue.message || 'Validation error')
      const errorMessage = errorMessages.join(', ') || 'Validation Error'

      throw createError({
        statusCode: 400,
        statusMessage: errorMessage,
        data: error.issues,
      })
    }

    // Jeśli to już błąd z createError, przekaż go dalej
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    })
  }
})
