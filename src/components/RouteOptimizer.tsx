import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  MapPin, 
  Route, 
  Clock, 
  DollarSign, 
  Navigation,
  Target,
  ArrowRight,
  Zap,
  TrendingUp
} from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Report } from "@/types/report";
import { useToast } from "@/hooks/use-toast";

interface RouteOptimizerProps {
  reports: Report[];
}

export const RouteOptimizer = ({ reports }: RouteOptimizerProps) => {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [optimizationType, setOptimizationType] = useState<'cost' | 'time' | 'efficiency'>('cost');
  const { toast } = useToast();
  
  const { routeAnalysis, transportPatterns, aiInsights } = useAIAnalysis(reports);

  // Get unique locations from all reports
  const allLocations = useMemo(() => {
    const locations = new Set<string>();
    reports.forEach(report => {
      report.items.forEach(item => {
        locations.add(item.location);
      });
    });
    return Array.from(locations).sort();
  }, [reports]);

  // Calculate optimal route based on selected locations and optimization type
  const optimizedRoute = useMemo(() => {
    if (selectedLocations.length === 0) return null;

    const selectedPatterns = transportPatterns.filter(p => 
      selectedLocations.includes(p.location)
    );

    if (selectedPatterns.length === 0) return null;

    // Sort by optimization criteria
    let sortedPatterns = [...selectedPatterns];
    switch (optimizationType) {
      case 'cost':
        sortedPatterns.sort((a, b) => a.averageCost - b.averageCost);
        break;
      case 'time':
        // Assume time is inversely proportional to visit count (more visits = more familiar = faster)
        sortedPatterns.sort((a, b) => b.visitCount - a.visitCount);
        break;
      case 'efficiency':
        // Combine cost and visit frequency for efficiency
        sortedPatterns.sort((a, b) => {
          const aEfficiency = a.visitCount / a.averageCost;
          const bEfficiency = b.visitCount / b.averageCost;
          return bEfficiency - aEfficiency;
        });
        break;
    }

    const route = sortedPatterns.map(p => p.location);
    const totalCost = sortedPatterns.reduce((sum, p) => sum + p.averageCost, 0);
    const estimatedTime = `${route.length * 2} hours`; // Rough estimate
    const efficiency = sortedPatterns.reduce((sum, p) => sum + (p.visitCount / p.averageCost), 0);

    return {
      route,
      totalCost,
      estimatedTime,
      efficiency,
      optimizationType
    };
  }, [selectedLocations, optimizationType, transportPatterns]);

  const handleLocationToggle = (location: string) => {
    setSelectedLocations(prev => 
      prev.includes(location) 
        ? prev.filter(l => l !== location)
        : [...prev, location]
    );
  };

  const handleOptimizeRoute = () => {
    if (selectedLocations.length === 0) {
      toast({
        title: "No Locations Selected",
        description: "Please select at least one location to optimize.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Route Optimized",
      description: `Optimized route for ${selectedLocations.length} locations using ${optimizationType} criteria.`,
    });
  };

  const getOptimizationIcon = (type: string) => {
    switch (type) {
      case 'cost': return <DollarSign className="h-4 w-4" />;
      case 'time': return <Clock className="h-4 w-4" />;
      case 'efficiency': return <Zap className="h-4 w-4" />;
      default: return <Route className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Route Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="optimization-type">Optimization Criteria</Label>
              <select
                id="optimization-type"
                value={optimizationType}
                onChange={(e) => setOptimizationType(e.target.value as any)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="cost">Cost Optimization</option>
                <option value="time">Time Optimization</option>
                <option value="efficiency">Efficiency Optimization</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label>Selected Locations ({selectedLocations.length})</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                {selectedLocations.map(location => (
                  <Badge 
                    key={location} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleLocationToggle(location)}
                  >
                    <MapPin className="h-3 w-3 mr-1" />
                    {location}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleOptimizeRoute}
            disabled={selectedLocations.length === 0}
            className="w-full"
          >
            <Target className="h-4 w-4 mr-2" />
            Optimize Route
          </Button>
        </CardContent>
      </Card>

      {/* Location Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Available Locations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {allLocations.map(location => {
              const pattern = transportPatterns.find(p => p.location === location);
              const isSelected = selectedLocations.includes(location);
              
              return (
                <div
                  key={location}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleLocationToggle(location)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium text-sm">{location}</span>
                    </div>
                    {isSelected && <div className="w-2 h-2 bg-primary rounded-full" />}
                  </div>
                  
                  {pattern && (
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Visits:</span>
                        <span>{pattern.visitCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg Cost:</span>
                        <span>₦{pattern.averageCost.toFixed(0)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>Trend:</span>
                        {pattern.costTrend === 'increasing' && <TrendingUp className="h-3 w-3 text-red-500" />}
                        {pattern.costTrend === 'decreasing' && <TrendingUp className="h-3 w-3 text-green-500 rotate-180" />}
                        {pattern.costTrend === 'stable' && <span className="text-gray-500">-</span>}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Optimized Route Display */}
      {optimizedRoute && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getOptimizationIcon(optimizationType)}
              Optimized Route
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">{optimizationType} optimization</Badge>
              <span>• {optimizedRoute.route.length} locations</span>
            </div>

            <div className="space-y-3">
              {optimizedRoute.route.map((location, index) => (
                <div key={location} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{location}</div>
                    {index < optimizedRoute.route.length - 1 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        <ArrowRight className="h-3 w-3 inline mr-1" />
                        Next: {optimizedRoute.route[index + 1]}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold">₦{optimizedRoute.totalCost.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">Estimated Cost</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{optimizedRoute.estimatedTime}</div>
                <div className="text-sm text-muted-foreground">Estimated Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{optimizedRoute.efficiency.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">Efficiency Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Route Analysis Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Route Analysis Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-semibold">Most Frequent Routes</h4>
            {routeAnalysis.frequentRoutes.slice(0, 5).map((route, index) => (
              <div key={`${route.from}-${route.to}`} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{route.from} → {route.to}</div>
                    <div className="text-xs text-muted-foreground">
                      {route.frequency} trips • ₦{route.averageCost.toFixed(0)} avg
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{route.frequency}x</Badge>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">Optimization Tips</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                Group visits to nearby locations to reduce travel time and costs
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                Consider traffic patterns and peak hours when planning routes
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                Use the most cost-effective transportation for each route
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                Schedule high-priority visits during optimal time windows
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 