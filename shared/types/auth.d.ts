/**
 * Deklaracja typów dla nuxt-auth-utils
 *
 * Rozszerza interfejsy User, UserSession i SecureSessionData
 * zgodnie z dokumentacją: https://nuxt.com/modules/auth-utils
 */
declare module '#auth-utils' {
  /**
   * Interfejs użytkownika - dane dostępne w sesji (klient + serwer)
   * Zgodny z AuthOutputSchema i użyciem w komponentach
   */
  interface User {
    /** ID użytkownika z bazy danych */
    id: number
    /** Nazwa wyświetlana użytkownika (np. z OAuth lub profilu) */
    name?: string
    /** Nazwa użytkownika (unikalna, lokalne konto) */
    username?: string
    /** Email użytkownika (unikalny, jeśli dostępny) */
    email?: string
    /** URL do avatara (np. z GitHub/Google) */
    avatarUrl?: string
    /** Rola użytkownika (np. user, admin) */
    role: string
  }

  /**
   * Interfejs sesji użytkownika - dodatkowe metadane sesji
   * Dostępne w kliencie i na serwerze
   */
  interface UserSession {
    /** Data i czas logowania użytkownika */
    loggedInAt?: Date | number
  }

  /**
   * Interfejs bezpiecznych danych sesji - dostępne TYLKO na serwerze
   * Dane wrażliwe, które nie powinny być dostępne w kliencie
   */
  interface SecureSessionData {
    /** Token API (jeśli będzie potrzebny w przyszłości) */
    apiToken?: string
    /** Uprawnienia użytkownika (jeśli będzie system autoryzacji) */
    permissions?: string[]
    /** Token odświeżania (jeśli będzie potrzebny w przyszłości) */
    refreshToken?: string
  }
}

export {}
