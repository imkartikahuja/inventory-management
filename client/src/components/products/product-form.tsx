import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type InsertProduct } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  onSubmit: (data: InsertProduct) => void;
  isLoading?: boolean;
  defaultValues?: Partial<InsertProduct>;
}

export function ProductForm({ onSubmit, isLoading, defaultValues }: ProductFormProps) {
  const form = useForm<InsertProduct>({
    resolver: zodResolver(insertProductSchema),
    defaultValues: {
      sku: "",
      name: "",
      category: "",
      attributes: { size: "", color: "", style: "" },
      minStock: 10,
      currentStock: 0,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" {...form.register("sku")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...form.register("name")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input id="category" {...form.register("category")} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="size">Size</Label>
          <Input
            id="size"
            {...form.register("attributes.size")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            {...form.register("attributes.color")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Style</Label>
          <Input
            id="style"
            {...form.register("attributes.style")}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minStock">Min Stock</Label>
          <Input
            id="minStock"
            type="number"
            {...form.register("minStock", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentStock">Current Stock</Label>
          <Input
            id="currentStock"
            type="number"
            {...form.register("currentStock", { valueAsNumber: true })}
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Product
      </Button>
    </form>
  );
}
