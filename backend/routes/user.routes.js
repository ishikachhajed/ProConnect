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
  getUserProfileAndUserBasedOnUsername,
  changePassword,
  searchUsers,
  deleteAccount,
  softDeleteAccount,
  recoverAccount,
} from "../controllers/user.controller.js";

import multer from "multer";
import {
  validateRequest,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "../middlewares/validation.middleware.js";

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
router.post("/register", registerValidation, validateRequest, register);
router.post("/login", loginValidation, validateRequest, login);
router.post("/update_profile", updateUserProfile);
router.post("/get_profile", getUserProfile);

router.post("/update_profile_data", updateProfileValidation, validateRequest, updateProfileData);
router.post("/change_password", changePasswordValidation, validateRequest, changePassword);

router.get("/get_all_users", getAllUserProfile);
router.get("/search", searchUsers); // New aggregation route

router.post("/delete_account", deleteAccount); // Old immediate delete (deprecated)
router.post("/soft_delete_account", softDeleteAccount); // Soft delete with 30-day recovery
router.post("/recover_account", recoverAccount); // Recover deleted account

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
