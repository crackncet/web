import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  // Await the params object as required by Next.js 15+
  const { filename } = await params;

  // Basic security check to prevent directory traversal
  if (filename.includes("..") || filename.includes("/")) {
    return new NextResponse("Invalid file path", { status: 400 });
  }

  try {
    const filePath = path.join(
      process.cwd(),
      "app/(public)/sample-test/_papers",
      filename
    );
    const content = await fs.readFile(filePath, "utf-8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
