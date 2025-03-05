import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockMovementList } from "@/components/stock/stock-movement-list";
import { StockMovementForm } from "@/components/stock/stock-movement-form";
import {
  type Product,
  type StockMovement,
  type InsertStockMovement,
} from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function StockMovements() {
  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: movements } = useQuery<StockMovement[]>({
    queryKey: ["/api/stock-movements"],
  });

  const createMovement = useMutation({
    mutationFn: async (movement: InsertStockMovement) => {
      const res = await apiRequest("POST", "/api/stock-movements", movement);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/stock-movements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  if (!products || !movements) return null;

  const productNames = products.reduce<Record<number, string>>(
    (acc, product) => {
      acc[product.id] = `${product.name} (${product.sku})`;
      return acc;
    },
    {}
  );

  return (
    <div className="flex h-screen">
      <SidebarNav />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Stock Movements</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Movement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <Card>
                <CardHeader>
                  <CardTitle>Record Stock Movement</CardTitle>
                </CardHeader>
                <CardContent>
                  <StockMovementForm
                    products={products}
                    onSubmit={createMovement.mutate}
                    isLoading={createMovement.isPending}
                  />
                </CardContent>
              </Card>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-6">
            <StockMovementList movements={movements} products={productNames} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
