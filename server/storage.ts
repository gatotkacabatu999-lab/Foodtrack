import { type FoodItem, type InsertFoodItem, type UpdateFoodItem, foodItems } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getFoodItems(): Promise<FoodItem[]>;
  getDeletedFoodItems(): Promise<FoodItem[]>;
  getFoodItem(id: string): Promise<FoodItem | undefined>;
  createFoodItem(item: InsertFoodItem): Promise<FoodItem>;
  updateFoodItem(id: string, item: UpdateFoodItem): Promise<FoodItem | undefined>;
  deleteFoodItem(id: string): Promise<boolean>;
  restoreFoodItem(id: string): Promise<boolean>;
  permanentDeleteFoodItem(id: string): Promise<boolean>;
  clearTrash(): Promise<void>;
}

export class MemStorage implements IStorage {
  private foodItems: Map<string, FoodItem>;

  constructor() {
    this.foodItems = new Map();
  }

  async getFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(item => !item.isDeleted);
  }

  async getDeletedFoodItems(): Promise<FoodItem[]> {
    return Array.from(this.foodItems.values()).filter(item => item.isDeleted);
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    return this.foodItems.get(id);
  }

  async createFoodItem(insertItem: InsertFoodItem): Promise<FoodItem> {
    const id = randomUUID();
    const now = new Date();
    const item: FoodItem = {
      ...insertItem,
      id,
      isDeleted: false,
      deletedAt: null,
      createdAt: now,
      notes: insertItem.notes || null,
    };
    this.foodItems.set(id, item);
    return item;
  }

  async updateFoodItem(id: string, updateItem: UpdateFoodItem): Promise<FoodItem | undefined> {
    const existingItem = this.foodItems.get(id);
    if (!existingItem) {
      return undefined;
    }

    const updatedItem: FoodItem = {
      ...existingItem,
      ...updateItem,
    };
    this.foodItems.set(id, updatedItem);
    return updatedItem;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    const item = this.foodItems.get(id);
    if (!item) {
      return false;
    }

    const deletedItem: FoodItem = {
      ...item,
      isDeleted: true,
      deletedAt: new Date(),
    };
    this.foodItems.set(id, deletedItem);
    return true;
  }

  async restoreFoodItem(id: string): Promise<boolean> {
    const item = this.foodItems.get(id);
    if (!item || !item.isDeleted) {
      return false;
    }

    const restoredItem: FoodItem = {
      ...item,
      isDeleted: false,
      deletedAt: null,
    };
    this.foodItems.set(id, restoredItem);
    return true;
  }

  async permanentDeleteFoodItem(id: string): Promise<boolean> {
    return this.foodItems.delete(id);
  }

  async clearTrash(): Promise<void> {
    const deletedItems = Array.from(this.foodItems.values()).filter(item => item.isDeleted);
    deletedItems.forEach(item => {
      this.foodItems.delete(item.id);
    });
  }
}

// DatabaseStorage implementation
export class DatabaseStorage implements IStorage {
  async getFoodItems(): Promise<FoodItem[]> {
    return await db.select().from(foodItems).where(eq(foodItems.isDeleted, false));
  }

  async getDeletedFoodItems(): Promise<FoodItem[]> {
    return await db.select().from(foodItems).where(eq(foodItems.isDeleted, true));
  }

  async getFoodItem(id: string): Promise<FoodItem | undefined> {
    const [item] = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return item || undefined;
  }

  async createFoodItem(insertItem: InsertFoodItem): Promise<FoodItem> {
    const [item] = await db
      .insert(foodItems)
      .values({
        ...insertItem,
        notes: insertItem.notes || null,
      })
      .returning();
    return item;
  }

  async updateFoodItem(id: string, updateItem: UpdateFoodItem): Promise<FoodItem | undefined> {
    const [item] = await db
      .update(foodItems)
      .set(updateItem)
      .where(eq(foodItems.id, id))
      .returning();
    return item || undefined;
  }

  async deleteFoodItem(id: string): Promise<boolean> {
    const [item] = await db
      .update(foodItems)
      .set({
        isDeleted: true,
        deletedAt: new Date(),
      })
      .where(eq(foodItems.id, id))
      .returning();
    return !!item;
  }

  async restoreFoodItem(id: string): Promise<boolean> {
    const [item] = await db
      .update(foodItems)
      .set({
        isDeleted: false,
        deletedAt: null,
      })
      .where(eq(foodItems.id, id))
      .returning();
    return !!item;
  }

  async permanentDeleteFoodItem(id: string): Promise<boolean> {
    const result = await db.delete(foodItems).where(eq(foodItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async clearTrash(): Promise<void> {
    await db.delete(foodItems).where(eq(foodItems.isDeleted, true));
  }
}

export const storage = new DatabaseStorage();
