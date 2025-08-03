import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ReportForm } from "@/components/ReportForm";
import { ReportsHistory } from "@/components/ReportsHistory";
import { ReportViewer } from "@/components/ReportViewer";
import { generatePDF } from "@/components/PDFReport";
import { Report } from "@/types/report";
import { useReports } from "@/hooks/useReports";
import { useAuth } from "@/hooks/useAuth";
import { FileText, History, Loader2, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const { user, loading: authLoading, signOut, session } = useAuth();
  const navigate = useNavigate();
  const { reports, loading, createReport, updateReport, deleteReport } = useReports();
  const [activeTab, setActiveTab] = useState("create");
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  const handleReportSubmit = async (reportData: Omit<Report, 'id' | 'createdAt'>) => {
    if (editingReport) {
      const success = await updateReport(editingReport.id, reportData);
      if (success) {
        setEditingReport(null);
        setActiveTab("history");
      }
    } else {
      const reportId = await createReport(reportData);
      if (reportId) {
        const newReport: Report = {
          ...reportData,
          id: reportId,
          createdAt: new Date().toISOString(),
        };
        await generatePDF(newReport);
        setActiveTab("history");
      }
    }
  };

  const handleViewReport = (report: Report) => {
    setViewingReport(report);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setViewingReport(null);
    setActiveTab("create");
  };

  const handleDeleteReport = async (reportId: string) => {
    await deleteReport(reportId);
  };

  const handleBackToReports = () => setViewingReport(null);
  const handleCancelEdit = () => {
    setEditingReport(null);
    setActiveTab("history");
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (viewingReport) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <ReportViewer
            report={viewingReport}
            onBack={handleBackToReports}
            onEdit={handleEditReport}
          />
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => email?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1">
              Field Report Generator
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Create professional field reports for verification and recovery visits
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Total Reports Created: <strong>{reports.length}</strong>
            </p>
            {session?.user && (
              <p className="text-xs text-muted-foreground mt-1">
                Last login: {new Date(session.user.last_sign_in_at || session.user.created_at).toLocaleString()}
              </p>
            )}
          </div>

          {/* User info and controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-1 text-sm text-muted-foreground border">
              <div className="bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-semibold">
                {getInitials(user.email)}
              </div>
              <span>{user.email}</span>
            </div>

            <ThemeToggle />

            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-6 sm:mb-8">
            <TabsTrigger value="create" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Create Report</span>
              <span className="sm:hidden">Create</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">Reports History</span>
              <span className="sm:hidden">History</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <ReportForm
              onSubmit={handleReportSubmit}
              editingReport={editingReport}
              onCancelEdit={handleCancelEdit}
            />
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <ReportsHistory
              reports={reports}
              onViewReport={handleViewReport}
              onEditReport={handleEditReport}
              onDeleteReport={handleDeleteReport}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
