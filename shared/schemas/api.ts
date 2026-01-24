import { object, string, optional, boolean } from 'valibot'

/**
 * Schemat walidacji inputu dla formularza kontaktowego
 */
export const ContactFormInputSchema = object({
  name: string(),
  email: string(),
  message: string(),
  honeypot: optional(string()) // Pole honeypot dla ochrony przed spamem
})

/**
 * Schemat outputu dla formularza kontaktowego (DTO)
 */
export const ContactFormOutputSchema = object({
  id: string(),
  name: string(),
  email: string(),
  message: string(),
  createdAt: string() // ISO date string
})

/**
 * Schemat outputu dla health check endpoint
 */
export const HealthOutputSchema = object({
  ok: boolean(),
  version: string(),
  timestamp: string() // ISO date string
})
