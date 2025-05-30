"use client"

import { useState } from "react"
import { MoreVertical, PlusCircle, Search, Share, Pencil, Star, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { auth, db } from "@/lib/firebase"
import { collection, getDocs, query, where, orderBy } from "firebase/firestore"
import { useEffect } from "react"
import { Timestamp } from "firebase/firestore"
import { doc, updateDoc, getDoc } from "firebase/firestore"
import { deleteDoc } from "firebase/firestore"
import { useSummary } from "@/app/context/SummaryContext"

type HistoryItem = {
  id: string
  title: string
  summary?: string
  isSelected?: boolean
}

export function DashboardSidebar() {
  const { state } = useSidebar()
  const { setSummary, setInputText, setShowSummary } = useSummary()

  const [historyItems, setHistoryItems] = useState<{
    today: HistoryItem[]
    lastWeek: HistoryItem[]
    older: HistoryItem[]
  }>({ today: [], lastWeek: [], older: [] });

  useEffect(() => {
    const fetchHistory = async () => {
      const user = auth.currentUser
      if (!user) return

      const q = query(
          collection(db, "users", user.uid, "summaries"),
          orderBy("createdAt", "desc")
      )

      const snapshot = await getDocs(q)

      const today: HistoryItem[] = []
      const lastWeek: HistoryItem[] = []
      const older: HistoryItem[] = []

      const now = new Date()
      const todayDate = now.toDateString()

      snapshot.forEach((doc) => {
        const data = doc.data()
        const createdAt = data.createdAt?.toDate?.() as Date
        if (!createdAt) return

        const diffDays = Math.floor(
            (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
        )

        const item = {
          id: doc.id,
          title: doc.data().title || "Ringkasan",
          createdAt: doc.data().createdAt?.toDate(),
        };

        if (createdAt.toDateString() === todayDate) {
          today.push(item)
        } else if (diffDays <= 7) {
          lastWeek.push(item)
        } else {
          older.push(item)
        }
      })

      setHistoryItems({ today, lastWeek, older })
    }

    fetchHistory()
  }, [])

  const startNewChat = () => {
    setInputText("")
    setSummary("")
    setShowSummary(false) // << ini penting supaya tampilan reset ke form input
    setHistoryItems(prev => {
      const reset = (items: HistoryItem[]) =>
          items.map(item => ({ ...item, isSelected: false }))
      return {
        today: reset(prev.today),
        lastWeek: reset(prev.lastWeek),
        older: reset(prev.older),
      }
    })
  }

  const selectHistoryItem = async (id: string) => {
    const user = auth.currentUser
    if (!user) return

    const ref = doc(db, "users", user.uid, "summaries", id)
    const docSnap = await getDoc(ref)

    if (docSnap.exists()) {
      const data = docSnap.data()

      const updateSection = (items: HistoryItem[]) =>
          items.map((item) =>
              item.id === id
                  ? { ...item, isSelected: true, summary: data.summary }
                  : { ...item, isSelected: false }
          )

      setHistoryItems({
        today: updateSection(historyItems.today),
        lastWeek: updateSection(historyItems.lastWeek),
        older: updateSection(historyItems.older),
      })

      setSummary(data.summary) // Kirim ke tampilan utama
      setInputText(data.text)

      // OPTIONAL: Kirim summary ke komponen utama
      console.log("Summary dipilih:", data.summary)
    }
  }

  const renameHistoryItem = async (id: string, newTitle: string) => {
    const user = auth.currentUser
    if (!user) return

    // Update di Firestore
    await updateDoc(doc(db, "users", user.uid, "summaries", id), {
      title: newTitle,
    })

    // Update di local state
    const updateSection = (items: HistoryItem[]) =>
        items.map((item) => (item.id === id ? { ...item, title: newTitle } : item))

    setHistoryItems({
      today: updateSection(historyItems.today),
      lastWeek: updateSection(historyItems.lastWeek),
      older: updateSection(historyItems.older),
    })
  }

  const deleteHistoryItem = async (id: string) => {
    const user = auth.currentUser
    if (!user) return

    // Hapus di Firestore
    await deleteDoc(doc(db, "users", user.uid, "summaries", id))

    // Update state lokal
    const filterSection = (items: HistoryItem[]) => items.filter((item) => item.id !== id)
    setHistoryItems({
      today: filterSection(historyItems.today),
      lastWeek: filterSection(historyItems.lastWeek),
      older: filterSection(historyItems.older),
    })
  }


  const isCollapsed = state === "collapsed"

  return (
    <Sidebar className="border-r" collapsible="icon">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center">
          <SidebarTrigger />
        </div>
      </div>
      <SidebarContent>
        <div className="p-2">
          <Button
              onClick={startNewChat}
              variant="outline"
              className={`w-full justify-start gap-2 mb-2 ${isCollapsed ? "justify-center" : ""}`}
          >
            <PlusCircle className="h-4 w-4" />
            {!isCollapsed && <span>Chat Baru</span>}
          </Button>

          {!isCollapsed && (
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Cari Berita..." className="pl-8" />
            </div>
          )}

          {isCollapsed && (
            <Button variant="ghost" size="icon" className="w-full mb-2">
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="py-1">
          {!isCollapsed && (
            <div className="px-4 py-2">
              <h2 className="text-xs font-medium">Hari Ini</h2>
            </div>
          )}
          <SidebarMenu>
            {historyItems.today.map((item) => (
              <SidebarMenuItem key={item.id} className="group">
                <div className="flex items-center w-full">
                  <SidebarMenuButton
                    isActive={item.isSelected}
                    onClick={() => selectHistoryItem(item.id)}
                    className={`${item.isSelected ? "bg-blue-900 text-white hover:bg-blue-900 hover:text-white" : ""} flex-grow`}
                  >
                    {!isCollapsed && <span className="ml-1">{item.title}</span>}
                    {isCollapsed && <span className="w-1 h-1 rounded-full bg-current"></span>}
                  </SidebarMenuButton>

                  {!isCollapsed && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white text-black border-gray-200">
                        <DropdownMenuItem className="flex items-center gap-2 focus:bg-gray-100">
                          <Share className="h-4 w-4" />
                          <span>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 focus:bg-gray-100"
                          onClick={() => {
                            const newTitle = prompt("Masukkan nama baru:", item.title)
                            if (newTitle) renameHistoryItem(item.id, newTitle)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          <span>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="flex items-center gap-2 focus:bg-gray-100">
                          <Star className="h-4 w-4" />
                          <span>Favorite</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-red-500 focus:bg-gray-100 focus:text-red-500"
                          onClick={() => deleteHistoryItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {!isCollapsed && (
          <>
            <div className="py-2">
              <div className="px-4 py-2">
                <h2 className="text-xs font-medium">Minggu Lalu</h2>
              </div>
              <SidebarMenu>
                {historyItems.lastWeek.map((item) => (
                  <SidebarMenuItem key={item.id} className="group">
                    <div className="flex items-center w-full">
                      <SidebarMenuButton
                        isActive={item.isSelected}
                        onClick={() => selectHistoryItem(item.id)}
                        className={`${item.isSelected ? "bg-blue-900 text-white hover:bg-blue-900 hover:text-white" : ""} flex-grow`}
                      >
                        <span className="ml-1">{item.title}</span>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white text-black border-gray-200">
                          <DropdownMenuItem className="flex items-center gap-2 focus:bg-gray-100">
                            <Share className="h-4 w-4" />
                            <span>Share</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 focus:bg-gray-100"
                            onClick={() => {
                              const newTitle = prompt("Masukkan nama baru:", item.title)
                              if (newTitle) renameHistoryItem(item.id, newTitle)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 focus:bg-gray-100">
                            <Star className="h-4 w-4" />
                            <span>Favorite</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-500 focus:bg-gray-100 focus:text-red-500"
                            onClick={() => deleteHistoryItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            <div className="py-2">
              <div className="px-4 py-2">
                <h2 className="text-xs font-medium">Bulan Sebelumnya</h2>
              </div>
              <SidebarMenu>
                {historyItems.older.map((item) => (
                  <SidebarMenuItem key={item.id} className="group">
                    <div className="flex items-center w-full">
                      <SidebarMenuButton
                        isActive={item.isSelected}
                        onClick={() => selectHistoryItem(item.id)}
                        className={`${item.isSelected ? "bg-blue-900 text-white hover:bg-blue-900 hover:text-white" : ""} flex-grow`}
                      >
                        <span className="ml-1">{item.title}</span>
                      </SidebarMenuButton>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white text-black border-gray-200">
                          <DropdownMenuItem className="flex items-center gap-2 focus:bg-gray-100">
                            <Share className="h-4 w-4" />
                            <span>Share</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 focus:bg-gray-100"
                            onClick={() => {
                              const newTitle = prompt("Masukkan nama baru:", item.title)
                              if (newTitle) renameHistoryItem(item.id, newTitle)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            <span>Rename</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2 focus:bg-gray-100">
                            <Star className="h-4 w-4" />
                            <span>Favorite</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="flex items-center gap-2 text-red-500 focus:bg-gray-100 focus:text-red-500"
                            onClick={() => deleteHistoryItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
