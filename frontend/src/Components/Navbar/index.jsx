import React from "react";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import styles from "./styles.module.css";
import NotificationBell from "../NotificationBell";

export default function NavBarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        <div style={{ flex: 1 }}></div>

        <div className={styles.navBarOptionContainer}>
          {/* When logged in */}
          {authState.profileFetched && (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
                paddingRight: "300px", // Prevents overlap with right sidebar
              }}
            >
              <NotificationBell />

              <div style={{ width: '1px', height: '20px', background: '#ccc' }}></div>

              <p
                onClick={() => router.push("/search")}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  margin: 0,
                  color: "var(--text-primary, #333)",
                }}
              >
                Find New Projects
              </p>
              <div style={{ width: '1px', height: '20px', background: '#ccc' }}></div>
              <p style={{ fontSize: "0.9rem", margin: 0 }}>
                Hey, {authState.user?.name}
              </p>
            </div>
          )}

          {/* When NOT logged in */}
          {!authState.profileFetched && (
            <div
              onClick={() => router.push("/login")}
              className={styles.buttonJoin}
            >
              <p style={{ margin: 0 }}>Be a part</p>
            </div>
          )}
        </div>
      </nav >
    </div >
  );
}
