import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    // Read and parse the JSON data
    const { email, password, name, inviteCode } = await request.json();

    // Log the parsed data
    console.log("Parsed request body:", { email, password, name, inviteCode });

    // Check for missing fields
    if (!email || !password || !name || !inviteCode) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Validate the invite code
    const code = await prisma.inviteCode.findUnique({
      where: { code: inviteCode },
    });

    console.log("Invite code fetched from database:", code);

    if (!code || code.used) {
      return NextResponse.json({ error: "Invalid or used invite code" }, { status: 400 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user and associate the invite code
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        inviteCode: { connect: { id: code.id } },
      },
    });

    // Mark the invite code as used
    await prisma.inviteCode.update({
      where: { id: code.id },
      data: {
        used: true,
      },
    });

    return NextResponse.json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}