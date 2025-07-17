import { useState, useEffect } from 'react'
import { blink } from './blink/client'
import { Sidebar } from './components/layout/Sidebar'
import { Dashboard } from './components/pages/Dashboard'
import { TeamManagement } from './components/pages/TeamManagement'
import { CarDevelopment } from './components/pages/CarDevelopment'
import { RaceWeekend } from './components/pages/RaceWeekend'
import { SeasonCalendar } from './components/pages/SeasonCalendar'
import { Standings } from './components/pages/Standings'
import { ScoutDrivers } from './components/pages/ScoutDrivers'

type Page = 'dashboard' | 'team' | 'car' | 'race' | 'calendar' | 'standings' | 'scout'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState<Page>('dashboard')

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading F1 Manager...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h1 className="text-4xl font-bold text-primary mb-4">F1 Manager</h1>
          <p className="text-muted-foreground mb-8">
            Build your Formula 1 empire. Manage drivers, develop cars, and compete for the championship.
          </p>
          <button
            onClick={() => blink.auth.login()}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Start Your F1 Journey
          </button>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'team':
        return <TeamManagement />
      case 'car':
        return <CarDevelopment />
      case 'race':
        return <RaceWeekend />
      case 'calendar':
        return <SeasonCalendar />
      case 'standings':
        return <Standings />
      case 'scout':
        return <ScoutDrivers />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-auto">
        {renderPage()}
      </main>
    </div>
  )
}

export default App