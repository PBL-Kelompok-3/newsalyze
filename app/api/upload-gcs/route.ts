import { NextRequest, NextResponse } from "next/server"
import { Storage } from "@google-cloud/storage"
import { v4 as uuidv4 } from "uuid"
import path from "path"

const isDev = process.env.NODE_ENV === "development"
const bucketName = "newsalyze-pics"

// Inisialisasi Google Cloud Storage
const storage = new Storage(
    isDev
        ? {
            projectId: "summarization-model-460906", // boleh ditaruh di .env juga
            keyFilename: path.join(process.cwd(), "gcs-service-account.json"),
        }
        : (() => {
            if (!process.env.GCS_KEY_JSON) {
                throw new Error("❌ GCS_KEY_JSON belum di-define di environment variables!")
            }
            return {
                projectId: "summarization-model-460906",
                credentials: JSON.parse(process.env.GCS_KEY_JSON),
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
            public: true,
        })

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`
        console.log("✅ Upload berhasil:", publicUrl)

        return NextResponse.json({ url: publicUrl })
    } catch (err) {
        console.error("❌ Upload error:", err)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
