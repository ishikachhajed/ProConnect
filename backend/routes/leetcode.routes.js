import { Router } from "express";
import { getLeetCodeStats } from "../controllers/leetcode.controller.js";

const router = Router();
console.log(" leetcode.routes.js LOADED");

// Get LeetCode stats for a username
router.get("/stats", getLeetCodeStats);

export default router;
