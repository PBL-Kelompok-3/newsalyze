import { NextRequest, NextResponse } from "next/server";
import { Storage } from "@google-cloud/storage";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Lokasi file service account
const keyPath = path.join(process.cwd(), "gcs-service-account.json");
console.log("✅ Key file path:", keyPath);

// Inisialisasi storage
const storage = new Storage({
    projectId: "summarization-model-460906",
    keyFilename: keyPath,
});

const bucketName = "newsalyze-pics";

export async function POST(req: NextRequest) {
    try {
        console.log("📥 Menerima request upload...");

        const formData = await req.formData();
        const file = formData.get("image") as File;

        if (!file) {
            console.warn("⚠️ Tidak ada file yang diterima di formData.");
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.type.split("/")[1] || "jpg";
        const filename = `profile-${uuidv4()}.${fileExt}`;

        console.log("📄 Nama file:", filename);
        console.log("📏 Ukuran file (bytes):", buffer.length);
        console.log("🧾 Tipe MIME:", file.type);

        const bucket = storage.bucket(bucketName);
        const fileRef = bucket.file(filename);

        console.log("🚀 Mengupload ke bucket:", bucketName);

        await fileRef.save(buffer, {
            metadata: { contentType: file.type },
        });

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;
        console.log("✅ Upload berhasil:", publicUrl);

        return NextResponse.json({ url: publicUrl });
    } catch (err) {
        console.error("❌ Upload error:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
