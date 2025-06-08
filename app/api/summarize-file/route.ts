// app/api/summarize-file/route.ts
import { NextResponse } from "next/server"
import { fetch, Agent, FormData as UndiciFormData } from "undici"
import { fileFrom } from "undici/form-data"

export async function POST(req: Request) {
    const incomingFormData = await req.formData()

    // Konversi ke FormData-nya undici (bukan native browser)
    const formData = new UndiciFormData()

    for (const [key, value] of incomingFormData.entries()) {
        if (typeof value === "string") {
            formData.set(key, value)
        } else {
            // File harus dikonversi ke fileFrom
            const file = await fileFrom(value as Blob, value.name)
            formData.set(key, file)
        }
    }

    const agent = new Agent({
        connect: { rejectUnauthorized: false }, // Self-signed cert
    })

    const res = await fetch("https://34.124.244.236:443/summarize-file", {
        method: "POST",
        body: formData,
        dispatcher: agent,
    })

    const data = await res.json()
    return NextResponse.json(data)
}
