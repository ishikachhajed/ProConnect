import axios from 'axios';

// Fetch LeetCode stats from public API
export const getLeetCodeStats = async (req, res) => {
    try {
        const { username } = req.query;

        if (!username) {
            return res.status(400).json({ message: "Username is required" });
        }

        // Fetch user data from alfa-leetcode-api
        const profileUrl = `https://alfa-leetcode-api.onrender.com/${username}`;
        const calendarUrl = `https://alfa-leetcode-api.onrender.com/${username}/calendar`;

        // Fetch both profile and calendar data
        const [profileResponse, calendarResponse] = await Promise.all([
            axios.get(profileUrl).catch(() => null),
            axios.get(calendarUrl).catch(() => null)
        ]);

        // Check if user exists
        if (!profileResponse || !profileResponse.data) {
            return res.status(404).json({ message: "LeetCode user not found" });
        }

        const profileData = profileResponse.data;
        const calendarData = calendarResponse?.data || {};

        // Calculate current streak from calendar
        const currentStreak = calculateStreak(calendarData.submissionCalendar || {});

        // Prepare response
        const stats = {
            username: profileData.username || username,
            totalSolved: profileData.totalSolved || 0,
            easySolved: profileData.easySolved || 0,
            mediumSolved: profileData.mediumSolved || 0,
            hardSolved: profileData.hardSolved || 0,
            currentStreak: currentStreak,
            recentSubmission: calendarData.streak || 0,
            profileUrl: `https://leetcode.com/${username}`
        };

        return res.json({ stats });

    } catch (error) {
        console.error("LEETCODE STATS ERROR:", error.message);
        return res.status(500).json({ message: "Error fetching LeetCode stats" });
    }
};

// Calculate current streak from submission calendar
function calculateStreak(submissionCalendar) {
    if (!submissionCalendar || Object.keys(submissionCalendar).length === 0) {
        return 0;
    }

    // Convert timestamps to dates and sort
    const dates = Object.keys(submissionCalendar)
        .map(timestamp => new Date(parseInt(timestamp) * 1000))
        .sort((a, b) => b - a); // Sort descending (most recent first)

    if (dates.length === 0) return 0;

    // Check if there's a submission today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const mostRecent = new Date(dates[0]);
    mostRecent.setHours(0, 0, 0, 0);

    // If most recent submission is not today or yesterday, streak is 0
    if (mostRecent < yesterday) {
        return 0;
    }

    // Count consecutive days
    let streak = 0;
    let currentDate = new Date(today);
    currentDate.setHours(0, 0, 0, 0);

    for (const date of dates) {
        const submissionDate = new Date(date);
        submissionDate.setHours(0, 0, 0, 0);

        if (submissionDate.getTime() === currentDate.getTime()) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
        } else if (submissionDate < currentDate) {
            // Gap in streak found
            break;
        }
    }

    return streak;
}
