import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    console.log(`Password reset requested for: ${email}`)

    return NextResponse.json({ success: true })
  }catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to process password reset request" }, { status: 500 })
  }
}
