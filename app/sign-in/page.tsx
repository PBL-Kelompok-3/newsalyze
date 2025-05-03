import Link from "next/link"
import { SignInForm } from "@/components/sign-in-form"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Masuk</h1>
          <p className="mt-2 text-sm text-muted-foreground">Masuk ke akun Anda untuk melanjutkan</p>
        </div>
        <SignInForm />
        <div className="text-center text-sm">
          Belum punya akun?{" "}
          <Link href="/sign-up" className="font-medium text-primary hover:underline">
            Daftar
          </Link>
        </div>
      </div>
    </div>
  )
}
