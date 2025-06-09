import { NextRequest, NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"
import { v4 as uuidv4 } from "uuid"
import path from "path"

const isDev = process.env.NODE_ENV === "development"
const bucketName = "newsalyze-pics"

// Fungsi untuk decode Base64 ke JSON
function decodeBase64ToJson(base64String: string) {
    const jsonStr = Buffer.from(base64String, "base64").toString("utf8")
    return JSON.parse(jsonStr)
}

// Inisialisasi Google Cloud Storage
const storage = new Storage(
    isDev
        ? {
            projectId: "summarization-model-460906",
            keyFilename: path.join(process.cwd(), "gcs-service-account.json"),
        }
        : (() => {
            const encoded = process.env.GCS_KEY_JSON_BASE64
            if (!encoded) {
                throw new Error("❌ GCS_KEY_JSON_BASE64 belum di-define di environment variables!")
            }

            const credentials = decodeBase64ToJson(encoded)
            return {
                projectId: "summarization-model-460906",
                credentials,
            }
        })()
)

export async function POST(req: NextRequest) {
    try {
        console.log("📥 Menerima request upload...")

        const formData = await req.formData()
        const file = formData.get("image") as File

        if (!file) {
            console.warn("⚠️ Tidak ada file yang diterima di formData.")
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const fileExt = file.type.split("/")[1] || "jpg"
        const filename = `profile-${uuidv4()}.${fileExt}`

        const bucket = storage.bucket(bucketName)
        const fileRef = bucket.file(filename)

        console.log("🚀 Mengupload ke bucket:", bucketName)

        await fileRef.save(buffer, {
            metadata: { contentType: file.type },
        })

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`
        console.log("✅ Upload berhasil:", publicUrl)

        return NextResponse.json({ url: publicUrl })
    } catch (err: any) {
        console.error("❌ Upload error:", err?.message || err)
        return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 })
    }
}
