import { createSlice } from "@reduxjs/toolkit";
import { getAllPosts, getAllComments, postComment } from "../../action/postAction";

const initialState = {
  posts: [],
  isError: false,
  isLoading: false,
  postFetched: false,
  loggedIn: false,
  message: "",
  comments: [],
  postId: "",
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    reset: () => initialState,
    resetPostId: (state) => {
      state.postId = "";
      state.comments = [];
    },
    setPostId: (state, action) => {
      state.postId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllPosts.pending, (state) => {
        state.message = "Fetching Posts...";
        state.isLoading = true;
      })
      .addCase(getAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.postFetched = true;
        state.posts = action.payload.posts;
        state.isError = false;
        state.message = "Posts Fetched Successfully";
      })
      .addCase(getAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllComments.fulfilled, (state, action) => {
        state.postId = action.payload.postId;
        state.comments = action.payload.comments;
      })
      .addCase(postComment.fulfilled, (state, action) => {
        state.comments = action.payload.comments; // ✅ update after posting
      });
  },
});

export const { reset, resetPostId, setPostId } = postSlice.actions;
export default postSlice.reducer;
