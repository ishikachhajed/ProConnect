import axios from 'axios';
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
function extractLeetCodeUsername(raw) {
    if (!raw) return null;
    const trimmed = raw.trim();
    const urlMatch = trimmed.match(/leetcode\.com\/(?:u\/)?([^/?#\s]+)/);
    if (urlMatch) return urlMatch[1].replace(/\/$/, "");
    if (trimmed.includes('/')) {
        const parts = trimmed.split('/').filter(Boolean);
        return parts[parts.length - 1];
    }
    return trimmed;
}

function calculateStreaks(submissionCalendar) {
    let parsed = {};
    try {
        parsed = typeof submissionCalendar === 'string'
            ? JSON.parse(submissionCalendar)
            : (submissionCalendar || {});
    } catch { return { currentStreak: 0, maxStreak: 0 }; }

    const activeDates = new Set();
    for (const [ts, count] of Object.entries(parsed)) {
        if (Number(count) > 0) {
            activeDates.add(new Date(Number(ts) * 1000).toISOString().slice(0, 10));
        }
    }
    if (activeDates.size === 0) return { currentStreak: 0, maxStreak: 0 };

    // Current streak — walk back from today (or yesterday if today is empty)
    let currentStreak = 0;
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const yest = new Date(today); yest.setUTCDate(yest.getUTCDate() - 1);
    let cursor = activeDates.has(todayStr) ? new Date(today) : yest;
    while (activeDates.has(cursor.toISOString().slice(0, 10))) {
        currentStreak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    // Max streak — scan sorted dates
    const sorted = Array.from(activeDates).sort();
    let maxStreak = 0, runStart = 0;
    for (let i = 0; i < sorted.length; i++) {
        if (i === 0) { maxStreak = 1; continue; }
        const diff = Math.round((new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000);
        if (diff === 1) { const run = i - runStart + 1; if (run > maxStreak) maxStreak = run; }
        else runStart = i;
    }
    return { currentStreak, maxStreak };
}

// ── API Source 1: leetcode-stats-api (Heroku-hosted, stable) ─────────────────
// Returns: totalSolved, easySolved, mediumSolved, hardSolved, submissionCalendar etc.
async function fetchViaLeetcodeStatsApi(username) {
    const res = await axios.get(
        `https://leetcode-stats-api.herokuapp.com/${username}`,
        { timeout: 15000 }
    );
    const d = res.data;
    if (!d || d.status === 'error') throw new Error(d?.message || 'User not found');

    const submissionCalendar = d.submissionCalendar || "{}";
    const { currentStreak, maxStreak } = calculateStreaks(submissionCalendar);

    return {
        username,
        totalSolved: d.totalSolved || 0,
        easySolved: d.easySolved || 0,
        mediumSolved: d.mediumSolved || 0,
        hardSolved: d.hardSolved || 0,
        currentStreak,
        maxStreak,
        submissionCalendar,
        profileUrl: `https://leetcode.com/u/${username}`,
        lastUpdated: new Date(),
    };
}

// ── API Source 2: alfa-leetcode-api (Render-hosted, may cold-start) ───────────
async function fetchViaAlfa(username) {
    const BASE = "https://alfa-leetcode-api.onrender.com";
    const [solvedRes, calendarRes] = await Promise.allSettled([
        axios.get(`${BASE}/${username}/solved`, { timeout: 35000 }),   // 35s — allows cold start
        axios.get(`${BASE}/userCalendar`, { params: { username, year: new Date().getFullYear() }, timeout: 35000 }),
    ]);

    if (solvedRes.status === 'rejected') throw new Error(solvedRes.reason.message);
    const solved = solvedRes.value.data;
    const calData = calendarRes.status === 'fulfilled' ? calendarRes.value.data : {};
    const submissionCalendar = calData.submissionCalendar || "{}";
    const { currentStreak, maxStreak } = calculateStreaks(submissionCalendar);

    return {
        username,
        totalSolved: solved.solvedProblem || 0,
        easySolved: solved.easySolved || 0,
        mediumSolved: solved.mediumSolved || 0,
        hardSolved: solved.hardSolved || 0,
        currentStreak,
        maxStreak,
        submissionCalendar,
        profileUrl: `https://leetcode.com/u/${username}`,
        lastUpdated: new Date(),
    };
}

// ── API Source 3: LeetCode GraphQL (direct, sometimes blocked) ────────────────
async function fetchViaGraphQL(username) {
    const res = await axios.post(
        "https://leetcode.com/graphql",
        {
            query: `query userCombinedStats($username: String!) {
              matchedUser(username: $username) {
                username
                submitStats: submitStatsGlobal {
                  acSubmissionNum { difficulty count }
                }
              }
              userCalendar(username: $username) { submissionCalendar }
            }`,
            variables: { username },
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://leetcode.com/',
                'Origin': 'https://leetcode.com',
            },
            timeout: 12000,
        }
    );
    if (res.data.errors) throw new Error("GraphQL errors");
    const data = res.data.data;
    if (!data?.matchedUser) throw new Error("User not found");

    const statsMap = {};
    (data.matchedUser.submitStats?.acSubmissionNum || []).forEach(item => {
        if (item?.difficulty) statsMap[item.difficulty] = item.count;
    });
    const submissionCalendar = data.userCalendar?.submissionCalendar || "{}";
    const { currentStreak, maxStreak } = calculateStreaks(submissionCalendar);

    return {
        username: data.matchedUser.username,
        totalSolved: statsMap['All'] || 0,
        easySolved: statsMap['Easy'] || 0,
        mediumSolved: statsMap['Medium'] || 0,
        hardSolved: statsMap['Hard'] || 0,
        currentStreak,
        maxStreak,
        submissionCalendar,
        profileUrl: `https://leetcode.com/u/${username}`,
        lastUpdated: new Date(),
    };
}

// ── Try all sources in order, return first success ────────────────────────────
async function fetchFreshStats(username) {
    const sources = [
        { name: 'leetcode-stats-api', fn: () => fetchViaLeetcodeStatsApi(username) },
        { name: 'alfa-leetcode-api',  fn: () => fetchViaAlfa(username) },
        { name: 'graphql',            fn: () => fetchViaGraphQL(username) },
    ];

    for (const source of sources) {
        try {
            const result = await source.fn();
            console.log(`[LeetCode] ✅ ${source.name} succeeded for ${username}`);
            return result;
        } catch (err) {
            console.warn(`[LeetCode] ❌ ${source.name} failed: ${err.message}`);
        }
    }
    return null; // all failed
}

// ── Main controller ───────────────────────────────────────────────────────────
export const getLeetCodeStats = async (req, res) => {
    try {
        const { username: rawUsername, token } = req.query;
        if (!rawUsername) return res.status(400).json({ message: "Username is required" });

        const cleanUsername = extractLeetCodeUsername(rawUsername);
        if (!cleanUsername) return res.status(400).json({ message: "Invalid LeetCode username or URL" });

        console.log(`[LeetCode] Request for: ${cleanUsername}`);

        // 1. Find profile
        const userProfile = await Profile.findOne({
            leetcodeUsername: { $in: [cleanUsername, rawUsername] }
        });
        if (!userProfile) {
            return res.status(404).json({ message: "LeetCode username not linked to any ProConnect profile" });
        }

        // 2. Visibility / ownership check
        let isOwner = false;
        if (token) {
            const user = await User.findOne({ token });
            if (user && String(user._id) === String(userProfile.userId._id || userProfile.userId)) {
                isOwner = true;
            }
        }
        if (userProfile.leetcodeVisibility !== 'public' && !isOwner) {
            return res.status(403).json({ message: "This user's LeetCode stats are private" });
        }

        // 3. Cache check (48 hours)
        const CACHE_TTL = 48 * 60 * 60 * 1000;
        const isCacheValid = (
            userProfile.leetcodeStats &&
            userProfile.leetcodeLastUpdated &&
            (new Date() - userProfile.leetcodeLastUpdated < CACHE_TTL)
        );

        if (isCacheValid) {
            console.log(`[LeetCode] Cache hit for ${cleanUsername}`);
            // Back-fill maxStreak for old cached entries that lack it
            const cached = userProfile.leetcodeStats;
            if (cached?.submissionCalendar && cached.maxStreak === undefined) {
                const { currentStreak, maxStreak } = calculateStreaks(cached.submissionCalendar);
                cached.currentStreak = currentStreak;
                cached.maxStreak = maxStreak;
            }
            return res.json({ stats: cached });
        }

        // 4. Fetch fresh (tries 3 sources)
        console.log(`[LeetCode] Cache miss — fetching fresh for ${cleanUsername}`);
        const freshStats = await fetchFreshStats(cleanUsername);

        if (freshStats) {
            userProfile.leetcodeStats = freshStats;
            userProfile.leetcodeLastUpdated = new Date();
            userProfile.leetcodeUsername = cleanUsername;
            await userProfile.save();
            return res.json({ stats: freshStats });
        }

        // 5. All sources failed — return stale if available
        if (userProfile.leetcodeStats) {
            console.log(`[LeetCode] All sources failed — returning stale cache for ${cleanUsername}`);
            return res.json({
                stats: userProfile.leetcodeStats,
                warning: "Stats may be slightly outdated — LeetCode API is temporarily unavailable"
            });
        }

        // 6. No data at all
        return res.status(503).json({
            message: "LeetCode statistics are temporarily unavailable. Please try again in a few minutes.",
        });

    } catch (error) {
        console.error("LEETCODE STATS ERROR:", error.message);
        return res.status(500).json({ message: "Internal server error", detail: error.message });
    }
};
