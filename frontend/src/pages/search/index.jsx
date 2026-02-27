
import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '@/config';
import styles from './search.module.css';
import Link from 'next/link';
import UserLayout from '@/layout/UserLayout';

export default function SearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await axios.get(`${BASE_URL}/api/users/search?query=${query}`);
            setResults(res.data.results);
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserLayout>
            <div className={styles.container}>
                <h1>Search Users</h1>
                <form onSubmit={handleSearch} className={styles.searchForm}>
                    <input
                        type="text"
                        placeholder="Search by name, username, or skills..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={styles.searchInput}
                    />
                    <button type="submit" className={styles.searchButton} disabled={loading}>
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </form>

                <div className={styles.results}>
                    {results.length > 0 ? (
                        results.map(user => (
                            <div key={user._id} className={styles.userCard}>
                                <img
                                    src={user.profilePicture ? `${BASE_URL}${user.profilePicture}` : '/default-avatar.png'}
                                    alt={user.username}
                                    className={styles.avatar}
                                />
                                <div className={styles.userInfo}>
                                    <h3>{user.name}</h3>
                                    <p>@{user.username}</p>
                                    {user.profile && (
                                        <>
                                            <p>{user.profile.original_profile?.currentPost}</p>
                                            <div className={styles.skills}>
                                                {user.profile.original_profile?.skills?.slice(0, 3).map(skill => (
                                                    <span key={skill} className={styles.skillBadge}>{skill}</span>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                    <Link href={`/view_profile/${user.username}`} className={styles.viewProfileBtn}>
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        !loading && query && <p>No results found.</p>
                    )}
                </div>
            </div>
        </UserLayout>
    );
}
