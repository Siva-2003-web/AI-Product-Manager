import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    console.log("[REGISTER] Starting registration for:", email);
    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    console.log("[REGISTER] Connecting to database...");
    const { db } = await connectToDatabase();
    console.log("[REGISTER] Connected to database.");
    const usersCollection = db.collection("users");

    // Check if user exists
    console.log("[REGISTER] Checking existing user...");
    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    console.log("[REGISTER] Existing user check complete.");
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    // Hash password
    console.log("[REGISTER] Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log("[REGISTER] Password hashed.");

    // Insert user
    console.log("[REGISTER] Inserting user...");
    const result = await usersCollection.insertOne({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Sign JWT
    console.log("[REGISTER] Signing JWT...");
    const token = await signToken({
      userId: result.insertedId.toString(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
    });

    // Set cookie and return
    const response = NextResponse.json(
      {
        user: {
          id: result.insertedId.toString(),
          name: name.trim(),
          email: email.toLowerCase().trim(),
        },
        message: "Account created successfully.",
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
