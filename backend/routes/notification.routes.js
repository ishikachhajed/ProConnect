import { Router } from "express";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from "../controllers/notification.controller.js";

const router = Router();

// Get all notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark single notification as read
router.post("/mark-read", markAsRead);

// Mark all as read
router.post("/mark-all-read", markAllAsRead);

export default router;
