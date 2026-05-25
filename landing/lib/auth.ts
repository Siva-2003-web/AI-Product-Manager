import { SignJWT, jwtVerify, JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ai-pm-landing-secret-key-change-in-production"
);

const JWT_ISSUER = "ai-pm-landing";
const JWT_EXPIRATION = "7d";

export interface UserJWTPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
}

export async function signToken(payload: {
  userId: string;
  email: string;
  name: string;
}): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setExpirationTime(JWT_EXPIRATION)
    .sign(JWT_SECRET);
}

export async function verifyToken(
  token: string
): Promise<UserJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });
    return payload as UserJWTPayload;
  } catch {
    return null;
  }
}

export function getTokenFromCookies(
  cookieHeader: string | null
): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}
