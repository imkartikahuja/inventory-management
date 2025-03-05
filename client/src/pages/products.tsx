import { useQuery, useMutation } from "@tanstack/react-query";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductList } from "@/components/products/product-list";
import { ProductForm } from "@/components/products/product-form";
import { type Product, type InsertProduct } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: products } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createProduct = useMutation({
    mutationFn: async (product: InsertProduct) => {
      const res = await apiRequest("POST", "/api/products", product);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
  });

  if (!products) return null;

  return (
    <div className="flex h-screen">
      <SidebarNav />
      <div className="flex-1 p-8 overflow-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          {isAdmin && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent>
                <Card>
                  <CardHeader>
                    <CardTitle>Add New Product</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductForm
                      onSubmit={createProduct.mutate}
                      isLoading={createProduct.isPending}
                    />
                  </CardContent>
                </Card>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardContent className="p-6">
            <ProductList products={products} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
