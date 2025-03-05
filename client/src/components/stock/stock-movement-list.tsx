import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { type StockMovement } from "@shared/schema";

interface StockMovementListProps {
  movements: StockMovement[];
  products: Record<number, string>;
}

export function StockMovementList({ movements, products }: StockMovementListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Product</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead>Reason</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {movements.map((movement) => (
          <TableRow key={movement.id}>
            <TableCell>
              {new Date(movement.timestamp).toLocaleDateString()}
            </TableCell>
            <TableCell>{products[movement.productId]}</TableCell>
            <TableCell>
              <Badge variant={movement.type === "in" ? "default" : "secondary"}>
                {movement.type === "in" ? "Stock In" : "Stock Out"}
              </Badge>
            </TableCell>
            <TableCell>{movement.quantity}</TableCell>
            <TableCell>{movement.reason}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
