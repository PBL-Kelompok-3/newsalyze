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
import { auth } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import Logo from "@/components/logo";

export function DashboardContent() {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [showExportOptions, setShowExportOptions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (textareaRef.current) {
      const shouldExpand =
        inputValue.length > 100 || inputValue.split("\n").length > 3;
      setIsExpanded(shouldExpand);
    }
  }, [inputValue]);

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
    if (!inputValue.trim()) {
      toast.error("Silakan masukkan berita atau URL berita");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("http://34.87.27.37:8000/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputValue }),
      });

      if (!res.ok) throw new Error("Gagal fetch ringkasan");

      const data = await res.json();
      setSummaryText(data.summary);
      setShowSummary(true);
      toast.success("Analisis berita berhasil");
    } catch (error) {
      console.error(error);
      toast.error("Gagal menganalisis berita");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => toast.success("Teks berhasil disalin"))
      .catch(() => toast.error("Gagal menyalin teks"));
  };

  const handleExport = (format: string) => {
    toast.success(`Mengekspor ke format ${format.toUpperCase()}`);
    setShowExportOptions(false);

    if (format === "txt") {
      const blob = new Blob([summaryText], { type: "text/plain" });
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
    if (inputValue.length > 0) {
      setIsExpanded(true);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          <h1 className="text-xl font-semibold">Newsalyze</h1>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="https://i.pinimg.com/736x/d2/e3/69/d2e369e5c82b185a2feffcd9da115234.jpg"
                  alt="User avatar"
                  className="h-8 w-8 rounded-full"
                />
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
              {inputValue.split("\n\n").map((para, i) => (
                <p key={i} className="text-sm text-gray-800 mb-2">
                  {para}
                </p>
              ))}
            </div>

            {/* RINGKASAN */}
            <div className="bg-white p-6 border border-gray-200 rounded-lg flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Ringkasan:</h3>
                {summaryText.split("\n\n").map((para, i) => (
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
                    placeholder="Else Type Your Idea here..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
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
                      {isLoading ? "Processing..." : "Summarize"}
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
