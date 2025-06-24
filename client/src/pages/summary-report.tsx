import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Download, FileDown } from "lucide-react";

interface SummaryReportRow {
  productCode: string;
  initialQuantity: number;
  scannedIn: number;
  scannedOut: number;
  returns: number;
  currentClosingStock: number;
}

function convertToCSV(data: SummaryReportRow[]) {
  const header = ["Product Code", "Initial Quantity", "Scanned IN", "Scanned Out", "Returns", "Current Closing Stock"];
  const rows = data.map(row => 
    [row.productCode, row.initialQuantity, row.scannedIn, row.scannedOut, row.returns, row.currentClosingStock].join(',')
  );
  return [header.join(','), ...rows].join('\n');
}

function downloadCSV(csvString: string, filename: string) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function fetchSummaryReport(dateRange?: DateRange) {
  const params = new URLSearchParams();
  if (dateRange?.from) {
    params.append("startDate", dateRange.from.toISOString());
  }
  if (dateRange?.to) {
    params.append("endDate", dateRange.to.toISOString());
  }
  const res = await apiRequest("GET", `/api/reports/summary?${params.toString()}`);
  return res.json();
}

export default function SummaryReport() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  
  const { data: reportData, refetch, isLoading } = useQuery<SummaryReportRow[]>({
    queryKey: ["/api/reports/summary", dateRange],
    queryFn: () => fetchSummaryReport(dateRange),
    enabled: false, // Only fetch when refetch is called
  });

  const handleDownload = () => {
    if (reportData) {
      const csv = convertToCSV(reportData);
      downloadCSV(csv, 'summary-report.csv');
    }
  };

  return (
    <div className="flex h-screen">
      <SidebarNav />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8">Complete Summary Report</h1>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
            />
            <Button onClick={() => refetch()}>
              {isLoading ? "Loading..." : "Generate Report"}
            </Button>
            <Button
              onClick={handleDownload}
              disabled={!reportData || reportData.length === 0}
              variant="outline"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
          </CardContent>
        </Card>

        {reportData && (
          <Card className="mt-8">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Code</TableHead>
                    <TableHead>Initial Quantity</TableHead>
                    <TableHead>Scanned IN</TableHead>
                    <TableHead>Scanned Out</TableHead>
                    <TableHead>Returns</TableHead>
                    <TableHead>Current Closing Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.productCode}</TableCell>
                      <TableCell>{row.initialQuantity}</TableCell>
                      <TableCell>{row.scannedIn}</TableCell>
                      <TableCell>{row.scannedOut}</TableCell>
                      <TableCell>{row.returns}</TableCell>
                      <TableCell>{row.currentClosingStock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 