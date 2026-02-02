import User from "../models/user.model.js";
import Post from "../models/posts.model.js";

export const activeCheck = (req, res) => {
  return res.status(200).json({ message: "API is active" });
};

export const createPost = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { token, body } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const user = await User.findOne({ token });

    if (!user) {
      return res.status(404).json({ message: "Invalid token / User not found" });
    }

    const fileType = req.file
      ? req.file.mimetype.startsWith("image")
        ? "image"
        : req.file.mimetype.startsWith("video")
        ? "video"
        : "none"
      : "none";

    const post = new Post({
      userId: user._id,                 // ✅ FIXED
      body: body,                       // ✅ FIXED
      media: req.file ? req.file.filename : "",
      fileType: fileType,
    });

    await post.save();

    return res.status(201).json({
      message: "Post created successfully",
      post
    });

  } catch (error) {
    console.error("CREATE POST ERROR:", error.message);
    return res.status(500).json({ message: error.message });
  }
};




export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("userId", "name username email profilePicture")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    console.error("GET POSTS ERROR:", error.message);
    return res.status(500).json({ message: "Error fetching posts" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { token, postId } = req.body;

    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized to delete this post" });
    }

    await Post.deleteOne({ _id: postId });

    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("DELETE POST ERROR:", error.message);
    return res.status(500).json({ message: "Error deleting post" });
  }
};

export const get_comments_by_post = async (req, res) => {
  const { postId } = req.query;   // ✅ read from query, not body

  try {
    const post = await Post.findById(postId).populate(
      "comments.userId",
      "name username profilePicture"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    return res.status(200).json({
      comments: post.comments,
    });

  } catch (error) {
    console.error("GET COMMENTS ERROR:", error.message);
    return res.status(500).json({ message: "Error fetching comments" });
  }
};


export const delete_comment_of_user = async (req, res) => {
  try {
    const { token, postId, commentId } = req.body;

    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    comment.remove();
    await post.save();

    return res.status(200).json({ message: "Comment deleted successfully" });

  } catch (error) {
    console.error("DELETE COMMENT ERROR:", error.message);
    return res.status(500).json({ message: "Error deleting comment" });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { token, postId, commentBody } = req.body;

    if (!token || !commentBody || !postId) {
      return res.status(400).json({ message: "Token, PostId and commentBody are required" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "Invalid token / User not found" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      userId: user._id,
      text: commentBody   // ✅ map commentBody → text in DB
    });

    await post.save();

    return res.status(201).json({
      message: "Comment added successfully",
      comments: post.comments
    });

  } catch (error) {
    console.error("COMMENT POST ERROR:", error.message);
    return res.status(500).json({ message: "Error adding comment" });
  }
};




export const increment_likes = async (req, res) => {
  const { post_id } = req.body;

  try {
    const post = await Post.findById(post_id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.likes += 1;
    await post.save();

    return res.status(200).json({
      message: "Like incremented",
      likes: post.likes,
    });
  } catch (error) {
    console.error("INCREMENT LIKES ERROR:", error.message);
    return res.status(500).json({ message: "Error incrementing likes" });
  }
};

