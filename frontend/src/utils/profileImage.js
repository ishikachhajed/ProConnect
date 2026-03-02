import { BASE_URL } from "@/config";

export function getProfileImageUrl(profilePicture) {
    // Handle null, undefined, empty, "undefined", "null"
    if (
        !profilePicture ||
        profilePicture === "undefined" ||
        profilePicture === "null" ||
        profilePicture.trim() === ""
    ) {
        return "/default-avatar.png";
    }

    // Absolute URL (Cloudinary)
    if (
        profilePicture.startsWith("http://") ||
        profilePicture.startsWith("https://")
    ) {
        return profilePicture;
    }

    // Local legacy upload path
    return `${BASE_URL}${profilePicture}`;
}