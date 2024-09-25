import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: Request) {
  try {
    // Read and parse the JSON data
    const { email, password, name, inviteCode } = await request.json();

    // Log the parsed data
    console.log("Parsed request body:", { email, password, name, inviteCode });

    // Check for missing fields (inviteCode is now optional)
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Initialize a variable for the invite code (if provided)
    let code;
    if (inviteCode) {
      // Validate the invite code
      code = await prisma.inviteCode.findUnique({
        where: { code: inviteCode },
      });

      console.log("Invite code fetched from database:", code);

      if (!code || code.used) {
        return NextResponse.json({ error: "Invalid or used invite code" }, { status: 400 });
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    const userData: any = {
      email,
      name,
      hashedPassword,
    };

    // Associate the invite code if it was provided
    if (code) {
      userData.inviteCode = { connect: { id: code.id } };
    }

    // Create the new user
    const user = await prisma.user.create({
      data: userData,
    });

    // Mark the invite code as used if it was provided
    if (code) {
      await prisma.inviteCode.update({
        where: { id: code.id },
        data: {
          used: true,
        },
      });
    }

    return NextResponse.json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}