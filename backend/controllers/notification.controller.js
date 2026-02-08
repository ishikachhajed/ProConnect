import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

// Get all notifications for user
export const getNotifications = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Get notifications, newest first
        const notifications = await Notification.find({ receiver: user._id })
            .populate("sender", "name username profilePicture")
            .populate("post", "body")
            .sort({ createdAt: -1 })
            .limit(50);

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error("GET NOTIFICATIONS ERROR:", error.message);
        return res.status(500).json({ message: "Error fetching notifications" });
    }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
    try {
        const { token } = req.query;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const count = await Notification.countDocuments({
            receiver: user._id,
            read: false
        });

        return res.status(200).json({ count });
    } catch (error) {
        console.error("GET UNREAD COUNT ERROR:", error.message);
        return res.status(500).json({ message: "Error getting unread count" });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { token, notificationId } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, receiver: user._id },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        return res.status(200).json({ message: "Marked as read", notification });
    } catch (error) {
        console.error("MARK AS READ ERROR:", error.message);
        return res.status(500).json({ message: "Error marking notification" });
    }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
    try {
        const { token } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        await Notification.updateMany(
            { receiver: user._id, read: false },
            { read: true }
        );

        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        console.error("MARK ALL READ ERROR:", error.message);
        return res.status(500).json({ message: "Error marking notifications" });
    }
};

// Helper function to create notification (used by other controllers)
export const createNotification = async ({ type, senderId, receiverId, postId = null, message = '' }) => {
    try {
        // Don't create notification if sender and receiver are same
        if (senderId.toString() === receiverId.toString()) {
            return null;
        }

        const notification = new Notification({
            type,
            sender: senderId,
            receiver: receiverId,
            post: postId,
            message,
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error("CREATE NOTIFICATION ERROR:", error.message);
        return null;
    }
};
