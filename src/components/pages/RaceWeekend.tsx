import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { 
  Flag, 
  Play, 
  Pause,
  RotateCcw,
  Timer,
  Thermometer,
  Droplets,
  Wind,
  Trophy,
  Target,
  Fuel,
  Wrench,
  TrendingUp,
  TrendingDown,
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle,
  FastForward,
  SkipForward
} from 'lucide-react'
import { blink } from '../../blink/client'
import { 
  getCurrentRace, 
  getDrivers, 
  getTeam, 
  saveRaceResult, 
  updateTeam,
  Race,
  Driver as GameDriver,
  Team
} from '../../lib/gameData'

interface RaceDriver {
  id: string
  name: string
  position: number
  lapTime: string
  bestLap: string
  tyreCompound: 'soft' | 'medium' | 'hard'
  tyreWear: number
  fuel: number
  isInPits: boolean
  pitStops: number
  skill: number
  dnf: boolean
  points: number
}

interface RaceData {
  currentLap: number
  totalLaps: number
  raceStatus: 'preparation' | 'qualifying' | 'race' | 'finished'
  weather: 'sunny' | 'cloudy' | 'rain'
  temperature: number
  trackCondition: 'dry' | 'damp' | 'wet'
  isRunning: boolean
  raceSpeed: number // 1x, 2x, 4x speed
}

interface StrategyOption {
  id: string
  name: string
  description: string
  tyreCompound: 'soft' | 'medium' | 'hard'
  estimatedStops: number
}

const STRATEGY_OPTIONS: StrategyOption[] = [
  { id: 'aggressive', name: 'Aggressive', description: 'Soft tyres, early stops', tyreCompound: 'soft', estimatedStops: 2 },
  { id: 'balanced', name: 'Balanced', description: 'Medium tyres, standard stops', tyreCompound: 'medium', estimatedStops: 1 },
  { id: 'conservative', name: 'Conservative', description: 'Hard tyres, minimal stops', tyreCompound: 'hard', estimatedStops: 1 }
]

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]

