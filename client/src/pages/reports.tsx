import { useQuery } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { type Product, type StockMovement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { useState } from "react";
import { format } from "date-fns";

function downloadCSV(data: any[], filename: string) {
  const headers = Object.keys(data[0]);
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(","),
      ...data.map((row) => headers.map((key) => row[key]).join(",")),
    ].join("\n");

  const link = document.createElement("a");
  link.href = encodeURI(csvContent);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: movements } = useQuery<StockMovement[]>({
    queryKey: ["/api/stock-movements"],
  });

  const { data: dailyMovements } = useQuery({
    queryKey: ["/api/stock-movements/daily", selectedDate?.toISOString()],
    queryFn: async () => {
      if (!selectedDate) return null;
      const response = await fetch(`/api/stock-movements/daily?date=${selectedDate.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch daily movements');
      return response.json();
    },
    enabled: !!selectedDate,
  });

  const handleExportDailyReport = () => {
    if (!dailyMovements || !selectedDate) return;
    
    const exportData = dailyMovements.map((movement: any) => ({
      Date: format(new Date(movement.timestamp), "yyyy-MM-dd HH:mm:ss"),
      "Product Name": movement.productName,
      SKU: movement.productSku,
      Category: movement.productCategory,
      Type: movement.type === "in" ? "Stock In" : "Stock Out",
      Quantity: movement.quantity,
      Reason: movement.reason,
    }));

    downloadCSV(exportData, `daily-stock-movements-${format(selectedDate, "yyyy-MM-dd")}.csv`);
  };

  if (!products || !movements) return null;

  const categoryData = products.reduce<{ name: string; count: number }[]>(
    (acc, product) => {
      const existing = acc.find((c) => c.name === product.category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ name: product.category, count: 1 });
      }
      return acc;
    },
    []
  );

  const stockData = products.map((product) => ({
    name: product.name,
    current: product.currentStock,
    minimum: product.minStock,
  }));

  const exportProducts = products.map((p) => ({
    SKU: p.sku,
    Name: p.name,
    Category: p.category,
    "Current Stock": p.currentStock,
    "Min Stock": p.minStock,
  }));

  return (
    <div className="flex h-screen">
      <SidebarNav />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Reports</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => downloadCSV(exportProducts, "inventory-report.csv")}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Inventory
            </Button>
          </div>
        </div>

        {/* Daily Stock Movement Export Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Stock Movement Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1 max-w-xs">
                <label className="text-sm font-medium mb-2 block">
                  Select Date
                </label>
                <DatePicker
                  date={selectedDate}
                  onDateChange={setSelectedDate}
                  placeholder="Choose a date..."
                />
              </div>
              <Button
                onClick={handleExportDailyReport}
                disabled={!selectedDate || !dailyMovements?.length}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Daily Report
              </Button>
            </div>
            {selectedDate && (
              <div className="mt-4 text-sm text-muted-foreground">
                {dailyMovements?.length ? (
                  <span>Found {dailyMovements.length} stock movements for {format(selectedDate, "PPP")}</span>
                ) : (
                  <span>No stock movements found for {format(selectedDate, "PPP")}</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Products by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      name="Products"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="current"
                      fill="hsl(var(--primary))"
                      name="Current Stock"
                    />
                    <Bar
                      dataKey="minimum"
                      fill="hsl(var(--destructive))"
                      name="Minimum Stock"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
