import { BASE_URL } from '@/config'
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import { getAboutUser, getMyConnectionsRequests, sendConnectionRequest, whatAreMyConnections } from '@/config/redux/action/authAction'
import axios from 'axios'
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import styles from "./index.module.css"

export default function DiscoverPage({ users, error }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  // Track connections for each user
  const [connectionStatus, setConnectionStatus] = useState({});
  // Track loading state for each button
  const [loadingId, setLoadingId] = useState(null);

  // Fetch user's connections on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      dispatch(getAboutUser({ token }));
      dispatch(whatAreMyConnections({ token }));
      dispatch(getMyConnectionsRequests({ token }));
    }
  }, [dispatch]);

  // Get connection status for a user
  const getConnectionStatus = (targetId) => {
    if (!targetId) return 'none';

    const myId = authState.user?._id;

    // 1. Check in Redux connections state
    if (authState.connections && authState.connections.length > 0) {
      const isConnected = authState.connections.some((conn) => {
        // Find the user on the other side of the connection
        const otherId = String(conn.userId?._id) === String(myId)
          ? String(conn.connectionId?._id)
          : String(conn.userId?._id);
        return otherId === String(targetId);
      });
      if (isConnected) return 'connected';
    }

    // 2. Check in Redux connectionRequests state (pending)
    if (authState.connectionRequests && authState.connectionRequests.length > 0) {
      const isPending = authState.connectionRequests.some((req) => {
        // Find the user on the other side of the request
        const otherId = String(req.userId?._id) === String(myId)
          ? String(req.connectionId?._id)
          : String(req.userId?._id);
        return otherId === String(targetId);
      });
      if (isPending) return 'pending';
    }

    // 3. Also check local state for newly sent requests
    return connectionStatus[targetId] || 'none';
  };

  // Handle connect button click
  const handleConnect = async (e, userId) => {
    // IMPORTANT: Stop event from bubbling to parent (card click)
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Set loading state
    setLoadingId(userId);

    try {
      // Dispatch the connection request
      await dispatch(sendConnectionRequest({ token, connectionId: userId }));

      // Update local state to show pending
      setConnectionStatus((prev) => ({
        ...prev,
        [userId]: 'pending'
      }));
    } catch (err) {
      console.error("Connection request failed:", err);
    } finally {
      // Clear loading state
      setLoadingId(null);
    }
  };

  // Navigate to profile
  const goToProfile = (username) => {
    router.push(`/view_profile/${username}`);
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Error display */}
          {error && (
            <div className={styles.errorBox}>
              <strong>Server error:</strong>
              <pre>{error}</pre>
            </div>
          )}

          <h1 className={styles.pageTitle}>Discover People</h1>

          <div className={styles.allUserProfile}>
            {users
              .filter((u) => u.userId?._id !== authState.user?._id)
              .map((user) => {
                const userId = user.userId?._id;
                const status = getConnectionStatus(userId);
                const isLoading = loadingId === userId;

              return (
                <div
                  key={user._id}
                  className={styles.userProfile}
                  onClick={() => goToProfile(user.userId?.username)}
                >
                  {/* Profile image */}
                  <img
                    className={styles.userCard__image}
                    src={`${BASE_URL}${user.userId?.profilePicture}`}
                    alt="profile"
                  />

                  {/* User info */}
                  <div className={styles.userInfo}>
                    <h3>{user.userId?.name}</h3>
                    <p>@{user.userId?.username}</p>
                  </div>

                  {/* Connect button - uses stopPropagation */}
                  <button
                    className={`${styles.connectBtn} ${status !== 'none' ? styles.connected : ''}`}
                    onClick={(e) => handleConnect(e, userId)}
                    disabled={status !== 'none' || isLoading}
                  >
                    {isLoading ? (
                      "Sending..."
                    ) : status === 'connected' ? (
                      "Connected"
                    ) : status === 'pending' ? (
                      "Pending"
                    ) : (
                      "Connect"
                    )}
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </DashboardLayout>
    </UserLayout>
  )
}

export async function getServerSideProps() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://proconnect-93x8.onrender.com";
  try {
    const res = await axios.get(`${API_URL}/api/users/get_all_users`);

    return {
      props: {
        users: res.data.profiles || [],
      },
    };
  } catch (err) {
    const message = err.response?.data
      ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data))
      : (err.message || 'Unknown server error');

    return {
      props: {
        users: [],
        error: message,
      },
    };
  }
}
