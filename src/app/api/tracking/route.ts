import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  // Retrieve the user's session
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch tracking entries tied to the authenticated user
    const trackings = await prisma.tracking.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Return the tracking entries as JSON
    return NextResponse.json(trackings, { status: 200 });
  } catch (error) {
    console.error("Error fetching trackings:", error);
    return NextResponse.json(
      { error: "Failed to fetch tracking entries." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // Retrieve the user's session
  const session = await getServerSession(authOptions);

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the JSON body of the request
  const { name, trackingNumber } = await request.json();

  // Validate the input
  if (!name || !trackingNumber) {
    return NextResponse.json(
      { error: "Name and Tracking Number are required." },
      { status: 400 }
    );
  }

  try {
    // Create a new tracking entry in the database
    const newTracking = await prisma.tracking.create({
      data: {
        name,
        trackingNumber,
        userId: session.user.id,
      },
    });

    // Return the newly created tracking entry as JSON
    return NextResponse.json(newTracking, { status: 201 });
  } catch (error) {
    console.error("Error creating tracking entry:", error);
    return NextResponse.json(
      { error: "Failed to create tracking entry." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
    // You get the idea...
    const session = await getServerSession(authOptions);
  
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      // Parse the JSON body of the request
      const { ids } = await request.json();
  
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json(
          { error: 'No tracking IDs provided for deletion.' },
          { status: 400 }
        );
      }
  
      // Delete the tracking entries from the database
      await prisma.tracking.deleteMany({
        where: {
          id: { in: ids },
          userId: session.user.id,
        },
      });
  
      return NextResponse.json(
        { message: 'Trackings deleted successfully.' },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error deleting trackings:', error);
      return NextResponse.json(
        { error: 'Failed to delete tracking entries.' },
        { status: 500 }
      );
    }
  }