// Game data management with localStorage persistence

export interface Driver {
  id: string
  name: string
  skill: number
  contractYears: number
  salary: number
  age: number
  nationality: string
  experience: number
  specialties: string[]
  isAvailable: boolean
  teamId?: string
  userId: string
}

export interface Team {
  id: string
  userId: string
  name: string
  budget: number
  reputation: number
  championshipPoints: number
  position: number
  createdAt: string
  updatedAt: string
}

export interface Race {
  id: string
  name: string
  location: string
  date: string
  laps: number
  status: 'upcoming' | 'active' | 'completed'
  weather: 'sunny' | 'cloudy' | 'rain'
  temperature: number
  trackCondition: 'dry' | 'damp' | 'wet'
  roundNumber: number
}

export interface RaceResult {
  id: string
  userId: string
  raceId: string
  driverId: string
  position: number
  points: number
  bestLap: string
  pitStops: number
  dnf: boolean
}

export interface CarDevelopment {
  id: string
  userId: string
  teamId: string
  engineLevel: number
  aerodynamicsLevel: number
  chassisLevel: number
  reliabilityLevel: number
  totalPerformance: number
}

// Default data
const DEFAULT_RACES: Race[] = [
  { id: 'race_1', name: 'Bahrain Grand Prix', location: 'Sakhir', date: '2024-03-02', laps: 57, status: 'upcoming', weather: 'sunny', temperature: 28, trackCondition: 'dry', roundNumber: 1 },
  { id: 'race_2', name: 'Saudi Arabian Grand Prix', location: 'Jeddah', date: '2024-03-09', laps: 50, status: 'upcoming', weather: 'sunny', temperature: 32, trackCondition: 'dry', roundNumber: 2 },
  { id: 'race_3', name: 'Australian Grand Prix', location: 'Melbourne', date: '2024-03-24', laps: 58, status: 'upcoming', weather: 'cloudy', temperature: 22, trackCondition: 'dry', roundNumber: 3 },
  { id: 'race_4', name: 'Japanese Grand Prix', location: 'Suzuka', date: '2024-04-07', laps: 53, status: 'upcoming', weather: 'cloudy', temperature: 18, trackCondition: 'damp', roundNumber: 4 },
  { id: 'race_5', name: 'Chinese Grand Prix', location: 'Shanghai', date: '2024-04-21', laps: 56, status: 'upcoming', weather: 'sunny', temperature: 20, trackCondition: 'dry', roundNumber: 5 },
  { id: 'race_6', name: 'Miami Grand Prix', location: 'Miami', date: '2024-05-05', laps: 57, status: 'upcoming', weather: 'sunny', temperature: 30, trackCondition: 'dry', roundNumber: 6 },
  { id: 'race_7', name: 'Emilia Romagna Grand Prix', location: 'Imola', date: '2024-05-19', laps: 63, status: 'upcoming', weather: 'rain', temperature: 16, trackCondition: 'wet', roundNumber: 7 },
  { id: 'race_8', name: 'Monaco Grand Prix', location: 'Monaco', date: '2024-05-26', laps: 78, status: 'active', weather: 'sunny', temperature: 24, trackCondition: 'dry', roundNumber: 8 },
  { id: 'race_9', name: 'Canadian Grand Prix', location: 'Montreal', date: '2024-06-09', laps: 70, status: 'upcoming', weather: 'cloudy', temperature: 19, trackCondition: 'dry', roundNumber: 9 },
  { id: 'race_10', name: 'Spanish Grand Prix', location: 'Barcelona', date: '2024-06-23', laps: 66, status: 'upcoming', weather: 'sunny', temperature: 26, trackCondition: 'dry', roundNumber: 10 },
  { id: 'race_11', name: 'Austrian Grand Prix', location: 'Spielberg', date: '2024-06-30', laps: 71, status: 'upcoming', weather: 'sunny', temperature: 23, trackCondition: 'dry', roundNumber: 11 },
  { id: 'race_12', name: 'British Grand Prix', location: 'Silverstone', date: '2024-07-07', laps: 52, status: 'upcoming', weather: 'rain', temperature: 17, trackCondition: 'wet', roundNumber: 12 },
  { id: 'race_13', name: 'Hungarian Grand Prix', location: 'Budapest', date: '2024-07-21', laps: 70, status: 'upcoming', weather: 'sunny', temperature: 29, trackCondition: 'dry', roundNumber: 13 },
  { id: 'race_14', name: 'Belgian Grand Prix', location: 'Spa-Francorchamps', date: '2024-07-28', laps: 44, status: 'upcoming', weather: 'cloudy', temperature: 20, trackCondition: 'damp', roundNumber: 14 },
  { id: 'race_15', name: 'Dutch Grand Prix', location: 'Zandvoort', date: '2024-08-25', laps: 72, status: 'upcoming', weather: 'sunny', temperature: 21, trackCondition: 'dry', roundNumber: 15 },
  { id: 'race_16', name: 'Italian Grand Prix', location: 'Monza', date: '2024-09-01', laps: 53, status: 'upcoming', weather: 'sunny', temperature: 27, trackCondition: 'dry', roundNumber: 16 },
  { id: 'race_17', name: 'Azerbaijan Grand Prix', location: 'Baku', date: '2024-09-15', laps: 51, status: 'upcoming', weather: 'sunny', temperature: 25, trackCondition: 'dry', roundNumber: 17 },
  { id: 'race_18', name: 'Singapore Grand Prix', location: 'Singapore', date: '2024-09-22', laps: 62, status: 'upcoming', weather: 'cloudy', temperature: 31, trackCondition: 'dry', roundNumber: 18 },
  { id: 'race_19', name: 'United States Grand Prix', location: 'Austin', date: '2024-10-20', laps: 56, status: 'upcoming', weather: 'sunny', temperature: 24, trackCondition: 'dry', roundNumber: 19 },
  { id: 'race_20', name: 'Mexican Grand Prix', location: 'Mexico City', date: '2024-10-27', laps: 71, status: 'upcoming', weather: 'sunny', temperature: 22, trackCondition: 'dry', roundNumber: 20 },
  { id: 'race_21', name: 'Brazilian Grand Prix', location: 'São Paulo', date: '2024-11-03', laps: 71, status: 'upcoming', weather: 'rain', temperature: 25, trackCondition: 'wet', roundNumber: 21 },
  { id: 'race_22', name: 'Las Vegas Grand Prix', location: 'Las Vegas', date: '2024-11-23', laps: 50, status: 'upcoming', weather: 'sunny', temperature: 15, trackCondition: 'dry', roundNumber: 22 },
  { id: 'race_23', name: 'Abu Dhabi Grand Prix', location: 'Abu Dhabi', date: '2024-12-08', laps: 58, status: 'upcoming', weather: 'sunny', temperature: 28, trackCondition: 'dry', roundNumber: 23 }
]

