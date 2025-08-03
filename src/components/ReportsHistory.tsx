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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      case 'recovery':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'post-disbursement':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  if (reports.length === 0) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <Calendar className="h-16 w-16 text-muted-foreground mb-6" />
            <h3 className="text-xl font-semibold mb-3 text-center">No Reports Yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Create your first field report to see it here. All your reports will be displayed in this organized view.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center sm:text-left">
            Reports History
          </CardTitle>
          <p className="text-muted-foreground text-center sm:text-left">
            {reports.length} report{reports.length !== 1 ? 's' : ''} found
          </p>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {reports.map((report) => (
            <Card key={report.id} className="p-4 sm:p-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
                    <Badge className={`${getReportTypeColor(report.reportType)} text-xs font-medium px-3 py-1 w-fit`}>
                      {report.reportType.replace('-', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="font-medium">
                        {new Date(report.reportDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-left sm:text-right">
                    <div className="text-xs sm:text-sm text-muted-foreground uppercase tracking-wide">
                      Total Cost
                    </div>
                    <div className="font-bold text-lg sm:text-xl text-primary">
                      ₦{report.totalCost.toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="space-y-3">
                  {report.description && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <p className="text-sm leading-relaxed text-foreground">
                        {report.description}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {report.items.length} location{report.items.length !== 1 ? 's' : ''} visited
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground xs:border-l xs:border-muted xs:pl-4">
                      <span className="hidden sm:inline">Locations: </span>
                      <span className="font-medium">
                        {report.items.length <= 3 
                          ? report.items.map(item => item.location).join(', ')
                          : `${report.items.slice(0, 3).map(item => item.location).join(', ')} +${report.items.length - 3} more`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="pt-3 border-t border-muted">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewReport(report)}
                      className="flex items-center justify-center gap-2 h-9"
                    >
                      <Eye className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">View</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditReport(report)}
                      className="flex items-center justify-center gap-2 h-9"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Edit</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(report)}
                      className="flex items-center justify-center gap-2 h-9"
                    >
                      <Download className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">PDF</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteReport(report.id)}
                      className="flex items-center justify-center gap-2 h-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs sm:text-sm">Delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};