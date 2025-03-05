import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@shared/schema";

interface ProductListProps {
  products: Product[];
}

export function ProductList({ products }: ProductListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>SKU</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Attributes</TableHead>
          <TableHead>Stock Level</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell className="font-medium">{product.sku}</TableCell>
            <TableCell>{product.name}</TableCell>
            <TableCell>{product.category}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                {product.attributes.size && (
                  <Badge variant="outline">Size: {product.attributes.size}</Badge>
                )}
                {product.attributes.color && (
                  <Badge variant="outline">Color: {product.attributes.color}</Badge>
                )}
                {product.attributes.style && (
                  <Badge variant="outline">Style: {product.attributes.style}</Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              {product.currentStock} / {product.minStock}
            </TableCell>
            <TableCell>
              <Badge
                variant={product.currentStock < product.minStock ? "destructive" : "default"}
              >
                {product.currentStock < product.minStock ? "Low Stock" : "In Stock"}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
