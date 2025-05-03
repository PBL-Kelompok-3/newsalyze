import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    // Dalam aplikasi nyata, Anda akan:
    // 1. Memeriksa apakah email ada di database
    // 2. Membuat token reset password
    // 3. Mengirim email dengan link reset password

    console.log(`Password reset requested for: ${email}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process password reset request" }, { status: 500 })
  }
}
