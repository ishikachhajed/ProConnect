import axios from "axios";

// Read API base URL from environment (set on Vercel): NEXT_PUBLIC_API_URL
// Fallback to the previous Render URL if not provided.
export const BASE_URL = "https://proconnect-93x8.onrender.com";

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
