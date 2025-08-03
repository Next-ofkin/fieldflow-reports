import { Document, Page, Text, View, StyleSheet, pdf, Image } from '@react-pdf/renderer';
import { Report } from '@/types/report';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 10,
    marginTop: 10,
    alignSelf: 'center',
    objectFit: 'contain',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f5f5f5',
  },
  tableCol: {
    width: '33.33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCellHeader: {
    margin: 5,
    fontSize: 12,
    fontWeight: 'bold',
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  totalRow: {
    backgroundColor: '#e8e8e8',
    fontWeight: 'bold',
  },
  description: {
    marginTop: 15,
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 3,
    borderLeftColor: '#333333',
  },
  descriptionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  descriptionText: {
    fontSize: 10,
    lineHeight: 1.5,
  },
  paymentSection: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  paymentTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0c4a6e',
    textAlign: 'center',
  },
  paymentText: {
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'center',
  },
  accountInfo: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0c4a6e',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#666666',
  },
});

interface PDFReportProps {
  report: Report;
  officerName?: string;
}

const sanitizeCost = (input: number | string): number => {
  if (typeof input === 'string') {
    const cleaned = input.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  }
  return input;
};

const formatNaira = (amount: number | string) => {
  const clean = sanitizeCost(amount);
  return `₦${clean.toLocaleString('en-NG')}`;
};

export const PDFReport = ({ report, officerName = "Excel Shogbola" }: PDFReportProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image src="/Noltlogo.png" style={styles.logo} />

      <View style={styles.header}>
        <Text style={styles.title}>
          {report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)} Report
        </Text>
        <Text style={styles.subtitle}>Date: {new Date(report.reportDate).toLocaleDateString()}</Text>
        <Text style={styles.subtitle}>Officer: {officerName}</Text>
        <Text style={styles.subtitle}>Type: {report.reportType}</Text>
        <Text style={styles.subtitle}>Generated: {new Date(report.createdAt).toLocaleDateString()}</Text>
      </View>

      {report.description && (
        <View style={styles.description}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{report.description}</Text>
        </View>
      )}

      <View style={styles.table}>
        <View style={[styles.tableRow, styles.tableHeader]}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCellHeader}>Location</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCellHeader}>Transport Mode</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCellHeader}>Cost</Text>
          </View>
        </View>

        {report.items.map((item, index) => (
          <View style={styles.tableRow} key={index}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.location}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.transportation}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{formatNaira(item.cost)}</Text>
            </View>
          </View>
        ))}

        <View style={[styles.tableRow, styles.totalRow]}>
          <View style={styles.tableCol}>
            <Text style={styles.tableCellHeader}>TOTAL</Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCellHeader}></Text>
          </View>
          <View style={styles.tableCol}>
            <Text style={styles.tableCellHeader}>{formatNaira(report.totalCost)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.paymentSection}>
        <Text style={styles.paymentTitle}>PAYMENT INFORMATION</Text>
        <Text style={styles.paymentText}>
          Kindly proceed with payment to the account details below:
        </Text>
        <Text style={styles.accountInfo}>
          Account Number: {report.accountNumber}
        </Text>
        <Text style={styles.accountInfo}>
          Account Name: {report.accountName}
        </Text>
        <Text style={styles.accountInfo}>
          Bank Name: {report.bankName}
        </Text>
      </View>

      <Text style={styles.footer}>
        This is an official field report generated by the verification system.
      </Text>
    </Page>
  </Document>
);

export const generatePDF = async (report: Report, officerName?: string) => {
  const doc = <PDFReport report={report} officerName={officerName} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.reportType}-report-${report.reportDate}.pdf`;
  link.click();

  URL.revokeObjectURL(url);
};
