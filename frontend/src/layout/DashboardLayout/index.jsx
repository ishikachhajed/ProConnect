import { setTokenIsThere, setTokenIsNotThere, reset } from "@/config/redux/reducer/authReducer";
import { BASE_URL } from "@/config";
import { getProfileImageUrl } from "@/utils/profileImage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import ThemeToggle from "@/Components/ThemeToggle";
import NotificationBell from "@/Components/NotificationBell";

// Heroicons
import { HomeIcon } from "@heroicons/react/24/outline";

function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  // Track if we're logging out to prevent redirect loop
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Check auth on mount ONLY (empty dependency array)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      // Only redirect if not already logging out
      if (!isLoggingOut) {
        router.replace("/login"); // Use replace instead of push
      }
    } else {
      dispatch(setTokenIsThere());
    }
  }, []); // Empty deps - run only on mount

  // Handle logout - proper implementation
  const handleLogout = () => {
    // Set flag to prevent redirect loop
    setIsLoggingOut(true);

    // Remove token from localStorage
    localStorage.removeItem("token");

    // Reset Redux auth state
    dispatch(reset());
    dispatch(setTokenIsNotThere());

    // Use replace to prevent back button issues
    router.replace("/login");
  };

  return (
    <div className={styles.layoutContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoText}>Pro<span>Connect</span></span>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <div
            onClick={() => router.push("/dashboard")}
            className={`${styles.navItem} ${router.pathname === "/dashboard" ? styles.active : ""}`}
          >
            <HomeIcon className={styles.icon} />
            <span>Home</span>
          </div>

          <div
            onClick={() => router.push("/discover")}
            className={`${styles.navItem} ${router.pathname === "/discover" ? styles.active : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
            <span>Discover</span>
          </div>

          <div
            onClick={() => router.push("/my_connections")}
            className={`${styles.navItem} ${router.pathname === "/my_connections" ? styles.active : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z"
              />
            </svg>
            <span>Connections</span>
          </div>

          {/* Profile */}
          <div
            onClick={() => router.push("/profile_edit")}
            className={`${styles.navItem} ${router.pathname === "/profile_edit" ? styles.active : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
            <span>Profile</span>
          </div>

          {/* Settings */}
          <div
            onClick={() => router.push("/settings")}
            className={`${styles.navItem} ${router.pathname === "/settings" ? styles.active : ""}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
            <span>Settings</span>
          </div>
        </nav>

        {/* Sidebar footer */}
        <div className={styles.sidebarFooter}>
          <div className={styles.footerActions}>
            <NotificationBell />
            <ThemeToggle />
          </div>

          {authState.user && (
            <div
              className={styles.userCard}
              onClick={() => router.push(`/view_profile/${authState.user.username}`)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={getProfileImageUrl(authState.user.profilePicture)}
                alt="profile"
                className={styles.userAvatar}
                onError={(e) => { e.target.src = '/default-avatar.png'; }}
              />
              <div className={styles.userInfo}>
                <p className={styles.userName}>{authState.user.name}</p>
                <p className={styles.userHandle}>@{authState.user.username}</p>
              </div>
            </div>
          )}

          <button onClick={handleLogout} className={styles.logoutBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={styles.mainContent}>
        {children}
      </main>

      {/* Right sidebar */}
      <aside className={styles.rightSidebar}>
        <div className={styles.rightHeader}>
          <h3>Top Profiles</h3>
        </div>

        <div className={styles.profileList}>
          {authState.allUsers &&
            authState.allUsers.slice(0, 5).map((profile) => (
              <div
                key={profile._id}
                className={styles.profileCard}
                onClick={() => router.push(`/view_profile/${profile.userId?.username}`)}
              >
                <img
                  src={getProfileImageUrl(profile.userId?.profilePicture)}
                  alt="profile"
                  className={styles.profileAvatar}
                  onError={(e) => { e.target.src = '/default-avatar.png'; }}
                />
                <div className={styles.profileInfo}>
                  <p className={styles.profileName}>{profile.userId?.name}</p>
                  <p className={styles.profileHandle}>@{profile.userId?.username}</p>
                </div>
              </div>
            ))}
        </div>
      </aside>
    </div>
  );
}

export default DashboardLayout;
