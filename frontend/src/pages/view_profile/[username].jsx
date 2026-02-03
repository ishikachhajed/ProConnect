import { clientServer } from "@/config";
import { getMyConnectionsRequests, sendConnectionRequest } from "@/config/redux/action/authAction";
import { getAllPosts } from "@/config/redux/action/postAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";

export default function ViewProfilePage({ user }) {
  const BASE_URL = process.env.BASE_URL;
  const router = useRouter();
  const dispatch = useDispatch();

  const postReducer = useSelector((state) => state.postReducer);
  const authState = useSelector((state) => state.auth);

  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUserInConnection, setIsCurrentUserInConnection] = useState(false);

  const getUserPost = async () => {
    await dispatch(getAllPosts());
    await dispatch(getMyConnectionsRequests({ token: localStorage.getItem("token") }));
  };

  useEffect(() => {
    if (postReducer.posts.length > 0 && router.query.username) {
      const post = postReducer.posts.filter(
        (post) => post.userId.username === router.query.username
      );
      setUserPosts(post);
    }
  }, [postReducer.posts, router.query.username]);

  useEffect(() => {
    if (authState.connections?.length > 0) {
      const isConnected = authState.connections.some(
  (conn) => conn.connectionId._id === user.userId._id
);

      setIsCurrentUserInConnection(isConnected);
    }
  }, [authState.connections, user.userId._id]);

  useEffect(() => {
    getUserPost();
  }, [dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.container}>
          <div className={styles.backDropContainer}>
            <img
              className={styles.backDrop}
              src={
                user.userId.profilePicture
                  ? `${BASE_URL}${user.userId.profilePicture}`
                  : "/default-avatar.png"
              }
              alt="backdrop"
            />
          </div>

          <div className={styles.profileContainer__details}>
            <div className={styles.detailsInner}>
              <div className={styles.profileInfo}>
                <div>
                  {isCurrentUserInConnection ? (
                    <button className={styles.connectedButton}>Connected</button>
                  ) : (
                    <button
                      className={styles.connectButton}
                      onClick={() => {
                        dispatch(
                          sendConnectionRequest({
                            token: localStorage.getItem("token"),
                            connectionId: user.userId._id,
                          })
                        );
                      }}
                    >
                      Connect
                    </button>
                  )}
                </div>
                <div className={styles.profileHeader}>
                  <div>
                    <h2>{user?.userId?.name}</h2>
                    <p className={styles.username}>@{user?.userId?.username}</p>
                  </div>
                </div>

                <div>
                  <p className={styles.bio}>{user.bio}</p>
                </div>
              </div>

              <div className={styles.recentActivity}>
                <h3>Recent Activity</h3>
                {userPosts.map((post) => {
                  return (
                    <div key={post._id} className={styles.postCard}>
                      <div className={styles.card}>
                        <div className={styles.card__profileContainer}>
                          {post.media ? (
                            <img
                              src={`${BASE_URL}/upload/${post.media}`}
                              alt={`media-for-${post._id}`}
                            />
                          ) : (
                            <div style={{ width: "3.4rem", height: "3.4rem" }} />
                          )}
                        </div>

                        <div className={styles.card__body}>
                          <p>{post.body}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}

export async function getServerSideProps(context) {
  const request = await clientServer.get("/api/users/get_profile_based_on_username", {
    params: {
      username: context.query.username,
    },
  });

  return {
    props: {
      user: request.data.profile,
    },
  };
}
