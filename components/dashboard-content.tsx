"use client"

import { useState } from "react"
import { LogOut, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"


export function DashboardContent() {
  const [inputValue, setInputValue] = useState("")

  const router = useRouter()

const handleLogout = async () => {
  try {
    await signOut(auth)
    toast.success("Berhasil logout")
    router.replace("/sign-in")
  } catch (error) {
    toast.error("Gagal logout")
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
                  src="https://i.pinimg.com/736x/8e/1f/7e/8e1f7ec445966723f91ace7760edab7b.jpg"
                  alt="User avatar"
                  className="h-8 w-8 rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
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
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center space-y-8 pt-20">
          <h2 className="text-3xl font-bold">Analisa berita Anda disini!</h2>
          <div className="w-full max-w-2xl">
            <div className="flex items-center gap-4">
              <div className="flex flex-1 items-center gap-2 rounded-md border bg-white px-3 py-2">
                <Plus className="h-5 w-5 text-gray-400" />
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Else Type Your Idea here..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="bg-blue-900 hover:bg-blue-800">Summarize</Button>
                <Button className="bg-blue-900 hover:bg-blue-800">Sentiment</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
