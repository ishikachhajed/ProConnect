import { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "@/config/redux/action/authAction";
import Link from "next/link";
import styles from "./register.module.css";

export default function RegisterPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    // Form state
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [errors, setErrors] = useState({});

    // Handle profile picture change
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) newErrors.name = "Name is required";
        if (!username.trim()) newErrors.username = "Username is required";

        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // Dispatch register action
        const result = await dispatch(registerUser({
            name,
            username,
            email,
            password,
            profilePicture
        }));

        // If successful, redirect to login
        if (result?.payload?.message?.includes("successfully")) {
            router.push("/login");
        }
    };

    return (
        <div className={styles.container}>
            {/* Background decoration */}
            <div className={styles.bgDecoration}>
                <div className={styles.circle1}></div>
                <div className={styles.circle2}></div>
                <div className={styles.circle3}></div>
            </div>

            <div className={styles.formWrapper}>
                {/* Left side - Branding */}
                <div className={styles.brandSection}>
                    <div className={styles.brandContent}>
                        <h1 className={styles.logo}>
                            Pro<span>Connect</span>
                        </h1>
                        <p className={styles.tagline}>
                            Join the network where professionals thrive
                        </p>
                        <div className={styles.features}>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>🚀</span>
                                <span>Build your professional presence</span>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>🤝</span>
                                <span>Connect with like-minded professionals</span>
                            </div>
                            <div className={styles.feature}>
                                <span className={styles.featureIcon}>💡</span>
                                <span>Share your insights and grow</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Form */}
                <div className={styles.formSection}>
                    <div className={styles.formCard}>
                        <h2 className={styles.formTitle}>Create Account</h2>
                        <p className={styles.formSubtitle}>Start your professional journey today</p>

                        {/* Show API error message */}
                        {authState.message && (
                            <div className={`${styles.alert} ${authState.isError ? styles.error : styles.success}`}>
                                {authState.message}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            {/* Profile Picture Upload */}
                            <div className={styles.avatarUpload}>
                                <label htmlFor="profilePicture" className={styles.avatarLabel}>
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className={styles.avatarPreview} />
                                    ) : (
                                        <div className={styles.avatarPlaceholder}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                            </svg>
                                            <span>Add Photo</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        id="profilePicture"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        hidden
                                    />
                                </label>
                            </div>

                            {/* Name & Username Row */}
                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                                    />
                                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className={`${styles.input} ${errors.username ? styles.inputError : ""}`}
                                    />
                                    {errors.username && <span className={styles.errorText}>{errors.username}</span>}
                                </div>
                            </div>

                            {/* Email */}
                            <div className={styles.inputGroup}>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                                />
                                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                            </div>

                            {/* Password Row */}
                            <div className={styles.inputRow}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                                    />
                                    {errors.password && <span className={styles.errorText}>{errors.password}</span>}
                                </div>

                                <div className={styles.inputGroup}>
                                    <input
                                        type="password"
                                        placeholder="Confirm Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ""}`}
                                    />
                                    {errors.confirmPassword && <span className={styles.errorText}>{errors.confirmPassword}</span>}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={authState.isLoading}
                            >
                                {authState.isLoading ? "Creating Account..." : "Create Account"}
                            </button>

                            {/* Login Link */}
                            <p className={styles.loginLink}>
                                Already have an account? <Link href="/login">Sign In</Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
