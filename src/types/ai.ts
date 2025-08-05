export interface TransportPattern {
  location: string;
  visitCount: number;
  totalCost: number;
  averageCost: number;
  transportationTypes: { [key: string]: number };
  lastVisited: string;
  costTrend: 'increasing' | 'decreasing' | 'stable';
  efficiency: number; // 0-100 scale
  recommendations: string[];
}

export interface RouteAnalysis {
  frequentRoutes: Array<{
    from: string;
    to: string;
    frequency: number;
    averageCost: number;
    efficiency: number;
  }>;
  optimalRoute: {
    locations: string[];
    estimatedCost: number;
    estimatedTime: string;
    efficiency: number;
  };
  coverageMap: {
    [area: string]: {
      visitCount: number;
      lastVisit: string;
      averageCost: number;
      efficiency: number;
    };
  };
}

export interface PredictiveInsights {
  costForecast: {
    nextMonth: number;
    nextQuarter: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
  };
  visitPredictions: {
    nextMonth: number;
    peakDays: string[];
    optimalTimes: string[];
  };
  efficiencyPredictions: {
    potentialSavings: number;
    optimizationOpportunities: string[];
    riskFactors: string[];
  };
}

export interface AIInsights {
  summary: string;
  recommendations: string[];
  costAnalysis: {
    totalSpent: number;
    averagePerVisit: number;
    monthlyTrend: number;
    costEfficiency: 'high' | 'medium' | 'low';
    projectedAnnualCost: number;
  };
  efficiencyMetrics: {
    visitsPerMonth: number;
    averageDistance: number;
    timeOptimization: string;
    efficiencyScore: number;
  };
  patterns: {
    mostFrequentLocations: string[];
    preferredTransport: string;
    peakVisitingHours: string[];
    seasonalTrends: string[];
    costHotspots: string[];
  };
  predictiveInsights: PredictiveInsights;
}

export interface AIReport {
  id: string;
  title: string;
  type: 'transport' | 'route' | 'cost' | 'efficiency' | 'comprehensive' | 'predictive';
  insights: AIInsights;
  routeAnalysis?: RouteAnalysis;
  transportPatterns?: TransportPattern[];
  generatedAt: string;
  dateRange: {
    start: string;
    end: string;
  };
  aiModel: string;
  confidence: number;
}

export interface LocationData {
  name: string;
  coordinates?: { lat: number; lng: number };
  visitHistory: Array<{
    date: string;
    cost: number;
    transportation: string;
    reportType: string;
  }>;
}

export interface TransportEfficiency {
  transportationType: string;
  totalUsage: number;
  totalCost: number;
  averageCost: number;
  efficiency: number; // 0-100 scale
  recommendations: string[];
  aiInsights: string[];
}

export interface AIAPIConfig {
  provider: 'deepseek' | 'openai' | 'anthropic' | 'local' | 'free';
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface AIAnalysisRequest {
  reports: any[];
  analysisType: string;
  focusAreas: string[];
  customPrompt?: string;
}

export interface AIAnalysisResponse {
  insights: string;
  recommendations: string[];
  predictions: any;
  confidence: number;
  model: string;
} 