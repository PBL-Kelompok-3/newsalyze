"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Plus, Settings, Download, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import Logo from "@/components/logo";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useSummary } from "@/app/context/SummaryContext"
import { generateTitle } from "@/lib/utils";

export function DashboardContent() {
  const { inputText, setInputText, summary, setSummary, showSummary, setShowSummary } = useSummary()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (textareaRef.current) {
      const shouldExpand =
          inputText.length > 100 || inputText.split("\n").length > 3;
      setIsExpanded(shouldExpand);
    }
  }, [inputText]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setPhotoUrl(data.photoURL || null);
        setUsername(data.username || null);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (summary) {
      setShowSummary(true);
    }
  }, [summary]);

  const handleEditProfile = () => router.push("/profile/edit");

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Berhasil logout");
      router.replace("/sign-in");
    } catch (error) {
      toast.error("Gagal logout");
    }
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      toast.error("Silakan masukkan berita atau URL berita");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://34.124.234.224:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      if (!res.ok) throw new Error("Gagal fetch ringkasan");

      const data = await res.json();
      setSummary(data.summary);
      setShowSummary(true);
      toast.success("Analisis berita berhasil");

      // Simpan ke Firestore
      const user = auth.currentUser;
      if (user) {
        await addDoc(collection(db, "users", user.uid, "summaries"), {
          title: generateTitle(inputText),
          text: inputText,
          summary: data.summary,
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Gagal menganalisis berita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(summary)
      .then(() => toast.success("Teks berhasil disalin"))
      .catch(() => toast.error("Gagal menyalin teks"));
  };

  const handleExport = (format: string) => {
    toast.success(`Mengekspor ke format ${format.toUpperCase()}`);
    setShowExportOptions(false);

    if (format === "txt") {
      const blob = new Blob([summary], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `newsalyze-summary.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleFocus = () => {
    if (inputText.length > 0) {
      setIsExpanded(true);
    }
  };

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
                <img
                    src={photoUrl || "/placeholder.svg"}
                    alt="User avatar"
                    className="h-8 w-8 rounded-full"
                />
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
                    <DropdownMenuItem onClick={() => handleExport("pdf")}>
                      .pdf
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("docx")}>
                      .docx
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport("txt")}>
                      .txt
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Rekomendasi Berita */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg space-y-4 max-h-[400px] overflow-y-auto">
              <h3 className="font-semibold text-lg mb-2">
                Rekomendasi Berita untuk Anda
              </h3>
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 border-b pb-4 last:border-b-0"
                >
                  <img
                    src={`https://source.unsplash.com/100x100/?news,${i}`} // Ganti dengan URL thumbnail berita asli
                    alt="Thumbnail Berita"
                    className="w-24 h-16 object-cover rounded-md"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      Judul berita menarik ke-{i + 1}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Kategori •{" "}
                      {new Date().toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-6 pt-16 w-full">
            <h2 className="text-2xl font-bold text-center">
              Analisa berita Anda disini!
            </h2>

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
                    >
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
  );
}
