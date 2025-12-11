// src/lib/jwt.ts
import { SignJWT, jwtVerify } from "jose";

const rawSecret = process.env.JWT_SECRET || "dev-secret";

// Edge + Node safe secret
const secret = new TextEncoder().encode(rawSecret);

export async function signToken(
  payload: Record<string, unknown>,
  expiresIn: string | number = "7d"
) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId?: string; [key: string]: unknown };
}
