import { Router } from "express";
import {
  register,
  login,
  uploadProfilePicture,
  updateUserProfile,
  getUserProfile,
  updateProfileData,
  downloadProfile,
  sendConnectionRequest,
  getMyConnectionsRequests,
  whatAreMyConnections,
  acceptConnectionRequest,
  getAllUserProfile,
  getUserProfileAndUserBasedOnUsername
  

} from "../controllers/user.controller.js";

import multer from "multer";

const router = Router();
console.log("✅ user.routes.js LOADED");


// MULTER SETUP
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// -------- USER ROUTES --------
router.post("/register", register);
router.post("/login", login);
router.post("/update_profile", updateUserProfile);
router.post("/get_profile", getUserProfile);

router.post("/update_profile_data", updateProfileData);

router.get("/get_all_users", getAllUserProfile);

router.get("/download_resume", downloadProfile);
router.get("/send_connection_request", sendConnectionRequest);
router.get("/getMyConnectionsRequests", getMyConnectionsRequests);
router.get("/whatAreMyConnections", whatAreMyConnections);
router.get("/acceptConnectionRequest", acceptConnectionRequest);

router.get("/get_profile_based_on_username", getUserProfileAndUserBasedOnUsername);






// -------- FILE UPLOAD --------
router.post(
  "/upload_profile_picture",
  upload.single("profile_picture"),
  uploadProfilePicture
);

export default router;
