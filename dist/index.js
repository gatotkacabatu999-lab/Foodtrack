var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  foodItems: () => foodItems,
  insertFoodItemSchema: () => insertFoodItemSchema,
  updateFoodItemSchema: () => updateFoodItemSchema
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var foodItems = pgTable("food_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  expiryDate: timestamp("expiry_date", { withTimezone: true }).notNull(),
  category: text("category").notNull(),
  notes: text("notes"),
  isDeleted: boolean("is_deleted").notNull().default(false),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().default(sql`now()`)
});
var insertFoodItemSchema = createInsertSchema(foodItems).omit({
  id: true,
  isDeleted: true,
  deletedAt: true,
  createdAt: true
}).extend({
  expiryDate: z.union([z.date(), z.string().transform((str) => new Date(str))])
});
var updateFoodItemSchema = insertFoodItemSchema.partial().extend({
  expiryDate: z.union([z.date(), z.string().transform((str) => new Date(str))]).optional()
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq } from "drizzle-orm";
var DatabaseStorage = class {
  async getFoodItems() {
    return await db.select().from(foodItems).where(eq(foodItems.isDeleted, false));
  }
  async getDeletedFoodItems() {
    return await db.select().from(foodItems).where(eq(foodItems.isDeleted, true));
  }
  async getFoodItem(id) {
    const [item] = await db.select().from(foodItems).where(eq(foodItems.id, id));
    return item || void 0;
  }
  async createFoodItem(insertItem) {
    const [item] = await db.insert(foodItems).values({
      ...insertItem,
      notes: insertItem.notes || null
    }).returning();
    return item;
  }
  async updateFoodItem(id, updateItem) {
    const [item] = await db.update(foodItems).set(updateItem).where(eq(foodItems.id, id)).returning();
    return item || void 0;
  }
  async deleteFoodItem(id) {
    const [item] = await db.update(foodItems).set({
      isDeleted: true,
      deletedAt: /* @__PURE__ */ new Date()
    }).where(eq(foodItems.id, id)).returning();
    return !!item;
  }
  async restoreFoodItem(id) {
    const [item] = await db.update(foodItems).set({
      isDeleted: false,
      deletedAt: null
    }).where(eq(foodItems.id, id)).returning();
    return !!item;
  }
  async permanentDeleteFoodItem(id) {
    const result = await db.delete(foodItems).where(eq(foodItems.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async clearTrash() {
    await db.delete(foodItems).where(eq(foodItems.isDeleted, true));
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z as z2 } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/food-items", async (req, res) => {
    try {
      const items = await storage.getFoodItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });
  app2.get("/api/food-items/trash", async (req, res) => {
    try {
      const items = await storage.getDeletedFoodItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch deleted food items" });
    }
  });
  app2.get("/api/food-items/:id", async (req, res) => {
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
  app2.post("/api/food-items", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const item = await storage.createFoodItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food item" });
    }
  });
  app2.patch("/api/food-items/:id", async (req, res) => {
    try {
      const { adminPassword, ...updateData } = req.body;
      const currentItem = await storage.getFoodItem(req.params.id);
      if (!currentItem) {
        return res.status(404).json({ message: "Food item not found" });
      }
      const expiryDate = new Date(currentItem.expiryDate);
      const today = /* @__PURE__ */ new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1e3 * 3600 * 24));
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid input data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update food item" });
    }
  });
  app2.delete("/api/food-items/:id", async (req, res) => {
    try {
      const item = await storage.getFoodItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      const expiryDate = new Date(item.expiryDate);
      const today = /* @__PURE__ */ new Date();
      const timeDiff = expiryDate.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1e3 * 3600 * 24));
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
  app2.post("/api/food-items/:id/restore", async (req, res) => {
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
  app2.delete("/api/food-items/:id/permanent", async (req, res) => {
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
  app2.delete("/api/food-items/trash/clear", async (req, res) => {
    try {
      await storage.clearTrash();
      res.json({ message: "Trash cleared" });
    } catch (error) {
      res.status(500).json({ message: "Failed to clear trash" });
    }
  });
  app2.post("/api/verify-password", async (req, res) => {
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
  app2.post("/api/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminPassword) {
        return res.status(500).json({ success: false, message: "Admin password not configured" });
      }
      if (currentPassword !== adminPassword) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
      }
      res.json({
        success: false,
        message: "Password change not supported in demo. Environment variables cannot be changed at runtime."
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Password change failed" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
