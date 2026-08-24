import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const sessionCookie = "lumina_session";
const secret = new TextEncoder().encode(process.env.SESSION_SECRET || "development-secret-change-me");

type Session = { userId: string; role: "STUDENT" | "TEACHER" | "ADMIN" };

export async function createSession(session: Session) {
  const token = await new SignJWT(session).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret);
  const cookieStore = await cookies();
  cookieStore.set(sessionCookie, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(sessionCookie)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string" || !["STUDENT", "TEACHER", "ADMIN"].includes(String(payload.role))) return null;
    return { userId: payload.userId, role: payload.role as Session["role"] };
  } catch {
    return null;
  }
}

export async function clearSession() {
  (await cookies()).delete(sessionCookie);
}
