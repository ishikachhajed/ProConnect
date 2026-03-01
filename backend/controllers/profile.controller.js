import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";

// Update profile (bio, learning, skills, featuredProject)
export const updateProfile = async (req, res) => {
    try {
        const { token, bio, learning, leetcodeUsername, leetcodeVisibility, currentPost } = req.body;

        // Get user from token
        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Find or create profile
        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        // Update fields if provided
        if (bio !== undefined) profile.bio = bio;
        if (learning !== undefined) profile.learning = learning;
        if (leetcodeUsername !== undefined) profile.leetcodeUsername = leetcodeUsername;
        if (leetcodeVisibility !== undefined) profile.leetcodeVisibility = leetcodeVisibility;
        if (currentPost !== undefined) profile.currentPost = currentPost;

        await profile.save();

        return res.status(200).json({
            message: "Profile updated successfully",
            profile,
        });
    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error.message);
        return res.status(500).json({ message: "Error updating profile" });
    }
};

// Add a skill
export const addSkill = async (req, res) => {
    try {
        const { token, skill } = req.body;

        if (!skill || skill.trim() === '') {
            return res.status(400).json({ message: "Skill is required" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id, skills: [] });
        }

        // Check if skill already exists
        if (profile.skills.includes(skill.trim())) {
            return res.status(400).json({ message: "Skill already exists" });
        }

        // Add skill
        profile.skills.push(skill.trim());
        await profile.save();

        return res.status(200).json({
            message: "Skill added",
            skills: profile.skills,
        });
    } catch (error) {
        console.error("ADD SKILL ERROR:", error.message);
        return res.status(500).json({ message: "Error adding skill" });
    }
};

// Remove a skill
export const removeSkill = async (req, res) => {
    try {
        const { token, skill } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        // Remove skill
        profile.skills = profile.skills.filter(s => s !== skill);
        await profile.save();

        return res.status(200).json({
            message: "Skill removed",
            skills: profile.skills,
        });
    } catch (error) {
        console.error("REMOVE SKILL ERROR:", error.message);
        return res.status(500).json({ message: "Error removing skill" });
    }
};

// Update featured project
export const updateFeaturedProject = async (req, res) => {
    try {
        const { token, title, description, githubLink, leetcodeLink } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        // Update featured project
        profile.featuredProject = {
            title: title || '',
            description: description || '',
            githubLink: githubLink || '',
            leetcodeLink: leetcodeLink || '',
        };

        await profile.save();

        return res.status(200).json({
            message: "Featured project updated",
            featuredProject: profile.featuredProject,
        });
    } catch (error) {
        console.error("UPDATE FEATURED PROJECT ERROR:", error.message);
        return res.status(500).json({ message: "Error updating featured project" });
    }
};

// Get full profile by username
export const getProfileByUsername = async (req, res) => {
    try {
        const { username } = req.query;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const profile = await Profile.findOne({ userId: user._id }).populate('userId', 'name username email profilePicture');

        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }

        return res.status(200).json({ profile });
    } catch (error) {
        console.error("GET PROFILE ERROR:", error.message);
        return res.status(500).json({ message: "Error fetching profile" });
    }
};

// Update career status
export const updateCareerStatus = async (req, res) => {
    try {
        const { token, careerStatus } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        profile.careerStatus = careerStatus || '';
        await profile.save();

        return res.status(200).json({
            message: "Career status updated",
            careerStatus: profile.careerStatus,
        });
    } catch (error) {
        console.error("UPDATE CAREER STATUS ERROR:", error.message);
        return res.status(500).json({ message: "Error updating career status" });
    }
};

// Update weekly goals (max 3)
export const updateWeeklyGoals = async (req, res) => {
    try {
        const { token, weeklyGoals } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Validate max 3 goals
        if (weeklyGoals && weeklyGoals.length > 3) {
            return res.status(400).json({ message: "Maximum 3 weekly goals allowed" });
        }

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        profile.weeklyGoals = weeklyGoals || [];
        await profile.save();

        return res.status(200).json({
            message: "Weekly goals updated",
            weeklyGoals: profile.weeklyGoals,
        });
    } catch (error) {
        console.error("UPDATE WEEKLY GOALS ERROR:", error.message);
        return res.status(500).json({ message: "Error updating weekly goals" });
    }
};

// Update profile theme
export const updateTheme = async (req, res) => {
    try {
        const { token, theme } = req.body;

        const validThemes = ['sand', 'coffee', 'forest', 'dark'];
        if (!validThemes.includes(theme)) {
            return res.status(400).json({ message: "Invalid theme" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        profile.profileTheme = theme;
        await profile.save();

        return res.status(200).json({
            message: "Theme updated",
            profileTheme: profile.profileTheme,
        });
    } catch (error) {
        console.error("UPDATE THEME ERROR:", error.message);
        return res.status(500).json({ message: "Error updating theme" });
    }
};

// Update header background
export const updateHeaderBackground = async (req, res) => {
    try {
        const { token, type, value } = req.body;

        const validTypes = ['gradient', 'solid', 'image'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid background type" });
        }

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        profile.headerBackground = { type, value };
        await profile.save();

        return res.status(200).json({
            message: "Header background updated",
            headerBackground: profile.headerBackground,
        });
    } catch (error) {
        console.error("UPDATE HEADER BG ERROR:", error.message);
        return res.status(500).json({ message: "Error updating header background" });
    }
};

// Update projects (array)
export const updateProjects = async (req, res) => {
    try {
        const { token, projects } = req.body;

        const user = await User.findOne({ token });
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        let profile = await Profile.findOne({ userId: user._id });
        if (!profile) {
            profile = new Profile({ userId: user._id });
        }

        // Update projects
        profile.projects = projects || [];
        await profile.save();

        return res.status(200).json({
            message: "Projects updated",
            projects: profile.projects,
        });
    } catch (error) {
        console.error("UPDATE PROJECTS ERROR:", error.message);
        return res.status(500).json({ message: "Error updating projects" });
    }
};
