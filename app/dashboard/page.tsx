import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface JwtPayload {
  userId: string;
  globalRole: "ADMIN" | "TEAM_MEMBER" | "STUDENT";
  sessionId: string;
  iat: number;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    // Base64URL decode
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

export default async function DashboardProxyPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    redirect("/");
  }

  const payload = decodeJwt(token);
  if (!payload || !payload.globalRole) {
    redirect("/");
  }

  const { globalRole } = payload;

  if (globalRole === "ADMIN") {
    redirect("/dashboard/admin");
  } else if (globalRole === "TEAM_MEMBER") {
    redirect("/dashboard/member");
  } else {
    redirect("/dashboard/student");
  }
}
