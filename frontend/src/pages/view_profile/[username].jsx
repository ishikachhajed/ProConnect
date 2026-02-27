import { BASE_URL } from "@/config";
import { getMyConnectionsRequests, sendConnectionRequest, whatAreMyConnections } from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";
import ResumeSnapshot from "@/Components/ResumeSnapshot";
import LeetCodeCard from "@/Components/LeetCodeCard";

export default function ViewProfilePage({ user }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("none");
  const [isLoading, setIsLoading] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Helper function to ensure URL has protocol
  const ensureHttps = (url) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
  };

  // Check if viewing own profile
  useEffect(() => {
    if (authState.user && user?.userId) {
      setIsOwnProfile(authState.user._id === user.userId._id);
    }
  }, [authState.user, user?.userId]);

  // Apply profile theme
  useEffect(() => {
    if (user?.profileTheme) {
      document.documentElement.setAttribute('data-profile-theme', user.profileTheme);
    }
    return () => {
      document.documentElement.removeAttribute('data-profile-theme');
    };
  }, [user?.profileTheme]);

  // Fetch posts and connections on mount
  const fetchData = async () => {
    const token = localStorage.getItem("token");
    await dispatch(getAllPosts());
    if (token) {
      await dispatch(whatAreMyConnections({ token }));
      await dispatch(getMyConnectionsRequests({ token }));
    }
  };

  useEffect(() => {
    fetchData();
  }, [dispatch]);

  // Filter posts for this user
  useEffect(() => {
    if (postReducer.posts.length > 0 && router.query.username) {
      const posts = postReducer.posts.filter(
        (post) => post.userId.username === router.query.username
      );
      setUserPosts(posts);
    }
  }, [postReducer.posts, router.query.username]);

  // Check connection status
  useEffect(() => {
    if (!user?.userId?._id || isOwnProfile) return;

    if (authState.connections?.length > 0) {
      const isConnected = authState.connections.some(
        (conn) => conn.connectionId?._id === user.userId._id
      );
      if (isConnected) {
        setConnectionStatus("connected");
        return;
      }
    }

    if (authState.connectionRequests?.length > 0) {
      const isPending = authState.connectionRequests.some(
        (req) => req.userId?._id === user.userId._id || req.connectionId?._id === user.userId._id
      );
      if (isPending) {
        setConnectionStatus("pending");
        return;
      }
    }

    setConnectionStatus("none");
  }, [authState.connections, authState.connectionRequests, user?.userId?._id, isOwnProfile]);

  // Handle connect button
  const handleConnect = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    console.log("Connect clicked. ID:", user.userId._id);
    setIsLoading(true);
    try {
      const result = await dispatch(sendConnectionRequest({
        token,
        connectionId: user.userId._id,
      }));
      console.log("Connect result:", result);
      setConnectionStatus("pending");
      // Refresh connection data to persist state
      await fetchData();
    } catch (error) {
      console.error("Connection request failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!deletePassword.trim()) {
      setDeleteError("Please enter your password");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const response = await axios.post(`${BASE_URL}/api/users/delete_account`, {
        token,
        password: deletePassword,
      });

      // Clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redirect to home/login
      alert("Account deleted successfully");
      router.push("/login");
    } catch (error) {
      setDeleteError(error.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  // Navigate to edit profile
  const handleEditProfile = () => {
    router.push("/profile_edit");
  };

  // Button config for other users
  const getButtonConfig = () => {
    if (connectionStatus === "connected") {
      return { text: "Connected", className: styles.connectedButton, disabled: true };
    }
    if (connectionStatus === "pending") {
      return { text: "Pending", className: styles.pendingButton, disabled: true };
    }
    if (isLoading) {
      return { text: "Sending...", className: styles.connectButton, disabled: true };
    }
    return { text: "Connect", className: styles.connectButton, disabled: false };
  };

  const buttonConfig = getButtonConfig();

  // Get header background style
  const getHeaderStyle = () => {
    if (user?.headerBackground?.type === 'solid') {
      return { background: user.headerBackground.value };
    }
    if (user?.headerBackground?.type === 'image') {
      return { backgroundImage: `url(${user.headerBackground.value})`, backgroundSize: 'cover' };
    }
    // Default gradient
    return { background: user?.headerBackground?.value || 'var(--accent-gradient)' };
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Backdrop with dynamic background */}
          <div className={styles.backDropContainer} style={getHeaderStyle()}>
            <img
              className={styles.backDrop}
              src={
                user?.userId?.profilePicture
                  ? `${BASE_URL}${user.userId.profilePicture}`
                  : "/default-avatar.png"
              }
              alt="backdrop"
            />
          </div>

          <div className={styles.profileContainer__details}>
            <div className={styles.detailsInner}>
              {/* Profile Info Section */}
              <div className={styles.profileInfo}>
                {/* Button - Connect for others, nothing for self */}
                <div className={styles.buttonWrapper}>
                  {!isOwnProfile && (
                    <button
                      className={buttonConfig.className}
                      onClick={handleConnect}
                      disabled={buttonConfig.disabled}
                    >
                      {buttonConfig.text}
                    </button>
                  )}
                </div>

                {/* Name and Username - Vertical layout */}
                <div className={styles.profileHeader}>
                  <h2 className={styles.fullName}>{user?.userId?.name}</h2>
                  <p className={styles.username}>@{user?.userId?.username}</p>
                </div>

                {/* Career Mood Status */}
                {user?.careerStatus && (
                  <div className={styles.careerStatus}>
                    <span className={styles.statusBadge}>
                      ✨ {user.careerStatus}
                    </span>
                  </div>
                )}

                {/* Bio Section */}
                {user?.bio && (
                  <div className={styles.bioSection}>
                    <h4>About</h4>
                    <p>{user.bio}</p>
                  </div>
                )}

                {/* What I'm Learning Section */}
                {user?.learning && (
                  <div className={styles.learningSection}>
                    <h4>📚 Currently Learning</h4>
                    <p>{user.learning}</p>
                  </div>
                )}

                {/* Weekly Goals */}
                {user?.weeklyGoals && user.weeklyGoals.length > 0 && (
                  <div className={styles.goalsSection}>
                    <h4>🎯 Weekly Goals</h4>
                    <ul className={styles.goalsList}>
                      {user.weeklyGoals.map((goal, index) => (
                        <li key={index} className={styles.goalItem}>
                          <span className={styles.goalCheckbox}>○</span>
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills Badges with Animation */}
                {user?.skills && user.skills.length > 0 && (
                  <div className={styles.skillsSection}>
                    <h4>🛠 Skills</h4>
                    <div className={styles.skillBadges}>
                      {user.skills.map((skill, index) => (
                        <span key={index} className={styles.skillBadge}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {user?.projects && user.projects.length > 0 && (
                  <div className={styles.skillsSection} style={{ marginTop: '20px' }}>
                    <h4>📂 Projects</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {user.projects.map((proj, index) => (
                        <div key={index} className={styles.projectCard} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-tertiary)' }}>
                          <h5 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{proj.title}</h5>
                          {proj.description && <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{proj.description}</p>}
                          <div className={styles.projectLinks}>
                            {proj.githubLink && (
                              <a href={proj.githubLink} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                                GitHub
                              </a>
                            )}
                            {proj.liveLink && (
                              <a href={ensureHttps(proj.liveLink)} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                                Live Demo
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Featured Project (Legacy) */}
                {user?.featuredProject?.title && !user?.projects?.length && (
                  <div className={styles.featuredProject}>
                    <h4>🚀 Featured Project</h4>
                    <div className={styles.projectCard}>
                      <h5>{user.featuredProject.title}</h5>
                      {user.featuredProject.description && (
                        <p>{user.featuredProject.description}</p>
                      )}
                      <div className={styles.projectLinks}>
                        {user.featuredProject.githubLink && (
                          <a href={user.featuredProject.githubLink} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            GitHub
                          </a>
                        )}
                        {user.featuredProject.leetcodeLink && (
                          <a href={user.featuredProject.leetcodeLink} target="_blank" rel="noopener noreferrer" className={styles.projectLink}>
                            LeetCode
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* LeetCode Profile Section */}
                {user?.leetcodeUsername && (
                  <div style={{ marginBottom: '24px' }}>
                    <LeetCodeCard username={user.leetcodeUsername} />
                  </div>
                )}
              </div>

              {/* Right Side - Resume Snapshot & Activity */}
              <div className={styles.rightColumn}>
                {/* Resume Snapshot Card */}
                <div className={styles.resumeSnapshot}>
                  <ResumeSnapshot user={user} isOwnProfile={isOwnProfile} />
                </div>

                {/* Recent Activity */}
                <div className={styles.recentActivity}>
                  <h3>Recent Activity</h3>
                  {userPosts.length === 0 ? (
                    <p className={styles.noPosts}>No posts yet</p>
                  ) : (
                    userPosts.slice(0, 3).map((post) => (
                      <div key={post._id} className={styles.postCard}>
                        <div className={styles.card}>
                          <div className={styles.card__profileContainer}>
                            {post.media ? (
                              <img src={`${BASE_URL}/upload/${post.media}`} alt={`media-for-${post._id}`} />
                            ) : (
                              <div style={{ width: "3.4rem", height: "3.4rem" }} />
                            )}
                          </div>
                          <div className={styles.card__body}>
                            <p>{post.body.slice(0, 80)}...</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout >
  );
}

export async function getServerSideProps(context) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:9090";

  try {
    const request = await axios.get(`${API_URL}/api/users/get_profile_based_on_username`, {
      params: {
        username: context.query.username,
      },
    });

    return {
      props: {
        user: request.data.profile,
      },
    };
  } catch (error) {
    return {
      notFound: true,
    };
  }
}
