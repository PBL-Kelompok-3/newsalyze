"use client"

import { DashboardContent } from "@/components/dashboard-content"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"
import { toast } from "react-hot-toast"
import { SummaryProvider } from "@/app/context/SummaryContext"

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const user = auth.currentUser

    if (!user) {
      router.push("/sign-in")
      return
    }

    if (!user.emailVerified) {
      toast.error("Verifikasi email diperlukan.")
      signOut(auth)
      router.push("/sign-in")
    }
  }, [router])

  return (
      <SidebarProvider defaultOpen={true}>
        <SummaryProvider>
          <div className="flex h-screen w-full overflow-hidden">
            <DashboardSidebar />
            <DashboardContent />
          </div>
        </SummaryProvider>
      </SidebarProvider>
  )
}
