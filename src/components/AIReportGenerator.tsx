import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  TrendingUp, 
  Route, 
  Zap, 
  Brain, 
  Download,
  Loader2,
  CheckCircle
} from "lucide-react";
import { useAIAnalysis } from "@/hooks/useAIAnalysis";
import { Report } from "@/types/report";
import { AIReport } from "@/types/ai";
import { useToast } from "@/hooks/use-toast";

interface AIReportGeneratorProps {
  reports: Report[];
}

const REPORT_TYPES = [
  { value: 'comprehensive', label: 'Comprehensive Analysis', icon: Brain, description: 'Complete transport analysis with all insights' },
  { value: 'transport', label: 'Transport Patterns', icon: TrendingUp, description: 'Focus on transport usage and patterns' },
  { value: 'route', label: 'Route Analysis', icon: Route, description: 'Route optimization and frequent paths' },
  { value: 'cost', label: 'Cost Analysis', icon: Zap, description: 'Cost efficiency and spending patterns' },
  { value: 'efficiency', label: 'Efficiency Report', icon: CheckCircle, description: 'Transport efficiency and recommendations' }
];

export const AIReportGenerator = ({ reports }: AIReportGeneratorProps) => {
  const [selectedType, setSelectedType] = useState<AIReport['type']>('comprehensive');
  const [generatedReport, setGeneratedReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  
  const { generateAIReport, aiInsights } = useAIAnalysis(reports);

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const report = await generateAIReport(selectedType);
      setGeneratedReport(report);
      toast({
        title: "Report Generated",
        description: `${report.title} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!generatedReport) return;
    
    const reportContent = `
AI TRANSPORT ANALYSIS REPORT
${generatedReport.title}
Generated: ${new Date(generatedReport.generatedAt).toLocaleString()}
Date Range: ${generatedReport.dateRange.start} to ${generatedReport.dateRange.end}

SUMMARY:
${generatedReport.insights.summary}

COST ANALYSIS:
- Total Spent: ₦${generatedReport.insights.costAnalysis.totalSpent.toLocaleString()}
- Average per Visit: ₦${generatedReport.insights.costAnalysis.averagePerVisit.toFixed(0)}
- Monthly Trend: ₦${generatedReport.insights.costAnalysis.monthlyTrend.toFixed(0)}
- Efficiency: ${generatedReport.insights.costAnalysis.costEfficiency}

RECOMMENDATIONS:
${generatedReport.insights.recommendations.map(rec => `• ${rec}`).join('\n')}

PATTERNS:
- Most Frequent Locations: ${generatedReport.insights.patterns.mostFrequentLocations.join(', ')}
- Preferred Transport: ${generatedReport.insights.patterns.preferredTransport}
- Visits per Month: ${generatedReport.insights.efficiencyMetrics.visitsPerMonth.toFixed(1)}

${generatedReport.routeAnalysis ? `
ROUTE ANALYSIS:
${generatedReport.routeAnalysis.frequentRoutes.map(route => 
  `• ${route.from} → ${route.to}: ${route.frequency} times (₦${route.averageCost.toFixed(0)} avg)`
).join('\n')}
` : ''}

${generatedReport.transportPatterns ? `
TRANSPORT PATTERNS:
${generatedReport.transportPatterns.slice(0, 10).map(pattern => 
  `• ${pattern.location}: ${pattern.visitCount} visits, ₦${pattern.averageCost.toFixed(0)} avg`
).join('\n')}
` : ''}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={selectedType} onValueChange={(value: AIReport['type']) => setSelectedType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport} 
                disabled={loading || reports.length === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </div>
          </div>

          {reports.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No reports available for analysis.</p>
              <p className="text-sm">Create some reports first to generate AI insights.</p>
            </div>
          )}

          {reports.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-semibold">{reports.length}</div>
                <div className="text-muted-foreground">Total Reports</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-semibold">₦{aiInsights.costAnalysis.totalSpent.toLocaleString()}</div>
                <div className="text-muted-foreground">Total Spent</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="font-semibold capitalize">{aiInsights.costAnalysis.costEfficiency}</div>
                <div className="text-muted-foreground">Efficiency</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {generatedReport && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Generated Report
              </span>
              <Badge variant="outline">{generatedReport.type}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-semibold">{generatedReport.title}</h4>
              <p className="text-sm text-muted-foreground">
                Generated on {new Date(generatedReport.generatedAt).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">
                Date Range: {generatedReport.dateRange.start} to {generatedReport.dateRange.end}
              </p>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Summary</h5>
              <p className="text-sm">{generatedReport.insights.summary}</p>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Key Insights</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Total Spent:</strong> ₦{generatedReport.insights.costAnalysis.totalSpent.toLocaleString()}
                </div>
                <div>
                  <strong>Average per Visit:</strong> ₦{generatedReport.insights.costAnalysis.averagePerVisit.toFixed(0)}
                </div>
                <div>
                  <strong>Efficiency:</strong> {generatedReport.insights.costAnalysis.costEfficiency}
                </div>
                <div>
                  <strong>Visits per Month:</strong> {generatedReport.insights.efficiencyMetrics.visitsPerMonth.toFixed(1)}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="font-medium">Recommendations</h5>
              <ul className="space-y-1 text-sm">
                {generatedReport.insights.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleDownloadReport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button 
                onClick={() => setGeneratedReport(null)} 
                variant="ghost" 
                size="sm"
              >
                Generate New Report
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 