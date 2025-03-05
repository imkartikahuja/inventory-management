import { 
  User, InsertUser, 
  Product, InsertProduct,
  StockMovement, InsertStockMovement
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>; // Added getUsers method

  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;

  // Stock movement operations
  getStockMovements(productId?: number): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement & { userId: number }): Promise<StockMovement>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private stockMovements: Map<number, StockMovement>;
  private userId: number;
  private productId: number;
  private movementId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.stockMovements = new Map();
    this.userId = 1;
    this.productId = 1;
    this.movementId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Make the first user an admin
    const role = (await this.getUsers()).length === 0 ? "admin" : "staff";
    const user: User = { ...insertUser, id, role };
    this.users.set(id, user);
    return user;
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const existing = await this.getProduct(id);
    if (!existing) throw new Error("Product not found");

    const updated = { ...existing, ...updates };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  // Stock movement operations
  async getStockMovements(productId?: number): Promise<StockMovement[]> {
    const movements = Array.from(this.stockMovements.values());
    if (productId) {
      return movements.filter(m => m.productId === productId);
    }
    return movements;
  }

  async createStockMovement(movement: InsertStockMovement & { userId: number }): Promise<StockMovement> {
    const id = this.movementId++;
    const stockMovement: StockMovement = {
      ...movement,
      id,
      timestamp: new Date(),
    };

    // Update product stock
    const product = await this.getProduct(movement.productId);
    if (!product) throw new Error("Product not found");

    const stockChange = movement.type === "in" ? movement.quantity : -movement.quantity;
    await this.updateProduct(product.id, {
      currentStock: product.currentStock + stockChange
    });

    this.stockMovements.set(id, stockMovement);
    return stockMovement;
  }
}

export const storage = new MemStorage();