import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStockMovementSchema, type InsertStockMovement, type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface StockMovementFormProps {
  onSubmit: (data: InsertStockMovement) => void;
  isLoading?: boolean;
  products: Product[];
}

export function StockMovementForm({ onSubmit, isLoading, products }: StockMovementFormProps) {
  const form = useForm<InsertStockMovement>({
    resolver: zodResolver(insertStockMovementSchema),
    defaultValues: {
      productId: 0,
      type: "in",
      quantity: 1,
      reason: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="product">Product</Label>
        <Select
          onValueChange={(value) => form.setValue("productId", parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.name} ({product.sku})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Movement Type</Label>
        <Select
          onValueChange={(value) => form.setValue("type", value as "in" | "out")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select movement type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in">Stock In</SelectItem>
            <SelectItem value="out">Stock Out</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Quantity</Label>
        <Input
          id="quantity"
          type="number"
          min="1"
          {...form.register("quantity", { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="reason">Reason</Label>
        <Input id="reason" {...form.register("reason")} />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Record Movement
      </Button>
    </form>
  );
}
