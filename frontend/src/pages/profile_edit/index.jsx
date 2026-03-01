import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { clientServer } from "@/config";
import { uploadProfilePicture } from "@/config/redux/action/authAction";
import styles from "./profile_edit.module.css";

export default function ProfileEditPage() {
    const router = useRouter();
    const dispatch = useDispatch();
    const authState = useSelector((state) => state.auth);

    // Helper function to ensure URL has protocol
    const ensureHttps = (url) => {
        if (!url) return url;
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    // Form state
    const [bio, setBio] = useState("");
    const [learning, setLearning] = useState("");
    const [leetcodeUsername, setLeetcodeUsername] = useState(""); // LeetCode username
    const [currentPost, setCurrentPost] = useState("");
    const [skills, setSkills] = useState([]);
    const [newSkill, setNewSkill] = useState("");
    const [featuredProject, setFeaturedProject] = useState({
        title: "",
        description: "",
        githubLink: "",
    });
    // Projects State
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({
        title: "",
        description: "",
        githubLink: "",
        liveLink: ""
    });

    // New Features State
    const [careerStatus, setCareerStatus] = useState("");
    const [weeklyGoals, setWeeklyGoals] = useState([]);
    const [newGoal, setNewGoal] = useState("");
    const [profileTheme, setProfileTheme] = useState("sand");
    const [headerBackground, setHeaderBackground] = useState({
        type: "gradient",
        value: "linear-gradient(135deg, #c4a574 0%, #d4b888 50%, #e8c99b 100%)"
    });

    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");

    // Profile picture state
    const [profilePicPreview, setProfilePicPreview] = useState(null);
    const [profilePicFile, setProfilePicFile] = useState(null);
    const [profilePicLoading, setProfilePicLoading] = useState(false);
    const [profilePicMessage, setProfilePicMessage] = useState("");

    // Current profile picture from Redux auth state
    const currentProfilePic = authState?.user?.profilePicture;

    // Load existing profile data
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await clientServer.post("/api/users/get_profile", { token });
                const profile = response.data.profile;

                if (profile) {
                    setBio(profile.bio || "");
                    setLearning(profile.learning || "");
                    setLeetcodeUsername(profile.leetcodeUsername || ""); // Load LeetCode username
                    setCurrentPost(profile.currentPost || "");
                    setSkills(profile.skills || []);
                    setFeaturedProject(profile.featuredProject || {
                        title: "",
                        description: "",
                        githubLink: "",
                    });
                    setProjects(profile.projects || []);

                    // Set new fields
                    setCareerStatus(profile.careerStatus || "");
                    setWeeklyGoals(profile.weeklyGoals || []);
                    setProfileTheme(profile.profileTheme || "sand");
                    if (profile.headerBackground) {
                        setHeaderBackground(profile.headerBackground);
                    }
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [router]);

    // Handle profile picture file selection (show preview only)
    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfilePicFile(file);
        setProfilePicPreview(URL.createObjectURL(file));
        setProfilePicMessage("");
    };

    // Handle profile picture upload to Cloudinary via Redux thunk (updates sidebar instantly)
    const handleUploadProfilePicture = async () => {
        if (!profilePicFile) {
            setProfilePicMessage("Please select an image first.");
            return;
        }
        const token = localStorage.getItem("token");
        setProfilePicLoading(true);
        setProfilePicMessage("");
        try {
            const result = await dispatch(uploadProfilePicture({ file: profilePicFile, token }));
            if (uploadProfilePicture.fulfilled.match(result)) {
                setProfilePicPreview(result.payload.imageUrl);
                setProfilePicFile(null);
                setProfilePicMessage("✅ Profile picture updated!");
            } else {
                setProfilePicMessage(`❌ ${result.payload || "Upload failed"}`);
            }
        } catch (error) {
            setProfilePicMessage("❌ Upload failed. Please try again.");
            console.error("Profile picture upload error:", error);
        } finally {
            setProfilePicLoading(false);
        }
    };

    // Handle standard profile update
    const handleUpdateProfile = async () => {
        setIsLoading(true);
        setMessage("");
        const token = localStorage.getItem("token");

        try {
            await clientServer.post("/api/profile/update", {
                token,
                bio,
                learning,
                leetcodeUsername, // Include LeetCode username
                currentPost,
            });
            setMessage("Profile updated successfully!");
        } catch (error) {
            setMessage("Error updating profile");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Career Status Update
    const handleUpdateCareerStatus = async () => {
        const token = localStorage.getItem("token");
        try {
            await clientServer.post("/api/profile/career-status", {
                token,
                careerStatus
            });
            setMessage("Career status updated!");
        } catch (error) {
            console.error("Error updating career status:", error);
        }
    };

    // Handle Weekly Goals
    const handleAddGoal = async () => {
        if (!newGoal.trim()) return;
        if (weeklyGoals.length >= 3) {
            setMessage("Max 3 goals allowed");
            return;
        }

        const updatedGoals = [...weeklyGoals, newGoal.trim()];
        const token = localStorage.getItem("token");

        try {
            const response = await clientServer.post("/api/profile/weekly-goals", {
                token,
                weeklyGoals: updatedGoals
            });
            setWeeklyGoals(response.data.weeklyGoals);
            setNewGoal("");
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    const handleRemoveGoal = async (indexToRemove) => {
        const updatedGoals = weeklyGoals.filter((_, i) => i !== indexToRemove);
        const token = localStorage.getItem("token");

        try {
            const response = await clientServer.post("/api/profile/weekly-goals", {
                token,
                weeklyGoals: updatedGoals
            });
            setWeeklyGoals(response.data.weeklyGoals);
        } catch (error) {
            console.error("Error removing goal:", error);
        }
    };

    // Handle Theme Update
    const handleUpdateTheme = async (theme) => {
        setProfileTheme(theme);
        // Apply immediately to current page
        document.documentElement.setAttribute('data-profile-theme', theme);

        const token = localStorage.getItem("token");
        try {
            await clientServer.post("/api/profile/theme", {
                token,
                theme
            });
        } catch (error) {
            console.error("Error updating theme:", error);
        }
    };

    // Handle Header Background
    const handleUpdateHeaderBackground = async (bgObject) => {
        setHeaderBackground(bgObject);

        const token = localStorage.getItem("token");
        try {
            await clientServer.post("/api/profile/header-background", {
                token,
                ...bgObject
            });
        } catch (error) {
            console.error("Error updating header background:", error);
        }
    };

    // Handle add skill
    const handleAddSkill = async () => {
        if (!newSkill.trim()) return;

        const token = localStorage.getItem("token");
        try {
            const response = await clientServer.post("/api/profile/skills/add", {
                token,
                skill: newSkill.trim(),
            });
            setSkills(response.data.skills);
            setNewSkill("");
        } catch (error) {
            console.error("Error adding skill:", error);
        }
    };

    // Handle remove skill
    const handleRemoveSkill = async (skillToRemove) => {
        const token = localStorage.getItem("token");
        try {
            const response = await clientServer.post("/api/profile/skills/remove", {
                token,
                skill: skillToRemove,
            });
            setSkills(response.data.skills);
        } catch (error) {
            console.error("Error removing skill:", error);
        }
    };

    // Handle featured project update
    const handleUpdateFeaturedProject = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        try {
            await clientServer.post("/api/profile/featured-project", {
                token,
                ...featuredProject,
            });
            setMessage("Featured project updated!");
        } catch (error) {
            setMessage("Error updating featured project");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Projects
    const handleAddProject = () => {
        if (!newProject.title.trim()) return;
        const updatedProjects = [...projects, newProject];
        setProjects(updatedProjects);
        setNewProject({ title: "", description: "", githubLink: "", liveLink: "" });
        saveProjects(updatedProjects);
    };

    const handleRemoveProject = (index) => {
        const updatedProjects = projects.filter((_, i) => i !== index);
        setProjects(updatedProjects);
        saveProjects(updatedProjects);
    };

    const saveProjects = async (updatedProjects) => {
        const token = localStorage.getItem("token");
        try {
            await clientServer.post("/api/profile/projects", {
                token,
                projects: updatedProjects
            });
        } catch (error) {
            console.error("Error saving projects:", error);
        }
    };

    return (
        <UserLayout>
            <DashboardLayout>
                <div className={styles.container}>
                    <h1 className={styles.pageTitle}>Edit Profile</h1>

                    {/* Success/Error Message */}
                    {message && (
                        <div className={styles.message}>
                            {message}
                        </div>
                    )}

                    {/* ===== PROFILE PICTURE UPLOAD ===== */}
                    <div className={styles.section}>
                        <h3>📷 Profile Picture</h3>

                        {/* Circular avatar preview */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
                            <img
                                src={
                                    profilePicPreview ||
                                    (currentProfilePic && currentProfilePic.startsWith("http")
                                        ? currentProfilePic
                                        : "/default-avatar.png")
                                }
                                alt="Profile Preview"
                                style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '3px solid var(--accent)',
                                    background: 'var(--bg-secondary)'
                                }}
                                onError={(e) => { e.target.src = "/default-avatar.png"; }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {/* Hidden file input — triggered by the label button */}
                                <input
                                    id="profilePicInput"
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleProfilePicChange}
                                />
                                <label
                                    htmlFor="profilePicInput"
                                    className={styles.miniSaveButton}
                                    style={{ cursor: 'pointer', display: 'inline-block', textAlign: 'center' }}
                                >
                                    {profilePicFile ? "Change Image" : "Select Image"}
                                </label>
                                {profilePicFile && (
                                    <button
                                        className={styles.saveButton}
                                        onClick={handleUploadProfilePicture}
                                        disabled={profilePicLoading}
                                        style={{ padding: '8px 16px' }}
                                    >
                                        {profilePicLoading ? "Uploading..." : "Upload"}
                                    </button>
                                )}
                            </div>
                        </div>

                        {profilePicMessage && (
                            <div
                                className={
                                    profilePicMessage.startsWith("✅")
                                        ? styles.message
                                        : styles.errorMessage
                                }
                            >
                                {profilePicMessage}
                            </div>
                        )}
                        <p style={{ fontSize: '0.82em', opacity: 0.6, marginTop: '6px' }}>
                            Accepted formats: JPG, PNG, JPEG · Max size: 5MB
                        </p>
                    </div>

                    {/* Header Background Selector */}
                    <div className={styles.section}>
                        <h3>🎨 Profile Header</h3>
                        <div className={styles.themeSelector}>
                            <button
                                className={`${styles.themeOption} ${headerBackground.type === 'gradient' ? styles.active : ''}`}
                                onClick={() => handleUpdateHeaderBackground({ type: 'gradient', value: 'linear-gradient(135deg, #c4a574 0%, #d4b888 50%, #e8c99b 100%)' })}
                            >
                                Default Gradient
                            </button>
                            <button
                                className={`${styles.themeOption} ${headerBackground.type === 'solid' ? styles.active : ''}`}
                                onClick={() => handleUpdateHeaderBackground({ type: 'solid', value: '#302a22' })}
                            >
                                Dark Solid
                            </button>
                        </div>
                    </div>

                    {/* Theme Selector */}
                    <div className={styles.section}>
                        <h3>🌈 Profile Theme</h3>
                        <div className={styles.themeSelector}>
                            {['sand', 'coffee', 'forest', 'dark'].map((theme) => (
                                <button
                                    key={theme}
                                    className={`${styles.themeOption} ${profileTheme === theme ? styles.active : ''}`}
                                    onClick={() => handleUpdateTheme(theme)}
                                >
                                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Career Mood Status */}
                    <div className={styles.section}>
                        <h3>✨ Career Status</h3>
                        <div className={styles.row}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="e.g. Open to Internships"
                                value={careerStatus}
                                onChange={(e) => setCareerStatus(e.target.value)}
                            />
                            <button className={styles.miniSaveButton} onClick={handleUpdateCareerStatus}>Update</button>
                        </div>
                    </div>

                    {/* Weekly Goals */}
                    <div className={styles.section}>
                        <h3>🎯 Weekly Goals (Max 3)</h3>
                        <div className={styles.skillsContainer}>
                            {weeklyGoals.map((goal, index) => (
                                <div key={index} className={styles.goalTag}>
                                    {goal}
                                    <button
                                        className={styles.removeSkill}
                                        onClick={() => handleRemoveGoal(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        {weeklyGoals.length < 3 && (
                            <div className={styles.addSkillRow}>
                                <input
                                    type="text"
                                    className={styles.input}
                                    placeholder="Add a weekly goal"
                                    value={newGoal}
                                    onChange={(e) => setNewGoal(e.target.value)}
                                    onKeyPress={(e) => e.key === "Enter" && handleAddGoal()}
                                />
                                <button className={styles.addButton} onClick={handleAddGoal}>
                                    Add
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Bio Section */}
                    <div className={styles.section}>
                        <h3>About Me</h3>
                        <textarea
                            className={styles.textarea}
                            placeholder="Write a short bio about yourself (max 300 chars)"
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 300))}
                            rows={4}
                        />
                        <span className={styles.charCount}>{bio.length}/300</span>
                    </div>

                    {/* Current Position */}
                    <div className={styles.section}>
                        <h3>Current Position</h3>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Full Stack Developer at XYZ"
                            value={currentPost}
                            onChange={(e) => setCurrentPost(e.target.value)}
                        />
                    </div>

                    {/* Learning Section */}
                    <div className={styles.section}>
                        <h3>📚 What I'm Learning</h3>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="e.g. Learning Data Structures & Algorithms"
                            value={learning}
                            onChange={(e) => setLearning(e.target.value.slice(0, 300))}
                        />
                    </div>

                    <button
                        className={styles.saveButton}
                        onClick={handleUpdateProfile}
                        disabled={isLoading}
                    >
                        {isLoading ? "Saving..." : "Save Profile Info"}
                    </button>

                    {/* Skills Section */}
                    <div className={styles.section}>
                        <h3>🛠 Skills</h3>
                        <div className={styles.skillsContainer}>
                            {skills.map((skill, index) => (
                                <div key={index} className={styles.skillTag}>
                                    {skill}
                                    <button
                                        className={styles.removeSkill}
                                        onClick={() => handleRemoveSkill(skill)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.addSkillRow}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Add a skill (e.g. React, Python)"
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyPress={(e) => e.key === "Enter" && handleAddSkill()}
                            />
                            <button className={styles.addButton} onClick={handleAddSkill}>
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Multiple Projects Section */}
                    <div className={styles.section}>
                        <h3>📂 Projects</h3>
                        <div className={styles.skillsContainer} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                            {projects.map((proj, index) => (
                                <div key={index} className={styles.goalTag} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                        <strong>{proj.title}</strong>
                                        <button
                                            className={styles.removeSkill}
                                            onClick={() => handleRemoveProject(index)}
                                            style={{ color: 'var(--error)' }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                    <p style={{ fontSize: '0.9em', margin: 0, opacity: 0.8 }}>{proj.description}</p>
                                    <div style={{ display: 'flex', gap: '10px', fontSize: '0.85em' }}>
                                        {proj.githubLink && <a href={proj.githubLink} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>GitHub</a>}
                                        {proj.liveLink && <a href={ensureHttps(proj.liveLink)} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>Live Link</a>}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.addSkillRow} style={{ flexDirection: 'column' }}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="Project Title"
                                value={newProject.title}
                                onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                            />
                            <textarea
                                className={styles.textarea}
                                placeholder="Project Description"
                                value={newProject.description}
                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                rows={2}
                            />
                            <div className={styles.row}>
                                <input
                                    type="url"
                                    className={styles.input}
                                    placeholder="GitHub URL"
                                    value={newProject.githubLink}
                                    onChange={(e) => setNewProject({ ...newProject, githubLink: e.target.value })}
                                />
                                <input
                                    type="url"
                                    className={styles.input}
                                    placeholder="Live Link URL"
                                    value={newProject.liveLink}
                                    onChange={(e) => setNewProject({ ...newProject, liveLink: e.target.value })}
                                />
                            </div>
                            <button className={styles.addButton} onClick={handleAddProject} style={{ marginTop: '8px' }}>
                                Add Project
                            </button>
                        </div>
                    </div>

                    {/* Featured Project Section */}
                    <div className={styles.section}>
                        <h3>🚀 Featured Project (Legacy)</h3>
                        <input
                            type="text"
                            className={styles.input}
                            placeholder="Project Title"
                            value={featuredProject.title}
                            onChange={(e) =>
                                setFeaturedProject({ ...featuredProject, title: e.target.value })
                            }
                        />
                        <textarea
                            className={styles.textarea}
                            placeholder="Project Description"
                            value={featuredProject.description}
                            onChange={(e) =>
                                setFeaturedProject({ ...featuredProject, description: e.target.value })
                            }
                            rows={3}
                        />
                        <input
                            type="url"
                            className={styles.input}
                            placeholder="GitHub Link (https://github.com/...)"
                            value={featuredProject.githubLink}
                            onChange={(e) =>
                                setFeaturedProject({ ...featuredProject, githubLink: e.target.value })
                            }
                        />
                        <button
                            className={styles.saveButton}
                            onClick={handleUpdateFeaturedProject}
                            disabled={isLoading}
                        >
                            Save Featured Project
                        </button>
                    </div>

                    {/* LeetCode Username Section */}
                    <div className={styles.section}>
                        <h3>💻 LeetCode Profile</h3>
                        <p style={{ marginBottom: '12px', opacity: 0.8, fontSize: '0.9em' }}>
                            Enter your LeetCode username to display coding stats and streak.
                        </p>
                        <div className={styles.row}>
                            <input
                                type="text"
                                className={styles.input}
                                placeholder="LeetCode username"
                                value={leetcodeUsername}
                                onChange={(e) => setLeetcodeUsername(e.target.value)}
                            />
                            <button className={styles.miniSaveButton} onClick={handleUpdateProfile}>
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        </UserLayout>
    );
}
