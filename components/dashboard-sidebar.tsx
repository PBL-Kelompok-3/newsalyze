"use client"

import { useState } from "react"
import Link from "next/link"
import { BookOpen, Menu } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type HistoryItem = {
  id: string
  title: string
  isSelected?: boolean
}

export function DashboardSidebar() {
  const [historyItems, setHistoryItems] = useState<{
    today: HistoryItem[]
    lastWeek: HistoryItem[]
    older: HistoryItem[]
  }>({
    today: [
      { id: "1", title: "History is Selected", isSelected: true },
      { id: "2", title: "History 1" },
    ],
    lastWeek: [
      { id: "3", title: "History 1" },
      { id: "4", title: "History 1" },
    ],
    older: [
      { id: "5", title: "History 1" },
      { id: "6", title: "History 1" },
    ],
  })

  const selectHistoryItem = (id: string) => {
    const updateSection = (items: HistoryItem[]) =>
      items.map((item) => ({
        ...item,
        isSelected: item.id === id,
      }))

    setHistoryItems({
      today: updateSection(historyItems.today),
      lastWeek: updateSection(historyItems.lastWeek),
      older: updateSection(historyItems.older),
    })
  }

  return (
    <Sidebar className="border-r">
      <div className="flex h-14 items-center border-b px-4">
        <SidebarTrigger>
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        <Link href="/dashboard" className="ml-3 font-semibold">
          Newsalyze
        </Link>
      </div>
      <SidebarContent>
        <div className="py-2">
          <div className="px-4 py-2">
            <h2 className="text-sm font-medium">History Hari Ini</h2>
          </div>
          <SidebarMenu>
            {historyItems.today.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={item.isSelected}
                  onClick={() => selectHistoryItem(item.id)}
                  className={item.isSelected ? "bg-blue-900 text-white hover:bg-blue-900 hover:text-white" : ""}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <div className="py-2">
          <div className="px-4 py-2">
            <h2 className="text-sm font-medium">History Minggu Lalu</h2>
          </div>
          <SidebarMenu>
            {historyItems.lastWeek.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={item.isSelected}
                  onClick={() => selectHistoryItem(item.id)}
                  className={item.isSelected ? "bg-blue-900 text-white hover:bg-blue-900 hover:text-white" : ""}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <div className="py-2">
          <div className="px-4 py-2">
            <h2 className="text-sm font-medium">Beriberi Long History</h2>
          </div>
          <SidebarMenu>
            {historyItems.older.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={item.isSelected}
                  onClick={() => selectHistoryItem(item.id)}
                  className={item.isSelected ? "bg-blue-900 text-white hover:bg-blue-900 hover:text-white" : ""}
                >
                  <BookOpen className="h-4 w-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
