import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Report, ReportItem } from '@/types/report';
import { useToast } from '@/hooks/use-toast';

export const useReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch reports from database
  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select(`
          id,
          report_type,
          report_date,
          description,
          total_cost,
          account_number,
          account_name,
          bank_name,
          created_at,
          updated_at,
          report_items (
            id,
            location,
            transportation,
            cost
          )
        `)
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Transform database data to match Report interface
      const transformedReports: Report[] = (reportsData || []).map(dbReport => ({
        id: dbReport.id,
        reportType: dbReport.report_type as 'verification' | 'recovery' | 'post-disbursement',
        reportDate: dbReport.report_date,
        description: dbReport.description || '',
        totalCost: Number(dbReport.total_cost),
        accountNumber: dbReport.account_number || '',
        accountName: dbReport.account_name || '',
        bankName: dbReport.bank_name || '',
        createdAt: dbReport.created_at,
        items: (dbReport.report_items || []).map(item => ({
          id: item.id,
          location: item.location,
          transportation: item.transportation,
          cost: Number(item.cost),
        }))
      }));

      setReports(transformedReports);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Create a new report
  const createReport = async (reportData: Omit<Report, 'id' | 'createdAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to create reports.",
          variant: "destructive",
        });
        return null;
      }

      // Insert report
      const { data: reportResult, error: reportError } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          report_type: reportData.reportType,
          report_date: reportData.reportDate,
          description: reportData.description,
          total_cost: reportData.totalCost,
          account_number: reportData.accountNumber,
          account_name: reportData.accountName,
          bank_name: reportData.bankName,
        })
        .select()
        .single();

      if (reportError) throw reportError;

      // Insert report items
      if (reportData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('report_items')
          .insert(
            reportData.items.map(item => ({
              report_id: reportResult.id,
              location: item.location,
              transportation: item.transportation,
              cost: item.cost,
            }))
          );

        if (itemsError) throw itemsError;
      }

      // Refresh reports list
      await fetchReports();

      toast({
        title: "Report Created Successfully",
        description: "Your field report has been saved to the database.",
      });

      return reportResult.id;
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create report. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update an existing report
  const updateReport = async (reportId: string, reportData: Omit<Report, 'id' | 'createdAt'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to update reports.",
          variant: "destructive",
        });
        return false;
      }

      // Update report
      const { error: reportError } = await supabase
        .from('reports')
        .update({
          report_type: reportData.reportType,
          report_date: reportData.reportDate,
          description: reportData.description,
          total_cost: reportData.totalCost,
          account_number: reportData.accountNumber,
          account_name: reportData.accountName,
          bank_name: reportData.bankName,
        })
        .eq('id', reportId)
        .eq('user_id', user.id);

      if (reportError) throw reportError;

      // Delete existing items and insert new ones
      const { error: deleteError } = await supabase
        .from('report_items')
        .delete()
        .eq('report_id', reportId);

      if (deleteError) throw deleteError;

      if (reportData.items.length > 0) {
        const { error: itemsError } = await supabase
          .from('report_items')
          .insert(
            reportData.items.map(item => ({
              report_id: reportId,
              location: item.location,
              transportation: item.transportation,
              cost: item.cost,
            }))
          );

        if (itemsError) throw itemsError;
      }

      // Refresh reports list
      await fetchReports();

      toast({
        title: "Report Updated Successfully",
        description: "Your field report has been updated.",
      });

      return true;
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Delete a report
  const deleteReport = async (reportId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to delete reports.",
          variant: "destructive",
        });
        return false;
      }

      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Refresh reports list
      await fetchReports();

      toast({
        title: "Report Deleted",
        description: "The report has been successfully deleted.",
      });

      return true;
    } catch (error) {
      console.error('Error deleting report:', error);
      toast({
        title: "Error",
        description: "Failed to delete report. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return {
    reports,
    loading,
    createReport,
    updateReport,
    deleteReport,
    refreshReports: fetchReports,
  };
};