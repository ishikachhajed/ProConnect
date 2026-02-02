import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from "path";
import PDFDocument from 'pdfkit';
import ConnectionRequest from "../models/connections.model.js";
import Profile from '../models/profile.model.js';
import User from '../models/user.model.js';




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

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
  name,
  username,
  email,
  password: hashedPassword,
  profilePicture: "/upload/default.png"   // ✅ correct
});


    // ✅ save user
    await newUser.save();

    // ✅ CREATE PROFILE ALSO
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
    return res.status(500).json({ message: error.message });
  }
};



/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.json({ token });

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
      .populate("userId", "name username email profilePicture");

    return res.json({ profiles });

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

    const { connectionId } = req.body;

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
    } else {
      connectionRequest.status_accepted = false;
    }

    await connectionRequest.save();

    return res.json({ message: "Connection Request Updated Successfully" });

  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
};


export const getAllPosts = async (req,res) => {
  try {
    const posts = await Post.find()
    .populate("userId", "name username email profilePicture");

    return res.json({posts});

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

export const getUserProfileAndUserBasedOnUsername = async(req,res)=>{
  const{username} = req.query;
  try{
    const user = await User.findOne({
      username
    });
    if(!user){
      return res.status(404).json({message:"User Not Found"})
    }
    const userProfile = await Profile.findOne({userId:user._id})
    .populate('userId','name username email profilePicture');
    return res.json({"profile":userProfile})
  } catch(err){
    return res.status(500).json({message:err.message})
  }
}
