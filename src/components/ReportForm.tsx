import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Save, X } from "lucide-react";
import { Report, ReportItem, REPORT_TYPES } from "@/types/report";
import { useToast } from "@/hooks/use-toast";

interface ReportFormProps {
  onSubmit: (report: Omit<Report, 'id' | 'createdAt'>) => void;
  editingReport?: Report | null;
  onCancelEdit?: () => void;
}

export const ReportForm = ({ onSubmit, editingReport, onCancelEdit }: ReportFormProps) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>("");
  const [reportDate, setReportDate] = useState("");
  const [description, setDescription] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [bankName, setBankName] = useState("");
  const [items, setItems] = useState<ReportItem[]>([
    { id: crypto.randomUUID(), location: "", transportation: "", cost: 0 }
  ]);

  useEffect(() => {
    if (editingReport) {
      setReportType(editingReport.reportType);
      setReportDate(editingReport.reportDate);
      setDescription(editingReport.description);
      setAccountNumber(editingReport.accountNumber);
      setAccountName(editingReport.accountName);
      setBankName(editingReport.bankName);
      setItems(editingReport.items);
    }
  }, [editingReport]);

  const addItem = () => {
    setItems([...items, { id: crypto.randomUUID(), location: "", transportation: "", cost: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof ReportItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reportType || !reportDate || !accountNumber.trim() || !accountName.trim() || !bankName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including complete account details",
        variant: "destructive"
      });
      return;
    }

    const validItems = items.filter(item => 
      item.location.trim() && item.transportation.trim() && item.cost > 0
    );

    if (validItems.length === 0) {
      toast({
        title: "No Valid Items",
        description: "Please add at least one complete journey record",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      reportType: reportType as any,
      reportDate,
      description,
      accountNumber,
      accountName,
      bankName,
      items: validItems,
      totalCost
    });

    // Reset form if not editing
    if (!editingReport) {
      setReportType("");
      setReportDate("");
      setDescription("");
      setAccountNumber("");
      setAccountName("");
      setBankName("");
      setItems([{ id: crypto.randomUUID(), location: "", transportation: "", cost: 0 }]);
    }
  };

  const handleCancel = () => {
    setReportType("");
    setReportDate("");
    setDescription("");
    setAccountNumber("");
    setAccountName("");
    setBankName("");
    setItems([{ id: crypto.randomUUID(), location: "", transportation: "", cost: 0 }]);
    onCancelEdit?.();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-bold">
          {editingReport ? "Edit Field Report" : "Create New Field Report"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reportDate">Report Date</Label>
              <Input
                id="reportDate"
                type="date"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the field work activities..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <Label className="text-lg font-semibold">Payment Details *</Label>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="e.g., 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accountName">Account Name</Label>
                <Input
                  id="accountName"
                  placeholder="e.g., John Doe"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="e.g., First Bank Nigeria"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Journey Records</Label>
              <Button type="button" onClick={addItem} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <Card key={item.id} className="p-3 sm:p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor={`location-${item.id}`}>Location</Label>
                    <Input
                      id={`location-${item.id}`}
                      placeholder="e.g., Ajah, Lekki Phase 1"
                      value={item.location}
                      onChange={(e) => updateItem(item.id, 'location', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`transport-${item.id}`}>Transport Mode</Label>
                    <Select 
                      value={item.transportation} 
                      onValueChange={(value) => updateItem(item.id, 'transportation', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bus">Bus</SelectItem>
                        <SelectItem value="Keke">Keke</SelectItem>
                        <SelectItem value="Bike">Bike</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`cost-${item.id}`}>Cost (₦)</Label>
                    <Input
                      id={`cost-${item.id}`}
                      type="number"
                      min="0"
                      step="50"
                      placeholder="0"
                      value={item.cost || ""}
                      onChange={(e) => updateItem(item.id, 'cost', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t gap-4">
            <div className="text-center sm:text-right">
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <Badge variant="secondary" className="text-lg px-4 py-1">
                ₦{totalCost.toLocaleString()}
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {editingReport && onCancelEdit && (
                <Button type="button" variant="outline" size="lg" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              )}
              <Button type="submit" size="lg">
                <Save className="h-4 w-4 mr-2" />
                {editingReport ? "Update Report" : "Generate PDF Report"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};