import { BASE_URL } from "@/config";

/**
 * Returns the correct profile picture URL from a user object.
 * Priority: profilePicture (Cloudinary) > fallback default image
 *
 * Handles:
 * - Cloudinary absolute URLs (https://...) → used as-is
 * - Old local paths (/upload/...) → prepended with BASE_URL
 * - null / empty → '/default-avatar.png'
 *
 * @param {string|null|undefined} profilePicture - the profilePicture field from the user
 * @returns {string} - resolved image URL ready to use in <img src={...}>
 */
export function getProfileImageUrl(profilePicture) {
    if (!profilePicture) return "/default-avatar.png";

    // Absolute URL (Cloudinary or any external URL) — use as-is
    if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
        return profilePicture;
    }

    // Local path (legacy uploads) — prepend backend base URL
    return `${BASE_URL}${profilePicture}`;
}
