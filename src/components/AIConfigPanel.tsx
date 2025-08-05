import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Key, 
  TestTube, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Brain,
  Sparkles,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { aiService } from "@/services/aiService";
import { FreeAPIGuide } from "@/components/FreeAPIGuide";

interface AIConfigPanelProps {
  onConfigChange?: (config: any) => void;
}

export const AIConfigPanel = ({ onConfigChange }: AIConfigPanelProps) => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const { toast } = useToast();

  const [config, setConfig] = useState({
    provider: 'free' as 'deepseek' | 'openai' | 'anthropic' | 'local' | 'free',
    apiKey: '',
    model: 'huggingface-dialo',
    temperature: 0.7,
    maxTokens: 2000,
    enabled: true
  });

  const handleConfigChange = (key: string, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
    
    // Save to localStorage
    localStorage.setItem('aiConfig', JSON.stringify(newConfig));
  };

  const handleTestConnection = async () => {
    if (!config.apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key first.",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Configure the AI service
      aiService.setConfig({
        provider: config.provider,
        apiKey: config.apiKey,
        model: config.model,
        temperature: config.temperature,
        maxTokens: config.maxTokens
      });

      // Test with a simple prompt
      const response = await aiService.analyzeTransportData({
        reports: [],
        analysisType: 'test',
        focusAreas: ['connection-test'],
        customPrompt: 'This is a test connection. Please respond with "Connection successful" if you can see this message.'
      });

      if (response && response.insights) {
        setTestResult('success');
        toast({
          title: "Connection Successful!",
          description: "Your API key is working correctly.",
        });
      } else {
        throw new Error('Invalid response');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setTestResult('error');
      toast({
        title: "Connection Failed",
        description: "Please check your API key and try again.",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const loadSavedConfig = () => {
    const saved = localStorage.getItem('aiConfig');
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved);
        setConfig(savedConfig);
        onConfigChange?.(savedConfig);
      } catch (error) {
        console.error('Failed to load saved config:', error);
      }
    }
  };

  // Load saved config on mount
  useState(() => {
    loadSavedConfig();
  });

  const getProviderInfo = (provider: string) => {
    const providers = {
      free: {
        name: 'Free API (Hugging Face)',
        url: 'https://huggingface.co',
        models: ['huggingface-dialo', 'huggingface-gpt2', 'huggingface-bert']
      },
      deepseek: {
        name: 'DeepSeek',
        url: 'https://platform.deepseek.com',
        models: ['deepseek-chat', 'deepseek-coder', 'deepseek-chat-33b']
      },
      openai: {
        name: 'OpenAI',
        url: 'https://platform.openai.com',
        models: ['gpt-4', 'gpt-3.5-turbo', 'gpt-4-turbo']
      },
      anthropic: {
        name: 'Anthropic',
        url: 'https://console.anthropic.com',
        models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku']
      },
      local: {
        name: 'Local Analysis',
        url: 'No API key needed',
        models: ['local-analysis']
      }
    };
    return providers[provider as keyof typeof providers] || providers.local;
  };

  const currentProvider = getProviderInfo(config.provider);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          AI Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Provider Selection */}
        <div className="space-y-2">
          <Label htmlFor="provider">AI Provider</Label>
          <Select value={config.provider} onValueChange={(value) => handleConfigChange('provider', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free API (Hugging Face)</SelectItem>
              <SelectItem value="deepseek">DeepSeek</SelectItem>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="local">Local Analysis (No API)</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
            Using {currentProvider.name} - {currentProvider.url}
          </div>
        </div>

        {/* API Key Input */}
        {config.provider !== 'local' && (
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                placeholder="Enter your API key"
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">
              Your API key is stored locally and never sent to our servers
            </div>
          </div>
        )}

        {/* Model Selection */}
        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select value={config.model} onValueChange={(value) => handleConfigChange('model', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currentProvider.models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <Label htmlFor="temperature">Temperature: {config.temperature}</Label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={config.temperature}
            onChange={(e) => handleConfigChange('temperature', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            Lower = more focused, Higher = more creative
          </div>
        </div>

        {/* Max Tokens */}
        <div className="space-y-2">
          <Label htmlFor="maxTokens">Max Tokens: {config.maxTokens}</Label>
          <input
            type="range"
            min="500"
            max="4000"
            step="100"
            value={config.maxTokens}
            onChange={(e) => handleConfigChange('maxTokens', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-muted-foreground">
            Maximum response length
          </div>
        </div>

        {/* Enable/Disable */}
        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={config.enabled}
            onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
          />
          <Label htmlFor="enabled">Enable AI Features</Label>
        </div>

        {/* Test Connection */}
        {config.provider !== 'local' && (
          <div className="space-y-3">
            <Button 
              onClick={handleTestConnection} 
              disabled={isTesting || !config.apiKey.trim()}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <TestTube className="h-4 w-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            {testResult && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                testResult === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {testResult === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">
                  {testResult === 'success' 
                    ? 'Connection successful! Your API key is working.' 
                    : 'Connection failed. Please check your API key.'
                  }
                </span>
              </div>
            )}
          </div>
        )}

        {/* Status */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="text-sm font-medium">AI Status</span>
          </div>
          <Badge variant={config.enabled ? "default" : "secondary"}>
            {config.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* Free API Guide */}
        {config.provider === 'free' && (
          <div className="mt-4">
            <FreeAPIGuide />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              localStorage.removeItem('aiConfig');
              setConfig({
                provider: 'free',
                apiKey: '',
                model: 'huggingface-dialo',
                temperature: 0.7,
                maxTokens: 2000,
                enabled: true
              });
              toast({
                title: "Configuration Reset",
                description: "AI settings have been reset to defaults.",
              });
            }}
          >
            Reset Config
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              const configStr = JSON.stringify(config, null, 2);
              navigator.clipboard.writeText(configStr);
              toast({
                title: "Configuration Copied",
                description: "Current settings copied to clipboard.",
              });
            }}
          >
            Export Config
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}; 