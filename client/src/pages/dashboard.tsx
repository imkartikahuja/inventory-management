import { useQuery } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductList } from "@/components/products/product-list";
import { type Product } from "@shared/schema";
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

export default function Dashboard() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  if (!products) return null;

  const lowStockProducts = products.filter(
    (p) => p.currentStock < p.minStock
  );

  const totalStock = products.reduce((sum, p) => sum + p.currentStock, 0);
  const totalProducts = products.length;
  const lowStockCount = lowStockProducts.length;

  return (
    <div className="flex h-screen">
      <SidebarNav />
      <div className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Stock
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStock}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Low Stock Items
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockCount}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductList products={lowStockProducts} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
