// app/api/summarize-url/route.ts
import { NextResponse } from "next/server"
import { Agent } from "undici"

const agent = new Agent({ connect: { rejectUnauthorized: false } })

export async function POST(req: Request) {
    const { url } = await req.json()

    const res = await fetch("https://34.124.244.236/summarize-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
        dispatcher: agent, // ← PENTING kalau self-signed
    })

    const data = await res.json()
    return NextResponse.json(data)
}
