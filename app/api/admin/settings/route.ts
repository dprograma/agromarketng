import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

// Helper function to validate admin session
async function validateAdmin(req: NextRequest) {
  const token = req.cookies.get('next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      role: string;
    };

    // Check if user is admin
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

// This is a simplified settings implementation
// In a real app, you would have a settings table in the database
const SETTINGS_KEY = 'app_settings';

export async function GET(req: NextRequest) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Default settings
    const defaultSettings = {
      supportEnabled: true,
      maxAgentsPerCategory: 5,
      autoAssignAgents: true,
      chatTimeoutMinutes: 30,
      notificationsEnabled: true,
      maintenanceMode: false
    };

    // In a real app, you would fetch settings from the database
    // For now, we'll just return the default settings
    return NextResponse.json(defaultSettings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await req.json();
    
    // Validate settings
    if (typeof settings !== 'object') {
      return NextResponse.json(
        { error: "Invalid settings format" },
        { status: 400 }
      );
    }

    // In a real app, you would save settings to the database
    // For now, we'll just return success
    return NextResponse.json({ 
      message: "Settings updated successfully",
      settings
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
