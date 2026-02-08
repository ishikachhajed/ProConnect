import { Router } from "express";
import {
    updateProfile,
    addSkill,
    removeSkill,
    updateFeaturedProject,
    getProfileByUsername,
    updateCareerStatus,
    updateWeeklyGoals,
    updateTheme,
    updateHeaderBackground,
} from "../controllers/profile.controller.js";

const router = Router();

// Update profile (bio, learning, currentPost)
router.post("/update", updateProfile);

// Skills management
router.post("/skills/add", addSkill);
router.post("/skills/remove", removeSkill);

// Featured project
router.post("/featured-project", updateFeaturedProject);

// Career status
router.post("/career-status", updateCareerStatus);

// Weekly goals
router.post("/weekly-goals", updateWeeklyGoals);

// Profile theme
router.post("/theme", updateTheme);

// Header background
router.post("/header-background", updateHeaderBackground);

// Get profile by username
router.get("/get", getProfileByUsername);


// Monthly/Custom Projects
import { updateProjects } from "../controllers/profile.controller.js";
router.post("/projects", updateProjects);

export default router;
