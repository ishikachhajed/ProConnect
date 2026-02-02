import React, { useEffect, useState } from "react";
import UserLayout from "@/layout/UserLayout";
import styles from "./style.module.css";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import { registerUser, loginUser } from "@/config/redux/action/authAction";
import { reset , emptyMessage } from "@/config/redux/reducer/authReducer";

function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLoginMethod, setIsLoginMethod] = useState(false);

  const [email, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (authState.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn, router]);

  useEffect(() => {
  if (authState.loggedIn) {
    router.push("/dashboard");
  }
}, [authState.loggedIn, router]);



//   useEffect(() => {
//   // After successful registration → switch to Sign In
//   if (authState.isSuccess && !authState.loggedIn) {
//     setIsLoginMethod(true);
//     setUsername("");
//     setName("");
//     setEmailAddress("");
//     setPassword("");
//   }
// }, [authState.isSuccess, authState.loggedIn]);



useEffect(() => {
  dispatch(emptyMessage());
}, [isLoginMethod]);



  const handleRegister = () => {
  if (!username || !name || !email || !password) {
    alert("Please fill all fields");
    return;
  }

  dispatch(registerUser({ username, name, email, password }));
};


  const handleLogin = () => {
    console.log("Login...");
    dispatch(loginUser({ email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer__left}>
            <p className={styles.cardLeft_heading}>
              {isLoginMethod ? "Sign In" : "Sign Up"}
            </p>

            {authState.message && (
              <p style={{ color: authState.isError ? "red" : "green" }}>
                {authState.message}
              </p>
            )}

            <form autoComplete="off" className={styles.inputContainers}>
              {/* Username & Name only for Sign Up */}
              {!isLoginMethod && (
                <div className={styles.inputRow}>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={styles.inputfield}
                    type="text"
                    name="username"
                    autoComplete="new-username"
                    placeholder="Username"
                  />

                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={styles.inputfield}
                    type="text"
                    name="name"
                    autoComplete="off"
                    placeholder="Name"
                  />
                </div>
              )}

              {/* Email */}
              <input
                value={email}
                onChange={(e) => setEmailAddress(e.target.value)}
                className={styles.inputfield}
                type="email"
                name="email"
                autoComplete="new-email"
                placeholder="Email"
              />

              {/* Password */}
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputfield}
                type="password"
                name="password"
                autoComplete="new-password"
                placeholder="Password"
              />

              {/* Button */}
              <div
                onClick={() => {
                  if (authState.isLoading) return;

                  if (isLoginMethod) {
                    // LOGIN validation
                    if (!email || !password) {
                      alert("Please enter email and password");
                      return;
                    }
                    handleLogin();
                  } else {
                    // REGISTER validation
                    if (!username || !name || !email || !password) {
                      alert("All fields are required");
                      return;
                    }
                    handleRegister();
                  }
                }}

                className={styles.buttonWithOutline}
              >
                <p>{isLoginMethod ? "Sign In" : "Sign Up"}</p>
              </div>

              {/* Toggle */}
              <p
                style={{ cursor: "pointer", marginTop: "12px" }}
                onClick={() => {
                  setIsLoginMethod(!isLoginMethod);
                  setUsername("");
                  setName("");
                  setEmailAddress("");
                  setPassword("");
                  dispatch(reset()); 
                }}
              >
                {isLoginMethod
                  ? "Don't have an account? Sign Up"
                  : "Already have an account? Sign In"}
              </p>
            </form>
          </div>

          <div className={styles.cardContainer__right}>
           
              {isLoginMethod ? <p>Don't Have An Account!</p> : <p>Already Have an Account!</p>}
                  
                  <div onClick ={()=>{
                    setIsLoginMethod(!isLoginMethod);
                  }} style={{color:"black", textAlign:"center"}} className={styles.buttonWithOutline}>
                    <p>{isLoginMethod ? "Sign Up" : "Sign In"}</p>
                  </div>
                  </div>
        
          
        </div>
      </div>
    </UserLayout>
  );
}

export default LoginComponent;
