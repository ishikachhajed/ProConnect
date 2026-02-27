import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import DashboardLayout from '@/layout/DashboardLayout';
import UserLayout from '@/layout/UserLayout';
import { clientServer } from '@/config';
import styles from './settings.module.css';

export default function SettingsPage() {
    const router = useRouter();
    const authState = useSelector((state) => state.auth);

    // User state
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Change Password state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMessage, setPasswordMessage] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    // Delete Account state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [usernameConfirm, setUsernameConfirm] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    // Load user data from Redux
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        if (authState.user) {
            setUser(authState.user);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }, [authState.user, router]);

    // Handle Change Password
    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordMessage('');

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordMessage('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordMessage('New password must be at least 6 characters');
            return;
        }

        const token = localStorage.getItem('token');
        setPasswordLoading(true);

        try {
            await clientServer.post('/api/users/change_password', {
                token,
                oldPassword: currentPassword,
                newPassword,
            });

            setPasswordMessage('âœ… Password changed successfully!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMessage(error.response?.data?.message || 'Error changing password');
        } finally {
            setPasswordLoading(false);
        }
    };

    // Handle Soft Delete Account
    const handleDeleteAccount = async () => {
        if (!user) return;

        if (usernameConfirm !== user.username) {
            setDeleteError('Username does not match');
            return;
        }

        const token = localStorage.getItem('token');
        setIsDeleting(true);
        setDeleteError('');

        try {
            await clientServer.post('/api/users/soft_delete_account', {
                token,
                username: user.username,
            });

            // Immediate cleanup - no delays, no alerts
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // Instant redirect
            window.location.href = '/login?deleted=true';
        } catch (error) {
            setDeleteError(error.response?.data?.message || 'Error deleting account');
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <UserLayout>
                <DashboardLayout>
                    <div className={styles.container}>
                        <div className={styles.loading}>Loading settings...</div>
                    </div>
                </DashboardLayout>
            </UserLayout>
        );
    }

    if (!user) return null;

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1>Settings</h1>
                        <p>Manage your account settings and preferences</p>
                    </div>

                    {/* Account Information */}
                    <div className={styles.section}>
                        <h2>Account Information</h2>
                        <div className={styles.infoCard}>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Name:</span>
                                <span className={styles.value}>{user.name}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Username:</span>
                                <span className={styles.value}>@{user.username}</span>
                            </div>
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Email:</span>
                                <span className={styles.value}>{user.email}</span>
                            </div>
                        </div>
                        <button
                            className={styles.editProfileBtn}
                            onClick={() => router.push('/profile_edit')}
                        >
                            Edit Profile
                        </button>
                    </div>

                    {/* Change Password */}
                    <div className={styles.section}>
                        <h2>Change Password</h2>
                        <form onSubmit={handleChangePassword} className={styles.passwordForm}>
                            <div className={styles.inputGroup}>
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    className={styles.input}
                                />
                            </div>
                            {passwordMessage && (
                                <div className={passwordMessage.includes('âœ…') ? styles.successMessage : styles.errorMessage}>
                                    {passwordMessage}
                                </div>
                            )}
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? 'Changing...' : 'Change Password'}
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className={styles.dangerZone}>
                        <h2>Danger Zone</h2>
                        <div className={styles.dangerCard}>
                            <h3>Delete Account</h3>
                            <p>
                                Your account will be deactivated for 30 days. During this period, you can recover it by logging in with your credentials. After 30 days, your account and all associated data will be permanently deleted.
                            </p>
                            <button
                                className={styles.deleteBtn}
                                onClick={() => setShowDeleteModal(true)}
                            >
                                Delete My Account
                            </button>
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteModal && (
                        <div className={styles.modalOverlay} onClick={() => setShowDeleteModal(false)}>
                            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                <h3 className={styles.modalTitle}>Delete Account</h3>

                                <div className={styles.modalBody}>
                                    <p className={styles.warningText}>
                                        This will deactivate your account for 30 days. You can recover it by logging in during this period.
                                    </p>

                                    <p className={styles.confirmText}>
                                        Type your username <strong>{user.username}</strong> to confirm:
                                    </p>

                                    <input
                                        type="text"
                                        value={usernameConfirm}
                                        onChange={(e) => {
                                            setUsernameConfirm(e.target.value);
                                            setDeleteError('');
                                        }}
                                        placeholder="Enter your username"
                                        className={styles.modalInput}
                                        autoFocus
                                    />

                                    {deleteError && (
                                        <p className={styles.errorMessage}>{deleteError}</p>
                                    )}
                                </div>

                                <div className={styles.modalActions}>
                                    <button
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setUsernameConfirm('');
                                            setDeleteError('');
                                        }}
                                        className={styles.cancelBtn}
                                        disabled={isDeleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDeleteAccount}
                                        className={styles.confirmDeleteBtn}
                                        disabled={isDeleting || usernameConfirm !== user.username}
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete Account'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}