const AVAILABLE_DRIVERS: Driver[] = [
  { id: 'scout_1', name: 'Luca Martinelli', skill: 82, contractYears: 0, salary: 8500000, age: 24, nationality: 'Italy', experience: 3, specialties: ['Qualifying', 'Consistency'], isAvailable: true, userId: 'system' },
  { id: 'scout_2', name: 'Yuki Tanaka', skill: 79, contractYears: 0, salary: 7200000, age: 22, nationality: 'Japan', experience: 2, specialties: ['Wet Weather', 'Overtaking'], isAvailable: true, userId: 'system' },
  { id: 'scout_3', name: 'Oliver Schmidt', skill: 85, contractYears: 0, salary: 12000000, age: 28, nationality: 'Germany', experience: 6, specialties: ['Race Craft', 'Tire Management'], isAvailable: true, userId: 'system' },
  { id: 'scout_4', name: 'Carlos Mendoza', skill: 76, contractYears: 0, salary: 5800000, age: 21, nationality: 'Mexico', experience: 1, specialties: ['Speed', 'Aggression'], isAvailable: true, userId: 'system' },
  { id: 'scout_5', name: 'Emma Thompson', skill: 88, contractYears: 0, salary: 15000000, age: 26, nationality: 'United Kingdom', experience: 5, specialties: ['All-Weather', 'Strategy'], isAvailable: true, userId: 'system' },
  { id: 'scout_6', name: 'Pierre Dubois', skill: 73, contractYears: 0, salary: 4500000, age: 20, nationality: 'France', experience: 1, specialties: ['Qualifying', 'Youth'], isAvailable: true, userId: 'system' },
  { id: 'scout_7', name: 'Raj Patel', skill: 80, contractYears: 0, salary: 9200000, age: 25, nationality: 'India', experience: 4, specialties: ['Consistency', 'Pressure'], isAvailable: true, userId: 'system' },
  { id: 'scout_8', name: 'Sofia Andersson', skill: 77, contractYears: 0, salary: 6800000, age: 23, nationality: 'Sweden', experience: 2, specialties: ['Wet Weather', 'Precision'], isAvailable: true, userId: 'system' }
]

