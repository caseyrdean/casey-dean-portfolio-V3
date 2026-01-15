/**
 * Standalone Authentication Module
 * 
 * Simple password-based authentication for admin access.
 * No external OAuth dependencies - fully portable to AWS.
 * 
 * Environment Variables Required:
 * - ADMIN_PASSWORD: The admin password for login
 * - JWT_SECRET: Secret for signing JWT tokens
 */

import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import * as bcrypt from "bcryptjs";
import * as db from "./db";
import type { User } from "../drizzle/schema";

import { COOKIE_NAME, ONE_YEAR_MS } from "../shared/const";

// Re-export for convenience
export const AUTH_COOKIE_NAME = COOKIE_NAME;
const ADMIN_OPEN_ID = "admin"; // Fixed ID for the admin user

// Get environment variables
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
};

const getAdminPassword = () => {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  return password;
};

export type SessionPayload = {
  openId: string;
  name: string;
  role: string;
};

/**
 * Verify admin password
 */
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = getAdminPassword();
  
  // If password is already hashed (starts with $2), compare with bcrypt
  if (adminPassword.startsWith("$2")) {
    return bcrypt.compare(password, adminPassword);
  }
  
  // Otherwise, do a simple string comparison (for development)
  return password === adminPassword;
}

/**
 * Create a session token for the admin user
 */
export async function createSessionToken(
  payload: SessionPayload,
  expiresInMs: number = ONE_YEAR_MS
): Promise<string> {
  const secretKey = getJwtSecret();
  const expirationSeconds = Math.floor((Date.now() + expiresInMs) / 1000);

  return new SignJWT({
    openId: payload.openId,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expirationSeconds)
    .sign(secretKey);
}

/**
 * Verify a session token
 */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) {
    return null;
  }

  try {
    const secretKey = getJwtSecret();
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    const { openId, name, role } = payload as Record<string, unknown>;

    if (
      typeof openId !== "string" ||
      typeof name !== "string" ||
      typeof role !== "string"
    ) {
      console.warn("[Auth] Session payload missing required fields");
      return null;
    }

    return { openId, name, role };
  } catch (error) {
    console.warn("[Auth] Session verification failed", String(error));
    return null;
  }
}

/**
 * Parse cookies from request
 */
function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) {
    return new Map<string, string>();
  }
  const parsed = parseCookieHeader(cookieHeader);
  return new Map(Object.entries(parsed));
}

/**
 * Authenticate a request and return the user
 */
export async function authenticateRequest(req: Request): Promise<User | null> {
  const cookies = parseCookies(req.headers.cookie);
  const sessionCookie = cookies.get(AUTH_COOKIE_NAME);
  
  if (!sessionCookie) {
    return null;
  }

  const session = await verifySessionToken(sessionCookie);
  if (!session) {
    return null;
  }

  // Get user from database
  const user = await db.getUserByOpenId(session.openId);
  
  if (!user) {
    // User might have been deleted, invalidate session
    return null;
  }

  // Update last signed in
  await db.upsertUser({
    openId: user.openId,
    lastSignedIn: new Date(),
  });

  return user;
}

/**
 * Login with admin password
 * Returns session token on success, null on failure
 */
export async function loginWithPassword(
  password: string
): Promise<{ token: string; user: User } | null> {
  const isValid = await verifyAdminPassword(password);
  
  if (!isValid) {
    return null;
  }

  // Ensure admin user exists in database
  const adminName = process.env.OWNER_NAME || "Casey Dean";
  await db.upsertUser({
    openId: ADMIN_OPEN_ID,
    name: adminName,
    email: null,
    loginMethod: "password",
    role: "admin",
    lastSignedIn: new Date(),
  });

  const user = await db.getUserByOpenId(ADMIN_OPEN_ID);
  if (!user) {
    throw new Error("Failed to create admin user");
  }

  const token = await createSessionToken({
    openId: ADMIN_OPEN_ID,
    name: adminName,
    role: "admin",
  });

  return { token, user };
}

/**
 * Get cookie options for setting the session cookie
 */
export function getSessionCookieOptions(req: Request) {
  const isProduction = process.env.NODE_ENV === "production";
  
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    path: "/",
    maxAge: ONE_YEAR_MS,
  };
}
