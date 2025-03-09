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
import { Loader2, Barcode } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBarcodeScannerInput } from "@/hooks/use-barcode-scanner";
import { cn } from "@/lib/utils";

interface StockMovementFormProps {
  onSubmit: (data: InsertStockMovement) => void;
  isLoading?: boolean;
  products: Product[];
}

export function StockMovementForm({ onSubmit, isLoading, products }: StockMovementFormProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scanFeedback, setScanFeedback] = useState<"success" | "error" | null>(null);

  const form = useForm<InsertStockMovement>({
    resolver: zodResolver(insertStockMovementSchema),
    defaultValues: {
      productId: 0,
      type: "in",
      quantity: 1,
      reason: "",
    },
  });

  // Clear scan feedback after 2 seconds
  useEffect(() => {
    if (scanFeedback) {
      const timer = setTimeout(() => setScanFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [scanFeedback]);

  // Handle barcode scanning
  const { isScanning } = useBarcodeScannerInput({
    onScan: (barcode) => {
      const product = products.find(p => p.sku === barcode);
      if (product) {
        form.setValue("productId", product.id);
        setScanFeedback("success");
        // Focus quantity field after successful scan
        const quantityInput = document.getElementById("quantity");
        if (quantityInput) {
          quantityInput.focus();
        }
      } else {
        setScanFeedback("error");
      }
    }
  });

  const filteredProducts = products.filter((product) => {
    const searchLower = searchValue.toLowerCase();
    return (
      product.sku.toLowerCase().includes(searchLower) ||
      product.name.toLowerCase().includes(searchLower)
    );
  });

  const selectedProduct = products.find(
    (product) => product.id === form.watch("productId")
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Product</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className={cn(
                "w-full justify-between",
                isScanning && "border-blue-500 ring-2 ring-blue-500",
                scanFeedback === "success" && "border-green-500 ring-2 ring-green-500",
                scanFeedback === "error" && "border-red-500 ring-2 ring-red-500"
              )}
            >
              {selectedProduct
                ? `${selectedProduct.name} (${selectedProduct.sku})`
                : "Select or scan a product..."}
              <Barcode className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Search by name or scan barcode..."
                value={searchValue}
                onValueChange={setSearchValue}
                className="h-9"
              />
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.sku}
                    onSelect={() => {
                      form.setValue("productId", product.id);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    {product.name} ({product.sku})
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
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