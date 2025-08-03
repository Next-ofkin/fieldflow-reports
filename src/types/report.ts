export interface ReportItem {
  id: string;
  location: string;
  transportation: string;
  cost: number;
}

export interface Report {
  id: string;
  reportType: 'verification' | 'recovery' | 'post-disbursement';
  reportDate: string;
  description: string;
  items: ReportItem[];
  totalCost: number;
  accountNumber: string;
  accountName: string;
  bankName: string;
  createdAt: string;
}

export const REPORT_TYPES = [
  { value: 'verification', label: 'Verification' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'post-disbursement', label: 'Post-Disbursement' },
] as const;