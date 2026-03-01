import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import styles from './leetcode.module.css';

// ── Streak calculation (mirrors backend logic, for client-side display) ───────
function calculateStreaks(submissionCalendar) {
    let parsed = {};
    try {
        parsed = typeof submissionCalendar === 'string'
            ? JSON.parse(submissionCalendar)
            : (submissionCalendar || {});
    } catch {
        return { currentStreak: 0, maxStreak: 0 };
    }

    const activeDates = new Set();
    for (const [ts, count] of Object.entries(parsed)) {
        if (Number(count) > 0) {
            activeDates.add(new Date(Number(ts) * 1000).toISOString().slice(0, 10));
        }
    }
    if (activeDates.size === 0) return { currentStreak: 0, maxStreak: 0 };

    // Current streak
    let currentStreak = 0;
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 10);
    const yest = new Date(today);
    yest.setUTCDate(yest.getUTCDate() - 1);
    let cursor = activeDates.has(todayStr) ? new Date(today) : yest;

    while (true) {
        if (!activeDates.has(cursor.toISOString().slice(0, 10))) break;
        currentStreak++;
        cursor.setUTCDate(cursor.getUTCDate() - 1);
    }

    // Max streak
    const sorted = Array.from(activeDates).sort();
    let maxStreak = 0;
    let runStart = 0;
    for (let i = 0; i < sorted.length; i++) {
        if (i === 0) { maxStreak = 1; continue; }
        const diff = Math.round(
            (new Date(sorted[i]) - new Date(sorted[i - 1])) / 86400000
        );
        if (diff === 1) {
            const run = i - runStart + 1;
            if (run > maxStreak) maxStreak = run;
        } else {
            runStart = i;
        }
    }

    return { currentStreak, maxStreak };
}

// ── Heatmap intensity: 0–4 based on submission count ─────────────────────────
function getIntensity(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
}

// ── Build last-N-days array from submissionCalendar ───────────────────────────
function buildCalendarDays(submissionCalendar, days = 105) {
    let parsed = {};
    try {
        parsed = typeof submissionCalendar === 'string'
            ? JSON.parse(submissionCalendar)
            : (submissionCalendar || {});
    } catch { parsed = {}; }

    // Index by "YYYY-MM-DD"
    const byDate = {};
    for (const [ts, count] of Object.entries(parsed)) {
        const d = new Date(Number(ts) * 1000);
        const key = d.toISOString().slice(0, 10);
        byDate[key] = (byDate[key] || 0) + Number(count);
    }

    const result = [];
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setUTCDate(d.getUTCDate() - i);
        const key = d.toISOString().slice(0, 10);
        result.push({ date: key, count: byDate[key] || 0 });
    }
    return result;
}

