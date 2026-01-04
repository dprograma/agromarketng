import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { apiErrorResponse } from '@/lib/errorHandling';
import { quickSend } from '@/lib/email';

interface UserWithAgent {
  id: string;
  email: string;
  name: string;
  verified: boolean;
  Agent: any | null;
}


async function validateAdmin(req: NextRequest) {
  // Try both development and production cookie names
  const token = req.cookies.get('next-auth.session-token')?.value ||
                req.cookies.get('__Secure-next-auth.session-token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
      id: string;
      email: string;
      role: string;
      exp?: number;
    };

    console.log("admin session token: ", decoded);

    // Check token expiration
    if (decoded.exp && Date.now() >= decoded.exp * 1000) {
      return null;
    }

    // Check if user is admin by role
    if (decoded.role !== 'admin') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await validateAdmin(req);
    console.log("session from get request in agents api handler: ", session)
    if (!session) {
      return apiErrorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const agents = await prisma.agent.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Error fetching agents:", error);
    return apiErrorResponse(
      "Failed to fetch agents",
      500,
      "FETCH_AGENTS_FAILED",
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

    const { email, name, specialties } = await req.json();

    // Input validation
    if (!email || !specialties) {
      return apiErrorResponse(
        "Email and specialties are required",
        400,
        "MISSING_FIELDS"
      );
    }

    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return apiErrorResponse(
        "Invalid email format",
        400,
        "INVALID_EMAIL_FORMAT"
      );
    }

    // Check if user exists
    let user: UserWithAgent | null = await prisma.user.findUnique({
      where: { email },
      include: {
        Agent: true
      }
    });

    // Check if user is already an agent
    if (user?.Agent) {
      return apiErrorResponse(
        "User is already an agent",
        400,
        "USER_ALREADY_AGENT"
      );
    }

    // Create user if doesn't exist
    if (!user) {
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      const newUser = await prisma.user.create({
        data: {
          email,
          name: name || email.split("@")[0],
          password: hashedPassword,
          role: "agent",
          verified: false
        },
      });

      user = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        verified: newUser.verified,
        Agent: null
      };

      // Generate verification token
      const verificationToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      // Send welcome email with verification link
      try {
        const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${verificationToken}`;

        // Send both welcome and verification emails
        const welcomeResult = await quickSend.agentWelcome(email, name, Array.isArray(specialties) ? specialties[0] : specialties || 'General Support');

        if (!welcomeResult.success) {
          throw new Error(welcomeResult.error || 'Failed to send welcome email');
        }

        const verificationResult = await quickSend.verification(email, name, verificationUrl);

        if (!verificationResult.success) {
          throw new Error(verificationResult.error || 'Failed to send verification email');
        }

        console.log('Agent welcome and verification emails sent successfully');
      } catch (emailError) {
        console.error("Error sending welcome email:", emailError);
        // Delete created user if email fails to prevent orphaned user accounts
        await prisma.user.delete({ where: { id: user?.id } });
        return apiErrorResponse(
          "Failed to send verification email",
          500,
          "EMAIL_SEND_FAILED",
          emailError instanceof Error ? emailError.message : String(emailError)
        );
      }
    }

    // Create agent profile
    try {
      const agent = await prisma.agent.create({
        data: {
          userId: user.id,
          specialties: Array.isArray(specialties)
            ? specialties
            : specialties.split(',').map((s: string) => s.trim()),
          isAvailable: false
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              verified: true
            },
          },
        },
      });

      return NextResponse.json(agent);
    } catch (error) {
      // Cleanup if agent creation fails
      if (!user?.verified) {
        await prisma.user.delete({ where: { id: user.id } });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error creating agent:", error);
    return apiErrorResponse(
      "Failed to create agent",
      500,
      "CREATE_AGENT_FAILED",
      error instanceof Error ? error.message : String(error)
    );
  }
}