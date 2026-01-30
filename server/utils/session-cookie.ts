/**
 * Nazwa ciasteczka przechowującego token sesji w DB (do listy sesji i "wyloguj inne").
 * Ustawiane przy logowaniu, odczytywane w GET /api/profile/sessions i POST /api/profile/sessions/logout-others.
 */
export const APP_SESSION_ID_COOKIE = 'app_session_id'
