// app/api/summarize/route.ts
import { NextResponse } from "next/server"
import { fetch, Agent } from "undici"

export async function POST(req: Request) {
    const body = await req.json()

    const agent = new Agent({
        connect: { rejectUnauthorized: false }, // ⬅️ biar HTTPS self-signed bisa jalan
    })

    const res = await fetch("https://34.124.244.236:443/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        dispatcher: agent, // ⬅️ penting banget
    })

    const data = await res.json()
    return NextResponse.json(data)
}
