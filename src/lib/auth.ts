// src/lib/auth.ts
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function addHoursToDate(hours: number) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}
