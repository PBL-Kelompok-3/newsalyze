// app/api/summarize/route.ts
import { NextResponse } from "next/server"
import { fetch, Agent } from "undici"

export async function POST(req: Request) {
    const body = await req.json()

    const agent = new Agent({
        connect: { rejectUnauthorized: false }, // ⬅️ biar HTTPS self-signed bisa jalan
    })

    const res = await fetch("https://35.197.145.2:443/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        dispatcher: agent, // ⬅️ penting banget
    })

    const data = await res.json()
    return NextResponse.json(data)
}
