import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  body: {
    type: String,
    required: true,
  },

  likes: {
    type: Number,
    default: 0,
  },

  media: {
    type: String,
    default: "",
  },

  fileType: {
    type: String,
    enum: ["image", "video", "none"],
    default: "none",   // ✅ FIXED (see issue 2)
  },

  active: {
    type: Boolean,
    default: true,
  },

  comments: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],

}, { timestamps: true });

const Post = mongoose.model("Post", postSchema);
export default Post;
