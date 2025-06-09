import { NextResponse } from "next/server"

export async function GET() {
  // Redirect ke halaman autentikasi Google
  return NextResponse.json({ message: "Google OAuth endpoint" })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log("Google OAuth request body:", body)
    // Proses token atau kode dari Google OAuth di sini

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}
