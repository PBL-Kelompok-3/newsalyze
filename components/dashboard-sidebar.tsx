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
      { id: "1", title: "Sign in dan Sign up", isSelected: true },
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

  const renameHistoryItem = (id: string, newTitle: string) => {
    const updateSection = (items: HistoryItem[]) =>
      items.map((item) => (item.id === id ? { ...item, title: newTitle } : item))

    setHistoryItems({
      today: updateSection(historyItems.today),
      lastWeek: updateSection(historyItems.lastWeek),
      older: updateSection(historyItems.older),
    })
  }

  const deleteHistoryItem = (id: string) => {
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
