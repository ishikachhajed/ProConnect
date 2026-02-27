import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/config/redux/action/authAction";
import { emptyMessage, reset } from "@/config/redux/reducer/authReducer";
import Link from "next/link";
import ThemeToggle from "@/Components/ThemeToggle";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  // Redirect if already logged in
  useEffect(() => {
    if (authState.loggedIn) {
      router.replace("/dashboard");
    }
  }, [authState.loggedIn, router]);

  // Clear messages when component mounts
  useEffect(() => {
    dispatch(emptyMessage());

    // Clear form if coming from account deletion
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('deleted') === 'true') {
      setEmail('');
      setPassword('');
      // Remove the param from URL
      window.history.replaceState({}, '', '/login');
    }
  }, [dispatch]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email or username is required";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    dispatch(loginUser({ email, password }));
  };

  return (
    <div className={styles.container}>
      {/* Theme toggle */}
      <div className={styles.themeToggleWrapper}>
        <ThemeToggle />
      </div>

      {/* Background decoration */}
      <div className={styles.bgDecoration}>
        <div className={styles.circle1}></div>
        <div className={styles.circle2}></div>
      </div>

      <div className={styles.loginWrapper}>
        {/* Left side - Form */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h1 className={styles.logo}>
              Pro<span>Connect</span>
            </h1>

            <h2 className={styles.formTitle}>Welcome Back</h2>
            <p className={styles.formSubtitle}>Sign in to continue to your network</p>

            {/* API messages */}
            {authState.message && (
              <div className={`${styles.alert} ${authState.isError ? styles.error : styles.success}`}>
                {authState.message}
              </div>
            )}

            <form onSubmit={handleLogin} className={styles.form}>
              {/* Email/Username */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email or Username</label>
                <input
                  type="text"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              {/* Password */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={authState.isLoading}
              >
                {authState.isLoading ? "Signing In..." : "Sign In"}
              </button>

              {/* Register Link */}
              <p className={styles.registerLink}>
                Don't have an account? <Link href="/register">Create one</Link>
              </p>
            </form>
          </div>
        </div>

        {/* Right side - Illustration */}
        <div className={styles.illustrationSection}>
          <div className={styles.illustrationContent}>
            <div className={styles.floatingCards}>
              <div className={styles.floatingCard + " " + styles.card1}>
                <div className={styles.cardIcon}>👋</div>
                <p>Connect with professionals</p>
              </div>
              <div className={styles.floatingCard + " " + styles.card2}>
                <div className={styles.cardIcon}>💼</div>
                <p>Share your expertise</p>
              </div>
              <div className={styles.floatingCard + " " + styles.card3}>
                <div className={styles.cardIcon}>🌟</div>
                <p>Grow your network</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
