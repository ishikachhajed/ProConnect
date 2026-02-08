import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    school: {
        type: String,
        required: true,
    },
    degree: {
        type: String,
        required: true,
    },
    fieldOfStudy: {
        type: String,
        required: true,
    },
});

const workSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
    },
    position: {
        type: String,
        required: true,
    },
    years: {
        type: String,
        required: true,
    },
});

// Featured project schema (GitHub only)
const featuredProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    githubLink: {
        type: String,
        default: '',
    },
});

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Bio about the user (max 300 chars recommended)
    bio: {
        type: String,
        default: '',
        maxlength: 300,
    },
    // Current position/role
    currentPost: {
        type: String,
        default: '',
    },
    // What user is currently learning
    learning: {
        type: String,
        default: '',
        maxlength: 300,
    },
    // Career mood status (e.g., "Open to internships")
    careerStatus: {
        type: String,
        default: '',
        maxlength: 100,
    },
    // Weekly goals (up to 3)
    weeklyGoals: {
        type: [String],
        default: [],
        validate: {
            validator: function (arr) {
                return arr.length <= 3;
            },
            message: 'Maximum 3 weekly goals allowed'
        }
    },
    // Profile theme selection
    profileTheme: {
        type: String,
        enum: ['sand', 'coffee', 'forest', 'dark'],
        default: 'sand',
    },
    // Header background customization
    headerBackground: {
        type: {
            type: String,
            enum: ['gradient', 'solid', 'image'],
            default: 'gradient',
        },
        value: {
            type: String,
            default: 'linear-gradient(135deg, #c4a574 0%, #d4b888 50%, #e8c99b 100%)',
        }
    },
    // Skills array for badges
    skills: {
        type: [String],
        default: [],
    },
    // LeetCode username for stats integration
    leetcodeUsername: {
        type: String,
        default: '',
        trim: true,
    },
    // Projects array
    projects: {
        type: [{
            title: String,
            description: String,
            githubLink: String,
            liveLink: String,
        }],
        default: [],
    },
    // Featured project (Keeping for backward compatibility, but UI will prefer projects)
    featuredProject: {
        type: featuredProjectSchema,
        default: () => ({}),
    },
    // Work history
    pastWork: {
        type: [workSchema],
        default: [],
    },
    // Education history
    education: {
        type: [educationSchema],
        default: [],
    }
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;