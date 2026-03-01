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

import upload from "../middlewares/upload.js";
import {
  validateRequest,
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
} from "../middlewares/validation.middleware.js";

const router = Router();
console.log("✅ user.routes.js LOADED");

router.post("/register", upload.single("profile_picture"), registerValidation, validateRequest, register);
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
