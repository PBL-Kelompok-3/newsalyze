"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { LogOut, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "react-hot-toast"

export function DashboardContent() {
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      // Check if content is long enough to expand
      const shouldExpand = inputValue.length > 100 || inputValue.split("\n").length > 3
      setIsExpanded(shouldExpand)
    }
  }, [inputValue])

  const handleEditProfile = () => {
    router.push("/profile/edit")
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast.success("Berhasil logout")
      router.replace("/sign-in")
    } catch (error) {
      toast.error("Gagal logout")
    }
  }

  const handleSummarize = async () => {
    if (!inputValue.trim()) {
      toast.error("Silakan masukkan berita atau URL berita")
      return
    }

    setIsLoading(true)
    try {
      // Simulasi proses analisis berita
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Analisis berita berhasil")
      // Di sini Anda bisa menambahkan logika untuk menampilkan hasil analisis
    } catch (error) {
      toast.error("Gagal menganalisis berita")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFocus = () => {
    if (inputValue.length > 0) {
      setIsExpanded(true)
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center gap-2">
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
      <main className="flex-1 overflow-auto p-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center space-y-6 pt-16">
          <h2 className="text-2xl font-bold text-center">Analisa berita Anda disini!</h2>

          <div className="w-full max-w-xl mx-auto">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Area input teks */}
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

              {/* Area tombol di bawah - selalu terlihat */}
              <div className="flex items-center justify-between border-t border-white bg-white px-3 py-2">
                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-200">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div>
                  <Button
                    onClick={handleSummarize}
                    disabled={isLoading}
                    className="bg-black hover:bg-gray-700 text-white rounded-md px-4 py-1"
                  >
                    {isLoading ? "Processing..." : "Summarize"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
