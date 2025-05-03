"use client"

import { useState } from "react"
import { ChevronDown, LogOut, Plus, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function DashboardContent() {
  const [inputValue, setInputValue] = useState("")

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center">
          <SidebarTrigger className="lg:hidden">
            <ChevronDown className="h-5 w-5" />
          </SidebarTrigger>
          <h1 className="ml-2 text-xl font-semibold">Newsalyze</h1>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/dashboard1-40RfTICtvelImMLr86fJR0LnVJUgPQ.png?avatar=true"
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
              <DropdownMenuItem>
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
          <div className="flex w-full max-w-2xl flex-col gap-4">
            <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2">
              <Plus className="h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Else Type Your Idea here..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="flex gap-2">
              <Button className="bg-blue-900 hover:bg-blue-800">Summarize</Button>
              <Button className="bg-blue-900 hover:bg-blue-800">Sentiment</Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
