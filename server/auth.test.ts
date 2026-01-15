/**
 * Standalone Auth Module Tests
 * 
 * Tests for password-based authentication without Manus OAuth.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock environment variables before importing auth module
const mockEnv = {
  JWT_SECRET: "test-jwt-secret-that-is-at-least-32-characters-long",
  ADMIN_PASSWORD: "test-admin-password",
  OWNER_NAME: "Test Owner",
};

// Set environment variables
Object.entries(mockEnv).forEach(([key, value]) => {
  process.env[key] = value;
});

// Import after setting env vars
import {
  verifyAdminPassword,
  createSessionToken,
  verifySessionToken,
  AUTH_COOKIE_NAME,
} from "./auth";

describe("Standalone Auth Module", () => {
  describe("AUTH_COOKIE_NAME", () => {
    it("should be defined and match expected value", () => {
      expect(AUTH_COOKIE_NAME).toBe("casey_portfolio_session");
    });
  });

  describe("verifyAdminPassword", () => {
    it("should return true for correct password", async () => {
      const result = await verifyAdminPassword("test-admin-password");
      expect(result).toBe(true);
    });

    it("should return false for incorrect password", async () => {
      const result = await verifyAdminPassword("wrong-password");
      expect(result).toBe(false);
    });

    it("should return false for empty password", async () => {
      const result = await verifyAdminPassword("");
      expect(result).toBe(false);
    });
  });

  describe("createSessionToken", () => {
    it("should create a valid JWT token", async () => {
      const payload = {
        openId: "test-user",
        name: "Test User",
        role: "admin",
      };

      const token = await createSessionToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should create tokens with different payloads", async () => {
      const payload1 = { openId: "user1", name: "User 1", role: "admin" };
      const payload2 = { openId: "user2", name: "User 2", role: "user" };

      const token1 = await createSessionToken(payload1);
      const token2 = await createSessionToken(payload2);

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifySessionToken", () => {
    it("should verify a valid token and return payload", async () => {
      const payload = {
        openId: "test-user",
        name: "Test User",
        role: "admin",
      };

      const token = await createSessionToken(payload);
      const verified = await verifySessionToken(token);

      expect(verified).not.toBeNull();
      expect(verified?.openId).toBe(payload.openId);
      expect(verified?.name).toBe(payload.name);
      expect(verified?.role).toBe(payload.role);
    });

    it("should return null for invalid token", async () => {
      const result = await verifySessionToken("invalid-token");
      expect(result).toBeNull();
    });

    it("should return null for null input", async () => {
      const result = await verifySessionToken(null);
      expect(result).toBeNull();
    });

    it("should return null for undefined input", async () => {
      const result = await verifySessionToken(undefined);
      expect(result).toBeNull();
    });

    it("should return null for empty string", async () => {
      const result = await verifySessionToken("");
      expect(result).toBeNull();
    });
  });

  describe("Token expiration", () => {
    it("should create tokens with custom expiration", async () => {
      const payload = {
        openId: "test-user",
        name: "Test User",
        role: "admin",
      };

      // Create token with 1 second expiration
      const shortToken = await createSessionToken(payload, 1000);
      
      // Verify immediately - should work
      const verified = await verifySessionToken(shortToken);
      expect(verified).not.toBeNull();
    });
  });
});
