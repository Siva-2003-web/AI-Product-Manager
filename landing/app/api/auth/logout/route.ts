import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json(
      { message: "Logged out successfully." },
      { status: 200 }
    );

    // Set cookie to empty string and expire it immediately
    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Failed to log out. Please try again." },
      { status: 500 }
    );
  }
}
