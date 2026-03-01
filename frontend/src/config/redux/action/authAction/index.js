import { createAsyncThunk } from "@reduxjs/toolkit";
import { clientServer } from "@/config";

/* ---------------- LOGIN ---------------- */



export const loginUser = createAsyncThunk(
  "user/login",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/api/users/login", {
        email: user.email,
        password: user.password,
      });

      // ✅ if token exists, save it
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        console.log("SAVED TOKEN:", response.data.token);

        return response.data; // success
      } else {
        return thunkAPI.rejectWithValue("Token not provided by server");
      }

    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Login failed"
      );
    }
  }
);


/* ---------------- REGISTER ---------------- */
export const registerUser = createAsyncThunk(
  "user/register",
  async (user, thunkAPI) => {
    try {
      let response;

      if (user.profilePicture) {
        // Send as multipart/form-data so the image file reaches multer
        const formData = new FormData();
        formData.append("name", user.name);
        formData.append("username", user.username);
        formData.append("email", user.email);
        formData.append("password", user.password);
        formData.append("profile_picture", user.profilePicture);

        response = await clientServer.post("/api/users/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        // No image — send as plain JSON
        response = await clientServer.post("/api/users/register", {
          name: user.name,
          username: user.username,
          email: user.email,
          password: user.password,
        });
      }

      if (response.data?.message) {
        return response.data.message;
      }

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Registration failed"
      );
    }
  }
);
/* ---------------- UPLOAD PROFILE PICTURE ---------------- */
export const uploadProfilePicture = createAsyncThunk(
  "user/uploadProfilePicture",
  async ({ file, token }, thunkAPI) => {
    try {
      const formData = new FormData();
      formData.append("profile_picture", file);
      formData.append("token", token);
      const response = await clientServer.post("/api/users/upload_profile_picture", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data; // { message, imageUrl }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Upload failed"
      );
    }
  }
);

export const getAboutUser = createAsyncThunk(
  "user/getAboutUser",
  async (user, thunkAPI) => {
    try {
      const response = await clientServer.post("/api/users/get_profile", {
        token: user.token,
      });

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, thunkAPI) => {
    try {
      const response = await clientServer.get("/api/users/get_all_users");

      return thunkAPI.fulfillWithValue(response.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
)





export const getMyConnectionsRequests = createAsyncThunk(
  "user/getMyConnectionsRequests",
  async (data, thunkAPI) => {
    try {
      const response = await clientServer.get(
        "/api/users/getMyConnectionsRequests",
        {
          params: { token: data.token },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Failed to fetch connection requests"
      );
    }
  }
);



export const sendConnectionRequest = createAsyncThunk(
    "user/sendConnectionRequest",
    async (data, thunkAPI) => {
        try {
            const response = await clientServer.get(
                "/api/users/send_connection_request",
                {
                    params: {
                        token: data.token,
                        connectionId: data.connectionId,
                    },
                }
            );
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data);
        }
    }
);

export const whatAreMyConnections = createAsyncThunk(
    "user/whatAreMyConnections",
    async (data, thunkAPI) => {
        try {
            const response = await clientServer.get("/api/users/whatAreMyConnections", {
                params: { token: data.token },
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to fetch connections"
            );
        }
    }
);

export const acceptConnectionRequest = createAsyncThunk(
    "user/acceptConnectionRequest",
    async (data, thunkAPI) => {
        try {
            const response = await clientServer.get("/api/users/acceptConnectionRequest", {
                params: {
                    token: data.token,
                    requestId: data.requestId,
                    action_type: data.action_type,
                },
            });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(
                error.response?.data?.message || "Failed to update connection request"
            );
        }
    }
);


