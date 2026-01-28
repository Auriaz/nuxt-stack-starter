import { object, string, optional, boolean, array, number } from 'valibot'

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

/**
 * Schemat inputu dla tworzenia użytkownika
 */
export const CreateUserInputSchema = object({
  username: string(),
  email: string()
})

/**
 * Schemat outputu dla pojedynczego użytkownika
 */
export const UserOutputSchema = object({
  id: number(),
  username: string(),
  email: string(),
  createdAt: string(), // ISO date string
  updatedAt: string() // ISO date string
})

/**
 * Schemat outputu dla listy użytkowników
 */
export const UsersOutputSchema = object({
  data: array(UserOutputSchema)
})
