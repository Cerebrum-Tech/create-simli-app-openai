import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_PATH = path.join(process.cwd(), 'settings.json');

function verifyToken(token: string | null): boolean {
  if (!token) return false;
  
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
  
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const settingsData = fs.readFileSync(SETTINGS_PATH, 'utf-8');
    const settings = JSON.parse(settingsData);
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json({ 
      error: 'Failed to read settings' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '') ?? null;
    
    if (!verifyToken(token)) {
      return NextResponse.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const newSettings = await request.json();
    
    // Write settings to file
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings, null, 2), 'utf-8');
    
    return NextResponse.json({ 
      success: true,
      message: 'Settings updated successfully' 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ 
      error: 'Failed to update settings' 
    }, { status: 500 });
  }
}

