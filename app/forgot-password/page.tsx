import Link from "next/link"
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Lupa Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">Masukkan email Anda untuk menerima link reset password</p>
        </div>
        <ForgotPasswordForm />
        <div className="text-center text-sm">
          Ingat password Anda?{" "}
          <Link href="/sign-in" className="font-medium text-primary hover:underline">
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    </div>
  )
}
