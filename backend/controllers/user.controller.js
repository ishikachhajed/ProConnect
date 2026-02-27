import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from "path";
import PDFDocument from 'pdfkit';
import ConnectionRequest from "../models/connections.model.js";
import Profile from '../models/profile.model.js';
import User from '../models/user.model.js';
import { generateToken } from '../middlewares/auth.middleware.js';
import { createNotification } from './notification.controller.js';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;




const getUserFromToken = async (req) => {
  const token = req.query.token;
  if (!token) return null;
  const user = await User.findOne({ token });
  return user;
};




/* ================= REGISTER ================= */


const convertUserDataToPDF = (profile) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();

      const fileName =
        crypto.randomBytes(16).toString("hex") + "_profile.pdf";

      const pdfPath = path.join("upload", fileName);
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      // 🖼 IMAGE
      let imagePath;

      if (profile.userId.profilePicture) {
        imagePath = path.join(
          "upload",
          path.basename(profile.userId.profilePicture)
        );
      } else {
        imagePath = path.join("upload", "default.png");
      }

      if (fs.existsSync(imagePath)) {
        doc.image(imagePath, { width: 120, align: "center" });
        doc.moveDown();
      }

      // 📝 TEXT
      doc.fontSize(18).text(`Name: ${profile.userId.name}`);
      doc.fontSize(14).text(`Username: ${profile.userId.username}`);
      doc.fontSize(14).text(`Email: ${profile.userId.email}`);
      doc.moveDown();

      doc.text(`Bio: ${profile.bio || "N/A"}`);
      doc.text(`Current Post: ${profile.currentPost || "N/A"}`);
      doc.moveDown();

      doc.text("Past Work:");
      profile.pastWork.forEach((work) => {
        doc.text(`Company: ${work.company}`);
        doc.text(`Position: ${work.position}`);
        doc.text(`Years: ${work.years}`);
        doc.moveDown();
      });

      doc.end();

      // ✅ WAIT UNTIL FILE IS ACTUALLY WRITTEN
      stream.on("finish", () => resolve(fileName));
      stream.on("error", reject);

    } catch (err) {
      reject(err);
    }
  });
};




// export const register = async (req, res) => {
//   try {
//     console.log("REGISTER BODY:", req.body);
//     const { name, username, email, password } = req.body;

//     if (!name || !username || !email || !password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const newUser = new User({
//       name,
//       username,
//       email,
//       password: hashedPassword,
//     });
//     console.log(newUser);

//     // await newUser.save();

//     // const profile = new Profile({
//     //   userId: newUser._id,
//     // });
//     // await profile.save();

//     return res.status(201).json({ message: "User registered successfully" });

//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

export const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    // Validate required fields
    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validate password length
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
      });
    }

    // Check for existing user (including soft-deleted)
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      // Check if account is soft-deleted
      if (existingUser.isDeleted) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        if (existingUser.deletedAt > thirtyDaysAgo) {
          // Account is in recovery period
          if (existingUser.email === email) {
            return res.status(409).json({
              message: "This email is associated with a deleted account. Please log in to recover it, or wait 30 days to register again."
            });
          }
          if (existingUser.username === username) {
            return res.status(409).json({
              message: "This username is associated with a deleted account. Please choose a different username or log in to recover your account."
            });
          }
        }
      } else {
        // Active account
        if (existingUser.email === email) {
          return res.status(409).json({ message: "Email already registered" });
        }
        return res.status(409).json({ message: "Username already taken" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      profilePicture: "/upload/default.png"
    });

    await newUser.save();

    // Create profile
    const profile = new Profile({
      userId: newUser._id,
      bio: "",
      currentPost: "",
      pastWork: []
    });

    await profile.save();

    return res.status(201).json({ message: "User registered successfully, please Login" });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Email/username and password are required" });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email }, { username: email }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if account is soft-deleted
    if (user.isDeleted) {
      // Check if within 30-day recovery period
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      if (user.deletedAt < thirtyDaysAgo) {
        // Account permanently deleted (recovery period expired)
        return res.status(403).json({
          message: "This account has been permanently deleted and cannot be recovered"
        });
      }

      // Account can be recovered - verify password first
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Recover the account automatically
      user.isDeleted = false;
      user.deletedAt = null;
      const token = generateToken(user._id);
      user.token = token;
      await user.save();

      console.log(`♻️ Account recovered during login: ${user.username}`);

      return res.json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture
        },
        recovered: true,
        message: "Welcome back! Your account has been recovered successfully."
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Also store in DB for backward compatibility
    user.token = token;
    await user.save();

    return res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= UPLOAD PROFILE PICTURE (CLOUDINARY) ================= */
export const uploadProfilePicture = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Image file missing" });
    }

    // Cloudinary URL
    user.profilePicture = `/upload/${req.file.filename}`;

    await user.save();

    return res.json({
      message: "Profile picture uploaded successfully",
      imageUrl: req.file.path,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Upload failed" });
  }
};

