import axios from "axios";

// Read API base URL from environment (set on Vercel): NEXT_PUBLIC_API_URL
// Fallback to the previous Render URL if not provided.
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://proconnect-93x8.onrender.com";

// Log environment at import time to help diagnose deployment issues.
try {
  // eslint-disable-next-line no-console
  console.log("[config] NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL);
  // eslint-disable-next-line no-console
  console.log("[config] BASE_URL:", BASE_URL);
} catch (e) {
  // ignore logging failures
}

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
