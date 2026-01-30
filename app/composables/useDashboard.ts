export const useDashboard = () => {
  const sidebarCollapsed = useState('dashboard-sidebar-collapsed', () => true)
  const currentPage = useState('dashboard-current-page', () => '')

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setCurrentPage = (page: string) => {
    currentPage.value = page
  }

  return {
    sidebarCollapsed,
    currentPage,
    toggleSidebar,
    setCurrentPage
  }
}
