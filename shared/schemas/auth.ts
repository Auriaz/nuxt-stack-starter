import {
  object,
  string,
  minLength,
  number,
  optional,
  email,
  pipe,
  boolean
} from 'valibot'

/**
 * Schemat inputu dla logowania
 */
export const LoginInputSchema = object({
  email: pipe(string(), email('Invalid email format')),
  password: pipe(string(), minLength(1, 'Password is required')),
  remember: optional(string())
})

/**
 * Schemat inputu dla rejestracji (tylko pola wysyłane do API)
 */
export const RegisterInputSchema = object({
  username: pipe(string(), minLength(3, 'Username must be at least 3 characters')),
  email: pipe(string(), email('Invalid email format')),
  password: pipe(string(), minLength(8, 'Password must be at least 8 characters'))
})

/**
 * Schemat formularza rejestracji (z passwordConfirm dla UI)
 * passwordConfirm jest wymagane w schemacie, aby UAuthForm mógł poprawnie walidować
 */
export const RegisterFormSchema = object({
  username: pipe(string(), minLength(3, 'Nazwa użytkownika musi mieć co najmniej 3 znaki')),
  email: pipe(string(), email('Nieprawidłowy adres email')),
  password: pipe(string(), minLength(8, 'Hasło musi mieć co najmniej 8 znaków')),
  passwordConfirm: pipe(string(), minLength(1, 'Potwierdzenie hasła jest wymagane')),
  isAgreedToTerms: boolean()
})

/**
 * Schemat inputu dla żądania resetu hasła
 */
export const ForgotPasswordInputSchema = object({
  email: pipe(string(), email('Invalid email format'))
})

/**
 * Schemat inputu dla resetu hasła
 */
export const ResetPasswordInputSchema = object({
  email: pipe(string(), email('Invalid email format')),
  password: pipe(string(), minLength(8, 'Password must be at least 8 characters')),
  token: pipe(string(), minLength(1, 'Token is required'))
})

/**
 * Schemat outputu dla autoryzacji
 */
export const AuthOutputSchema = object({
  user: object({
    id: number(),
    username: string(),
    email: string()
  })
})

/**
 * Schemat inputu dla weryfikacji adresu e-mail
 */
export const VerifyEmailInputSchema = object({
  token: pipe(string(), minLength(1, 'Token is required'))
})

/**
 * Schemat inputu dla ponownej wysyłki maila weryfikacyjnego
 */
export const ResendVerificationInputSchema = object({
  email: pipe(string(), email('Invalid email format'))
})
