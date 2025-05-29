import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import * as fs from "fs";
import path from "path";


export async function POST(req: Request) {
  try {
    // Verify authentication
    const token = (await cookies()).get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    const session: any = decoded;

    const formData = await req.formData();
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;
    const priority = formData.get("priority") as string;
    const category = formData.get("category") as string;
    const attachments = formData.getAll("attachments") as File[];

    // Upload attachments locally
    const attachmentUrls = await Promise.all(
      attachments.map(async (file) => {
        try {
          // Validate file
          validateFile(file);

          // Save file and get public URL
          const fileUrl = await saveLocalFile(file);
          return fileUrl;
        } catch (error: any) {
          console.error(`Error uploading ${file.name}:`, error);
          throw new Error(error.message);
        }
      })
    );

    // Create support ticket in database
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        message,
        priority,
        category,
        attachments: attachmentUrls,
        userId: session.user.id,
        status: "open",
      },
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "Failed to create support ticket" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    // Verify authentication
    const token = (await cookies()).get('next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!);
    const session: any = decoded;
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Failed to fetch support tickets" },
      { status: 500 }
    );
  }
}

function validateFile(file: File) {
  // Maximum file size (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Allowed file types
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size exceeds 5MB limit');
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('File type not allowed. Please upload images, PDFs, or Word documents');
  }
}


async function saveLocalFile(file: File): Promise<string> {
  // Create a unique filename
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const filename = `${timestamp}-${randomString}-${file.name}`;
  
  // Convert File to Buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Ensure uploads directory exists
  const uploadDir = './public/uploads';
  await fs.promises.mkdir(uploadDir, { recursive: true });

  // Save file
  const filepath = path.join(uploadDir, filename);
  await fs.promises.writeFile(filepath, buffer);

  // Return public URL
  return `/uploads/${filename}`;
}



