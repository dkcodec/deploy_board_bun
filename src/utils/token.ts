import { randomBytes } from "crypto";

export function generateRefreshToken() {
  return randomBytes(64).toString("hex");
}
