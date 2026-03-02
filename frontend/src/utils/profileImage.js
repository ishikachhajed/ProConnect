import { BASE_URL } from "@/config";

export function getProfileImageUrl(profilePicture) {
    // Handle null / undefined / empty
    if (
        !profilePicture ||
        profilePicture === "undefined" ||
        profilePicture === "null" ||
        profilePicture.trim() === ""
    ) {
        return "/default-avatar.png";
    }

    // Cloudinary or any full external URL
    if (profilePicture.startsWith("http")) {
        return profilePicture;
    }

    // Backend uploaded images
    if (profilePicture.startsWith("/upload")) {
        return `${BASE_URL}${profilePicture}`;
    }

    // Frontend public images (like default-avatar.png)
    return profilePicture;
}