import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertStockMovementSchema } from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Product routes
  app.get("/api/products", requireAuth, async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.patch("/api/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    try {
      const product = await storage.updateProduct(id, req.body);
      res.json(product);
    } catch (error) {
      res.status(404).json({ message: "Product not found" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }

    await storage.deleteProduct(id);
    res.status(204).send();
  });

  // Stock movement routes
  app.get("/api/stock-movements", requireAuth, async (req, res) => {
    const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
    const movements = await storage.getStockMovements(productId);
    res.json(movements);
  });

  app.get("/api/stock-movements/daily", requireAuth, async (req, res) => {
    const date = req.query.date as string;
    if (!date) {
      return res.status(400).json({ message: "Date parameter is required" });
    }

    try {
      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const movements = await storage.getStockMovementsByDateRange(startOfDay, endOfDay);
      
      // Get product details for the movements
      const products = await storage.getProducts();
      const productMap = products.reduce((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {} as Record<number, any>);

      // Enhance movements with product details
      const enhancedMovements = movements.map(movement => ({
        ...movement,
        productName: productMap[movement.productId]?.name || 'Unknown Product',
        productSku: productMap[movement.productId]?.sku || 'Unknown SKU',
        productCategory: productMap[movement.productId]?.category || 'Unknown Category'
      }));

      res.json(enhancedMovements);
    } catch (error) {
      res.status(400).json({ message: "Invalid date format" });
    }
  });

  app.post("/api/stock-movements", requireAuth, async (req, res) => {
    const parsed = insertStockMovementSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ errors: parsed.error.flatten() });
    }

    try {
      const movement = await storage.createStockMovement({
        ...parsed.data,
        userId: req.user!.id,
      });
      res.status(201).json(movement);
    } catch (error) {
      res.status(400).json({ message: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
