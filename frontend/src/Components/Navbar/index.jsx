import React from "react";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import styles from "./styles.module.css";
import { useDispatch } from "react-redux";
import { reset } from "@/config/redux/reducer/authReducer";

export default function NavBarComponent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  return (
    <div className={styles.container}>
      <nav className={styles.navBar}>
        {/* Logo */}
        <h1
          style={{ cursor: "pointer", fontSize: "1.2rem", margin: 0 }}
          onClick={() => router.push("/")}
        >
          ProConnect
        </h1>

        <div className={styles.navBarOptionContainer}>
          {/* When logged in */}
          {authState.profileFetched && (
            <div
              style={{
                display: "flex",
                gap: "1rem",
                alignItems: "center",
              }}
            >
              <p style={{ fontSize: "0.9rem", margin: 0 }}>
                Hey, {authState.user?.name}
              </p>

              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  margin: 0,
                }}
                
              >
                Profile
              </p>

              <p
              onClick={()=>{
                localStorage.removeItem("token")
                router.push("/login")
                dispatch(reset())
              }}
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  cursor: "pointer",
                  margin: 0,
                }}
              
              >
                Logout
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
      </nav>
    </div>
  );
}
