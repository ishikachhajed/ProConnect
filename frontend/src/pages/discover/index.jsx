import { BASE_URL, clientServer } from '@/config'
import DashboardLayout from '@/layout/DashboardLayout'
import UserLayout from '@/layout/UserLayout'
import { useRouter } from "next/router"
import styles from "./index.module.css"

export default function DiscoverPage({ users }) {
  const router = useRouter();

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
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
  const res = await clientServer.get("/api/users/get_all_users");

  return {
    props: {
      users: res.data.profiles
    }
  };
}
