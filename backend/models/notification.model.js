import mongoose from "mongoose";

// Notification schema for smart notifications
const notificationSchema = new mongoose.Schema({
    // Type of notification
    type: {
        type: String,
        enum: ["connection_request", "connection_accept", "like", "comment"],
        required: true,
    },
    // Who triggered the notification
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Who receives the notification
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    // Related post (for like/comment notifications)
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: null,
    },
    // Message to display
    message: {
        type: String,
        default: '',
    },
    // Read status
    read: {
        type: Boolean,
        default: false,
    },
    // Timestamp
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Index for efficient queries
notificationSchema.index({ receiver: 1, createdAt: -1 });
notificationSchema.index({ receiver: 1, read: 1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
