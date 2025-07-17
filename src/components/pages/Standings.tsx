import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Trophy } from 'lucide-react'

export function Standings() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Championship Standings</h1>
        <p className="text-muted-foreground">Current constructor and driver standings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Constructor and driver championship standings will be available soon.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}