import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Report } from "@/types/report";

interface AITestProps {
  reports: Report[];
}

export const AITest = ({ reports }: AITestProps) => {
  console.log('AITest reports:', reports);
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Analytics Test</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Reports Count: {reports.length}</h3>
              <p className="text-sm text-muted-foreground">
                Total reports available for analysis
              </p>
            </div>
            
            {reports.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Sample Report Data:</h3>
                <div className="bg-muted p-3 rounded text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(reports[0], null, 2)}
                  </pre>
                </div>
              </div>
            )}
            
            {reports.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No reports found. Create some reports first to see AI analytics.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 