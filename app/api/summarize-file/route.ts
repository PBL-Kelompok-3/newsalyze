// app/api/summarize-file/route.ts
import { NextResponse } from "next/server"
import { FormData } from "formdata-node"
import { FormDataEncoder } from "form-data-encoder"
import { Blob } from "fetch-blob"
import { fetch, Agent } from "undici"

export async function POST(req: Request) {
    const incomingFormData = await req.formData()
    const formData = new FormData()

    for (const [key, value] of incomingFormData.entries()) {
        if (typeof value === "string") {
            formData.set(key, value)
        } else {
            const file = value as File
            const arrayBuffer = await file.arrayBuffer()
            const buffer = Buffer.from(arrayBuffer)

            const fblob = new Blob([buffer], { type: file.type }) as Blob
            formData.set(key, fblob, file.name ?? "upload.dat")
        }
    }

    const encoder = new FormDataEncoder(formData)

    const res = await fetch("https://35.247.133.23:443/summarize-file", {
        method: "POST",
        body: encoder.encode(),
        headers: encoder.headers,
        duplex: "half",
        dispatcher: new Agent({ connect: { rejectUnauthorized: false } }),
    })

    const data = await res.json()
    return NextResponse.json(data)
}
