import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Brain, 
  MessageSquare,
  Loader2,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from "lucide-react";
import { Report } from "@/types/report";
import { aiService } from "@/services/aiService";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'insight' | 'chart' | 'error';
  data?: any;
}

interface AIChatInterfaceProps {
  reports: Report[];
}

const SUGGESTED_QUESTIONS = [
  "What are my most expensive locations?",
  "How can I optimize my transport costs?",
  "Which transport method is most efficient?",
  "What's the trend in my visit frequency?",
  "Show me cost predictions for next month",
  "Which locations should I visit more often?",
  "What are the risk factors in my data?",
  "How can I improve my route efficiency?"
];

export const AIChatInterface = ({ reports }: AIChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. I can help you analyze your field report data. Ask me anything about your transport patterns, costs, or efficiency!",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Analyze the question and generate response
      const response = await generateAIResponse(inputValue);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.insights,
        sender: 'ai',
        timestamp: new Date(),
        type: 'insight',
        data: response
      };

      setMessages(prev => [...prev, aiMessage]);
      
      toast({
        title: "AI Response Generated",
        description: "Analysis completed successfully!",
      });
    } catch (error) {
      console.error('AI Chat error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error while analyzing your data. Please try rephrasing your question or try again later.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'error'
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to generate AI response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIResponse = async (question: string): Promise<any> => {
    // Configure AI service
    aiService.setConfig({
      provider: 'deepseek',
      apiKey: '', // Will use fallback
      model: 'deepseek-chat',
      temperature: 0.7,
      maxTokens: 2000
    });

    // Analyze the question type and generate appropriate response
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('expensive') || questionLower.includes('cost')) {
      return await analyzeCostData(question);
    } else if (questionLower.includes('optimize') || questionLower.includes('efficiency')) {
      return await analyzeEfficiencyData(question);
    } else if (questionLower.includes('transport') || questionLower.includes('method')) {
      return await analyzeTransportData(question);
    } else if (questionLower.includes('trend') || questionLower.includes('frequency')) {
      return await analyzeTrendData(question);
    } else if (questionLower.includes('predict') || questionLower.includes('next')) {
      return await analyzePredictiveData(question);
    } else if (questionLower.includes('location') || questionLower.includes('visit')) {
      return await analyzeLocationData(question);
    } else if (questionLower.includes('risk') || questionLower.includes('problem')) {
      return await analyzeRiskData(question);
    } else {
      return await aiService.analyzeTransportData({
        reports,
        analysisType: 'comprehensive',
        focusAreas: ['general-analysis'],
        customPrompt: question
      });
    }
  };

  const analyzeCostData = async (question: string) => {
    const allItems = reports.flatMap(report => report.items);
    const totalCost = allItems.reduce((sum, item) => sum + item.cost, 0);
    const averageCost = totalCost / allItems.length;
    
    const locationCosts = allItems.reduce((acc, item) => {
      if (!acc[item.location]) acc[item.location] = 0;
      acc[item.location] += item.cost;
      return acc;
    }, {} as { [key: string]: number });

    const expensiveLocations = Object.entries(locationCosts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      insights: `Based on your data, your total transport cost is ₦${totalCost.toLocaleString()} with an average of ₦${averageCost.toFixed(0)} per visit. The most expensive locations are: ${expensiveLocations.map(([loc, cost]) => `${loc} (₦${cost.toLocaleString()})`).join(', ')}.`,
      recommendations: [
        'Consider grouping visits to expensive locations',
        'Evaluate if all visits to high-cost locations are necessary',
        'Look for more cost-effective transport options'
      ],
      predictions: {
        costTrend: 'stable',
        potentialSavings: totalCost * 0.15
      },
      confidence: 0.85,
      model: 'local-analysis'
    };
  };

  const analyzeEfficiencyData = async (question: string) => {
    const allItems = reports.flatMap(report => report.items);
    const transportEfficiency = allItems.reduce((acc, item) => {
      if (!acc[item.transportation]) {
        acc[item.transportation] = { totalCost: 0, usage: 0 };
      }
      acc[item.transportation].totalCost += item.cost;
      acc[item.transportation].usage += 1;
      return acc;
    }, {} as { [key: string]: any });

    const efficiencyData = Object.entries(transportEfficiency).map(([transport, data]) => ({
      transport,
      averageCost: data.totalCost / data.usage,
      efficiency: Math.max(0, 100 - (data.totalCost / data.usage) / 50)
    })).sort((a, b) => b.efficiency - a.efficiency);

    const mostEfficient = efficiencyData[0];
    const leastEfficient = efficiencyData[efficiencyData.length - 1];

    return {
      insights: `Your most efficient transport method is ${mostEfficient.transport} with ${mostEfficient.efficiency.toFixed(0)}% efficiency (₦${mostEfficient.averageCost.toFixed(0)} per trip). The least efficient is ${leastEfficient.transport} with ${leastEfficient.efficiency.toFixed(0)}% efficiency.`,
      recommendations: [
        `Prioritize using ${mostEfficient.transport} for most trips`,
        `Consider alternatives to ${leastEfficient.transport}`,
        'Group nearby visits to reduce overall costs'
      ],
      predictions: {
        efficiencyImprovement: '10-15%',
        savingsPotential: '20-25%'
      },
      confidence: 0.80,
      model: 'local-analysis'
    };
  };

  const analyzeTransportData = async (question: string) => {
    const allItems = reports.flatMap(report => report.items);
    const transportUsage = allItems.reduce((acc, item) => {
      acc[item.transportation] = (acc[item.transportation] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const preferredTransport = Object.entries(transportUsage)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      insights: `Your preferred transport method is ${preferredTransport[0]} with ${preferredTransport[1]} uses. This represents ${((preferredTransport[1] / allItems.length) * 100).toFixed(0)}% of your total trips.`,
      recommendations: [
        'Consider diversifying transport options for better efficiency',
        'Evaluate if your preferred method is always the most cost-effective',
        'Look for opportunities to use more efficient transport for short trips'
      ],
      predictions: {
        transportTrend: 'stable',
        optimizationPotential: '15-20%'
      },
      confidence: 0.75,
      model: 'local-analysis'
    };
  };

  const analyzeTrendData = async (question: string) => {
    const monthlyData = reports.reduce((acc, report) => {
      const month = new Date(report.reportDate).toLocaleDateString('en-US', { month: 'short' });
      if (!acc[month]) acc[month] = { visits: 0, cost: 0 };
      acc[month].visits += report.items.length;
      acc[month].cost += report.items.reduce((sum, item) => sum + item.cost, 0);
      return acc;
    }, {} as { [key: string]: any });

    const trends = Object.entries(monthlyData).sort((a, b) => 
      new Date(a[0] + ' 1, 2024').getTime() - new Date(b[0] + ' 1, 2024').getTime()
    );

    const recentTrend = trends.slice(-2);
    const trendDirection = recentTrend.length >= 2 
      ? recentTrend[1][1].visits > recentTrend[0][1].visits ? 'increasing' : 'decreasing'
      : 'stable';

    return {
      insights: `Your visit frequency shows a ${trendDirection} trend. Recent activity shows ${recentTrend[recentTrend.length - 1]?.[1].visits || 0} visits in the latest period.`,
      recommendations: [
        trendDirection === 'increasing' ? 'Consider if increased activity is sustainable' : 'Look for opportunities to increase visit efficiency',
        'Monitor cost per visit trends',
        'Plan for seasonal variations'
      ],
      predictions: {
        nextMonthVisits: Math.round((recentTrend[recentTrend.length - 1]?.[1].visits || 0) * 1.1),
        trendDirection
      },
      confidence: 0.70,
      model: 'local-analysis'
    };
  };

  const analyzePredictiveData = async (question: string) => {
    const allItems = reports.flatMap(report => report.items);
    const totalCost = allItems.reduce((sum, item) => sum + item.cost, 0);
    const averageCost = totalCost / allItems.length;
    
    const predictedNextMonth = averageCost * 1.05; // 5% increase
    const predictedQuarter = predictedNextMonth * 3;

    return {
      insights: `Based on current trends, I predict your costs for next month will be around ₦${predictedNextMonth.toFixed(0)} and ₦${predictedQuarter.toFixed(0)} for the quarter.`,
      recommendations: [
        'Monitor actual vs predicted costs closely',
        'Implement cost control measures if predictions exceed budget',
        'Consider seasonal adjustments in your planning'
      ],
      predictions: {
        nextMonth: predictedNextMonth,
        nextQuarter: predictedQuarter,
        confidence: '75%'
      },
      confidence: 0.75,
      model: 'local-analysis'
    };
  };

  const analyzeLocationData = async (question: string) => {
    const allItems = reports.flatMap(report => report.items);
    const locationVisits = allItems.reduce((acc, item) => {
      acc[item.location] = (acc[item.location] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const frequentLocations = Object.entries(locationVisits)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    return {
      insights: `Your most frequently visited locations are: ${frequentLocations.map(([loc, visits]) => `${loc} (${visits} visits)`).join(', ')}.`,
      recommendations: [
        'Consider if all frequent visits are necessary',
        'Look for opportunities to combine visits to nearby locations',
        'Evaluate if some locations could be visited less frequently'
      ],
      predictions: {
        topLocations: frequentLocations.map(([loc]) => loc),
        visitOptimization: '20-30% potential reduction'
      },
      confidence: 0.80,
      model: 'local-analysis'
    };
  };

  const analyzeRiskData = async (question: string) => {
    const allItems = reports.flatMap(report => report.items);
    const highCostItems = allItems.filter(item => item.cost > 3000);
    const riskLocations = highCostItems.map(item => item.location);

    return {
      insights: `I've identified ${highCostItems.length} high-cost visits (over ₦3,000) across ${new Set(riskLocations).size} locations. This represents ${((highCostItems.length / allItems.length) * 100).toFixed(0)}% of your total visits.`,
      recommendations: [
        'Review necessity of high-cost visits',
        'Consider alternative transport options for expensive routes',
        'Negotiate better rates for frequent high-cost locations'
      ],
      predictions: {
        riskLevel: highCostItems.length > 5 ? 'High' : 'Medium',
        potentialSavings: highCostItems.reduce((sum, item) => sum + item.cost * 0.3, 0)
      },
      confidence: 0.85,
      model: 'local-analysis'
    };
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputValue(question);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Brain className="h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold">AI Chat Assistant</h2>
          <p className="text-muted-foreground">
            Ask questions about your data and get intelligent insights
          </p>
        </div>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with AI
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start gap-3 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    
                    <div className={`rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      
                      {message.type === 'insight' && message.data && (
                        <div className="mt-3 space-y-2">
                          {message.data.recommendations && (
                            <div>
                              <div className="font-semibold text-xs mb-1">Recommendations:</div>
                              <ul className="text-xs space-y-1">
                                {message.data.recommendations.map((rec: string, index: number) => (
                                  <li key={index} className="flex items-start gap-1">
                                    <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {message.data.predictions && (
                            <div className="flex gap-2">
                              {message.data.predictions.costTrend && (
                                <Badge variant="secondary" className="text-xs">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {message.data.predictions.costTrend}
                                </Badge>
                              )}
                              {message.data.predictions.potentialSavings && (
                                <Badge variant="secondary" className="text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  ₦{message.data.predictions.potentialSavings.toFixed(0)} savings
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="text-xs opacity-70 mt-2">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Analyzing your data...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Suggested Questions */}
          {messages.length === 1 && (
            <div className="border-t p-4">
              <div className="text-sm font-medium mb-3">Suggested Questions:</div>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about your data..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 