import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Edit,
  UserPlus,
  Trophy,
  Zap,
  Target
} from 'lucide-react'
import { blink } from '../../blink/client'
import { 
  getTeam, 
  getDrivers, 
  updateDriver, 
  updateTeam,
  Team,
  Driver
} from '../../lib/gameData'

export function TeamManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [teamData, setTeamData] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    loadTeamData()
  }, [])

  const loadTeamData = async () => {
    try {
      const user = await blink.auth.me()
      const team = getTeam(user.id)
      const userDrivers = getDrivers(user.id)
      
      setTeamData(team)
      setDrivers(userDrivers)
    } catch (error) {
      console.error('Error loading team data:', error)
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

  const getSkillColor = (skill: number) => {
    if (skill >= 80) return 'text-green-400'
    if (skill >= 70) return 'text-yellow-400'
    if (skill >= 60) return 'text-orange-400'
    return 'text-red-400'
  }

  const getContractStatus = (contractYears: number) => {
    if (contractYears <= 0.5) return { text: 'Expiring Soon', color: 'destructive' }
    if (contractYears <= 1) return { text: 'Short Term', color: 'secondary' }
    return { text: 'Secure', color: 'default' }
  }

  const handleNegotiateContract = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsEditDialogOpen(true)
  }

  const handleSaveContract = () => {
    if (selectedDriver) {
      // Update driver in the list and storage
      updateDriver(selectedDriver)
      setDrivers(prev => prev.map(d => 
        d.id === selectedDriver.id ? selectedDriver : d
      ))
      setIsEditDialogOpen(false)
      setSelectedDriver(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Team Management</h1>
        <p className="text-muted-foreground">Manage your drivers and team contracts</p>
      </div>

      {/* Team Overview */}
      {teamData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{formatCurrency(teamData.budget)}</div>
              <p className="text-xs text-muted-foreground">Available for contracts</p>
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
              <CardTitle className="text-sm font-medium">Championship Position</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">#{teamData.position}</div>
              <p className="text-xs text-muted-foreground">{teamData.championshipPoints} points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers.length}</div>
              <p className="text-xs text-muted-foreground">Under contract</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Driver Management */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Driver Lineup</h2>
          <Button className="bg-primary hover:bg-primary/90">
            <UserPlus className="w-4 h-4 mr-2" />
            Scout New Driver
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {drivers.map((driver) => {
            const contractStatus = getContractStatus(driver.contractYears)
            
            return (
              <Card key={driver.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{driver.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {driver.nationality} • Age {driver.age} • {driver.experience} years experience
                      </p>
                    </div>
                    <Badge variant={contractStatus.color as any}>
                      {contractStatus.text}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Skill Rating */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Skill</span>
                      <span className={`text-lg font-bold ${getSkillColor(driver.skill)}`}>
                        {driver.skill}/100
                      </span>
                    </div>
                    <Progress value={driver.skill} className="h-2" />
                  </div>

                  {/* Specialties */}
                  <div>
                    <span className="text-sm font-medium mb-2 block">Specialties</span>
                    <div className="flex flex-wrap gap-2">
                      {driver.specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Contract Details */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Contract</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {driver.contractYears} year{driver.contractYears !== 1 ? 's' : ''} remaining
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Salary</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(driver.salary)}/year
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleNegotiateContract(driver)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Negotiate
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Target className="w-4 h-4 mr-2" />
                      Train
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Contract Negotiation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contract Negotiation</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg">{selectedDriver.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Current: {formatCurrency(selectedDriver.salary)}/year • {selectedDriver.contractYears} years
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="salary">Annual Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={selectedDriver.salary}
                    onChange={(e) => setSelectedDriver({
                      ...selectedDriver,
                      salary: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="contract">Contract Length (years)</Label>
                  <Input
                    id="contract"
                    type="number"
                    min="1"
                    max="5"
                    value={selectedDriver.contractYears}
                    onChange={(e) => setSelectedDriver({
                      ...selectedDriver,
                      contractYears: parseInt(e.target.value) || 1
                    })}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleSaveContract}
                >
                  Save Contract
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}