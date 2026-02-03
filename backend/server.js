import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

// app.use(cors({
//   origin: [
//     "http://localhost:3000",
//     "https://pro-connect-topaz.vercel.app",
//     "https://pro-connect-git-main-ishika-chhajeds-projects.vercel.app",
//     "https://pro-connect-97gsaugjt-ishika-chhajeds-projects.vercel.app"
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   credentials: true
// }));

// Configure CORS using environment variable(s).
// Set FRONTEND_URL or FRONTEND_URLS (comma-separated) in Render env.
const rawOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "";
const allowedOrigins = rawOrigins.split(",").map(s => s.trim()).filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser requests like curl (no origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.length === 0) return callback(null, true); // allow all if none configured
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('CORS policy: Origin not allowed'), false);
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight requests

app.use(express.json());

// ✅ expose upload folder
app.use("/upload", express.static("upload"));

app.get("/", (req, res) => {
  res.send("Backend is working ");
});

app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully 🚀");

    const PORT = process.env.PORT || 9090;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.log("❌ MongoDB connection failed\n", error);
  }
};

start();
