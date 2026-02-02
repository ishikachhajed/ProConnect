import mongoose from "mongoose";

const educationSchema = new mongoose.Schema({
    school:{
        type: String,
        required: true,
    },
    degree:{
        type: String,
        required: true,
    },
    fieldOfStudy:{
        type: String,
        required: true,
    },
});

const workSchema = new mongoose.Schema({
    company:{
        type: String,
        required: true,
    },
    position:{
        type: String,
        required: true,
    },
    years:{
        type: String,
        required: true,
    },
});

const profileSchema = new mongoose.Schema({
    userId: { 
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
     },
     bio:{
        type: String,
        default: '',
     },
     currentPost:{
        type: String,
        default: '',
     },
     pastWork:{
        type: [workSchema],
        default: [],
     },
     education:{
        type: [educationSchema],
        default: [],
     }
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;