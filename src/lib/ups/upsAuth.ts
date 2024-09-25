// src/lib/ups/upsAuth.ts
let upsTokenCache: {
    accessToken: string;
    expiresAt: number;
  } | null = null;
  
  export async function getUpsAccessToken(): Promise<string> {
    const clientId = process.env.UPS_CLIENT_ID;
    const clientSecret = process.env.UPS_CLIENT_SECRET;
    const accountNumber = process.env.UPS_ACCOUNT_NUMBER;
  
    if (!clientId || !clientSecret || !accountNumber) {
      throw new Error('UPS credentials are not set in environment variables.');
    }
  
    // Check if token is cached and still valid
    if (upsTokenCache && upsTokenCache.expiresAt > Date.now()) {
      console.log('Using cached UPS access token.');
      return upsTokenCache.accessToken;
    }
  
    console.log('Fetching new UPS access token.');
    const formData = new URLSearchParams({
      grant_type: 'client_credentials',
    });
  
    const response = await fetch('https://wwwcie.ups.com/security/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'x-merchant-id': accountNumber,
        Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      },
      body: formData.toString(),
    });
  
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`UPS OAuth Token request failed (${response.status}): ${errorText}`);
      throw new Error(`UPS OAuth Token request failed: ${errorText}`);
    }
  
    const data = await response.json();
    const accessToken = data.access_token as string;
    const expiresIn = parseInt(data.expires_in, 10);
  
    // Calculate the expiration time (current time + expires_in seconds)
    const expiresAt = Date.now() + expiresIn * 1000 - 60000; // Subtract 1 minute for buffer
  
    // Cache the token and its expiration time
    upsTokenCache = {
      accessToken,
      expiresAt,
    };
  
    return accessToken;
  }