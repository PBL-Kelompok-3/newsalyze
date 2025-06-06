"use client"
import { db } from "@/lib/firebase"
import { query, where, collection, getDocs } from "firebase/firestore"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

export default function SharePage() {
    const params = useParams();
    const shareId = params?.shareId?.toString();
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        const fetchShared = async () => {
            if (!shareId || typeof shareId !== "string") return;

            console.log("🔍 Share ID:", shareId);

            const q = query(
                collection(db, "shared_summaries"),
                where("shareId", "==", shareId) // ✅ diperbaiki di sini
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                console.log("✅ Data ditemukan");
                setData(snapshot.docs[0].data());
            } else {
                console.warn("❌ Share ID tidak ditemukan di Firestore");
            }
        };

        fetchShared();
    }, [shareId]);

    if (!data) return <p className="text-center mt-10">Loading...</p>;

    function formatTitle(id: string): string {
        return id
            .split("-")
            .slice(1) // buang timestamp kalau ada
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    function capitalizeSentences(text: string): string {
        return text
            .split(/([.!?])\s*/) // pisahkan berdasarkan tanda akhir kalimat
            .map((part, i, arr) => {
                if (i % 2 === 0) {
                    return part.trim().charAt(0).toUpperCase() + part.trim().slice(1);
                } else {
                    return part; // bagian tanda baca dan spasi setelahnya
                }
            })
            .join("")
            .trim();
    }

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Ringkasan Berita</h1>

            <h2 className="font-semibold">Teks Asli</h2>
            <p className="whitespace-pre-line text-sm text-gray-700 mb-4">{data.text}</p>

            <h2 className="font-semibold">Ringkasan</h2>
            <p className="whitespace-pre-line text-black text-base">{data.summary}</p>

            <h3 className="mt-6 font-semibold">Rekomendasi</h3>
            <ul className="list-disc pl-6">
                {data.recommendations?.map((rec: any, i: number) => (
                    <li key={i}>
                        <a
                            href={rec.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            {formatTitle(rec.article_id)}
                        </a>{" "}
                        - {capitalizeSentences(rec.category)}
                    </li>
                ))}
            </ul>
        </div>
    );
}
