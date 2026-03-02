import { BASE_URL } from "@/config";

export function getProfileImageUrl(profilePicture) {
    if (
        !profilePicture ||
        profilePicture === "undefined" ||
        profilePicture === "null" ||
        profilePicture.trim() === ""
    ) {
        return "/default-avatar.png";
    }

    // If database stored old default.png
    if (profilePicture === "default.png") {
        return "/default-avatar.png";
    }

    // Cloudinary URL
    if (profilePicture.startsWith("http")) {
        return profilePicture;
    }

    // Backend uploads
    if (profilePicture.startsWith("/upload")) {
        return `${BASE_URL}${profilePicture}`;
    }

    return profilePicture;
}