/* ================= UPDATE USER PROFILE ================= */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Invalid or missing token" });

    const { username, email, ...rest } = req.body;

    if (username || email) {
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser && existingUser._id.toString() !== user._id.toString()) {
        return res.status(409).json({ message: "Username or email already in use" });
      }
    }

    Object.assign(user, { username, email, ...rest });
    await user.save();

    return res.json({ message: "Profile updated", user });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

/* ================= GET USER PROFILE ================= */
export const getUserProfile = async (req, res) => {
  try {
    const { token, id } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // 🔹 authenticate user using token
    const authUser = await User.findOne({ token });
    if (!authUser) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // 🔹 decide whose profile to fetch
    const userIdToFind = id ? id : authUser._id;

    const profile = await Profile.findOne({ userId: userIdToFind })
      .populate("userId", "name username email profilePicture");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    return res.json({ profile });

  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};



/* ================= UPDATE PROFILE DATA ================= */
export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const profile = await Profile.findOne({ userId: user._id });
    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    Object.assign(profile, newProfileData);
    await profile.save();

    return res.json({
      message: "Profile updated successfully",
      profile
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find()
      .populate({
        path: "userId",
        select: "name username email profilePicture",
        match: { isDeleted: false }  // Exclude soft-deleted users
      });

    // Filter out profiles where userId was not populated (deleted users)
    const activeProfiles = profiles.filter(profile => profile.userId);

    return res.json({ profiles: activeProfiles });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const downloadProfile = async (req, res) => {
  try {
    const userId = req.query.id;

    const profile = await Profile.findOne({ userId })
      .populate("userId", "name username email profilePicture");

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const pdfFile = await convertUserDataToPDF(profile);

    res.download(path.join("upload", pdfFile));


  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendConnectionRequest = async (req, res) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const { connectionId } = req.query;

    const connectionUser = await User.findById(connectionId);
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    if (existingRequest) {
      return res.status(409).json({ message: "Request already sent" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    await request.save();

    // Create notification for connection request
    console.log(`Creating notification for connection request: Sender ${user._id} Receiver ${connectionUser._id}`);
    const notification = await createNotification({
      type: "connection_request",
      senderId: user._id,
      receiverId: connectionUser._id,
      message: `${user.name} sent you a connection request`,
    });
    console.log("Notification created:", notification ? "SUCCESS" : "FAILED (null)");

    return res.json({ message: "Connection request sent" });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};



export const getMyConnectionsRequests = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const connections = await ConnectionRequest.find({ connectionId: user._id })
      .populate("userId", "name username email profilePicture");

    return res.json({ connections });

  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connections = await ConnectionRequest.find({
      userId: user._id,
      status_accepted: true
    }).populate("connectionId", "name username email profilePicture");

    return res.json({ connections });

  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const acceptConnectionRequest = async (req, res) => {
  const { token, requestId, action_type } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    const connectionRequest = await ConnectionRequest.findById(requestId);
    if (!connectionRequest) {
      return res.status(404).json({ message: "Connection Request Not Found" });
    }

    if (action_type === "accept") {
      connectionRequest.status_accepted = true;

      // Create notification for accepted connection
      await createNotification({
        type: "connection_accept",
        senderId: user._id,
        receiverId: connectionRequest.userId,
        message: `${user.name} accepted your connection request`,
      });
    } else {
      connectionRequest.status_accepted = false;
    }

    await connectionRequest.save();

    return res.json({ message: "Connection Request Updated Successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name username email profilePicture");

    return res.json({ posts });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const commentPost = async (req, res) => {
  try {
    const { token, postId, commentBody } = req.body;

    if (!token || !postId || !commentBody) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "Invalid token" });
    }

    const post = await Post.findOne({ _id: postId });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = new Comment({
      userId: user._id,
      postId: postId,
      comment: commentBody
    });

    await comment.save();

    return res.status(200).json({ message: "Comment added successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export const getUserProfileAndUserBasedOnUsername = async (req, res) => {
  const { username } = req.query;
  try {
    const user = await User.findOne({
      username
    });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" })
    }
    const userProfile = await Profile.findOne({ userId: user._id })
      .populate('userId', 'name username email profilePicture');
    return res.json({ "profile": userProfile })
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

export const changePassword = async (req, res) => {
  try {
    const { token, oldPassword, newPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // Verify token & get user
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "Invalid or expired session" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    return res.json({ message: "Password changed successfully" });

  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Search Users and Profiles (Aggregation)
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }

    const searchRegex = new RegExp(query, 'i');

    const results = await User.aggregate([
      {
        $lookup: {
          from: "profiles",
          localField: "_id",
          foreignField: "userId",
          as: "profile"
        }
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          $or: [
            { name: searchRegex },
            { username: searchRegex },
            { "profile.skills": searchRegex },
            { "profile.currentPost": searchRegex }
          ]
        }
      },
      {
        $project: {
          password: 0,
          token: 0,
          "profile.__v": 0,
          "profile.userId": 0
        }
      }
    ]);

    return res.json({ results });

  } catch (error) {
    console.error("SEARCH ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Account (with password verification)
export const deleteAccount = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token and password are required" });
    }

    // Verify token and get user
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid session" });
    }

    // Verify password for security
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Import models dynamically if not already imported
    const Post = (await import('../models/post.model.js')).default;
    const Notification = (await import('../models/notification.model.js')).default;

    // Delete all user-related data
    await Profile.deleteOne({ userId: user._id });
    await Post.deleteMany({ userId: user._id });
    await ConnectionRequest.deleteMany({
      $or: [{ userId: user._id }, { connectionId: user._id }]
    });
    await Notification.deleteMany({
      $or: [{ sender: user._id }, { receiver: user._id }]
    });
    await User.deleteOne({ _id: user._id });

    console.log(`✅ Account deleted: ${user.username}`);
    return res.json({ message: "Account deleted successfully" });

  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return res.status(500).json({ message: "Error deleting account" });
  }
};

// ================= SOFT DELETE ACCOUNT =================
export const softDeleteAccount = async (req, res) => {
  try {
    const { token, username } = req.body;

    // Validate inputs
    if (!token || !username) {
      return res.status(400).json({ message: "Token and username required" });
    }

    // Find user by token
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ message: "Unauthorized - Invalid session" });
    }

    console.log("DEBUG - User found:", user.username);
    console.log("DEBUG - Username from request:", username);
    console.log("DEBUG - Match check:", user.username === username);

    // Confirm username matches
    if (user.username !== username) {
      return res.status(400).json({ message: "Username confirmation does not match" });
    }

    console.log("DEBUG - About to soft delete user:", user.username);
    console.log("DEBUG - Current isDeleted value:", user.isDeleted);

    // Soft delete: mark as deleted instead of removing
    user.isDeleted = true;
    user.deletedAt = new Date();

    console.log("DEBUG - Before save - isDeleted:", user.isDeleted, "deletedAt:", user.deletedAt);
    await user.save();
    console.log("DEBUG - After save successful");

    console.log(`🗑️ Account soft-deleted: ${user.username}`);

    return res.json({
      message: "Account deleted successfully",
      recoveryDeadline: new Date(user.deletedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
    });

  } catch (error) {
    console.error("SOFT DELETE ERROR:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
    return res.status(500).json({ message: "Error deleting account", error: error.message });
  }
};

// ================= RECOVER ACCOUNT =================
export const recoverAccount = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Account not found" });
    }

    // Check if account is deleted
    if (!user.isDeleted) {
      return res.status(400).json({ message: "Account is not deleted" });
    }

    // Check if within 30-day recovery period
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (user.deletedAt < thirtyDaysAgo) {
      return res.status(400).json({
        message: "Recovery period expired. Account cannot be restored"
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    // Restore account
    user.isDeleted = false;
    user.deletedAt = null;

    // Generate new token
    const newToken = generateToken();
    user.token = newToken;
    await user.save();

    console.log(`♻️ Account recovered: ${user.username}`);

    return res.json({
      message: "Account recovered successfully",
      token: newToken,
      user: {
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (error) {
    console.error("RECOVER ACCOUNT ERROR:", error);
    return res.status(500).json({ message: "Error recovering account" });
  }
};

