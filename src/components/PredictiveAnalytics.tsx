import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Clock,
  DollarSign,
  Target,
  Zap,
  Eye,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock as ClockIcon,
  MapPin,
  Route,
  Sparkles
} from "lucide-react";
import { Report } from "@/types/report";

interface PredictiveAnalyticsProps {
  reports: Report[];
}

export const PredictiveAnalytics = ({ reports }: PredictiveAnalyticsProps) => {
  const [predictionPeriod, setPredictionPeriod] = useState("3months");

  // Predictive analytics calculations
  const predictions = useMemo(() => {
    if (reports.length === 0) return null;

    const allItems = reports.flatMap(report => 
      report.items.map(item => ({
        ...item,
        reportType: report.reportType,
        reportDate: report.reportDate,
        month: new Date(report.reportDate).toISOString().slice(0, 7),
        monthName: new Date(report.reportDate).toLocaleDateString('en-US', { month: 'short' })
      }))
    );

    // Calculate historical trends
    const monthlyData = allItems.reduce((acc, item) => {
      const monthKey = item.monthName;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, totalCost: 0, visitCount: 0, averageCost: 0 };
      }
      acc[monthKey].totalCost += item.cost;
      acc[monthKey].visitCount += 1;
      acc[monthKey].averageCost = acc[monthKey].totalCost / acc[monthKey].visitCount;
      return acc;
    }, {} as { [key: string]: any });

    const monthlyTrends = Object.values(monthlyData).sort((a, b) => 
      new Date(a.month + ' 1, 2024').getTime() - new Date(b.month + ' 1, 2024').getTime()
    );

    // Calculate growth rate
    const recentMonths = monthlyTrends.slice(-3);
    const growthRate = recentMonths.length >= 2 
      ? ((recentMonths[recentMonths.length - 1].totalCost - recentMonths[0].totalCost) / recentMonths[0].totalCost) * 100
      : 0;

    // Predict future costs
    const currentAvgCost = recentMonths.reduce((sum, month) => sum + month.totalCost, 0) / recentMonths.length;
    const predictedCosts = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    for (let i = 0; i < 6; i++) {
      const predictedCost = currentAvgCost * (1 + (growthRate / 100) * (i + 1));
      predictedCosts.push({
        month: months[i],
        predicted: Math.round(predictedCost),
        actual: monthlyTrends[i]?.totalCost || 0,
        type: i < 3 ? 'actual' : 'predicted'
      });
    }

    // Visit frequency prediction
    const avgVisitsPerMonth = recentMonths.reduce((sum, month) => sum + month.visitCount, 0) / recentMonths.length;
    const predictedVisits = Math.round(avgVisitsPerMonth * (1 + (growthRate / 100)));

    // Optimal visit scheduling
    const locationFrequency = allItems.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const topLocations = Object.entries(locationFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, visits]) => ({ location, visits }));

    // Risk assessment
    const highCostLocations = allItems.reduce((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = { location: item.location, totalCost: 0, visitCount: 0 };
      }
      acc[item.location].totalCost += item.cost;
      acc[item.location].visitCount += 1;
      return acc;
    }, {} as { [key: string]: any });

    const riskLocations = Object.values(highCostLocations)
      .filter(loc => loc.totalCost / loc.visitCount > 3000)
      .sort((a, b) => (b.totalCost / b.visitCount) - (a.totalCost / a.visitCount))
      .slice(0, 3);

    return {
      monthlyTrends,
      predictedCosts,
      growthRate,
      predictedVisits,
      topLocations,
      riskLocations,
      currentAvgCost,
      efficiencyScore: Math.max(0, 100 - (currentAvgCost / 100))
    };
  }, [reports]);

  if (!predictions) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data for Predictions</h3>
          <p className="text-muted-foreground">Create more reports to enable predictive analytics.</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <TrendingUp className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Predictive Analytics
          </h2>
          <p className="text-muted-foreground">
            AI-powered forecasting and trend predictions
          </p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={predictionPeriod}
            onChange={(e) => setPredictionPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="3months">3 Months</option>
            <option value="6months">6 Months</option>
            <option value="1year">1 Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Sparkles className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Prediction Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            {getTrendIcon(predictions.growthRate)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.growthRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Monthly cost trend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predicted Visits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.predictedVisits}</div>
            <p className="text-xs text-muted-foreground">
              Next month visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{predictions.efficiencyScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Based on cost efficiency
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {predictions.growthRate > 10 ? 'High' : predictions.growthRate > 5 ? 'Medium' : 'Low'}
            </div>
            <p className="text-xs text-muted-foreground">
              Cost increase risk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Forecasting Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Cost Forecasting (6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
                          <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={predictions.predictedCosts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <YAxis 
                      tick={{ fill: 'hsl(var(--foreground))' }}
                      axisLine={{ stroke: 'hsl(var(--border))' }}
                    />
                    <Tooltip 
                      formatter={(value) => [`₦${value}`, 'Cost']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        color: 'hsl(var(--foreground))'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      name="Predicted"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Actual"
                    />
                  </LineChart>
                </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Predictions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimal Visit Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Optimal Visit Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.topLocations.map((location, index) => (
                <div key={location.location} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{location.location}</div>
                      <div className="text-sm text-muted-foreground">{location.visits} visits</div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {index === 0 ? 'Priority' : index === 1 ? 'High' : 'Medium'}
                  </Badge>
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">AI Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Schedule visits to nearby locations on the same day</li>
                  <li>• Use most efficient transport for high-priority locations</li>
                  <li>• Consider cost vs. frequency optimization</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {predictions.riskLocations.map((location, index) => (
                <div key={location.location} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{location.location}</span>
                    <Badge variant="destructive">High Risk</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    ₦{(location.totalCost / location.visitCount).toFixed(0)} per visit
                  </div>
                  <Progress 
                    value={Math.min(100, (location.totalCost / location.visitCount) / 50)} 
                    className="h-2"
                  />
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Risk Mitigation</h4>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• Consider alternative transport options</li>
                  <li>• Evaluate visit necessity vs. cost</li>
                  <li>• Negotiate better rates for frequent visits</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Efficiency Insights & Predictions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-green-800">Optimization Potential</h4>
              <p className="text-sm text-green-700 mt-2">
                {predictions.efficiencyScore > 70 ? 'Excellent' : predictions.efficiencyScore > 50 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <ClockIcon className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-blue-800">Time Optimization</h4>
              <p className="text-sm text-blue-700 mt-2">
                {predictions.predictedVisits > 20 ? 'High Activity' : predictions.predictedVisits > 10 ? 'Moderate' : 'Low Activity'}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Route className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-purple-800">Route Efficiency</h4>
              <p className="text-sm text-purple-700 mt-2">
                {predictions.topLocations.length > 3 ? 'Multiple Routes' : 'Focused Routes'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 