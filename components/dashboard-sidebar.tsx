"use client"

import { useState } from "react"
import { BookOpen, PlusCircle, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

type HistoryItem = {
  id: string
  title: string
  isSelected?: boolean
}

export function DashboardSidebar() {
  const { state } = useSidebar()
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

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar className="border-r" collapsible="icon">
      <div className="flex h-14 items-center justify-between border-b px-4">
        <div className="flex items-center">
          <SidebarTrigger />
        </div>
      </div>
      <SidebarContent>
        <div className="p-2">
          <Button
            variant="outline"
            className={`w-full justify-start gap-2 mb-2 ${isCollapsed ? "justify-center" : ""}`}
          >
            <PlusCircle className="h-4 w-4" />
            {!isCollapsed && <span>New Chat</span>}
          </Button>

          {!isCollapsed && (
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="pl-8" />
            </div>
          )}

          {isCollapsed && (
            <Button variant="ghost" size="icon" className="w-full mb-2">
              <Search className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="py-2">
          {!isCollapsed && (
            <div className="px-4 py-2">
              <h2 className="text-sm font-medium">History Hari Ini</h2>
            </div>
          )}
          <SidebarMenu>
            {historyItems.today.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  isActive={item.isSelected}
                  onClick={() => selectHistoryItem(item.id)}
                  className={item.isSelected ? "bg-blue-900 text-white hover:bg-blue-900 hover:text-white" : ""}
                >
                  <BookOpen className="h-4 w-4" />
                  {!isCollapsed && <span>{item.title}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {!isCollapsed && (
          <>
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
          </>
        )}
      </SidebarContent>
    </Sidebar>
  )
}
