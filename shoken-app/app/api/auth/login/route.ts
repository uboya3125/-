import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, createSessionToken, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (typeof password !== "string" || !verifyPassword(password)) {
    return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
