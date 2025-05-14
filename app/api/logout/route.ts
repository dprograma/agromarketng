import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    try {
        // Clear all auth-related cookies on the server side
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();

        for (const cookie of allCookies) {
            if (cookie.name.includes("next-auth")) {
                cookieStore.delete(cookie.name);
            }
        }

        return NextResponse.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return NextResponse.json(
            { success: false, message: "Failed to log out" },
            { status: 500 }
        );
    }
}