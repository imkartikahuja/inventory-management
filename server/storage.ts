import { 
  User, InsertUser, 
  Product, InsertProduct,
  StockMovement, InsertStockMovement,
  users, products, stockMovements
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc, sql, sum } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Stock movement operations
  getStockMovements(productId?: number): Promise<StockMovement[]>;
  getStockMovementsByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement & { userId: number }): Promise<StockMovement>;
  getSummaryReport(startDate?: Date, endDate?: Date): Promise<any[]>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const existingUsers = await this.getUsers();
    const role = existingUsers.length === 0 ? "admin" : "staff";
    const [user] = await db.insert(users).values({ ...insertUser, role }).returning();
    return user;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db.insert(products).values(product).returning();
    return created;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();

    if (!updated) throw new Error("Product not found");
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Stock movement operations
  async getStockMovements(productId?: number): Promise<StockMovement[]> {
    return db
      .select()
      .from(stockMovements)
      .where(productId ? eq(stockMovements.productId, productId) : undefined);
  }

  async getStockMovementsByDateRange(startDate: Date, endDate: Date): Promise<StockMovement[]> {
    return await db.select().from(stockMovements)
      .where(
        and(
          gte(stockMovements.timestamp, startDate),
          lte(stockMovements.timestamp, endDate)
        )
      )
      .orderBy(desc(stockMovements.timestamp));
  }

  async createStockMovement(
    movement: InsertStockMovement & { userId: number }
  ): Promise<StockMovement> {
    // First check if product exists
    const product = await this.getProduct(movement.productId);
    if (!product) throw new Error("Product not found");

    // Calculate new stock level
    const stockChange = movement.type === "in" || movement.type === "return" ? movement.quantity : -movement.quantity;
    const newStock = product.currentStock + stockChange;

    // Create stock movement and update product stock in a transaction
    const [stockMovement] = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(products)
        .set({ currentStock: newStock })
        .where(eq(products.id, movement.productId))
        .returning();

      if (!updated) throw new Error("Failed to update product stock");

      const [movement_record] = await tx
        .insert(stockMovements)
        .values(movement)
        .returning();

      return [movement_record];
    });

    return stockMovement;
  }

  async getSummaryReport(startDate?: Date, endDate?: Date): Promise<any[]> {
    // 1. Get all products
    const allProducts = await this.getProducts();

    // 2. Get stock movements within the date range
    const movements = await db
      .select({
        productId: stockMovements.productId,
        type: stockMovements.type,
        quantity: stockMovements.quantity,
      })
      .from(stockMovements)
      .where(
        startDate && endDate
          ? and(
              gte(stockMovements.timestamp, startDate),
              lte(stockMovements.timestamp, endDate)
            )
          : undefined
      );

    // 3. Process data
    const movementsByProduct = movements.reduce((acc, movement) => {
      if (!acc[movement.productId]) {
        acc[movement.productId] = {
          scannedIn: 0,
          scannedOut: 0,
          returns: 0,
        };
      }

      if (movement.type === "in") {
        acc[movement.productId].scannedIn += movement.quantity;
      } else if (movement.type === "out") {
        acc[movement.productId].scannedOut += movement.quantity;
      } else if (movement.type === "return") {
        acc[movement.productId].returns += movement.quantity;
      }

      return acc;
    }, {} as Record<number, { scannedIn: number; scannedOut: number; returns: number }>);

    // 4. Combine and calculate
    const report = allProducts.map(product => {
      const movements = movementsByProduct[product.id] || { scannedIn: 0, scannedOut: 0, returns: 0 };
      const { scannedIn, scannedOut, returns } = movements;
      
      const currentClosingStock = product.currentStock;
      const initialQuantity = currentClosingStock - (scannedIn + returns - scannedOut);

      return {
        productCode: product.sku,
        initialQuantity,
        scannedIn,
        scannedOut,
        returns,
        currentClosingStock,
      };
    });

    return report;
  }
}

export const storage = new DatabaseStorage();