// Storage keys
const STORAGE_KEYS = {
  TEAM: 'f1_manager_team',
  DRIVERS: 'f1_manager_drivers',
  RACES: 'f1_manager_races',
  RACE_RESULTS: 'f1_manager_race_results',
  CAR_DEVELOPMENT: 'f1_manager_car_development',
  AVAILABLE_DRIVERS: 'f1_manager_available_drivers'
}

// Utility functions
export const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

// Team management
export const getTeam = (userId: string): Team | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.TEAM)
  if (!stored) return null
  
  const teams: Team[] = JSON.parse(stored)
  return teams.find(team => team.userId === userId) || null
}

export const createTeam = (userId: string, name: string): Team => {
  const team: Team = {
    id: generateId(),
    userId,
    name,
    budget: 50000000,
    reputation: 50,
    championshipPoints: 0,
    position: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.TEAM)
  const teams: Team[] = stored ? JSON.parse(stored) : []
  teams.push(team)
  localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(teams))
  
  return team
}

export const updateTeam = (team: Team): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.TEAM)
  const teams: Team[] = stored ? JSON.parse(stored) : []
  const index = teams.findIndex(t => t.id === team.id)
  
  if (index !== -1) {
    teams[index] = { ...team, updatedAt: new Date().toISOString() }
    localStorage.setItem(STORAGE_KEYS.TEAM, JSON.stringify(teams))
  }
}

// Driver management
export const getDrivers = (userId: string): Driver[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  if (!stored) return []
  
  const drivers: Driver[] = JSON.parse(stored)
  return drivers.filter(driver => driver.userId === userId)
}

export const createDriver = (driver: Omit<Driver, 'id'>): Driver => {
  const newDriver: Driver = {
    ...driver,
    id: generateId()
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  const drivers: Driver[] = stored ? JSON.parse(stored) : []
  drivers.push(newDriver)
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers))
  
  return newDriver
}

export const updateDriver = (driver: Driver): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  const drivers: Driver[] = stored ? JSON.parse(stored) : []
  const index = drivers.findIndex(d => d.id === driver.id)
  
  if (index !== -1) {
    drivers[index] = driver
    localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers))
  }
}

export const getAvailableDrivers = (): Driver[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.AVAILABLE_DRIVERS)
  if (!stored) {
    // Initialize with default drivers
    localStorage.setItem(STORAGE_KEYS.AVAILABLE_DRIVERS, JSON.stringify(AVAILABLE_DRIVERS))
    return AVAILABLE_DRIVERS
  }
  
  return JSON.parse(stored)
}

export const signDriver = (driverId: string, teamId: string, userId: string, contractYears: number, salary: number): Driver | null => {
  const availableDrivers = getAvailableDrivers()
  const driverIndex = availableDrivers.findIndex(d => d.id === driverId)
  
  if (driverIndex === -1) return null
  
  const driver = availableDrivers[driverIndex]
  
  // Remove from available drivers
  availableDrivers.splice(driverIndex, 1)
  localStorage.setItem(STORAGE_KEYS.AVAILABLE_DRIVERS, JSON.stringify(availableDrivers))
  
  // Add to user's drivers
  const signedDriver: Driver = {
    ...driver,
    id: generateId(),
    userId,
    teamId,
    contractYears,
    salary,
    isAvailable: false
  }
  
  const userDrivers = getDrivers(userId)
  userDrivers.push(signedDriver)
  
  const allDrivers = localStorage.getItem(STORAGE_KEYS.DRIVERS)
  const drivers: Driver[] = allDrivers ? JSON.parse(allDrivers) : []
  const filteredDrivers = drivers.filter(d => d.userId !== userId)
  filteredDrivers.push(...userDrivers)
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(filteredDrivers))
  
  return signedDriver
}

