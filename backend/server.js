import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import postRoutes from './routes/posts.routes.js';
import userRoutes from './routes/user.routes.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://pro-connect-topaz.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.options("*", cors()); // handle preflight requests

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
