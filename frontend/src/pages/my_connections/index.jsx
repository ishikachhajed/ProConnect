import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyConnectionsRequests,
  whatAreMyConnections,
  acceptConnectionRequest
} from "@/config/redux/action/authAction";
import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { BASE_URL } from "@/config";
import { getProfileImageUrl } from "@/utils/profileImage";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import styles from "./connections.module.css";

export default function MyConnectionsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("connections");
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);

  // Check auth on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    } else {
      dispatch(setTokenIsThere());
    }
  }, [router, dispatch]);

  // Fetch connections data
  useEffect(() => {
    if (authState.isTokenThere) {
      const token = localStorage.getItem("token");
      dispatch(whatAreMyConnections({ token }));
      dispatch(getMyConnectionsRequests({ token }));
    }
  }, [authState.isTokenThere, dispatch]);

  // Update local state when redux state changes
  useEffect(() => {
    if (authState.connections) {
      setConnections(authState.connections);
    }
    if (authState.connectionRequests) {
      setRequests(authState.connectionRequests);
    }
  }, [authState.connections, authState.connectionRequests]);

  // Handle accept/reject connection
  const handleConnectionAction = async (requestId, actionType) => {
    const token = localStorage.getItem("token");
    await dispatch(acceptConnectionRequest({ token, requestId, action_type: actionType }));
    // Refresh lists
    dispatch(whatAreMyConnections({ token }));
    dispatch(getMyConnectionsRequests({ token }));
  };

  // Navigate to user profile
  const goToProfile = (username) => {
    router.push(`/view_profile/${username}`);
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>My Network</h1>

          {/* Tab Navigation */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "connections" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("connections")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
              Connections
              {connections.length > 0 && <span className={styles.badge}>{connections.length}</span>}
            </button>
            <button
              className={`${styles.tab} ${activeTab === "requests" ? styles.activeTab : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
              </svg>
              Pending Requests
              {requests.length > 0 && <span className={styles.badgeActive}>{requests.length}</span>}
            </button>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {activeTab === "connections" ? (
              <>
                {connections.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                    </svg>
                    <h3>No connections yet</h3>
                    <p>Start building your network by connecting with other professionals</p>
                    <button onClick={() => router.push("/discover")} className={styles.discoverBtn}>
                      Discover People
                    </button>
                  </div>
                ) : (
                  <div className={styles.userGrid}>
                    {connections.map((connection) => {
                      const otherUser = connection.userId?._id === authState.user?._id
                        ? connection.connectionId
                        : connection.userId;

                      if (!otherUser) return null;

                      return (
                        <div key={connection._id} className={styles.userCard}>
                          <img
                            src={getProfileImageUrl(otherUser.profilePicture)}
                            onError={(e) => { e.target.src = '/default-avatar.png'; }}
                            alt={otherUser.name}
                            className={styles.userAvatar}
                            onClick={() => goToProfile(otherUser.username)}
                          />
                          <div className={styles.userInfo}>
                            <h4
                              className={styles.userName}
                              onClick={() => goToProfile(otherUser.username)}
                            >
                              {otherUser.name}
                            </h4>
                            <p className={styles.userUsername}>@{otherUser.username}</p>
                          </div>
                          <div className={styles.cardActions}>
                            <button
                              className={styles.viewBtn}
                              onClick={() => goToProfile(otherUser.username)}
                            >
                              View Profile
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            ) : (
              <>
                {requests.length === 0 ? (
                  <div className={styles.emptyState}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <h3>No pending requests</h3>
                    <p>You're all caught up! No connection requests at the moment.</p>
                  </div>
                ) : (
                  <div className={styles.userGrid}>
                    {requests.map((request) => {
                      const isOutgoing = request.userId?._id === authState.user?._id;
                      const otherUser = isOutgoing ? request.connectionId : request.userId;

                      if (!otherUser) return null;

                      return (
                        <div key={request._id} className={styles.userCard}>
                          <img
                            src={getProfileImageUrl(otherUser.profilePicture)}
                            onError={(e) => { e.target.src = '/default-avatar.png'; }}
                            alt={otherUser.name}
                            className={styles.userAvatar}
                            onClick={() => goToProfile(otherUser.username)}
                          />
                          <div className={styles.userInfo}>
                            <h4
                              className={styles.userName}
                              onClick={() => goToProfile(otherUser.username)}
                            >
                              {otherUser.name}
                            </h4>
                            <p className={styles.userUsername}>@{otherUser.username}</p>
                            {isOutgoing && <span className={styles.outgoingBadge}>Sent Request</span>}
                          </div>
                          <div className={styles.requestActions}>
                            {!isOutgoing ? (
                              <>
                                <button
                                  className={styles.acceptBtn}
                                  onClick={() => handleConnectionAction(request._id, "accept")}
                                >
                                  Accept
                                </button>
                                <button
                                  className={styles.rejectBtn}
                                  onClick={() => handleConnectionAction(request._id, "reject")}
                                >
                                  Ignore
                                </button>
                              </>
                            ) : (
                              <button
                                className={styles.rejectBtn}
                                onClick={() => handleConnectionAction(request._id, "reject")}
                              >
                                Cancel Request
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
