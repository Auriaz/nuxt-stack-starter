/**
 * Composable do akcji na koncie: eksport danych (GDPR), deaktywacja, usunięcie konta.
 * Używa useAccountActionsResource do wywołań API.
 */

import { useAccountActionsResource } from '~/composables/resources/useAccountActionsResource'

export function useAccountActions() {
  const resource = useAccountActionsResource()
  const { logout } = useAuth()
  const toast = useToast()
  const isLoading = ref(false)
  const errors = ref<Record<string, string>>({})

  async function exportData(): Promise<boolean> {
    isLoading.value = true
    errors.value = {}
    try {
      const data = await resource.exportData()
      const blob = data instanceof Blob
        ? data
        : new Blob([JSON.stringify(data ?? {}, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `export-danych-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.add({
        title: 'Eksport zakończony',
        description: 'Dane zostały pobrane.',
        color: 'success'
      })
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nie udało się wyeksportować danych'
      errors.value = { root: message }
      toast.add({
        title: 'Błąd eksportu',
        description: message,
        color: 'error'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deactivateAccount(password: string): Promise<boolean> {
    isLoading.value = true
    errors.value = {}
    try {
      await resource.deactivateAccount(password)
      toast.add({
        title: 'Konto deaktywowane',
        description: 'Twoje konto zostało tymczasowo wyłączone. Zostaniesz wylogowany.',
        color: 'success'
      })
      await logout()
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nie udało się deaktywować konta'
      errors.value = { root: message }
      toast.add({
        title: 'Błąd',
        description: message,
        color: 'error'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteAccount(password: string, confirmation: string): Promise<boolean> {
    isLoading.value = true
    errors.value = {}
    try {
      await resource.deleteAccount(password, confirmation)
      toast.add({
        title: 'Konto usunięte',
        description: 'Twoje konto zostało trwale usunięte. Zostaniesz wylogowany.',
        color: 'success'
      })
      await logout()
      return true
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Nie udało się usunąć konta'
      errors.value = { root: message }
      toast.add({
        title: 'Błąd',
        description: message,
        color: 'error'
      })
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    exportData,
    deactivateAccount,
    deleteAccount,
    isLoading: readonly(isLoading),
    errors: readonly(errors)
  }
}
