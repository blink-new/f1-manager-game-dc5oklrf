import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Trophy, 
  DollarSign, 
  Users, 
  Car,
  TrendingUp,
  Calendar,
  Flag,
  Zap
} from 'lucide-react'
import { blink } from '../../blink/client'
import { initializeUserData, Team, Driver } from '../../lib/gameData'

export function Dashboard() {
  const [teamData, setTeamData] = useState<Team | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const user = await blink.auth.me()
      const { team, drivers: userDrivers } = initializeUserData(user.id)
      
      setTeamData(team)
      setDrivers(userDrivers)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!teamData) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-muted-foreground">Failed to load team data</p>
        </div>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Team Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to {teamData.name}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Championship Position</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">#{teamData.position}</div>
            <p className="text-xs text-muted-foreground">
              {teamData.championshipPoints} points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(teamData.budget)}</div>
            <p className="text-xs text-muted-foreground">
              Available funds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Reputation</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamData.reputation}/100</div>
            <Progress value={teamData.reputation} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              Under contract
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Drivers Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Driver Lineup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {drivers.map((driver) => (
              <div key={driver.id} className="p-4 border border-border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground">{driver.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Contract: {driver.contractYears} year{driver.contractYears !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Skill: {driver.skill}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Skill Level</span>
                    <span className="font-medium">{driver.skill}/100</span>
                  </div>
                  <Progress value={driver.skill} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Salary</span>
                    <span className="font-medium">{formatCurrency(driver.salary)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Car className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Develop Car</h3>
            <p className="text-sm text-muted-foreground">
              Upgrade your car's performance
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Flag className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Next Race</h3>
            <p className="text-sm text-muted-foreground">
              Prepare for the upcoming race
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
          <CardContent className="p-6 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Season Calendar</h3>
            <p className="text-sm text-muted-foreground">
              View all upcoming races
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}