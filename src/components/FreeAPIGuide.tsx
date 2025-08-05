import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Info, 
  Key, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";

export const FreeAPIGuide = () => {
  return (
    <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
          <Info className="h-5 w-5" />
          Free AI API Setup Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Option 1: Hugging Face (Recommended)</span>
          </div>
          
          <div className="ml-6 space-y-2 text-sm">
            <p>1. Go to <a href="https://huggingface.co" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline flex items-center gap-1">
              https://huggingface.co <ExternalLink className="h-3 w-3" />
            </a></p>
            <p>2. Sign up for a free account</p>
            <p>3. Go to Settings → Access Tokens</p>
            <p>4. Create a new token (read access is enough)</p>
            <p>5. Copy the token and paste it in the API Key field</p>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Option 2: No API Key (Local Analysis)</span>
          </div>
          
          <div className="ml-6 space-y-2 text-sm">
            <p>• Select "Local Analysis" as provider</p>
            <p>• No API key needed</p>
            <p>• Basic analysis using your data</p>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <span className="text-sm font-medium">Important Notes:</span>
          </div>
          
          <div className="ml-6 space-y-2 text-sm">
            <p>• Free APIs have rate limits</p>
            <p>• Responses may be slower than paid services</p>
            <p>• For production use, consider paid APIs</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            <Sparkles className="h-3 w-3 mr-1" />
            Free Forever
          </Badge>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <Globe className="h-3 w-3 mr-1" />
            No Credit Card
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}; 