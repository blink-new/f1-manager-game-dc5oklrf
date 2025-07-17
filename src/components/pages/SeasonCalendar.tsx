import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { 
  Calendar, 
  Flag, 
  MapPin, 
  Clock,
  Trophy,
  Thermometer,
  Droplets,
  Sun,
  Cloud,
  CloudRain,
  Play,
  CheckCircle
} from 'lucide-react'
import { getRaces, getCurrentRace, updateRace, Race } from '../../lib/gameData'

export function SeasonCalendar() {
  const [races, setRaces] = useState<Race[]>([])
  const [currentRace, setCurrentRace] = useState<Race | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRaces()
  }, [])

  const loadRaces = () => {
    try {
      const allRaces = getRaces()
      const activeRace = getCurrentRace()
      
      setRaces(allRaces)
      setCurrentRace(activeRace)
    } catch (error) {
      console.error('Error loading races:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'active': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'upcoming': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-400" />
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-400" />
      case 'rain': return <CloudRain className="h-4 w-4 text-blue-400" />
      default: return <Sun className="h-4 w-4 text-yellow-400" />
    }
  }

  const getTrackConditionColor = (condition: string) => {
    switch (condition) {
      case 'dry': return 'text-green-400'
      case 'damp': return 'text-yellow-400'
      case 'wet': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const activateRace = (raceId: string) => {
    const race = races.find(r => r.id === raceId)
    if (!race) return

    // Deactivate current race
    if (currentRace) {
      const updatedCurrentRace = { ...currentRace, status: 'completed' as const }
      updateRace(updatedCurrentRace)
    }

    // Activate new race
    const updatedRace = { ...race, status: 'active' as const }
    updateRace(updatedRace)
    
    // Update local state
    setRaces(prev => prev.map(r => {
      if (r.id === raceId) return updatedRace
      if (r.id === currentRace?.id) return { ...r, status: 'completed' as const }
      return r
    }))
    setCurrentRace(updatedRace)
  }

  const completedRaces = races.filter(race => race.status === 'completed').length
  const totalRaces = races.length
  const seasonProgress = (completedRaces / totalRaces) * 100

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Season Calendar</h1>
        <p className="text-muted-foreground">2024 Formula 1 World Championship</p>
      </div>

      {/* Season Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Season Progress</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {completedRaces}/{totalRaces}
            </div>
            <Progress value={seasonProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {seasonProgress.toFixed(0)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Race</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentRace ? currentRace.name : 'Season Complete'}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentRace ? currentRace.location : 'All races finished'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Race</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {(() => {
              const nextRace = races.find(race => race.status === 'upcoming')
              return nextRace ? (
                <>
                  <div className="text-2xl font-bold">{formatDate(nextRace.date)}</div>
                  <p className="text-xs text-muted-foreground">{nextRace.name}</p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-bold">Season End</div>
                  <p className="text-xs text-muted-foreground">No upcoming races</p>
                </>
              )
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Race Calendar */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Race Calendar</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {races.map((race) => (
            <Card key={race.id} className={`overflow-hidden transition-all ${
              race.status === 'active' ? 'ring-2 ring-primary' : ''
            }`}>
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        Round {race.roundNumber}
                      </Badge>
                      <Badge className={getStatusColor(race.status)}>
                        {race.status === 'active' && <Play className="w-3 h-3 mr-1" />}
                        {race.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {race.status === 'upcoming' && <Clock className="w-3 h-3 mr-1" />}
                        {race.status.charAt(0).toUpperCase() + race.status.slice(1)}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{race.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{race.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatDate(race.date)}</p>
                    <p className="text-xs text-muted-foreground">{race.laps} laps</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Weather and Track Conditions */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      {getWeatherIcon(race.weather)}
                      <span className="text-sm font-medium">Weather</span>
                    </div>
                    <p className="text-xs text-muted-foreground capitalize">{race.weather}</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Thermometer className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Temp</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{race.temperature}°C</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Droplets className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Track</span>
                    </div>
                    <p className={`text-xs capitalize ${getTrackConditionColor(race.trackCondition)}`}>
                      {race.trackCondition}
                    </p>
                  </div>
                </div>

                {/* Race Actions */}
                <div className="flex gap-2 pt-2">
                  {race.status === 'upcoming' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => activateRace(race.id)}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Race Weekend
                    </Button>
                  )}
                  
                  {race.status === 'active' && (
                    <Button 
                      size="sm" 
                      className="flex-1 bg-primary hover:bg-primary/90"
                    >
                      <Flag className="w-4 h-4 mr-2" />
                      Go to Race
                    </Button>
                  )}
                  
                  {race.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                    >
                      <Trophy className="w-4 h-4 mr-2" />
                      View Results
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Season Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Season Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{completedRaces}</div>
              <p className="text-sm text-muted-foreground">Races Completed</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {races.filter(r => r.status === 'upcoming').length}
              </div>
              <p className="text-sm text-muted-foreground">Races Remaining</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {races.filter(r => r.weather === 'rain').length}
              </div>
              <p className="text-sm text-muted-foreground">Wet Races</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {races.filter(r => r.trackCondition === 'dry').length}
              </div>
              <p className="text-sm text-muted-foreground">Dry Races</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}