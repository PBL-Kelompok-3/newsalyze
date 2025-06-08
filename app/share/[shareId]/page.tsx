"use client"

import { db } from "@/lib/firebase"
import { query, where, collection, getDocs } from "firebase/firestore"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Download, Loader2, ImageIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "react-hot-toast"
import { saveAs } from "file-saver"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export default function SharePage() {
  const params = useParams()
  const shareId = params?.shareId?.toString()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({})

  useEffect(() => {
    const fetchShared = async () => {
      if (!shareId || typeof shareId !== "string") return

      console.log("🔍 Share ID:", shareId)

      const q = query(collection(db, "shared_summaries"), where("shareId", "==", shareId))
      const snapshot = await getDocs(q)

      if (!snapshot.empty) {
        console.log("✅ Data ditemukan")
        setData(snapshot.docs[0].data())
      } else {
        console.warn("❌ Share ID tidak ditemukan di Firestore")
      }
      setLoading(false)
    }

    fetchShared()
  }, [shareId])

  function formatTitle(id: string): string {
    if (!id) return "Artikel Berita"

    return id
      .split("-")
      .slice(1) // buang timestamp kalau ada
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  function capitalizeSentences(text: string): string {
    if (!text) return ""

    return text
      .split(/([.!?])\s*/) // pisahkan berdasarkan tanda akhir kalimat
      .map((part, i) => {
        if (i % 2 === 0) {
          return part.trim().charAt(0).toUpperCase() + part.trim().slice(1)
        } else {
          return part // bagian tanda baca dan spasi setelahnya
        }
      })
      .join("")
      .trim()
  }

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }))
  }

  const handleCopy = () => {
    if (!data?.summary) return
    navigator.clipboard.writeText(data.summary)
    toast.success("Ringkasan berhasil disalin!")
  }

  const handleExportDocx = () => {
    if (!data?.summary) return

    // Simplified export for now to avoid docx dependency issues
    const content = `RINGKASAN BERITA\n\nTeks Asli:\n${data.text}\n\nRingkasan:\n${data.summary}`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    saveAs(blob, "ringkasan-berita.docx")
    toast.success("Dokumen berhasil diunduh!")
  }

  const handleExport = (format: string) => {
    if (!data?.summary) return

    const content = `RINGKASAN BERITA\n\nTeks Asli:\n${data.text}\n\nRingkasan:\n${data.summary}`
    let blob
    let filename

    if (format === "txt") {
      blob = new Blob([content], { type: "text/plain;charset=utf-8" })
      filename = "ringkasan-berita.txt"
    } else if (format === "pdf") {
      const doc = new jsPDF()

      doc.setFontSize(14)
      doc.text("Ringkasan Berita", 14, 20)

      doc.setFontSize(11)
      doc.text("Teks Asli:", 14, 30)
      const originalLines = doc.splitTextToSize(data.text, 180)
      doc.text(originalLines, 14, 36)

      let nextY = 36 + originalLines.length * 6

      doc.text("Ringkasan:", 14, nextY)
      const summaryLines = doc.splitTextToSize(data.summary, 180)
      doc.text(summaryLines, 14, nextY + 6)

      doc.save("ringkasan-berita.pdf")
      toast.success("Dokumen PDF berhasil diunduh!")
      return
    }

    if (blob) {
      saveAs(blob, filename)
      toast.success("Dokumen berhasil diunduh!")
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600 mb-4" />
        <p className="text-gray-600">Memuat ringkasan...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Ringkasan Tidak Ditemukan</h2>
        <p className="text-gray-600">Maaf, ringkasan yang Anda cari tidak tersedia atau telah dihapus.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto p-4 flex flex-col min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-3xl space-y-6 py-8">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Ringkasan Berita</h2>
        </div>

        {/* TEKS ASLI */}
        <div className="bg-gray-100 p-4 border border-gray-300 rounded-lg">
          <h3 className="font-semibold mb-2">Teks Asli:</h3>
          {data.text.split("\n\n").map((para: string, i: number) => (
            <p key={i} className="text-sm text-gray-800 mb-2">
              {para}
            </p>
          ))}
        </div>

        {/* RINGKASAN */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <h3 className="font-semibold mb-2">Ringkasan:</h3>
            {data.summary.split("\n\n").map((para: string, i: number) => (
              <p key={i} className="mb-2">
                {para}
              </p>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleCopy}>
              <Copy className="w-4 h-4 mr-2" />
              Salin
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>.pdf</DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDocx}>.docx</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("txt")}>.txt</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Rekomendasi Berita */}
        {data.recommendations && data.recommendations.length > 0 && (
          <div className="bg-white p-6 border border-gray-200 rounded-lg space-y-4 max-h-[400px] overflow-y-auto shadow-sm">
            <h3 className="font-semibold text-lg mb-2">Rekomendasi Berita untuk Anda</h3>

            {data.recommendations.map((rec: any, i: number) => (
              <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                {/* Tampilkan gambar asli jika ada, kalau tidak ada atau error tampilkan placeholder */}
                {rec.imageUrl && !imageErrors[i] ? (
                  <img
                    src={rec.imageUrl || "/placeholder.svg"}
                    alt="Thumbnail Berita"
                    className="w-24 h-16 object-cover rounded-md"
                    onError={() => handleImageError(i)}
                  />
                ) : (
                  <div className="w-24 h-16 bg-gray-200 rounded-md flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}

                <div className="flex flex-col">
                  <a
                    href={rec.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-sm text-blue-600 hover:underline"
                  >
                    {formatTitle(rec.article_id)}
                  </a>

                  <span className="text-xs text-gray-500 mt-1">Kategori: {capitalizeSentences(rec.category)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}