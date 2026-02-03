import { setTokenIsThere } from "@/config/redux/reducer/authReducer";
import { BASE_URL } from "@/config";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./index.module.css";

// ✅ HEROICONS
import { HomeIcon } from "@heroicons/react/24/outline";


function DashboardLayout({ children }) {
  const router = useRouter();
  const dispatch = useDispatch();

  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
    } else {
      dispatch(setTokenIsThere());
    }
  }, [router, dispatch]);

  return (
    <div className="container">
      <div className={styles.homeContainer}>
        {/* LEFT SIDEBAR */}
        <div className={styles.homeContainer__leftBar}>
          <div
            onClick={() => router.push("/dashboard")}
            className={styles.sideBarOption}
          >
            <HomeIcon className={styles.icon} />
            <p>Home</p>
          </div>

          <div
            onClick={() => router.push("/discover")}
            className={styles.sideBarOption}
          >
            {/* DISCOVER SVG ICON */}
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
            <p>Discover</p>
          </div>

          <div
  onClick={() => router.push("/my_connections")}
  className={styles.sideBarOption}
>
  {/* MY CONNECTIONS SVG ICON */}
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

  <p>My Connections</p>
</div>

        </div>

        {/* MAIN FEED */}
        <div className={styles.homeContainer__feedContainer}>
          {children}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className={styles.homeContainer__extraContainer}>
          <h3>Top Profiles</h3>

          {authState.allUsers &&
            authState.allUsers.map((profile) => (
              <div
                key={profile._id}
                className={styles.extraContainer__profile}
              >
                <img
                  src={`${BASE_URL}${profile.userId.profilePicture}`}
                  alt="profile"
                />
                <p>{profile.userId.name}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