// ── Heatmap Component ─────────────────────────────────────────────────────────
function SubmissionHeatmap({ submissionCalendar }) {
    const days = buildCalendarDays(submissionCalendar, 105); // 15 weeks × 7

    // Group into weeks (columns of 7)
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    return (
        <div className={styles.calendarContainer}>
            <div className={styles.calendarTitle}>Submission Activity (15 Weeks)</div>
            <div className={styles.calendarGrid}>
                {weeks.map((week, wi) => (
                    <div key={wi} className={styles.calendarColumn}>
                        {week.map((day, di) => (
                            <div
                                key={di}
                                className={`${styles.calendarDay} ${styles[`dayLevel${getIntensity(day.count)}`]}`}
                                title={`${day.date}: ${day.count} submission${day.count !== 1 ? 's' : ''}`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            {/* Legend */}
            <div className={styles.calendarLegend}>
                <span>Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                    <div key={level} className={`${styles.calendarDay} ${styles[`dayLevel${level}`]}`} />
                ))}
                <span>More</span>
            </div>
        </div>
    );
}

// ── Main LeetCodeCard ─────────────────────────────────────────────────────────
export default function LeetCodeCard({ username }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [warning, setWarning] = useState(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        if (!username) { setLoading(false); return; }

        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            setWarning(null);
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${BASE_URL}/api/leetcode/stats`, {
                    params: { username, token }
                });
                const s = res.data.stats;

                // If backend didn't compute streaks (stale cache from old schema), compute client-side
                if (s && s.submissionCalendar && s.maxStreak === undefined) {
                    const { currentStreak, maxStreak } = calculateStreaks(s.submissionCalendar);
                    s.currentStreak = currentStreak;
                    s.maxStreak = maxStreak;
                }

                setStats(s);
                if (res.data.warning) setWarning(res.data.warning);
            } catch (err) {
                console.error('LeetCode stats error:', err);
                const status = err.response?.status;
                if (status === 503 || status === 504) {
                    setError('LeetCode stats are temporarily unavailable. Please try again later.');
                } else {
                    const message = err.response?.data?.message || 'Unable to load LeetCode stats';
                    const detail = err.response?.data?.detail ? ` (${err.response.data.detail})` : '';
                    setError(message + detail);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [username, retryKey]);

    if (!username) return null;

    if (loading) {
        return (
            <div className={styles.card}>
                <div className={styles.loading}>Loading LeetCode stats...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.card}>
                <div className={styles.error}>
                    <p>{error}</p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
                        <button
                            onClick={() => setRetryKey(k => k + 1)}
                            style={{ background: 'none', border: '1px solid currentColor', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', color: 'inherit', fontSize: '13px' }}
                        >
                            Retry
                        </button>
                        <a
                            href={`https://leetcode.com/${username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.profileLink}
                        >
                            View Profile on LeetCode →
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (!stats) return null;

    const total = Math.max(stats.totalSolved, 1);
    const easyP  = (stats.easySolved  / total) * 100;
    const mediumP = (stats.mediumSolved / total) * 100;
    const hardP  = (stats.hardSolved  / total) * 100;

    const maxStreak = stats.maxStreak ?? stats.currentStreak ?? 0;
    const curStreak = stats.currentStreak ?? 0;

    return (
        <div className={styles.card}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.title}>
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" fill="currentColor" />
                    </svg>
                    <h3>LeetCode Stats</h3>
                </div>
                <a href={stats.profileUrl} target="_blank" rel="noopener noreferrer" className={styles.viewProfile}>
                    LeetCode Profile →
                </a>
            </div>

            {warning && (
                <div style={{ fontSize: '12px', opacity: 0.6, padding: '4px 0 8px', color: 'var(--text-muted)' }}>
                    ⚠️ {warning}
                </div>
            )}

            {/* Streak section — shows BOTH max and current */}
            <div className={styles.streak}>
                <div className={styles.streakIcon}>🔥</div>
                <div className={styles.streakInfo}>
                    <div className={styles.streakNumber}>{maxStreak}</div>
                    <div className={styles.streakLabel}>Max Streak</div>
                </div>
                {curStreak > 0 && (
                    <div className={styles.streakInfo} style={{ marginLeft: '20px', opacity: 0.7 }}>
                        <div className={styles.streakNumber} style={{ fontSize: '1.2em' }}>{curStreak}</div>
                        <div className={styles.streakLabel}>Current</div>
                    </div>
                )}
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.totalSolved}</div>
                    <div className={styles.statLabel}>Solved</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.easySolved}</div>
                    <div className={styles.statLabel}>Easy</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.mediumSolved}</div>
                    <div className={styles.statLabel}>Medium</div>
                </div>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.hardSolved}</div>
                    <div className={styles.statLabel}>Hard</div>
                </div>
            </div>

            {/* Difficulty Bar */}
            <div className={styles.difficultyBar}>
                <div className={styles.barEasy}   style={{ width: `${easyP}%` }}   title={`Easy: ${stats.easySolved}`} />
                <div className={styles.barMedium} style={{ width: `${mediumP}%` }} title={`Medium: ${stats.mediumSolved}`} />
                <div className={styles.barHard}   style={{ width: `${hardP}%` }}   title={`Hard: ${stats.hardSolved}`} />
            </div>

            {/* Real Heatmap */}
            {stats.submissionCalendar && (
                <SubmissionHeatmap submissionCalendar={stats.submissionCalendar} />
            )}
        </div>
    );
}
