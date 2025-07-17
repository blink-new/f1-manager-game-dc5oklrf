import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { 
  Car, 
  Zap, 
  Wind, 
  Settings, 
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Wrench
} from 'lucide-react'
import { blink } from '../../blink/client'

interface CarComponent {
  id: string
  name: string
  category: 'engine' | 'aerodynamics' | 'chassis' | 'electronics'
  level: number
  maxLevel: number
  performance: number
  reliability: number
  developmentCost: number
  developmentTime: number // in days
  isUpgrading: boolean
  upgradeProgress: number
}

interface TeamData {
  budget: number
  researchPoints: number
}

export function CarDevelopment() {
  const [components, setComponents] = useState<CarComponent[]>([])
  const [teamData, setTeamData] = useState<TeamData>({ budget: 45000000, researchPoints: 850 })
  const [loading, setLoading] = useState(true)
  const [selectedComponent, setSelectedComponent] = useState<CarComponent | null>(null)
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false)

  useEffect(() => {
    loadCarData()
  }, [])

  const loadCarData = async () => {
    try {
      // Mock car components data
      const mockComponents: CarComponent[] = [
        {
          id: 'engine_1',
          name: 'Power Unit',
          category: 'engine',
          level: 3,
          maxLevel: 10,
          performance: 72,
          reliability: 85,
          developmentCost: 8500000,
          developmentTime: 14,
          isUpgrading: false,
          upgradeProgress: 0
        },
        {
          id: 'aero_1',
          name: 'Front Wing',
          category: 'aerodynamics',
          level: 4,
          maxLevel: 10,
          performance: 78,
          reliability: 92,
          developmentCost: 6200000,
          developmentTime: 10,
          isUpgrading: true,
          upgradeProgress: 65
        },
        {
          id: 'aero_2',
          name: 'Rear Wing',
          category: 'aerodynamics',
          level: 3,
          maxLevel: 10,
          performance: 70,
          reliability: 88,
          developmentCost: 5800000,
          developmentTime: 12,
          isUpgrading: false,
          upgradeProgress: 0
        },
        {
          id: 'chassis_1',
          name: 'Monocoque',
          category: 'chassis',
          level: 5,
          maxLevel: 10,
          performance: 82,
          reliability: 95,
          developmentCost: 12000000,
          developmentTime: 21,
          isUpgrading: false,
          upgradeProgress: 0
        },
        {
          id: 'chassis_2',
          name: 'Suspension',
          category: 'chassis',
          level: 2,
          maxLevel: 10,
          performance: 65,
          reliability: 78,
          developmentCost: 4500000,
          developmentTime: 8,
          isUpgrading: false,
          upgradeProgress: 0
        },
        {
          id: 'electronics_1',
          name: 'ECU System',
          category: 'electronics',
          level: 6,
          maxLevel: 10,
          performance: 88,
          reliability: 96,
          developmentCost: 3200000,
          developmentTime: 7,
          isUpgrading: false,
          upgradeProgress: 0
        }
      ]
      
      setComponents(mockComponents)
    } catch (error) {
      console.error('Error loading car data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'engine': return <Zap className="w-5 h-5" />
      case 'aerodynamics': return <Wind className="w-5 h-5" />
      case 'chassis': return <Car className="w-5 h-5" />
      case 'electronics': return <Settings className="w-5 h-5" />
      default: return <Wrench className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'engine': return 'text-red-400'
      case 'aerodynamics': return 'text-blue-400'
      case 'chassis': return 'text-green-400'
      case 'electronics': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 85) return 'text-green-400'
    if (performance >= 70) return 'text-yellow-400'
    if (performance >= 55) return 'text-orange-400'
    return 'text-red-400'
  }

  const handleUpgradeComponent = (component: CarComponent) => {
    setSelectedComponent(component)
    setIsUpgradeDialogOpen(true)
  }

  const confirmUpgrade = () => {
    if (selectedComponent && teamData.budget >= selectedComponent.developmentCost) {
      // Start upgrade
      setComponents(prev => prev.map(comp => 
        comp.id === selectedComponent.id 
          ? { ...comp, isUpgrading: true, upgradeProgress: 0 }
          : comp
      ))
      
      // Deduct cost
      setTeamData(prev => ({
        ...prev,
        budget: prev.budget - selectedComponent.developmentCost
      }))
      
      setIsUpgradeDialogOpen(false)
      setSelectedComponent(null)
    }
  }

  const getOverallPerformance = () => {
    const totalPerformance = components.reduce((sum, comp) => sum + comp.performance, 0)
    return Math.round(totalPerformance / components.length)
  }

  const getOverallReliability = () => {
    const totalReliability = components.reduce((sum, comp) => sum + comp.reliability, 0)
    return Math.round(totalReliability / components.length)
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Car Development</h1>
        <p className="text-muted-foreground">Upgrade your car's performance and technology</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Performance</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getPerformanceColor(getOverallPerformance())}`}>
              {getOverallPerformance()}/100
            </div>
            <Progress value={getOverallPerformance()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reliability</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{getOverallReliability()}/100</div>
            <Progress value={getOverallReliability()} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Development Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(teamData.budget)}</div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Research Points</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{teamData.researchPoints}</div>
            <p className="text-xs text-muted-foreground">Available for upgrades</p>
          </CardContent>
        </Card>
      </div>

      {/* Components Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Car Components</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {components.map((component) => (
            <Card key={component.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className={getCategoryColor(component.category)}>
                      {getCategoryIcon(component.category)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{component.name}</CardTitle>
                      <p className="text-sm text-muted-foreground capitalize">
                        {component.category}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    Level {component.level}/{component.maxLevel}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Performance Metrics */}
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Performance</span>
                      <span className={`text-sm font-bold ${getPerformanceColor(component.performance)}`}>
                        {component.performance}/100
                      </span>
                    </div>
                    <Progress value={component.performance} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium">Reliability</span>
                      <span className="text-sm font-bold text-green-400">
                        {component.reliability}/100
                      </span>
                    </div>
                    <Progress value={component.reliability} className="h-2" />
                  </div>
                </div>

                {/* Upgrade Status */}
                {component.isUpgrading ? (
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-400">Upgrading...</span>
                    </div>
                    <Progress value={component.upgradeProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      {component.upgradeProgress}% complete
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Upgrade Cost</span>
                      <span className="font-medium">{formatCurrency(component.developmentCost)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Development Time</span>
                      <span className="font-medium">{component.developmentTime} days</span>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button 
                  className="w-full"
                  disabled={component.isUpgrading || component.level >= component.maxLevel || teamData.budget < component.developmentCost}
                  onClick={() => handleUpgradeComponent(component)}
                >
                  {component.isUpgrading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2" />
                      Upgrading...
                    </>
                  ) : component.level >= component.maxLevel ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Max Level
                    </>
                  ) : teamData.budget < component.developmentCost ? (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Insufficient Funds
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade to Level {component.level + 1}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upgrade Confirmation Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Upgrade</DialogTitle>
          </DialogHeader>
          {selectedComponent && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className={getCategoryColor(selectedComponent.category)}>
                    {getCategoryIcon(selectedComponent.category)}
                  </div>
                  <h3 className="font-semibold text-lg">{selectedComponent.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Level {selectedComponent.level} → Level {selectedComponent.level + 1}
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-semibold">{formatCurrency(selectedComponent.developmentCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Development Time:</span>
                  <span className="font-semibold">{selectedComponent.developmentTime} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining Budget:</span>
                  <span className="font-semibold">
                    {formatCurrency(teamData.budget - selectedComponent.developmentCost)}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsUpgradeDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={confirmUpgrade}
                >
                  Start Upgrade
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}