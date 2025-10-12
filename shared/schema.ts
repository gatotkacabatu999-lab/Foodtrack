import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const foodItems = pgTable("food_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`),
});

export const insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true,
}).extend({
  expiryDate: z.union([z.date(), z.string().transform((str) => new Date(str))]),
});

export const updateFoodItemSchema = insertFoodItemSchema.partial().extend({
  expiryDate: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional(),
});

export type InsertFoodItem = z.infer<typeof insertFoodItemSchema>;
export type UpdateFoodItem = z.infer<typeof updateFoodItemSchema>;
export type FoodItem = typeof foodItems.$inferSelect;
