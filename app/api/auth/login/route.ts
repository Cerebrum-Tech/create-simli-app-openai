import { NextRequest, NextResponse } from 'next/server';

// Simple authentication credentials - in production, use environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Create a simple token (in production, use JWT or secure session)
      const token = Buffer.from(`${username}:${password}`).toString('base64');
      
      return NextResponse.json({ 
        success: true, 
        token,
        message: 'Authentication successful' 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid credentials' 
      }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      message: 'Authentication error' 
    }, { status: 500 });
  }
}

