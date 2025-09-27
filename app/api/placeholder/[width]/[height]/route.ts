import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Generate a simple SVG placeholder image
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ width: string; height: string }> }
) {
  try {
    const { width: widthParam, height: heightParam } = await params;
    const width = parseInt(widthParam) || 400;
    const height = parseInt(heightParam) || 300;

    // Limit size to prevent abuse
    const maxSize = 2000;
    const finalWidth = Math.min(Math.max(width, 50), maxSize);
    const finalHeight = Math.min(Math.max(height, 50), maxSize);

    // Generate a simple color based on dimensions
    const hue = (finalWidth + finalHeight) % 360;
    const backgroundColor = `hsl(${hue}, 20%, 95%)`;
    const textColor = `hsl(${hue}, 30%, 40%)`;
    const borderColor = `hsl(${hue}, 30%, 80%)`;

    const svg = `
      <svg width="${finalWidth}" height="${finalHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${backgroundColor}" stroke="${borderColor}" stroke-width="2"/>
        <text
          x="50%"
          y="50%"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${Math.min(finalWidth / 10, finalHeight / 8, 24)}"
          font-weight="500"
          fill="${textColor}"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          ${finalWidth} × ${finalHeight}
        </text>
        <text
          x="50%"
          y="65%"
          font-family="system-ui, -apple-system, sans-serif"
          font-size="${Math.min(finalWidth / 20, finalHeight / 16, 14)}"
          fill="${textColor}"
          text-anchor="middle"
          dominant-baseline="middle"
          opacity="0.7"
        >
          Placeholder Image
        </text>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);

    // Return a simple fallback SVG
    const fallbackSvg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6" stroke="#e5e7eb" stroke-width="2"/>
        <text
          x="50%"
          y="50%"
          font-family="system-ui, sans-serif"
          font-size="18"
          fill="#6b7280"
          text-anchor="middle"
          dominant-baseline="middle"
        >
          Image Error
        </text>
      </svg>
    `;

    return new NextResponse(fallbackSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
}