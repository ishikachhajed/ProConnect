import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "../../../index";

export const getAllPosts = createAsyncThunk(
  "post/getAllPosts",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/api/posts/posts");
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Error fetching posts");
    }
  }
);

export const createPost = createAsyncThunk(
  "post/createPost",
  async (formData, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/api/posts",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Upload failed"
      );
    }
  }
);

export const deletePost = createAsyncThunk(
  "post/deletePost",
  async ({ postId }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      await clientServer.post("/api/posts/delete_post", {
        token,
        postId,
      });

      // refresh posts after delete
      thunkAPI.dispatch(getAllPosts());

      return postId;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Delete failed"
      );
    }
  }
)

export const incrementPostLike = createAsyncThunk(
  "post/incrementPostLike",
  async ({ post_id }, thunkAPI) => {
    try {
      const response = await clientServer.post(
        "/api/posts/increment_post_likes",
        { post_id }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Like failed"
      );
    }
  }
)

export const getAllComments = createAsyncThunk(
  "post/getAllComments",
  async (postData, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/api/posts/get_comments",
        {
          params: {
            postId: postData.postId
          }
        }
      );

      return thunkAPI.fulfillWithValue({
        postId: postData.postId,
        comments: response.data.comments
      });
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Get comments failed"
      );
    }
  }
)

export const postComment = createAsyncThunk(
  "post/postComment",
  async ({ post_id, body }, thunkAPI) => {
    try {
      const token = localStorage.getItem("token");

      const response = await clientServer.post(
        "/api/posts/comment",
        {
          token: token,
          postId: post_id,
          commentBody: body,   // ✅ changed from `text` to `commentBody`
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Post comment failed"
      );
    }
  }
);






  

