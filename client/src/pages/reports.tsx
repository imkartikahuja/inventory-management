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
import { Download } from "lucide-react";

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
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: movements } = useQuery<StockMovement[]>({
    queryKey: ["/api/stock-movements"],
  });

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
          <Button
            variant="outline"
            onClick={() => downloadCSV(exportProducts, "inventory-report.csv")}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

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
