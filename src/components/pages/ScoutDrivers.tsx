import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  UserPlus,
  Trophy,
  Zap,
  Target,
  Search,
  Filter,
  Star,
  Globe
} from 'lucide-react'
import { blink } from '../../blink/client'
import { 
  getAvailableDrivers, 
  signDriver, 
  getTeam, 
  updateTeam,
  Driver,
  Team
} from '../../lib/gameData'

export function ScoutDrivers() {
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([])
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isNegotiationOpen, setIsNegotiationOpen] = useState(false)
  const [contractOffer, setContractOffer] = useState({ years: 2, salary: 0 })
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState<'all' | 'rookie' | 'experienced' | 'elite'>('all')

  useEffect(() => {
    loadScoutData()
  }, [])

  const loadScoutData = async () => {
    try {
      const user = await blink.auth.me()
      const userTeam = getTeam(user.id)
      const drivers = getAvailableDrivers()
      
      setTeam(userTeam)
      setAvailableDrivers(drivers)
    } catch (error) {
      console.error('Error loading scout data:', error)
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
    if (skill >= 85) return 'text-purple-400'
    if (skill >= 80) return 'text-green-400'
    if (skill >= 75) return 'text-yellow-400'
    if (skill >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  const getSkillTier = (skill: number) => {
    if (skill >= 85) return 'Elite'
    if (skill >= 80) return 'Experienced'
    if (skill >= 75) return 'Promising'
    if (skill >= 70) return 'Developing'
    return 'Rookie'
  }

  const getExperienceLevel = (experience: number) => {
    if (experience >= 5) return 'Veteran'
    if (experience >= 3) return 'Experienced'
    if (experience >= 1) return 'Developing'
    return 'Rookie'
  }

  const filteredDrivers = availableDrivers.filter(driver => {
    const matchesSearch = driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.nationality.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSkill = skillFilter === 'all' || 
                        (skillFilter === 'rookie' && driver.skill < 75) ||
                        (skillFilter === 'experienced' && driver.skill >= 75 && driver.skill < 85) ||
                        (skillFilter === 'elite' && driver.skill >= 85)
    
    return matchesSearch && matchesSkill
  })

  const handleScoutDriver = (driver: Driver) => {
    setSelectedDriver(driver)
    setContractOffer({ years: 2, salary: driver.salary })
    setIsNegotiationOpen(true)
  }

  const handleSignDriver = async () => {
    if (!selectedDriver || !team) return

    const user = await blink.auth.me()
    const totalCost = contractOffer.salary * contractOffer.years

    if (team.budget < totalCost) {
      alert('Insufficient budget for this contract!')
      return
    }

    // Sign the driver
    const signedDriver = signDriver(
      selectedDriver.id,
      team.id,
      user.id,
      contractOffer.years,
      contractOffer.salary
    )

    if (signedDriver) {
      // Update team budget
      const updatedTeam = {
        ...team,
        budget: team.budget - totalCost
      }
      updateTeam(updatedTeam)
      setTeam(updatedTeam)

      // Remove from available drivers
      setAvailableDrivers(prev => prev.filter(d => d.id !== selectedDriver.id))
      
      setIsNegotiationOpen(false)
      setSelectedDriver(null)
      
      alert(`Successfully signed ${selectedDriver.name}!`)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Scout Drivers</h1>
        <p className="text-muted-foreground">Discover and sign talented drivers for your team</p>
      </div>

      {/* Team Budget */}
      {team && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Team Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(team.budget)}</div>
            <p className="text-sm text-muted-foreground">Available for new signings</p>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search drivers by name or nationality..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={skillFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillFilter('all')}
          >
            All
          </Button>
          <Button
            variant={skillFilter === 'rookie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillFilter('rookie')}
          >
            Rookie
          </Button>
          <Button
            variant={skillFilter === 'experienced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillFilter('experienced')}
          >
            Experienced
          </Button>
          <Button
            variant={skillFilter === 'elite' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSkillFilter('elite')}
          >
            Elite
          </Button>
        </div>
      </div>

      {/* Available Drivers */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Available Drivers ({filteredDrivers.length})</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{driver.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{driver.nationality}</span>
                      <Badge variant="outline" className="text-xs">
                        Age {driver.age}
                      </Badge>
                    </div>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getSkillColor(driver.skill)} border-current`}
                  >
                    {getSkillTier(driver.skill)}
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

                {/* Experience */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Experience</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {driver.experience} years • {getExperienceLevel(driver.experience)}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Asking Price</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(driver.salary)}/year
                    </p>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <span className="text-sm font-medium mb-2 block">Specialties</span>
                  <div className="flex flex-wrap gap-2">
                    {driver.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Scout Button */}
                <Button 
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleScoutDriver(driver)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Scout Driver
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredDrivers.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contract Negotiation Dialog */}
      <Dialog open={isNegotiationOpen} onOpenChange={setIsNegotiationOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contract Negotiation</DialogTitle>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <h3 className="font-semibold text-lg">{selectedDriver.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDriver.nationality} • Age {selectedDriver.age} • Skill: {selectedDriver.skill}
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  {selectedDriver.specialties.map((specialty) => (
                    <Badge key={specialty} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="salary">Annual Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={contractOffer.salary}
                    onChange={(e) => setContractOffer(prev => ({
                      ...prev,
                      salary: parseInt(e.target.value) || 0
                    }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Driver asking: {formatCurrency(selectedDriver.salary)}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="years">Contract Length (years)</Label>
                  <Input
                    id="years"
                    type="number"
                    min="1"
                    max="5"
                    value={contractOffer.years}
                    onChange={(e) => setContractOffer(prev => ({
                      ...prev,
                      years: parseInt(e.target.value) || 1
                    }))}
                  />
                </div>

                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total Contract Value:</span>
                    <span className="font-semibold">
                      {formatCurrency(contractOffer.salary * contractOffer.years)}
                    </span>
                  </div>
                  {team && (
                    <div className="flex justify-between text-sm mt-1">
                      <span>Remaining Budget:</span>
                      <span className={`font-semibold ${
                        team.budget >= (contractOffer.salary * contractOffer.years) 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {formatCurrency(team.budget - (contractOffer.salary * contractOffer.years))}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsNegotiationOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={handleSignDriver}
                  disabled={!team || team.budget < (contractOffer.salary * contractOffer.years)}
                >
                  Sign Driver
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}