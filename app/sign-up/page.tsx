"use client"

import Link from "next/link"
import { SignUpForm } from "@/components/sign-up-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase"

export default function SignUpPage() {
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user && user.emailVerified) {
        router.replace("/dashboard") // gunakan replace agar tidak bisa "go back"
      }
    })

    return () => unsubscribe()
  }, [router])
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Daftar</h1>
          <p className="mt-2 text-sm text-muted-foreground">Buat akun baru untuk mulai menggunakan web</p>
        </div>
        <SignUpForm />
        <div className="text-center text-sm">
          Sudah punya akun?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Masuk
          </Link>
        </div>
      </div>
    </div>
  )
}
