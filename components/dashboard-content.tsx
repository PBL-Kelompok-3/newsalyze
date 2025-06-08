"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Plus, Settings, Download, Copy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { toast } from "react-hot-toast"
import Logo from "@/components/logo"
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { useSummary } from "@/app/context/SummaryContext"
import { generateTitle } from "@/lib/utils"
import { nanoid } from "nanoid"
import { saveAs } from "file-saver"
import { Document, Packer, Paragraph, TextRun } from "docx"
import jsPDF from "jspdf"

export function DashboardContent() {
  const {
    inputText,
    setInputText,
    summary,
    setSummary,
    showSummary,
    setShowSummary,
    recommendations,
    setRecommendations,
  } = useSummary()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [username, setUsername] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (textareaRef.current) {
      const shouldExpand = inputText.length > 100 || inputText.split("\n").length > 3
      setIsExpanded(shouldExpand)
    }
  }, [inputText])

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser
      if (!user) return

      const userDoc = await getDoc(doc(db, "users", user.uid))
      if (userDoc.exists()) {
        const data = userDoc.data()
        setPhotoUrl(data.photoURL || null)
        setUsername(data.username || null)
      }
    }

    fetchUserData()
  }, [])

  useEffect(() => {
    if (summary) {
      setShowSummary(true)
    }
  }, [summary])

  const handleEditProfile = () => router.push("/profile/edit")

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Berhasil logout")
      router.replace("/sign-in")
    } catch (error) {
      toast.error("Gagal logout")
    }
  }

  async function getOGImage(url: string): Promise<string> {
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      return data?.data?.image?.url || "/placeholder.png"
    } catch {
      return "/placeholder.png"
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/summarize-file", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.error) {
        toast.error(data.error)
      } else {
        setInputText(data.text)
        setSummary(data.summary)
        setShowSummary(true)
        toast.success("Berhasil menganalisis file")

        const user = auth.currentUser
        if (user) {
          // Ambil preferensi user
          let preferredCategories = ["umum"]
          const userDoc = await getDoc(doc(db, "users", user.uid))
          if (userDoc.exists()) {
            const userData = userDoc.data()
            if (userData.preferred_categories) {
              preferredCategories = userData.preferred_categories
            }
          }

          // Set loading state untuk rekomendasi
          setIsLoadingRecommendations(true)

          // Fetch rekomendasi
          const recRes = await fetch("/api/recommendations/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: data.text,
              summary: data.summary,
              preferred_categories: preferredCategories,
              alpha: 0.6,
              beta: 0.3,
              gamma: 0.1,
              n_recommendations: 5,
            }),
          })

          let recsWithImages = []
          if (recRes.ok) {
            const recData = await recRes.json()
            recsWithImages = await Promise.all(
              recData.recommendations.map(async (rec) => ({
                ...rec,
                imageUrl: await getOGImage(rec.source_url),
              })),
            )
            setRecommendations(recsWithImages)
          }

          setRecommendations(recsWithImages)
          setIsLoadingRecommendations(false)

          // Simpan ke Firestore
          await addDoc(collection(db, "users", user.uid, "summaries"), {
            title: generateTitle(data.text),
            text: data.text,
            summary: data.summary,
            recommendations: recsWithImages.map((rec) => ({
              article_id: rec.article_id,
              category: rec.category,
              similarity_score: rec.similarity_score,
              source_url: rec.source_url,
              imageUrl: rec.imageUrl,
            })),
            createdAt: serverTimestamp(),
          })
        }
      }

      const shareId = nanoid(10)

      await addDoc(collection(db, "shared_summaries"), {
        shareId,
        text: data.text,
        summary: data.summary,
        recommendations: recsWithImages,
        createdAt: serverTimestamp(),
      })
    } catch (err) {
      toast.error("Gagal upload file")
    } finally {
      setIsLoading(false)
    }
  }

  const isValidUrl = (text: string) => {
    try {
      new URL(text)
      return true
    } catch {
      return false
    }
  }

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast.error("Silakan masukkan berita atau URL berita")
      return
    }

    setIsLoading(true)
    try {
      const user = auth.currentUser // ⬅️ Ditaruh di awal

      const res = await fetch(
          isValidUrl(inputText) ? "/api/summarize-url" : "/api/summarize",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(isValidUrl(inputText) ? { url: inputText } : { text: inputText }),
          }
      )

      if (!res.ok) throw new Error("Gagal fetch ringkasan")

      const data = await res.json()
      setSummary(data.summary)

      // Fetch preferensi user
      let preferredCategories = ["umum"]
      if (user) {
        const userDocSnap = await getDoc(doc(db, "users", user.uid))
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          if (userData.preferred_categories) {
            preferredCategories = userData.preferred_categories
          }
        }
      }

      // Set loading state untuk rekomendasi
      setIsLoadingRecommendations(true)

      // Rekomendasi berita
      const recRes = await fetch("/api/recommendations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          summary: data.summary,
          preferred_categories: preferredCategories,
          alpha: 0.6,
          beta: 0.3,
          gamma: 0.1,
          n_recommendations: 10,
        }),
      })

      let recsWithImages = []

      if (recRes.ok) {
        const recData = await recRes.json()

        recsWithImages = await Promise.all(
          recData.recommendations.map(async (rec) => ({
            ...rec,
            imageUrl: await getOGImage(rec.source_url),
          })),
        )

        setRecommendations(recsWithImages)
      } else {
        toast.error("Gagal memuat rekomendasi")
        setIsLoadingRecommendations(false)
      }

      setRecommendations(recsWithImages)
      setIsLoadingRecommendations(false)

      setShowSummary(true)
      toast.success("Analisis berita berhasil")

      if (user) {
        await addDoc(collection(db, "users", user.uid, "summaries"), {
          title: generateTitle(inputText),
          text: inputText,
          summary: data.summary,
          recommendations: recsWithImages.map((rec) => ({
            article_id: rec.article_id,
            category: rec.category,
            similarity_score: rec.similarity_score,
            source_url: rec.source_url,
            imageUrl: rec.imageUrl,
          })),
          createdAt: serverTimestamp(),
        })
      }

      const shareId = nanoid(10) // misal hasil: "ab3f9d12c"

      await addDoc(collection(db, "shared_summaries"), {
        shareId,
        text: inputText,
        summary: data.summary,
        recommendations: recsWithImages,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error(error)
      toast.error("Gagal menganalisis berita")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard
      .writeText(summary)
      .then(() => toast.success("Teks berhasil disalin"))
      .catch(() => toast.error("Gagal menyalin teks"))
  }

  const handleExport = (format: string) => {
    if (!inputText || !summary) {
      toast.error("Tidak ada data untuk diekspor")
      return
    }

    toast.success(`Mengekspor ke format ${format.toUpperCase()}`)
    setShowExportOptions(false)

    const combinedText = `Teks Asli:\n${inputText}\n\nHasil Ringkasan:\n${summary}`

    if (format === "txt") {
      const blob = new Blob([combinedText], { type: "text/plain" })
      saveAs(blob, "newsalyze-summary.txt")
    }

    if (format === "pdf") {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const margin = 10
      const maxLineWidth = pageWidth - margin * 2

      doc.setFont("times", "normal")
      doc.setFontSize(12)

      let y = margin

      doc.text("Teks Asli:", margin, y)
      y += 8
      doc.setFontSize(11)
      const inputLines = doc.splitTextToSize(inputText, maxLineWidth)
      inputLines.forEach((line) => {
        if (y + 6 > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y, { align: "justify" })
        y += 6
      })

      y += 8
      doc.setFontSize(12)
      if (y + 6 > pageHeight - margin) {
        doc.addPage()
        y = margin
      }
      doc.text("Hasil Ringkasan:", margin, y)
      y += 8

      doc.setFontSize(11)
      const summaryLines = doc.splitTextToSize(summary, maxLineWidth)
      summaryLines.forEach((line) => {
        if (y + 6 > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y, { align: "justify" })
        y += 6
      })

      doc.save("newsalyze-summary.pdf")
    }
  }

  const handleExportDocx = () => {
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun({ text: "Teks Asli:", bold: true, size: 28 })],
            }),
            ...inputText.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, size: 24 })],
                  alignment: "JUSTIFIED",
                }),
            ),
            new Paragraph({ text: "" }),
            new Paragraph({
              children: [new TextRun({ text: "Hasil Ringkasan:", bold: true, size: 28 })],
            }),
            ...summary.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, size: 24 })],
                  alignment: "JUSTIFIED",
                }),
            ),
          ],
        },
      ],
    })

    Packer.toBlob(doc)
      .then((blob) => {
        saveAs(blob, "newsalyze-summary.docx")
        toast.success("Berhasil ekspor ke DOCX")
      })
      .catch(() => {
        toast.error("Gagal ekspor ke DOCX")
      })
  }

  const handleFocus = () => {
    if (inputText.length > 0) {
      setIsExpanded(true)
    }
  }

  function formatTitleFromId(id: string): string {
    const parts = id.split("-").slice(1) // buang timestamp
    return parts.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  }

  function capitalizeSentences(text: string): string {
    return text
      .split(/([.!?])\s*/) // pisahkan berdasarkan tanda akhir kalimat
      .map((part, i, arr) => {
        if (i % 2 === 0) {
          return part.trim().charAt(0).toUpperCase() + part.trim().slice(1)
        } else {
          return part // bagian tanda baca dan spasi setelahnya
        }
      })
      .join("")
      .trim()
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-semibold">Newsalyze</h1>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <img src={photoUrl || "/placeholder.svg"} alt="User avatar" className="h-8 w-8 rounded-full" />
                {username && <span className="font-medium text-sm">{username}</span>}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditProfile}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Edit Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-4 flex flex-col">
        {showSummary ? (
          <div className="mx-auto w-full max-w-3xl space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Hasil Ringkasan</h2>
            </div>

            {/* TEKS ASLI */}
            <div className="bg-gray-100 p-4 border border-gray-300 rounded-lg">
              <h3 className="font-semibold mb-2">Teks Asli:</h3>
              {inputText.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-gray-800 mb-2">
                  {para}
                </p>
              ))}
            </div>

            {/* RINGKASAN */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Ringkasan:</h3>
                {summary.split("\n\n").map((para, i) => (
                  <p key={i}>{para}</p>
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
            <div className="bg-white p-6 border border-gray-200 rounded-lg space-y-4 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold text-lg mb-2">Rekomendasi Berita untuk Anda</h3>

              {isLoadingRecommendations ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
                  <p className="text-sm text-gray-600">Sedang memproses rekomendasi berita...</p>
                </div>
              ) : recommendations.length > 0 ? (
                recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-b-0">
                    <img
                      src={rec.imageUrl || "/placeholder.svg"}
                      alt="Thumbnail Berita"
                      className="w-24 h-16 object-cover rounded-md"
                      onError={(e) => {
                        ;(e.target as HTMLImageElement).src = "/placeholder.png"
                      }}
                    />

                    <div className="flex flex-col">
                      <a
                        href={rec.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-sm text-blue-600 hover:underline"
                      >
                        {formatTitleFromId(rec.article_id)}
                      </a>

                      <span className="text-xs text-gray-500 mt-1">Kategori : {capitalizeSentences(rec.category)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Belum ada rekomendasi tersedia.</p>
              )}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-6 pt-16 w-full">
            <h2 className="text-2xl font-bold text-center">Analisa berita Anda disini!</h2>

            <div className="w-full max-w-xl mx-auto">
              <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="w-full">
                  <textarea
                    ref={textareaRef}
                    placeholder="Silahkan isi berita yang ingin Anda ringkas..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onFocus={handleFocus}
                    className={`w-full resize-none border-0 p-4 text-gray-900 shadow-none focus-visible:ring-0 focus:outline-none ${
                      isExpanded ? "min-h-[150px] max-h-[300px]" : "h-[52px]"
                    }`}
                    style={{
                      overflowY: isExpanded ? "auto" : "hidden",
                      display: "block",
                      transition: "height 0.3s ease",
                    }}
                  />
                </div>

                <div className="flex items-center justify-between bg-white px-3 py-2">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-black hover:bg-gray-200"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        style={{ display: "none" }}
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                      />
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <Button
                      onClick={handleSummarize}
                      disabled={isLoading}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-md px-4 py-1"
                    >
                      {isLoading ? "Memproses..." : "Ringkaskan"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
