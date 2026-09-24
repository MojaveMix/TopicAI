import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes.js";
import userRoutes from "../modules/users/user.routes.js";
import roleRoutes from "../modules/roles/role.routes.js";
import searchRoutes from "../modules/search/search.route.js";
import { ApiResponse } from "../utils/response.util.js";
import { sequelize } from "../config/database.js";
import { OllamaService } from "../services/ai/ollama.service.js";

const router = Router();

// Health Check
router.get("/health", async (req, res) => {
  let dbStatus = "connected";
  try {
    await sequelize.authenticate();
  } catch {
    dbStatus = "disconnected";
  }

  const aiStatus = await OllamaService.checkHealth();

  return ApiResponse.success(res, "AI Search Backend API is healthy", {
    status: "UP",
    database: dbStatus,
    aiEngine: {
      provider: "Ollama",
      status: aiStatus.online ? "ONLINE" : "OFFLINE",
      model: aiStatus.model,
      modelFound: aiStatus.modelFound,
    },
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)}s`,
  });
});

// API v1 Modules
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/search", searchRoutes);

export default router;
