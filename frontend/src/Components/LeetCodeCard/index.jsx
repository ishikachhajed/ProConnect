import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import styles from './leetcode.module.css';

export default function LeetCodeCard({ username }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!username) {
            setLoading(false);
            return;
        }

        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await axios.get(`${BASE_URL}/api/leetcode/stats?username=${username}`);
                setStats(res.data.stats);
            } catch (err) {
                console.error('LeetCode stats error:', err);
                setError(err.response?.data?.message || 'Unable to load LeetCode stats');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [username]);

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
        );
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.title}>
                    <svg className={styles.icon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" fill="currentColor" />
                    </svg>
                    <h3>LeetCode Profile</h3>
                </div>
                <a
                    href={stats.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.viewProfile}
                >
                    View Profile →
                </a>
            </div>

            {/* Streak Section */}
            <div className={styles.streak}>
                <div className={styles.streakIcon}>🔥</div>
                <div className={styles.streakInfo}>
                    <div className={styles.streakNumber}>{stats.currentStreak}</div>
                    <div className={styles.streakLabel}>Day Streak</div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                    <div className={styles.statValue}>{stats.totalSolved}</div>
                    <div className={styles.statLabel}>Total Solved</div>
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
        </div>
    );
}
