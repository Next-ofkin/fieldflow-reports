import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Car, 
  Train, 
  Bus, 
  Bike,
  Route,
  Target,
  Zap,
  Brain,
  Download,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { Report } from "@/types/report";

interface AIAnalyticsProps {
  reports: Report[];
}

export const AIAnalytics = ({ reports }: AIAnalyticsProps) => {
  console.log('AIAnalytics reports:', reports);

  // Simple analysis functions
  const analyzeData = () => {
    if (reports.length === 0) return null;

    const allItems = reports.flatMap(report => 
      report.items.map(item => ({
        ...item,
        reportType: report.reportType,
        reportDate: report.reportDate
      }))
    );

    const totalCost = allItems.reduce((sum, item) => sum + item.cost, 0);
    const averageCost = totalCost / allItems.length;
    const uniqueLocations = [...new Set(allItems.map(item => item.location))];
    
    const transportCounts = allItems.reduce((acc, item) => {
      acc[item.transportation] = (acc[item.transportation] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const preferredTransport = Object.entries(transportCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    return {
      totalVisits: allItems.length,
      totalCost,
      averageCost,
      uniqueLocations: uniqueLocations.length,
      preferredTransport,
      mostFrequentLocations: uniqueLocations.slice(0, 5)
    };
  };

  const analysis = analyzeData();

  const getTransportIcon = (transport: string) => {
    const lower = transport.toLowerCase();
    if (lower.includes('car')) return <Car className="h-4 w-4" />;
    if (lower.includes('train')) return <Train className="h-4 w-4" />;
    if (lower.includes('bus')) return <Bus className="h-4 w-4" />;
    if (lower.includes('bike')) return <Bike className="h-4 w-4" />;
    return <Car className="h-4 w-4" />;
  };

  // Show empty state if no reports
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground mb-4">
          Create some field reports first to see AI analytics and insights.
        </p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Analyzing data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Transport Analytics
          </h2>
          <p className="text-muted-foreground">
            Analysis of your transport patterns and insights
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analysis.totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              Across {analysis.uniqueLocations} locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{analysis.totalCost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ₦{analysis.averageCost.toFixed(0)} per visit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analysis.averageCost < 1000 ? 'High' : analysis.averageCost < 3000 ? 'Medium' : 'Low'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost efficiency rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferred Transport</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTransportIcon(analysis.preferredTransport)}
              <span className="text-lg font-bold">{analysis.preferredTransport}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Most used transport type
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Most Frequent Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.mostFrequentLocations.map((location, index) => (
                <div key={location} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <span className="font-medium">{location}</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {reports.filter(r => r.items.some(item => item.location === location)).length} visits
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transport Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  ₦{analysis.totalCost.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">Total Transport Cost</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-semibold">Recommendations:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    Consider grouping visits to nearby locations to reduce costs
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    Use {analysis.preferredTransport} for most efficient travel
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    Plan routes to minimize travel time and expenses
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sample Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Sample Report Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium mb-2">Latest Report:</p>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(reports[0], null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 