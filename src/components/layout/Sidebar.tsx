import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Flag, 
  Calendar, 
  Trophy,
  LogOut,
  Search
} from 'lucide-react'
import { blink } from '../../blink/client'

type Page = 'dashboard' | 'team' | 'car' | 'race' | 'calendar' | 'standings' | 'scout'

interface SidebarProps {
  currentPage: Page
  onPageChange: (page: Page) => void
}

const navigation = [
  { id: 'dashboard' as Page, name: 'Dashboard', icon: LayoutDashboard },
  { id: 'team' as Page, name: 'Team', icon: Users },
  { id: 'scout' as Page, name: 'Scout Drivers', icon: Search },
  { id: 'car' as Page, name: 'Car Development', icon: Car },
  { id: 'race' as Page, name: 'Race Weekend', icon: Flag },
  { id: 'calendar' as Page, name: 'Calendar', icon: Calendar },
  { id: 'standings' as Page, name: 'Standings', icon: Trophy },
]

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold text-primary">F1 Manager</h1>
        <p className="text-sm text-muted-foreground mt-1">Season 2024</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <button
          onClick={() => blink.auth.logout()}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  )
}