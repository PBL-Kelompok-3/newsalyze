// app/api/recommendations/route.ts
import { Agent, fetch } from "undici"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    const body = await req.json()

    const agent = new Agent({
        connect: { rejectUnauthorized: false }, // ⬅️ Ini biar self-signed diterima
    })

    const res = await fetch("https://34.87.30.246/recommendations/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        dispatcher: agent, // ⬅️ Gantinya `agent` di undici
    })

    const data = await res.json()
    return NextResponse.json(data)
}
