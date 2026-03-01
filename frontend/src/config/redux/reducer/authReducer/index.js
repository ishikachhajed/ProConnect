
// dispatch(loginUser(data))
//         ↓
// loginUser (createAsyncThunk)
//         ↓
// pending → fulfilled / rejected
//         ↓
// extraReducers update state

import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, getAboutUser, getAllUsers, getMyConnectionsRequests, whatAreMyConnections, sendConnectionRequest, acceptConnectionRequest } from "../../action/authAction";


const initialState = {
    user: undefined,
    token: null,
    isSuccess: false,
    isError: false,
    isLoading: false,
    loggedIn: false,
    message: "",
    isTokenThere: false,
    profileFetched: false,
    connections: [],
    connectionRequests: [],
    allUsers: [],
    all_profiles_fetching: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,

    reducers: {
        reset: () => ({ ...initialState }),

        handleLoginUser: (state) => {
            state.message = "helloooo";
        },
        emptyMessage: (state) => {
            state.message = "";
            state.isError = false;
            state.isSuccess = false;
        },
        setTokenIsThere: (state) => {
            state.isTokenThere = true
        },
        setTokenIsNotThere: (state) => {
            state.isTokenThere = false
        }
    },

    extraReducers: (builder) => {
        builder
            /* ---------------- LOGIN ---------------- */
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;     // ✅ reset old error
                state.isSuccess = false;
                state.message = "knocking the door....";
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;
                state.loggedIn = true;
                state.token = action.payload.token;

                state.message = "Login is successful";
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message =
                    typeof action.payload === "string"
                        ? action.payload
                        : action.payload?.message || "Login failed";
            })

            /* ---------------- REGISTER ---------------- */
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.isError = false;          // ✅ RESET ERROR
                state.isSuccess = false;
                state.message = "Registering youuu...";
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isError = false;
                state.isSuccess = true;

                // ❌ do NOT log in on register
                state.loggedIn = false;
                state.token = null;

                // ✅ show backend message
                state.message = "Registration successful. Please log in.";
            })

            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            .addCase(getAboutUser.fulfilled, (state, action) => {
                state.user = action.payload.profile.userId;   // user info      // full profile
                state.isLoading = false;
                state.profileFetched = true;
                state.isError = false;
            })
            .addCase(getAllUsers.fulfilled, (state, action) => {
                state.allUsers = action.payload.profiles;   // user info      // full profile
                state.isLoading = false;
                state.isError = false;
                state.all_profiles_fetched = true;
                state.all_users = action.payload.users;
            })
            /* ---------------- CONNECTIONS ---------------- */
            .addCase(getMyConnectionsRequests.fulfilled, (state, action) => {
                state.connectionRequests = action.payload.connections;
            })
            .addCase(whatAreMyConnections.fulfilled, (state, action) => {
                state.connections = action.payload.connections;
            })
            .addCase(sendConnectionRequest.fulfilled, (state, action) => {
                state.message = action.payload.message;
            })
            .addCase(acceptConnectionRequest.fulfilled, (state, action) => {
                state.message = action.payload.message;
            });
    },
});

export const { reset, handleLoginUser, emptyMessage , setTokenIsNotThere, setTokenIsThere} = authSlice.actions;
export default authSlice.reducer;





