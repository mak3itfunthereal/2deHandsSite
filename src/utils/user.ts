import type { LocationPreference, UserProfile } from "../types";
import { defaultUser, locations } from "./mockData";

export function userInitials(user: UserProfile) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

export function userFullName(user: UserProfile) {
  return `${user.firstName} ${user.lastName}`.trim();
}

export function loadStoredUser() {
  try {
    const stored = window.localStorage.getItem("bidzaar-user");
    return stored ? (JSON.parse(stored) as UserProfile) : defaultUser;
  } catch {
    return defaultUser;
  }
}

export function loadStoredLocation() {
  try {
    const stored = window.localStorage.getItem("bidzaar-location");
    return stored ? (JSON.parse(stored) as LocationPreference) : locations[0];
  } catch {
    return locations[0];
  }
}
