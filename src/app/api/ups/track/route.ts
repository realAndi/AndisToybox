import { NextResponse } from 'next/server';
import { getUpsAccessToken } from '@/lib/ups/upsAuth';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { trackingNumber } = await request.json();

    if (!trackingNumber) {
      return NextResponse.json({ error: 'Tracking number is required.' }, { status: 400 });
    }

    // Generate unique transaction ID
    const transactionId = uuidv4();

    // Obtain UPS Access Token using Client Credentials Grant with caching
    const accessToken = await getUpsAccessToken();

    // Make request to UPS Tracking API
    const query = new URLSearchParams({
      locale: 'en_US',
      returnSignature: 'false',
      returnMilestones: 'false',
      returnPOD: 'false',
    }).toString();

    const response = await fetch(
      `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}?${query}`,
      {
        method: 'GET',
        headers: {
          transId: transactionId,
          transactionSrc: 'Andis Toys',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`UPS Tracking API error [Transaction ID: ${transactionId}]:`, errorText);
      return NextResponse.json(
        { error: `UPS Tracking API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Optionally, include transactionId in the response for debugging
    return NextResponse.json({ trackingData: data, transactionId }, { status: 200 });
  } catch (error) {
    console.error('Error in UPS Tracking API:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}