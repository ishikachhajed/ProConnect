import { BASE_URL } from '@/config'
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import axios from 'axios'
import { useRouter } from "next/router"
import styles from "./index.module.css"

export default function DiscoverPage({ users, error }) {
  const router = useRouter();

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          {error && (
            <div style={{ background: '#fee', padding: 12, marginBottom: 12 }}>
              <strong>Server error (debug):</strong>
              <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
            </div>
          )}
          <h1>Discover</h1>

          <div className={styles.allUserProfile}>
            {users.map((user) => (
              <div
                key={user._id}
                className={styles.userProfile}
                onClick={() => router.push(`/view_profile/${user.userId.username}`)}
              >
                <img
                  className={styles.userCard__image}
                  src={`${BASE_URL}${user.userId.profilePicture}`}
                  alt="profile"
                />
                <div className={styles.userInfo}>
                  <h3>{user.userId.name}</h3>
                  <p>{user.userId.username}</p>
                </div>
              </div>
            ))}
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
        users: res.data.profiles,
      },
    };
  } catch (err) {
    // extract useful message
    const message = err.response && err.response.data
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
