import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Area,
  ComposedChart,
  Scatter,
  ScatterChart,
  ZAxis
} from "recharts";
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Activity,
  Zap,
  Eye,
  Download
} from "lucide-react";
import { Report } from "@/types/report";

interface EnhancedDataVisualizationProps {
  reports: Report[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1'];

// Dark mode compatible colors
const DARK_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

export const EnhancedDataVisualization = ({ reports }: EnhancedDataVisualizationProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");

  // Enhanced data processing
  const processedData = useMemo(() => {
    if (reports.length === 0) return null;

    const allItems = reports.flatMap(report => 
      report.items.map(item => ({
        ...item,
        reportType: report.reportType,
        reportDate: report.reportDate,
        month: new Date(report.reportDate).toISOString().slice(0, 7),
        year: new Date(report.reportDate).getFullYear(),
        monthName: new Date(report.reportDate).toLocaleDateString('en-US', { month: 'short' })
      }))
    );

    // Filter by time range
    const now = new Date();
    const filteredItems = allItems.filter(item => {
      const itemDate = new Date(item.reportDate);
      switch (selectedTimeRange) {
        case "month":
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        case "quarter":
          const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          return itemDate >= quarterStart;
        case "year":
          return itemDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    // Cost trends by month
    const monthlyTrends = filteredItems.reduce((acc, item) => {
      const monthKey = item.monthName;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, totalCost: 0, visitCount: 0, averageCost: 0 };
      }
      acc[monthKey].totalCost += item.cost;
      acc[monthKey].visitCount += 1;
      acc[monthKey].averageCost = acc[monthKey].totalCost / acc[monthKey].visitCount;
      return acc;
    }, {} as { [key: string]: any });

    // Location heat map data
    const locationData = filteredItems.reduce((acc, item) => {
      if (!acc[item.location]) {
        acc[item.location] = { 
          location: item.location, 
          totalCost: 0, 
          visitCount: 0, 
          averageCost: 0,
          intensity: 0
        };
      }
      acc[item.location].totalCost += item.cost;
      acc[item.location].visitCount += 1;
      acc[item.location].averageCost = acc[item.location].totalCost / acc[item.location].visitCount;
      acc[item.location].intensity = Math.min(100, (acc[item.location].visitCount * 20) + (acc[item.location].averageCost / 100));
      return acc;
    }, {} as { [key: string]: any });

    // Transport efficiency analysis
    const transportData = filteredItems.reduce((acc, item) => {
      if (!acc[item.transportation]) {
        acc[item.transportation] = { 
          transport: item.transportation, 
          totalCost: 0, 
          usage: 0, 
          averageCost: 0,
          efficiency: 0
        };
      }
      acc[item.transportation].totalCost += item.cost;
      acc[item.transportation].usage += 1;
      acc[item.transportation].averageCost = acc[item.transportation].totalCost / acc[item.transportation].usage;
      acc[item.transportation].efficiency = Math.max(0, 100 - (acc[item.transportation].averageCost / 50));
      return acc;
    }, {} as { [key: string]: any });

    // Cost distribution by report type
    const reportTypeData = filteredItems.reduce((acc, item) => {
      if (!acc[item.reportType]) {
        acc[item.reportType] = { type: item.reportType, totalCost: 0, count: 0 };
      }
      acc[item.reportType].totalCost += item.cost;
      acc[item.reportType].count += 1;
      return acc;
    }, {} as { [key: string]: any });

    return {
      monthlyTrends: Object.values(monthlyTrends),
      locationData: Object.values(locationData).sort((a, b) => b.intensity - a.intensity),
      transportData: Object.values(transportData).sort((a, b) => b.efficiency - a.efficiency),
      reportTypeData: Object.values(reportTypeData),
      summary: {
        totalVisits: filteredItems.length,
        totalCost: filteredItems.reduce((sum, item) => sum + item.cost, 0),
        averageCost: filteredItems.reduce((sum, item) => sum + item.cost, 0) / filteredItems.length,
        uniqueLocations: new Set(filteredItems.map(item => item.location)).size,
        uniqueTransport: new Set(filteredItems.map(item => item.transportation)).size
      }
    };
  }, [reports, selectedTimeRange]);

  if (!processedData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Create some reports to see enhanced visualizations.</p>
        </div>
      </div>
    );
  }

  const getTransportColor = (transport: string) => {
    const colors = {
      'car': '#0088FE',
      'train': '#00C49F', 
      'bus': '#FFBB28',
      'bike': '#FF8042',
      'walk': '#8884D8'
    };
    return colors[transport.toLowerCase() as keyof typeof colors] || '#82ca9d';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Enhanced Data Visualization
          </h2>
          <p className="text-muted-foreground">
            Advanced charts, heat maps, and interactive analytics
          </p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.summary.totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              Across {processedData.summary.uniqueLocations} locations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{processedData.summary.totalCost.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              ₦{processedData.summary.averageCost.toFixed(0)} per visit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedData.summary.averageCost < 1000 ? 'High' : processedData.summary.averageCost < 3000 ? 'Medium' : 'Low'}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on average cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transport Types</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedData.summary.uniqueTransport}</div>
            <p className="text-xs text-muted-foreground">
              Different transport methods used
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="transport">Transport</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cost Trends Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5" />
                  Cost Trends Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processedData.monthlyTrends}>
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
                      dataKey="totalCost" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Report Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Cost by Report Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData.reportTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalCost"
                    >
                      {processedData.reportTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₦${value}`, 'Cost']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visit Frequency Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Visit Frequency by Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="visitCount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost vs Visits Scatter */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Cost vs Visit Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={processedData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="visitCount" name="Visits" />
                    <YAxis dataKey="totalCost" name="Cost" />
                    <Tooltip formatter={(value) => [`₦${value}`, 'Cost']} />
                    <Scatter dataKey="totalCost" fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Location Heat Map */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Location Visit Intensity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {processedData.locationData.slice(0, 10).map((location, index) => (
                    <div key={location.location} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{
                            backgroundColor: `hsl(${Math.min(120, 120 - location.intensity)}, 70%, 50%)`,
                            opacity: Math.min(1, location.intensity / 100)
                          }}
                        />
                        <span className="font-medium">{location.location}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{location.visitCount} visits</div>
                        <div className="text-sm text-muted-foreground">
                          ₦{location.averageCost.toFixed(0)} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Location Cost Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost by Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.locationData.slice(0, 8)} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="location" type="category" width={100} />
                    <Tooltip formatter={(value) => [`₦${value}`, 'Cost']} />
                    <Bar dataKey="totalCost" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transport" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Transport Efficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Transport Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={processedData.transportData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="transport" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Efficiency']} />
                    <Bar dataKey="efficiency" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Transport Usage Pie */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Transport Usage Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData.transportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ transport, percent }) => `${transport} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {processedData.transportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getTransportColor(entry.transport)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 