/**
 * Typy dla rozszerzonego widoku profilu (sesje, aktywność, security).
 * Używane przez dashboard/profile i composables useProfileSessions, useProfileActivity.
 */

export interface Session {
  id: string | number
  last_activity?: string
  [key: string]: unknown
}

export interface RecentLogin {
  id: string | number
  ip_address?: string
  location?: string
  timestamp: string
}

export interface SecurityInfo {
  email_verified?: boolean
  password_strength?: 'strong' | 'consider_changing' | 'never_changed'
  password_changed_days_ago?: number | null
  two_factor_enabled?: boolean
  active_sessions_count?: number
  last_password_change?: string | null
  failed_login_attempts?: number
  account_type?: string
  roles?: Array<{ slug?: string, name?: string }>
  failed_login_attempts_recent?: Array<{ id?: string, ip_address?: string, user_agent?: string, attempted_at?: string }>
}

export interface ActivityLogItem {
  id: string | number
  action: string
  description?: string
  created_at?: string
}

export interface ActivityStats {
  total_actions?: number
  [key: string]: unknown
}