export function RaceWeekend() {
  const [drivers, setDrivers] = useState<RaceDriver[]>([])
  const [raceData, setRaceData] = useState<RaceData>({
    currentLap: 0,
    totalLaps: 58,
    raceStatus: 'preparation',
    weather: 'sunny',
    temperature: 24,
    trackCondition: 'dry',
    isRunning: false,
    raceSpeed: 1
  })
  const [currentRace, setCurrentRace] = useState<Race | null>(null)
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [strategyDialogOpen, setStrategyDialogOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<RaceDriver | null>(null)
  const [raceEvents, setRaceEvents] = useState<string[]>([])

  useEffect(() => {
    loadRaceData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (raceData.isRunning && raceData.raceStatus === 'race') {
      const speed = raceData.raceSpeed === 1 ? 3000 : raceData.raceSpeed === 2 ? 1500 : 750
      interval = setInterval(() => {
        simulateRaceTick()
      }, speed)
    }
    return () => clearInterval(interval)
  }, [raceData.isRunning, raceData.raceStatus, raceData.raceSpeed, simulateRaceTick])

  const loadRaceData = async () => {
    try {
      const user = await blink.auth.me()
      const race = getCurrentRace()
      const userTeam = getTeam(user.id)
      const userDrivers = getDrivers(user.id)
      
      setCurrentRace(race)
      setTeam(userTeam)
      
      if (race) {
        setRaceData(prev => ({
          ...prev,
          totalLaps: race.laps,
          weather: race.weather,
          temperature: race.temperature,
          trackCondition: race.trackCondition
        }))
      }
      
      // Convert game drivers to race drivers
      const raceDrivers: RaceDriver[] = userDrivers.map((driver, index) => ({
        id: driver.id,
        name: driver.name,
        position: 8 + index, // Start in midfield
        lapTime: generateRandomLapTime(driver.skill),
        bestLap: generateRandomLapTime(driver.skill),
        tyreCompound: 'medium',
        tyreWear: 0,
        fuel: 100,
        isInPits: false,
        pitStops: 0,
        skill: driver.skill,
        dnf: false,
        points: 0
      }))
      
      setDrivers(raceDrivers)
    } catch (error) {
      console.error('Error loading race data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateRandomLapTime = (skill: number) => {
    const baseTime = 83 + (100 - skill) * 0.05 + Math.random() * 2
    const minutes = Math.floor(baseTime / 60)
    const seconds = (baseTime % 60).toFixed(3)
    return `${minutes}:${seconds.padStart(6, '0')}`
  }

  const simulateRaceTick = useCallback(() => {
    setRaceData(prev => {
      if (prev.currentLap >= prev.totalLaps) {
        finishRace()
        return { ...prev, raceStatus: 'finished', isRunning: false }
      }
      return { ...prev, currentLap: prev.currentLap + 1 }
    })

    setDrivers(prev => prev.map(driver => {
      if (driver.dnf) return driver
      
      const skillFactor = driver.skill / 100
      const weatherPenalty = raceData.weather === 'rain' ? 0.1 : 0
      const tyrePenalty = driver.tyreWear / 100 * 0.05
      
      // Position changes based on skill and conditions
      let positionChange = 0
      if (Math.random() < 0.3) {
        positionChange = Math.random() < (skillFactor - weatherPenalty - tyrePenalty) ? -1 : 1
      }
      
      // Random events
      if (Math.random() < 0.001) {
        setRaceEvents(prev => [...prev, `${driver.name} has a mechanical failure!`])
        return { ...driver, dnf: true }
      }
      
      return {
        ...driver,
        tyreWear: Math.min(100, driver.tyreWear + Math.random() * 3 + (driver.tyreCompound === 'soft' ? 1 : 0)),
        fuel: Math.max(0, driver.fuel - Math.random() * 1.5),
        lapTime: generateRandomLapTime(driver.skill),
        position: Math.max(1, Math.min(20, driver.position + positionChange))
      }
    }))
  }, [raceData.weather, raceData.totalLaps]) // eslint-disable-line react-hooks/exhaustive-deps

  const finishRace = async () => {
    if (!currentRace || !team) return
    
    const user = await blink.auth.me()
    
    // Calculate points and save results
    const sortedDrivers = [...drivers].sort((a, b) => a.position - b.position)
    
    let totalPoints = 0
    for (const driver of sortedDrivers) {
      if (!driver.dnf && driver.position <= 10) {
        const points = POINTS_SYSTEM[driver.position - 1] || 0
        driver.points = points
        totalPoints += points
        
        // Save race result
        saveRaceResult({
          userId: user.id,
          raceId: currentRace.id,
          driverId: driver.id,
          position: driver.position,
          points,
          bestLap: driver.bestLap,
          pitStops: driver.pitStops,
          dnf: driver.dnf
        })
      }
    }
    
    // Update team championship points
    if (team) {
      const updatedTeam = {
        ...team,
        championshipPoints: team.championshipPoints + totalPoints
      }
      updateTeam(updatedTeam)
      setTeam(updatedTeam)
    }
    
    setRaceEvents(prev => [...prev, `Race finished! Team scored ${totalPoints} points.`])
  }

  const startRace = () => {
    setRaceData(prev => ({ ...prev, raceStatus: 'race', isRunning: true }))
    setRaceEvents(['Race started! Lights out and away we go!'])
  }

  const pauseRace = () => {
    setRaceData(prev => ({ ...prev, isRunning: false }))
  }

  const resumeRace = () => {
    setRaceData(prev => ({ ...prev, isRunning: true }))
  }

  const resetRace = () => {
    setRaceData(prev => ({ 
      ...prev, 
      currentLap: 0, 
      raceStatus: 'preparation', 
      isRunning: false 
    }))
    setRaceEvents([])
    loadRaceData()
  }

  const callPitStop = (driverId: string) => {
    setDrivers(prev => prev.map(driver => 
      driver.id === driverId 
        ? { 
            ...driver, 
            isInPits: true, 
            pitStops: driver.pitStops + 1,
            tyreWear: 0,
            tyreCompound: 'medium',
            position: Math.min(20, driver.position + 3) // Lose positions during pit stop
          }
        : driver
    ))

    setRaceEvents(prev => [...prev, `${drivers.find(d => d.id === driverId)?.name} pits for fresh tyres!`])

    // Simulate pit stop duration
    setTimeout(() => {
      setDrivers(prev => prev.map(driver => 
        driver.id === driverId 
          ? { ...driver, isInPits: false }
          : driver
      ))
    }, 3000)
  }

  const openStrategyDialog = (driver: RaceDriver) => {
    setSelectedDriver(driver)
    setStrategyDialogOpen(true)
  }

  const applyStrategy = (strategyId: string) => {
    if (!selectedDriver) return
    
    const strategy = STRATEGY_OPTIONS.find(s => s.id === strategyId)
    if (!strategy) return
    
    setDrivers(prev => prev.map(driver => 
      driver.id === selectedDriver.id 
        ? { ...driver, tyreCompound: strategy.tyreCompound }
        : driver
    ))
    
    setRaceEvents(prev => [...prev, `${selectedDriver.name} switches to ${strategy.name} strategy!`])
    setStrategyDialogOpen(false)
  }

  const getTyreColor = (compound: string) => {
    switch (compound) {
      case 'soft': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-gray-300'
      default: return 'bg-gray-500'
    }
  }

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'sunny': return <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
      case 'cloudy': return <div className="w-4 h-4 bg-gray-400 rounded"></div>
      case 'rain': return <Droplets className="w-4 h-4 text-blue-400" />
      default: return <div className="w-4 h-4 bg-gray-500 rounded"></div>
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentRace) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Flag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Race</h3>
            <p className="text-muted-foreground">
              Go to the Season Calendar to start a race weekend.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Race Weekend</h1>
        <p className="text-muted-foreground">{currentRace.name} • {currentRace.location}</p>
      </div>

      <Tabs defaultValue="race" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="race">Race Control</TabsTrigger>
          <TabsTrigger value="strategy">Strategy</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="race" className="space-y-6">
          {/* Race Status */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Race Progress</CardTitle>
                <Flag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">
                  {raceData.currentLap}/{raceData.totalLaps}
                </div>
                <Progress value={(raceData.currentLap / raceData.totalLaps) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weather</CardTitle>
                {getWeatherIcon(raceData.weather)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{raceData.temperature}°C</div>
                <p className="text-xs text-muted-foreground capitalize">{raceData.weather}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Track Condition</CardTitle>
                <Wind className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{raceData.trackCondition}</div>
                <p className="text-xs text-muted-foreground">Grip level: {raceData.trackCondition === 'dry' ? 'High' : 'Low'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Race Status</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{raceData.raceStatus}</div>
                <Badge variant={raceData.isRunning ? 'default' : 'secondary'} className="mt-2">
                  {raceData.isRunning ? 'Live' : 'Paused'}
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Race Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Race Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {raceData.raceStatus === 'preparation' && (
                  <Button onClick={startRace} className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Start Race
                  </Button>
                )}
                
                {raceData.raceStatus === 'race' && (
                  <>
                    {raceData.isRunning ? (
                      <Button onClick={pauseRace} variant="outline">
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </Button>
                    ) : (
                      <Button onClick={resumeRace} className="bg-green-600 hover:bg-green-700">
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </Button>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Speed:</span>
                      <Button
                        variant={raceData.raceSpeed === 1 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRaceData(prev => ({ ...prev, raceSpeed: 1 }))}
                      >
                        1x
                      </Button>
                      <Button
                        variant={raceData.raceSpeed === 2 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRaceData(prev => ({ ...prev, raceSpeed: 2 }))}
                      >
                        <FastForward className="w-4 h-4" />
                        2x
                      </Button>
                      <Button
                        variant={raceData.raceSpeed === 4 ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setRaceData(prev => ({ ...prev, raceSpeed: 4 }))}
                      >
                        <SkipForward className="w-4 h-4" />
                        4x
                      </Button>
                    </div>
                  </>
                )}
                
                <Button onClick={resetRace} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Race
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Driver Information */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Drivers</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {drivers.map((driver) => (
                <Card key={driver.id} className={`overflow-hidden ${driver.dnf ? 'opacity-50' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{driver.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">P{driver.position}</Badge>
                          {driver.isInPits && (
                            <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
                              In Pits
                            </Badge>
                          )}
                          {driver.dnf && (
                            <Badge variant="destructive">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              DNF
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Current Lap</p>
                        <p className="font-mono font-bold">{driver.lapTime}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Best Lap</p>
                        <p className="font-mono font-semibold">{driver.bestLap}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Pit Stops</p>
                        <p className="font-semibold">{driver.pitStops}</p>
                      </div>
                    </div>

                    {/* Tyre Information */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Tyre Wear</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getTyreColor(driver.tyreCompound)}`}></div>
                          <span className="text-sm capitalize">{driver.tyreCompound}</span>
                        </div>
                      </div>
                      <Progress value={driver.tyreWear} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{driver.tyreWear.toFixed(0)}% worn</p>
                    </div>

                    {/* Fuel Level */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Fuel Level</span>
                        <span className="text-sm">{driver.fuel.toFixed(0)}%</span>
                      </div>
                      <Progress value={driver.fuel} className="h-2" />
                    </div>

                    {/* Strategy Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        disabled={driver.isInPits || driver.dnf || raceData.raceStatus !== 'race'}
                        onClick={() => callPitStop(driver.id)}
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        Pit Stop
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        disabled={driver.dnf}
                        onClick={() => openStrategyDialog(driver)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Race Events */}
          {raceEvents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Race Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {raceEvents.slice(-5).reverse().map((event, index) => (
                    <p key={index} className="text-sm text-muted-foreground">
                      • {event}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Race Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STRATEGY_OPTIONS.map((strategy) => (
                  <Card key={strategy.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-2">{strategy.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{strategy.description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tyre Compound:</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getTyreColor(strategy.tyreCompound)}`}></div>
                            <span className="capitalize">{strategy.tyreCompound}</span>
                          </div>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Estimated Stops:</span>
                          <span>{strategy.estimatedStops}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {raceData.raceStatus === 'finished' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  Race Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {drivers
                    .sort((a, b) => a.position - b.position)
                    .map((driver) => (
                    <div key={driver.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">P{driver.position}</Badge>
                        <span className="font-semibold">{driver.name}</span>
                        {driver.dnf && (
                          <Badge variant="destructive" className="text-xs">DNF</Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm">{driver.bestLap}</p>
                        <p className="text-xs text-muted-foreground">
                          {driver.points > 0 ? `${driver.points} points` : 'No points'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Race Not Finished</h3>
                <p className="text-muted-foreground">
                  Complete the race to see final results and points.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Strategy Dialog */}
      <Dialog open={strategyDialogOpen} onOpenChange={setStrategyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose Strategy</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg">{selectedDriver.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Current Position: P{selectedDriver.position}
                </p>
              </div>
              
              <div className="space-y-3">
                {STRATEGY_OPTIONS.map((strategy) => (
                  <Button
                    key={strategy.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={() => applyStrategy(strategy.id)}
                  >
                    <div className="text-left">
                      <div className="font-semibold">{strategy.name}</div>
                      <div className="text-sm text-muted-foreground">{strategy.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}