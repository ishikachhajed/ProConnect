import cron from 'node-cron';
import User from '../models/user.model.js';
import Profile from '../models/profile.model.js';

/**
 * Cleanup job to permanently delete accounts that have been soft-deleted for more than 30 days
 * Runs daily at midnight (00:00)
 */
export const setupCleanupJobs = () => {
    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            // Find all users deleted more than 30 days ago
            const expiredUsers = await User.find({
                isDeleted: true,
                deletedAt: { $lt: thirtyDaysAgo }
            });

            if (expiredUsers.length === 0) {
                console.log('Cleanup: No expired accounts to delete');
                return;
            }

            // Delete associated profiles first
            const userIds = expiredUsers.map(user => user._id);
            await Profile.deleteMany({ userId: { $in: userIds } });

            // Permanently delete users
            const result = await User.deleteMany({
                isDeleted: true,
                deletedAt: { $lt: thirtyDaysAgo }
            });

            console.log(` Cleanup: Permanently deleted ${result.deletedCount} expired accounts and their profiles`);

        } catch (error) {
            console.error(' Cleanup job error:', error);
        }
    });

    console.log('Account cleanup cron job scheduled (runs daily at midnight)');
};

// Export function to manually trigger cleanup (for testing)
export const runCleanupNow = async () => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const expiredUsers = await User.find({
            isDeleted: true,
            deletedAt: { $lt: thirtyDaysAgo }
        });

        if (expiredUsers.length === 0) {
            console.log(' Manual Cleanup: No expired accounts to delete');
            return { deleted: 0 };
        }

        const userIds = expiredUsers.map(user => user._id);
        await Profile.deleteMany({ userId: { $in: userIds } });

        const result = await User.deleteMany({
            isDeleted: true,
            deletedAt: { $lt: thirtyDaysAgo }
        });

        console.log(`Manual Cleanup: Permanently deleted ${result.deletedCount} expired accounts`);
        return { deleted: result.deletedCount };

    } catch (error) {
        console.error(' Manual cleanup error:', error);
        throw error;
    }
};