// Race management
export const getRaces = (): Race[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.RACES)
  if (!stored) {
    localStorage.setItem(STORAGE_KEYS.RACES, JSON.stringify(DEFAULT_RACES))
    return DEFAULT_RACES
  }
  
  return JSON.parse(stored)
}

export const updateRace = (race: Race): void => {
  const races = getRaces()
  const index = races.findIndex(r => r.id === race.id)
  
  if (index !== -1) {
    races[index] = race
    localStorage.setItem(STORAGE_KEYS.RACES, JSON.stringify(races))
  }
}

export const getCurrentRace = (): Race | null => {
  const races = getRaces()
  return races.find(race => race.status === 'active') || races.find(race => race.status === 'upcoming') || null
}

// Race results
export const getRaceResults = (userId: string, raceId?: string): RaceResult[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.RACE_RESULTS)
  if (!stored) return []
  
  const results: RaceResult[] = JSON.parse(stored)
  let filtered = results.filter(result => result.userId === userId)
  
  if (raceId) {
    filtered = filtered.filter(result => result.raceId === raceId)
  }
  
  return filtered
}

export const saveRaceResult = (result: Omit<RaceResult, 'id'>): RaceResult => {
  const newResult: RaceResult = {
    ...result,
    id: generateId()
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.RACE_RESULTS)
  const results: RaceResult[] = stored ? JSON.parse(stored) : []
  results.push(newResult)
  localStorage.setItem(STORAGE_KEYS.RACE_RESULTS, JSON.stringify(results))
  
  return newResult
}

// Car development
export const getCarDevelopment = (userId: string, teamId: string): CarDevelopment | null => {
  const stored = localStorage.getItem(STORAGE_KEYS.CAR_DEVELOPMENT)
  if (!stored) return null
  
  const developments: CarDevelopment[] = JSON.parse(stored)
  return developments.find(dev => dev.userId === userId && dev.teamId === teamId) || null
}

export const createCarDevelopment = (userId: string, teamId: string): CarDevelopment => {
  const development: CarDevelopment = {
    id: generateId(),
    userId,
    teamId,
    engineLevel: 1,
    aerodynamicsLevel: 1,
    chassisLevel: 1,
    reliabilityLevel: 1,
    totalPerformance: 4
  }
  
  const stored = localStorage.getItem(STORAGE_KEYS.CAR_DEVELOPMENT)
  const developments: CarDevelopment[] = stored ? JSON.parse(stored) : []
  developments.push(development)
  localStorage.setItem(STORAGE_KEYS.CAR_DEVELOPMENT, JSON.stringify(developments))
  
  return development
}

export const updateCarDevelopment = (development: CarDevelopment): void => {
  const stored = localStorage.getItem(STORAGE_KEYS.CAR_DEVELOPMENT)
  const developments: CarDevelopment[] = stored ? JSON.parse(stored) : []
  const index = developments.findIndex(d => d.id === development.id)
  
  if (index !== -1) {
    developments[index] = development
    localStorage.setItem(STORAGE_KEYS.CAR_DEVELOPMENT, JSON.stringify(developments))
  }
}

// Initialize user data
export const initializeUserData = (userId: string): { team: Team, drivers: Driver[], carDevelopment: CarDevelopment } => {
  let team = getTeam(userId)
  if (!team) {
    team = createTeam(userId, 'Velocity Racing')
  }
  
  let drivers = getDrivers(userId)
  if (drivers.length === 0) {
    // Create default drivers
    const driver1 = createDriver({
      name: 'Alex Rodriguez',
      skill: 78,
      contractYears: 2,
      salary: 6500000,
      age: 26,
      nationality: 'Spain',
      experience: 4,
      specialties: ['Wet Weather', 'Overtaking'],
      isAvailable: false,
      teamId: team.id,
      userId
    })
    
    const driver2 = createDriver({
      name: 'Marcus Chen',
      skill: 74,
      contractYears: 1,
      salary: 4200000,
      age: 23,
      nationality: 'Singapore',
      experience: 2,
      specialties: ['Qualifying', 'Consistency'],
      isAvailable: false,
      teamId: team.id,
      userId
    })
    
    drivers = [driver1, driver2]
  }
  
  let carDevelopment = getCarDevelopment(userId, team.id)
  if (!carDevelopment) {
    carDevelopment = createCarDevelopment(userId, team.id)
  }
  
  return { team, drivers, carDevelopment }
}