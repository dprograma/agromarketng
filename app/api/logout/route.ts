import { authOptions } from "@/lib/authOptions"; // Ensure correct import path
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "No active session" }, { status: 401 });
  }

  // Return a response instructing NextAuth to remove the session cookie
  return NextResponse.redirect("/api/auth/signout");
}
