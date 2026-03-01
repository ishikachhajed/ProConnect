import { Router } from "express";
import axios from "axios";
import { getLeetCodeStats } from "../controllers/leetcode.controller.js";

const router = Router();
console.log(" leetcode.routes.js LOADED");

// Get LeetCode stats for a username
router.get("/stats", getLeetCodeStats);

// Test route - fetches directly without DB check
router.get("/test-stats", async (req, res) => {
    const { username } = req.query;
    if (!username) return res.status(400).json({ message: "Username required" });

    try {
        const query = {
            query: `query userPublicStats($username: String!) {
              matchedUser(username: $username) {
                username
                submitStats: submitStatsGlobal { acSubmissionNum { difficulty count } }
              }
            }`,
            variables: { username }
        };
        const response = await axios.post("https://leetcode.com/graphql", query, {
            headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0'
            }
        });
        res.json(response.data);
    } catch (err) {
        res.status(500).json({ message: err.message, stack: err.stack });
    }
});

export default router;
