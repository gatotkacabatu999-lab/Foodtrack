import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFoodItemSchema, updateFoodItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all active food items
  app.get("/api/food-items", async (req, res) => {
    try {
      const items = await storage.getFoodItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  // Get deleted food items (trash)
  app.get("/api/food-items/trash", async (req, res) => {
    try {
      const items = await storage.getDeletedFoodItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deleted food items" });
    }
  });

  // Get single food item
  app.get("/api/food-items/:id", async (req, res) => {
    try {
      const item = await storage.getFoodItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food item" });
    }
  });

  // Create new food item
  app.post("/api/food-items", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const item = await storage.createFoodItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  // Update food item (requires password only for items more than 15 days away)
  app.patch("/api/food-items/:id", async (req, res) => {
    try {
      const { adminPassword, ...updateData } = req.body;
      
      // Get current item to check expiry date
      const currentItem = await storage.getFoodItem(req.params.id);
      if (!currentItem) {
        return res.status(404).json({ message: "Food item not found" });
      }

      // Check 15-day rule - use current expiry date for the check
      const expiryDate = new Date(currentItem.expiryDate);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // If item has more than 15 days until expiry, require password
      if (daysDiff > 15) {
        const envPassword = process.env.ADMIN_PASSWORD;
        
        if (!envPassword) {
          return res.status(500).json({ message: "Admin password not configured" });
        }
        
        if (!adminPassword || adminPassword !== envPassword) {
          return res.status(403).json({ message: "Invalid admin password" });
        }
      }

      const validatedData = updateFoodItemSchema.parse(updateData);
      const item = await storage.updateFoodItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update food item" });
    }
  });

  // Delete food item (move to trash) - requires password and 15-day limit
  app.delete("/api/food-items/:id", async (req, res) => {
    try {
      // Get item to check expiry date first
      const item = await storage.getFoodItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }

      // Check 15-day rule and auto-deletion rule
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

      // If item is expired by 1+ day, allow auto-deletion without password
      // If item has more than 15 days until expiry, require password
      if (daysDiff > 15) {
        const { adminPassword } = req.body;
        const envPassword = process.env.ADMIN_PASSWORD;
        
        if (!envPassword) {
          return res.status(500).json({ message: "Admin password not configured" });
        }
        
        if (!adminPassword || adminPassword !== envPassword) {
          return res.status(403).json({ message: "Invalid admin password" });
        }
      }

      const success = await storage.deleteFoodItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json({ message: "Food item moved to trash" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  // Restore food item from trash
  app.post("/api/food-items/:id/restore", async (req, res) => {
    try {
      const success = await storage.restoreFoodItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Food item not found or not deleted" });
      }
      res.json({ message: "Food item restored" });
    } catch (error) {
      res.status(500).json({ message: "Failed to restore food item" });
    }
  });

  // Permanently delete food item
  app.delete("/api/food-items/:id/permanent", async (req, res) => {
    try {
      const success = await storage.permanentDeleteFoodItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json({ message: "Food item permanently deleted" });
    } catch (error) {
      res.status(500).json({ message: "Failed to permanently delete food item" });
    }
  });

  // Clear all trash
  app.delete("/api/food-items/trash/clear", async (req, res) => {
    try {
      await storage.clearTrash();
      res.json({ message: "Trash cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear trash" });
    }
  });

  // Verify admin password
  app.post("/api/verify-password", async (req, res) => {
    try {
      const { password } = req.body;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        return res.status(500).json({ valid: false, message: "Admin password not configured" });
      }
      
      const isValid = password === adminPassword;
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ valid: false, message: "Password verification failed" });
    }
  });

  // Change admin password
  app.post("/api/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminPassword = process.env.ADMIN_PASSWORD;
      
      if (!adminPassword) {
        return res.status(500).json({ success: false, message: "Admin password not configured" });
      }
      
      if (currentPassword !== adminPassword) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      
      // Note: In a real application, you would update the environment variable or database
      // For this demo, we'll just simulate success since env variables can't be changed at runtime
      res.json({ 
        success: false, 
        message: "Password change not supported in demo. Environment variables cannot be changed at runtime." 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Password change failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
