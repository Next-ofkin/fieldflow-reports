import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Edit, Calendar, MapPin } from "lucide-react";
import { Report } from "@/types/report";
import { generatePDF } from "./PDFReport";

interface ReportViewerProps {
  report: Report;
  onBack: () => void;
  onEdit: (report: Report) => void;
}

export const ReportViewer = ({ report, onBack, onEdit }: ReportViewerProps) => {
  const handleDownload = async () => {
    await generatePDF(report);
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case 'verification':
        return 'bg-blue-100 text-blue-800';
      case 'recovery':
        return 'bg-red-100 text-red-800';
      case 'post-disbursement':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="w-fit">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Reports
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onEdit(report)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Report
          </Button>
          <Button onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold mb-2">Field Report</CardTitle>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <Badge className={getReportTypeColor(report.reportType)}>
                  {report.reportType.replace('-', ' ').toUpperCase()}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(report.reportDate).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <div className="text-2xl font-bold">₦{report.totalCost.toLocaleString()}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {report.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">{report.description}</p>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-4">Journey Records</h3>
            <div className="space-y-3">
              {report.items.map((item, index) => (
                <Card key={item.id} className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Location</div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{item.location}</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Transportation</div>
                      <span className="font-medium">{item.transportation}</span>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Cost</div>
                      <span className="font-semibold">₦{item.cost.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Report created on</div>
              <div className="text-sm">{new Date(report.createdAt).toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};