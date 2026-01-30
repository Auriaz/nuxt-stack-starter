import { object, string, optional, boolean, number, nullable, pipe, maxLength, minLength, regex } from 'valibot'

/**
 * Schemat outputu profilu użytkownika (GET /api/profile/me)
 */
export const ProfileOutputSchema = object({
  id: number(),
  email: string(),
  username: string(),
  name: optional(string()),
  avatarUrl: optional(string()),
  bio: optional(string()),
  role: string(),
  emailVerifiedAt: optional(string()),
  showEmail: optional(boolean())
})

/**
 * Schemat inputu aktualizacji profilu (PATCH /api/profile/me)
 */
export const UpdateProfileInputSchema = object({
  name: optional(pipe(string(), maxLength(255, 'Imię nie może przekraczać 255 znaków'))),
  avatarUrl: optional(nullable(string())),
  bio: optional(nullable(pipe(string(), maxLength(500, 'Bio nie może przekraczać 500 znaków'))))
})

/**
 * Schemat inputu ustawień prywatności
 */
export const UpdatePrivacyInputSchema = object({
  showEmail: optional(boolean())
})

/**
 * Schemat inputu zmiany hasła (API: PATCH /api/profile/password)
 */
export const UpdatePasswordInputSchema = object({
  currentPassword: string(),
  newPassword: string()
})

/**
 * Schemat potwierdzenia hasła (deaktywacja konta)
 */
export const ConfirmPasswordSchema = object({
  password: pipe(
    string('Hasło jest wymagane'),
    minLength(1, 'Hasło jest wymagane')
  )
})

/**
 * Schemat usunięcia konta (hasło + wpisanie DELETE)
 */
export const DeleteAccountInputSchema = object({
  password: pipe(
    string('Hasło jest wymagane'),
    minLength(1, 'Hasło jest wymagane')
  ),
  confirmation: pipe(
    string('Potwierdzenie jest wymagane'),
    regex(/^DELETE$/, 'Wpisz DELETE aby potwierdzić')
  )
})

/**
 * Schemat formularza zmiany hasła (UI: obecne hasło, nowe hasło, potwierdzenie).
 * Walidacja równości nowe === potwierdzenie w komponencie.
 */
export const UpdatePasswordFormSchema = object({
  currentPassword: pipe(
    string('Obecne hasło jest wymagane'),
    minLength(1, 'Obecne hasło jest wymagane')
  ),
  newPassword: pipe(
    string('Nowe hasło jest wymagane'),
    minLength(8, 'Hasło musi mieć co najmniej 8 znaków'),
    regex(/[A-Z]/, 'Hasło musi zawierać co najmniej jedną wielką literę'),
    regex(/[a-z]/, 'Hasło musi zawierać co najmniej jedną małą literę'),
    regex(/[0-9]/, 'Hasło musi zawierać co najmniej jedną cyfrę'),
    regex(/[^A-Za-z0-9]/, 'Hasło musi zawierać co najmniej jeden znak specjalny')
  ),
  newPasswordConfirm: pipe(
    string('Potwierdzenie hasła jest wymagane'),
    minLength(1, 'Potwierdzenie hasła jest wymagane')
  )
})
