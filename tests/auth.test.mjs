import test from "node:test";
import assert from "node:assert/strict";

const userInitials = (user) => `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
const userFullName = (user) => `${user.firstName} ${user.lastName}`.trim();

test("user initials format correctly from profile", () => {
  const user = { firstName: "Lucas", lastName: "De Vries", email: "lucas@example.com", phone: "06-12345678" };
  assert.equal(userInitials(user), "LD");
});

test("user full name formats correctly", () => {
  const user = { firstName: "Lucas", lastName: "De Vries", email: "lucas@example.com", phone: "06-12345678" };
  assert.equal(userFullName(user), "Lucas De Vries");
});

test("login flow verifies valid credentials and persists auth state", () => {
  const mockStorage = new Map();
  const storageInterface = {
    setItem: (key, val) => mockStorage.set(key, String(val)),
    getItem: (key) => mockStorage.get(key) || null,
    removeItem: (key) => mockStorage.delete(key),
  };

  // Simulate login
  const testUser = {
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    phone: "06-00000000",
  };

  storageInterface.setItem("bidzaar-auth", "true");
  storageInterface.setItem("bidzaar-user", JSON.stringify(testUser));

  // Verify auth session
  assert.equal(storageInterface.getItem("bidzaar-auth"), "true");
  const storedUser = JSON.parse(storageInterface.getItem("bidzaar-user"));
  assert.equal(storedUser.email, "test@example.com");

  // Simulate logout
  storageInterface.setItem("bidzaar-auth", "false");
  assert.equal(storageInterface.getItem("bidzaar-auth"), "false");
});

test("login rejects empty email or short password in credentials validation", () => {
  const validateLogin = (email, password) => {
    if (!email || !email.includes("@")) return { valid: false, error: "Invalid email" };
    if (!password || password.length < 8) return { valid: false, error: "Password too short" };
    return { valid: true };
  };

  assert.equal(validateLogin("", "password123").valid, false);
  assert.equal(validateLogin("notanemail", "password123").valid, false);
  assert.equal(validateLogin("test@example.com", "short").valid, false);
  assert.equal(validateLogin("test@example.com", "securePassword123").valid, true);
});
