import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { clientServer } from "@/config";
import styles from "./notification_bell.module.css";

export default function NotificationBell() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications
    const fetchNotifications = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const [notifResponse, countResponse] = await Promise.all([
                clientServer.get("/api/notifications", { params: { token } }),
                clientServer.get("/api/notifications/unread-count", { params: { token } }),
            ]);

            setNotifications(notifResponse.data.notifications || []);
            setUnreadCount(countResponse.data.count || 0);
        } catch (error) {
            // Silently handle errors - API might not be available yet
            // This prevents crashes when backend is restarting
            if (error.response?.status !== 404) {
                console.error("Error fetching notifications:", error.message);
            }
        }
    };

    // Fetch on mount and periodically
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Mark notification as read
    const handleNotificationClick = async (notification) => {
        const token = localStorage.getItem("token");
        if (!notification.read) {
            try {
                await clientServer.post("/api/notifications/mark-read", {
                    token,
                    notificationId: notification._id,
                });
                setUnreadCount((prev) => Math.max(0, prev - 1));
                setNotifications((prev) =>
                    prev.map((n) => (n._id === notification._id ? { ...n, read: true } : n))
                );
            } catch (error) {
                console.error("Error marking as read:", error);
            }
        }

        // Navigate based on notification type
        if (notification.type === "like" || notification.type === "comment") {
            router.push("/dashboard");
        } else if (notification.type === "connection_request" || notification.type === "connection_accept") {
            router.push("/my_network");
        }
        setIsOpen(false);
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        const token = localStorage.getItem("token");
        try {
            await clientServer.post("/api/notifications/mark-all-read", { token });
            setUnreadCount(0);
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    // Get icon based on notification type
    const getNotificationIcon = (type) => {
        switch (type) {
            case "like":
                return "❤️";
            case "comment":
                return "💬";
            case "connection_request":
                return "🤝";
            case "connection_accept":
                return "✅";
            default:
                return "🔔";
        }
    };

    // Format time ago
    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return "just now";
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    return (
        <div className={styles.container} ref={dropdownRef}>
            {/* Bell Icon */}
            <button
                className={styles.bellButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Notifications"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.bellIcon}
                >
                    <path
                        fillRule="evenodd"
                        d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z"
                        clipRule="evenodd"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.dropdownHeader}>
                        <h4>Notifications</h4>
                        {unreadCount > 0 && (
                            <button className={styles.markAllRead} onClick={handleMarkAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className={styles.notificationList}>
                        {notifications.length === 0 ? (
                            <p className={styles.emptyMessage}>No notifications yet</p>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`${styles.notificationItem} ${!notification.read ? styles.unread : ""
                                        }`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <span className={styles.notificationIcon}>
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                    <div className={styles.notificationContent}>
                                        <p className={styles.notificationMessage}>
                                            {notification.message || `${notification.sender?.name} ${notification.type.replace("_", " ")}`}
                                        </p>
                                        <span className={styles.notificationTime}>
                                            {formatTimeAgo(notification.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
