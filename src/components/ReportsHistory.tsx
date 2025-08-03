import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Calendar, MapPin, Eye, Edit, Trash2 } from "lucide-react";
import { Report } from "@/types/report";
import { generatePDF } from "./PDFReport";

interface ReportsHistoryProps {
  reports: Report[];
  onViewReport: (report: Report) => void;
  onEditReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
}

export const ReportsHistory = ({ reports, onViewReport, onEditReport, onDeleteReport }: ReportsHistoryProps) => {
  const handleDownload = async (report: Report) => {
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

  if (reports.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
          <p className="text-muted-foreground text-center">
            Create your first field report to see it here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Reports History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id} className="p-3 sm:p-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <Badge className={getReportTypeColor(report.reportType)}>
                    {report.reportType.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    {new Date(report.reportDate).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  {report.description && (
                    <p className="text-sm text-foreground line-clamp-2">{report.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">
                      {report.items.length} location{report.items.length !== 1 ? 's' : ''} visited
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span className="hidden sm:inline">Locations: </span>
                    <span className="truncate">{report.items.map(item => item.location).join(', ')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4">
                <div className="text-left sm:text-right">
                  <div className="text-sm text-muted-foreground">Total Cost</div>
                  <div className="font-semibold text-lg">₦{report.totalCost.toLocaleString()}</div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewReport(report)}
                  >
                    <Eye className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditReport(report)}
                  >
                    <Edit className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(report)}
                  >
                    <Download className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">PDF</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteReport(report.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};