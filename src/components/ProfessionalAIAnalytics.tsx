import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
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
  Settings,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp as TrendingUpIcon,
  Eye,
  Lightbulb,
  Shield,
  Rocket
} from "lucide-react";
import { Report } from "@/types/report";
import { aiService } from "@/services/aiService";
import { useToast } from "@/hooks/use-toast";
import { AIConfigPanel } from "@/components/AIConfigPanel";

interface ProfessionalAIAnalyticsProps {
  reports: Report[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export const ProfessionalAIAnalytics = ({ reports }: ProfessionalAIAnalyticsProps) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [aiConfig, setAiConfig] = useState({
    apiKey: '',
    provider: 'deepseek' as const,
    model: 'deepseek-chat',
    temperature: 0.7,
    maxTokens: 2000,
    enabled: true
  });
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const { toast } = useToast();

  // Enhanced data analysis
  const analyzeData = () => {
    if (reports.length === 0) return null;

    const allItems = reports.flatMap(report => 
      report.items.map(item => ({
        ...item,
        reportType: report.reportType,
        reportDate: report.reportDate,
        month: new Date(report.reportDate).toISOString().slice(0, 7)
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

    // Monthly trends
    const monthlyData = allItems.reduce((acc, item) => {
      const month = item.month;
      if (!acc[month]) acc[month] = { cost: 0, visits: 0 };
      acc[month].cost += item.cost;
      acc[month].visits += 1;
      return acc;
    }, {} as { [key: string]: { cost: number; visits: number } });

    // Location analysis
    const locationAnalysis = uniqueLocations.map(location => {
      const locationItems = allItems.filter(item => item.location === location);
      const totalCost = locationItems.reduce((sum, item) => sum + item.cost, 0);
      const visitCount = locationItems.length;
      const averageCost = totalCost / visitCount;
      
      return {
        location,
        visitCount,
        totalCost,
        averageCost,
        efficiency: Math.max(0, 100 - (averageCost / 50)) // Simple efficiency calculation
      };
    }).sort((a, b) => b.visitCount - a.visitCount);

    return {
      totalVisits: allItems.length,
      totalCost,
      averageCost,
      uniqueLocations: uniqueLocations.length,
      preferredTransport,
      mostFrequentLocations: uniqueLocations.slice(0, 5),
      monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        cost: data.cost,
        visits: data.visits,
        averageCost: data.cost / data.visits
      })),
      locationAnalysis,
      transportBreakdown: Object.entries(transportCounts).map(([type, count]) => ({
        type,
        count,
        percentage: (count / allItems.length) * 100
      }))
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

  const handleAIAnalysis = async () => {
    setLoading(true);
    try {
      aiService.setConfig(aiConfig);
      const response = await aiService.analyzeTransportData({
        reports,
        analysisType: 'comprehensive',
        focusAreas: ['cost-optimization', 'route-efficiency', 'predictive-insights']
      });
      setAiInsights(response);
      toast({
        title: "AI Analysis Complete",
        description: "Advanced insights generated successfully!",
      });
    } catch (error) {
      console.error('AI Analysis error:', error);
      toast({
        title: "AI Analysis Error",
        description: "Failed to generate AI insights. Using local analysis.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show empty state if no reports
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground mb-4">
          Create some field reports first to see professional AI analytics.
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
      {/* Header with AI Configuration */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Professional AI Analytics
          </h2>
          <p className="text-muted-foreground">
            Advanced transport analysis with AI-powered insights
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-4 w-4 mr-2" />
            AI Config
          </Button>
          <Button
            onClick={handleAIAnalysis}
            disabled={loading || !aiConfig.enabled}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loading ? 'Analyzing...' : 'AI Analysis'}
          </Button>
        </div>
      </div>

      {/* AI Configuration Panel */}
      {showConfig && (
        <div className="mb-6">
          <AIConfigPanel onConfigChange={setAiConfig} />
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <MapPin className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analysis.totalVisits}</div>
            <p className="text-xs text-blue-600">
              Across {analysis.uniqueLocations} locations
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <Zap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₦{analysis.totalCost.toLocaleString()}
            </div>
            <p className="text-xs text-green-600">
              ₦{analysis.averageCost.toFixed(0)} per visit
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analysis.averageCost < 1000 ? 'High' : analysis.averageCost < 3000 ? 'Medium' : 'Low'}
            </div>
            <p className="text-xs text-purple-600">
              Cost efficiency rating
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferred Transport</CardTitle>
            <Route className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTransportIcon(analysis.preferredTransport)}
              <span className="text-lg font-bold text-orange-600">{analysis.preferredTransport}</span>
            </div>
            <p className="text-xs text-orange-600">
              Most used transport type
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <TrendingUpIcon className="h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="transport" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Transport
          </TabsTrigger>
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="h-5 w-5" />
                  Monthly Cost Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analysis.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₦${value}`, 'Cost']} />
                    <Area type="monotone" dataKey="cost" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transport Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Transport Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analysis.transportBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percentage }) => `${type} ${percentage.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analysis.transportBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Visit Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analysis.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="visits" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.locationAnalysis.slice(0, 10).map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{location.location}</h4>
                        <p className="text-sm text-muted-foreground">
                          {location.visitCount} visits • ₦{location.totalCost.toLocaleString()} total
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={location.efficiency > 70 ? 'bg-green-100 text-green-800' : location.efficiency > 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}>
                        {location.efficiency.toFixed(0)}% efficient
                      </Badge>
                      <span className="text-sm font-medium">₦{location.averageCost.toFixed(0)} avg</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transport" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Transport Efficiency Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.transportBreakdown.map((transport, index) => (
                  <div key={transport.type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getTransportIcon(transport.type)}
                        <h4 className="font-medium">{transport.type}</h4>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800">
                        {transport.count} uses ({transport.percentage.toFixed(1)}%)
                      </Badge>
                    </div>
                    
                    <Progress value={transport.percentage} className="mt-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-6">
          {aiInsights ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Key Insights:</h4>
                  <p className="text-sm">{aiInsights.insights}</p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold">Recommendations:</h4>
                  <ul className="space-y-2">
                    {aiInsights.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  Confidence: {(aiInsights.confidence * 100).toFixed(0)}%
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Click "AI Analysis" to generate advanced insights using AI
                </p>
                <Button onClick={handleAIAnalysis} disabled={loading}>
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                  {loading ? 'Generating...' : 'Generate AI Insights'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Predictive Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Calendar className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-green-800">Next Month</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.round(analysis.totalVisits * 1.1)}
                  </p>
                  <p className="text-sm text-green-600">Predicted visits</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800">Cost Forecast</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    ₦{Math.round(analysis.totalCost * 1.05).toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-600">Next month estimate</p>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Rocket className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-purple-800">Savings Potential</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    ₦{Math.round(analysis.totalCost * 0.15).toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-600">Optimization opportunity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 