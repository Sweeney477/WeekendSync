/**
 * User-facing error messages for join and create flows.
 * Centralizes copy so it stays consistent with journey/error docs.
 */

export function getFriendlyJoinError(message: string): string {
  if (
    message === "invalid_invite_code" ||
    message === "Invalid invite code"
  ) {
    return "That invite code isn’t valid. Check the link or ask your friend for a new one.";
  }
  if (message.includes("Too many attempts")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  return message || "We couldn’t add you to the trip. Check the code and try again.";
}

export function getFriendlyCreateError(message: string): string {
  if (
    message.includes("Complete onboarding") ||
    message.includes("onboarding")
  ) {
    return "Add your name first so your group recognizes you.";
  }
  return (
    message || "We couldn’t create the trip. Check your connection and try again."
  );
}

export function getFriendlyProfileError(message: string): string {
  if (message.includes("display_name") || message.includes("display name")) {
    return "Please enter a name.";
  }
  return message || "We couldn’t save your profile. Check your connection and try again.";
}

/**
 * Maps common API or network error phrases to user-friendly copy.
 * Use for generic save/load failures where no specific handler exists.
 */
export function getFriendlyGenericError(message: string, context: "save" | "load" = "save"): string {
  const fallback = context === "save"
    ? "We couldn’t save. Please try again."
    : "We couldn’t load. Please try again.";
  if (!message || message.startsWith("Failed") || message.includes("fetch")) {
    return fallback;
  }
  return message;
}
