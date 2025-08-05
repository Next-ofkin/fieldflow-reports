import { useState, useMemo } from 'react';
import { Report } from '@/types/report';
import { 
  TransportPattern, 
  RouteAnalysis, 
  AIInsights, 
  AIReport, 
  TransportEfficiency 
} from '@/types/ai';
import { useToast } from '@/hooks/use-toast';

export const useAIAnalysis = (reports: Report[]) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Extract all transport items from reports
  const allTransportItems = useMemo(() => {
    return reports.flatMap(report => 
      report.items.map(item => ({
        ...item,
        reportType: report.reportType,
        reportDate: report.reportDate,
        reportId: report.id
      }))
    );
  }, [reports]);

  // Analyze transport patterns by location
  const transportPatterns = useMemo((): TransportPattern[] => {
    const locationMap = new Map<string, {
      visits: Array<{ cost: number; transportation: string; date: string }>;
      totalCost: number;
    }>();

    allTransportItems.forEach(item => {
      if (!locationMap.has(item.location)) {
        locationMap.set(item.location, { visits: [], totalCost: 0 });
      }
      const location = locationMap.get(item.location)!;
      location.visits.push({
        cost: item.cost,
        transportation: item.transportation,
        date: item.reportDate
      });
      location.totalCost += item.cost;
    });

    return Array.from(locationMap.entries()).map(([location, data]) => {
      const visitCount = data.visits.length;
      const averageCost = data.totalCost / visitCount;
      const transportationTypes = data.visits.reduce((acc, visit) => {
        acc[visit.transportation] = (acc[visit.transportation] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Calculate cost trend
      const sortedVisits = data.visits.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const recentCosts = sortedVisits.slice(-3).map(v => v.cost);
      const olderCosts = sortedVisits.slice(0, 3).map(v => v.cost);
      
      let costTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (recentCosts.length >= 2 && olderCosts.length >= 2) {
        const recentAvg = recentCosts.reduce((a, b) => a + b, 0) / recentCosts.length;
        const olderAvg = olderCosts.reduce((a, b) => a + b, 0) / olderCosts.length;
        if (recentAvg > olderAvg * 1.1) costTrend = 'increasing';
        else if (recentAvg < olderAvg * 0.9) costTrend = 'decreasing';
      }

      // Calculate efficiency score
      const efficiency = Math.max(0, 100 - (averageCost / 50));
      
      // Generate recommendations based on patterns
      const recommendations = [];
      if (averageCost > 2000) recommendations.push('Consider more cost-effective transportation options');
      if (visitCount < 3) recommendations.push('Limited visits - consider if this location is necessary');
      if (costTrend === 'increasing') recommendations.push('Costs are increasing - monitor this location');

      return {
        location,
        visitCount,
        totalCost: data.totalCost,
        averageCost,
        transportationTypes,
        lastVisited: sortedVisits[sortedVisits.length - 1]?.date || '',
        costTrend,
        efficiency,
        recommendations
      };
    }).sort((a, b) => b.visitCount - a.visitCount);
  }, [allTransportItems]);

  // Analyze routes and frequent paths
  const routeAnalysis = useMemo((): RouteAnalysis => {
    const routeMap = new Map<string, { frequency: number; totalCost: number; costs: number[] }>();
    const coverageMap: { [area: string]: { visitCount: number; lastVisit: string; averageCost: number; efficiency: number } } = {};

    // Analyze routes between consecutive visits in reports
    reports.forEach(report => {
      const sortedItems = report.items.sort((a, b) => a.location.localeCompare(b.location));
      for (let i = 0; i < sortedItems.length - 1; i++) {
        const from = sortedItems[i].location;
        const to = sortedItems[i + 1].location;
        const routeKey = `${from} → ${to}`;
        
        if (!routeMap.has(routeKey)) {
          routeMap.set(routeKey, { frequency: 0, totalCost: 0, costs: [] });
        }
        const route = routeMap.get(routeKey)!;
        route.frequency++;
        route.totalCost += sortedItems[i].cost;
        route.costs.push(sortedItems[i].cost);
      }
    });

    // Build coverage map
    transportPatterns.forEach(pattern => {
      const area = pattern.location.split(',')[0].trim(); // Extract area from location
      if (!coverageMap[area]) {
        coverageMap[area] = { visitCount: 0, lastVisit: '', averageCost: 0, efficiency: 0 };
      }
      coverageMap[area].visitCount += pattern.visitCount;
      coverageMap[area].lastVisit = pattern.lastVisited;
      coverageMap[area].averageCost = (coverageMap[area].averageCost + pattern.averageCost) / 2;
      coverageMap[area].efficiency = Math.max(0, 100 - (coverageMap[area].averageCost / 50));
    });

    const frequentRoutes = Array.from(routeMap.entries())
      .map(([route, data]) => {
        const [from, to] = route.split(' → ');
        const averageCost = data.totalCost / data.frequency;
        const efficiency = Math.max(0, 100 - (averageCost / 50));
        return {
          from,
          to,
          frequency: data.frequency,
          averageCost,
          efficiency
        };
      })
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Calculate optimal route (most efficient path)
    const optimalRoute = calculateOptimalRoute(transportPatterns);

    return {
      frequentRoutes,
      optimalRoute,
      coverageMap
    };
  }, [reports, transportPatterns]);

  // Calculate optimal route using simple algorithm
  const calculateOptimalRoute = (patterns: TransportPattern[]) => {
    const topLocations = patterns.slice(0, 5).map(p => p.location);
    const estimatedCost = patterns.slice(0, 5).reduce((sum, p) => sum + p.averageCost, 0);
    const estimatedTime = `${topLocations.length * 2} hours`; // Rough estimate
    const efficiency = Math.max(0, 100 - (estimatedCost / 100));

    return {
      locations: topLocations,
      estimatedCost,
      estimatedTime,
      efficiency
    };
  };

  // Generate comprehensive AI insights
  const generateAIInsights = useMemo((): AIInsights => {
    const totalSpent = allTransportItems.reduce((sum, item) => sum + item.cost, 0);
    const totalVisits = allTransportItems.length;
    const averagePerVisit = totalSpent / totalVisits;

    // Calculate monthly trend
    const monthlyData = new Map<string, number>();
    allTransportItems.forEach(item => {
      const month = new Date(item.reportDate).toISOString().slice(0, 7);
      monthlyData.set(month, (monthlyData.get(month) || 0) + item.cost);
    });

    const monthlyTrend = Array.from(monthlyData.values()).slice(-2).reduce((a, b) => b - a, 0);

    // Determine cost efficiency
    let costEfficiency: 'high' | 'medium' | 'low' = 'medium';
    if (averagePerVisit < 1000) costEfficiency = 'high';
    else if (averagePerVisit > 3000) costEfficiency = 'low';

    // Find most frequent locations
    const mostFrequentLocations = transportPatterns
      .slice(0, 5)
      .map(p => p.location);

    // Find preferred transport
    const transportCounts = allTransportItems.reduce((acc, item) => {
      acc[item.transportation] = (acc[item.transportation] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const preferredTransport = Object.entries(transportCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';

    // Calculate visits per month
    const firstDate = new Date(Math.min(...allTransportItems.map(item => new Date(item.reportDate).getTime())));
    const lastDate = new Date(Math.max(...allTransportItems.map(item => new Date(item.reportDate).getTime())));
    const monthsDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const visitsPerMonth = totalVisits / Math.max(monthsDiff, 1);

    // Generate recommendations
    const recommendations = [];
    if (costEfficiency === 'low') {
      recommendations.push('Consider using more cost-effective transportation options for frequent routes');
    }
    if (transportPatterns.some(p => p.costTrend === 'increasing')) {
      recommendations.push('Transport costs are increasing in some areas - consider alternative routes');
    }
    if (mostFrequentLocations.length > 0) {
      recommendations.push(`Focus on optimizing routes to your most frequent locations: ${mostFrequentLocations.slice(0, 3).join(', ')}`);
    }

    // Calculate projected annual cost
    const projectedAnnualCost = totalSpent * 12;
    
    // Calculate efficiency score
    const efficiencyScore = Math.max(0, 100 - (averagePerVisit / 50));
    
    // Identify cost hotspots
    const costHotspots = transportPatterns
      .filter(p => p.averageCost > 2000)
      .slice(0, 5)
      .map(p => p.location);

    return {
      summary: `Analysis of ${totalVisits} transport records shows ${costEfficiency} cost efficiency with ${visitsPerMonth.toFixed(1)} visits per month on average.`,
      recommendations,
      costAnalysis: {
        totalSpent,
        averagePerVisit,
        monthlyTrend,
        costEfficiency,
        projectedAnnualCost
      },
      efficiencyMetrics: {
        visitsPerMonth,
        averageDistance: 0, // Would need coordinates for accurate calculation
        timeOptimization: 'Consider batch visits to nearby locations',
        efficiencyScore
      },
      patterns: {
        mostFrequentLocations,
        preferredTransport,
        peakVisitingHours: ['9:00 AM', '2:00 PM'], // Placeholder
        seasonalTrends: ['Higher activity in Q4'], // Placeholder
        costHotspots
      },
      predictiveInsights: {
        costForecast: {
          nextMonth: totalSpent * 1.05,
          nextQuarter: totalSpent * 3.15,
          trend: monthlyTrend > 0 ? 'increasing' : 'decreasing',
          confidence: 0.75
        },
        visitPredictions: {
          nextMonth: Math.round(visitsPerMonth),
          peakDays: ['Monday', 'Wednesday', 'Friday'],
          optimalTimes: ['9:00 AM', '2:00 PM']
        },
        efficiencyPredictions: {
          potentialSavings: totalSpent * 0.15,
          optimizationOpportunities: ['Route optimization', 'Transport mode selection'],
          riskFactors: ['Increasing fuel costs', 'Traffic congestion']
        }
      }
    };
  }, [allTransportItems, transportPatterns]);

  // Generate transport efficiency analysis
  const transportEfficiency = useMemo((): TransportEfficiency[] => {
    const efficiencyMap = new Map<string, { usage: number; totalCost: number; costs: number[] }>();

    allTransportItems.forEach(item => {
      if (!efficiencyMap.has(item.transportation)) {
        efficiencyMap.set(item.transportation, { usage: 0, totalCost: 0, costs: [] });
      }
      const transport = efficiencyMap.get(item.transportation)!;
      transport.usage++;
      transport.totalCost += item.cost;
      transport.costs.push(item.cost);
    });

    return Array.from(efficiencyMap.entries()).map(([type, data]) => {
      const averageCost = data.totalCost / data.usage;
      const efficiency = Math.max(0, 100 - (averageCost / 100)); // Simple efficiency calculation

      const recommendations = [];
      if (averageCost > 2000) recommendations.push('Consider more cost-effective alternatives');
      if (data.usage < 5) recommendations.push('Limited usage - evaluate if this transport type is necessary');

      return {
        transportationType: type,
        totalUsage: data.usage,
        totalCost: data.totalCost,
        averageCost,
        efficiency,
        recommendations,
        aiInsights: [
          `This transport type has ${data.usage} uses with ${efficiency.toFixed(0)}% efficiency`,
          averageCost > 2000 ? 'Consider more cost-effective alternatives' : 'This transport type is cost-effective',
          data.usage < 5 ? 'Limited usage - evaluate necessity' : 'Well-utilized transport option'
        ]
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
  }, [allTransportItems]);

  // Generate AI report
  const generateAIReport = async (type: AIReport['type'] = 'comprehensive'): Promise<AIReport> => {
    setLoading(true);
    try {
      const insights = generateAIInsights;
      const report: AIReport = {
        id: crypto.randomUUID(),
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Analysis Report`,
        type,
        insights,
        routeAnalysis: type === 'route' || type === 'comprehensive' ? routeAnalysis : undefined,
        transportPatterns: type === 'transport' || type === 'comprehensive' ? transportPatterns : undefined,
        generatedAt: new Date().toISOString(),
        dateRange: {
          start: reports[reports.length - 1]?.reportDate || '',
          end: reports[0]?.reportDate || ''
        },
        aiModel: 'local-analysis',
        confidence: 0.85
      };

      toast({
        title: "AI Report Generated",
        description: `${type} analysis report has been created successfully.`,
      });

      return report;
    } catch (error) {
      console.error('Error generating AI report:', error);
      toast({
        title: "Error",
        description: "Failed to generate AI report. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    transportPatterns,
    routeAnalysis,
    aiInsights: generateAIInsights,
    transportEfficiency,
    generateAIReport,
    allTransportItems
  };
}; 