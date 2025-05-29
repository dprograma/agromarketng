import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { apiErrorResponse } from '@/lib/errorHandling';

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
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
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
    return apiErrorResponse(
      "Failed to fetch settings",
      500,
      "FETCH_SETTINGS_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await validateAdmin(req);
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const settings = await req.json();

    // Validate settings
    if (typeof settings !== 'object') {
      return apiErrorResponse(
        "Invalid settings format",
        400,
        "INVALID_INPUT"
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
    return apiErrorResponse(
      "Failed to update settings",
      500,
      "UPDATE_SETTINGS_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}
