import { NextResponse } from "next/server";
import { serialize } from "cookie";

// This is the new handler function for Next.js App Router
export async function POST(req: Request) {
  try {
    // Clear the authentication cookie using the `Set-Cookie` header
    const cookie = serialize("session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/", // Clear the cookie across the entire site
      expires: new Date(0), // Expire the cookie immediately
    });

    const response = NextResponse.json({ message: "Logged out successfully" });
    response.headers.set("Set-Cookie", cookie); // Add the Set-Cookie header
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Method not allowed" },
      { status: 405 }
    );
  }
}

