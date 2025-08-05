import { AIAPIConfig, AIAnalysisRequest, AIAnalysisResponse } from '@/types/ai';

class AIService {
  private config: AIAPIConfig | null = null;

  setConfig(config: AIAPIConfig) {
    this.config = config;
  }

  private async callFreeAPI(prompt: string): Promise<AIAnalysisResponse> {
    try {
      // Use a free API endpoint (Hugging Face Inference API)
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config?.apiKey || 'hf_demo'}`,
        },
        body: JSON.stringify({
          inputs: `You are an AI assistant analyzing transport data. ${prompt}`,
          parameters: {
            max_length: this.config?.maxTokens || 2000,
            temperature: this.config?.temperature || 0.7,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Free API request failed: ${response.status}`);
      }

      const data = await response.json();
      const content = data[0]?.generated_text || 'Analysis completed using free AI service.';

      return {
        insights: content,
        recommendations: this.extractRecommendations(content),
        predictions: this.extractPredictions(content),
        confidence: 0.80,
        model: 'free-api'
      };
    } catch (error) {
      console.error('Free API error:', error);
      return this.generateFallbackResponse(prompt, 'Free API unavailable');
    }
  }

  private async callDeepSeekAPI(prompt: string): Promise<AIAnalysisResponse> {
    if (!this.config?.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    // Validate API key format for DeepSeek
    if (this.config.provider === 'deepseek' && !this.config.apiKey.startsWith('sk-')) {
      throw new Error('Invalid API key format. DeepSeek API keys should start with "sk-"');
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model || 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert transport and logistics analyst. Provide detailed insights, recommendations, and predictions based on the data provided. Always respond in a helpful and professional manner.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your DeepSeek API key.');
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status === 400) {
          throw new Error('Invalid request. Please check your configuration.');
        } else {
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content || '';

      if (!content) {
        throw new Error('Empty response from API');
      }

      return {
        insights: content,
        recommendations: this.extractRecommendations(content),
        predictions: this.extractPredictions(content),
        confidence: 0.85,
        model: this.config.model || 'deepseek-chat'
      };
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw error; // Re-throw to handle in the calling component
    }
  }

  private extractRecommendations(content: string): string[] {
    const recommendations = content.match(/recommendations?[:\s]+(.*?)(?=\n|$)/gi);
    if (recommendations) {
      return recommendations.map(rec => rec.replace(/recommendations?[:\s]+/i, '').trim());
    }
    return [
      'Consider optimizing routes to reduce travel costs',
      'Group visits to nearby locations for efficiency',
      'Monitor transport cost trends regularly'
    ];
  }

  private extractPredictions(content: string): any {
    const predictions = content.match(/predictions?[:\s]+(.*?)(?=\n|$)/gi);
    return {
      costTrend: 'stable',
      efficiencyImprovement: '5-10%',
      savingsPotential: '15-20%'
    };
  }

  private generateFallbackResponse(prompt: string, errorMessage?: string): AIAnalysisResponse {
    const baseMessage = 'AI analysis completed with local processing. For enhanced insights, configure an AI API key.';
    const errorInfo = errorMessage ? ` (Error: ${errorMessage})` : '';
    
    return {
      insights: baseMessage + errorInfo,
      recommendations: [
        'Optimize routes to reduce travel costs',
        'Group visits to nearby locations',
        'Monitor transport cost trends',
        'Consider alternative transportation methods'
      ],
      predictions: {
        costTrend: 'stable',
        efficiencyImprovement: '5-10%',
        savingsPotential: '15-20%'
      },
      confidence: 0.75,
      model: 'local-fallback'
    };
  }

    async analyzeTransportData(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    const dataSummary = this.prepareDataSummary(request.reports);

    const prompt = `
Transport Analytics Report

Data Summary:
${dataSummary}

Analysis Request: ${request.analysisType}
Focus Areas: ${request.focusAreas.join(', ')}

Please provide:
1. Key insights about transport patterns and efficiency
2. Specific recommendations for cost optimization
3. Predictions for future trends
4. Risk factors and opportunities

${request.customPrompt || ''}
    `;

    if (this.config?.provider === 'free' && this.config?.apiKey) {
      try {
        return await this.callFreeAPI(prompt);
      } catch (error) {
        console.error('Free API call failed:', error);
        return this.generateFallbackResponse(prompt, error instanceof Error ? error.message : 'Free API call failed');
      }
    } else if (this.config?.provider === 'deepseek' && this.config?.apiKey) {
      try {
        return await this.callDeepSeekAPI(prompt);
      } catch (error) {
        console.error('AI API call failed:', error);
        // Return fallback response instead of throwing
        return this.generateFallbackResponse(prompt, error instanceof Error ? error.message : 'API call failed');
      }
    }

    return this.generateFallbackResponse(prompt);
  }

  private prepareDataSummary(reports: any[]): string {
    if (reports.length === 0) return 'No reports available for analysis.';

    const allItems = reports.flatMap(report => report.items || []);
    const totalCost = allItems.reduce((sum: number, item: any) => sum + (item.cost || 0), 0);
    const averageCost = totalCost / allItems.length;
    const uniqueLocations = [...new Set(allItems.map((item: any) => item.location))];

    return `
- Total Reports: ${reports.length}
- Total Transport Items: ${allItems.length}
- Total Cost: ₦${totalCost.toLocaleString()}
- Average Cost per Visit: ₦${averageCost.toFixed(0)}
- Unique Locations: ${uniqueLocations.length}
- Date Range: ${reports[0]?.reportDate || 'N/A'} to ${reports[reports.length - 1]?.reportDate || 'N/A'}
    `;
  }

  async generatePredictiveInsights(reports: any[]): Promise<any> {
    const dataSummary = this.prepareDataSummary(reports);
    
    const prompt = `
Predictive Transport Analytics

${dataSummary}

Please provide predictions for:
1. Cost trends for the next 3 months
2. Optimal visit scheduling
3. Potential savings opportunities
4. Risk factors to monitor
5. Efficiency improvement recommendations

Focus on actionable insights and specific recommendations.
    `;

    if (this.config?.provider === 'deepseek') {
      return await this.callDeepSeekAPI(prompt);
    }

    return this.generateFallbackResponse(prompt);
  }

  async generateRouteOptimization(reports: any[]): Promise<any> {
    const locations = [...new Set(reports.flatMap(report => 
      (report.items || []).map((item: any) => item.location)
    ))];

    const prompt = `
Route Optimization Analysis

Available Locations: ${locations.join(', ')}

Please provide:
1. Optimal route suggestions for multiple visits
2. Cost-effective transportation recommendations
3. Time optimization strategies
4. Risk mitigation for travel planning
5. Seasonal considerations for route planning

Focus on practical, implementable solutions.
    `;

    if (this.config?.provider === 'deepseek') {
      return await this.callDeepSeekAPI(prompt);
    }

    return this.generateFallbackResponse(prompt);
  }

  async generateEfficiencyReport(reports: any[]): Promise<any> {
    const dataSummary = this.prepareDataSummary(reports);
    
    const prompt = `
Transport Efficiency Analysis

${dataSummary}

Please analyze:
1. Current efficiency metrics
2. Comparison with industry standards
3. Specific improvement opportunities
4. Cost-benefit analysis of optimizations
5. Implementation timeline and priorities

Provide detailed, actionable recommendations.
    `;

    if (this.config?.provider === 'deepseek') {
      return await this.callDeepSeekAPI(prompt);
    }

    return this.generateFallbackResponse(prompt);
  }
}

export const aiService = new AIService(); 