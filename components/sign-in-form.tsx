"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import {
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  fetchSignInMethodsForEmail
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase";
import { getDoc, doc, setDoc, serverTimestamp } from "firebase/firestore";

const formSchema = z.object({
  email: z.string().email({
    message: "Email tidak valid",
  }),
  password: z.string().min(6, {
    message: "Password minimal 6 karakter",
  }),
});

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

async function onSubmit(values: z.infer<typeof formSchema>) {
  setIsLoading(true)

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      values.email,
      values.password
    )

    const user = userCredential.user

    if (!user.emailVerified) {
      await signOut(auth)
      toast.error("Email belum diverifikasi. Cek kotak masuk Anda.")
      return
    }

    // 🔍 Cek preferred_categories di Firestore
    const userDocRef = doc(db, "users", user.uid)
    const userDocSnap = await getDoc(userDocRef)

    if (!userDocSnap.exists()) {
      // fallback ke category-selection kalau data gak ditemukan
      router.push("/category-selection")
      return
    }

    const data = userDocSnap.data()
    const categories = data?.preferred_categories

    if (!categories || categories.length === 0) {
      router.push("/category-selection")
    } else {
      router.push("/dashboard")
    }

    toast.success("Login berhasil!")
  } catch {
    toast.error("Detail akun salah!")
  } finally {
    setIsLoading(false)
  }
}


async function handleGoogleSignIn() {
  try {
    setIsGoogleLoading(true);
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Cek apakah email-nya juga sudah pernah dipakai dengan email+password
    const signInMethods = await fetchSignInMethodsForEmail(auth, user.email!);

    if (signInMethods.includes("password") && !signInMethods.includes("google.com")) {
      // berarti user daftar manual, jangan bikin akun Google baru
      toast.error("Email ini sudah digunakan untuk akun manual. Silakan login dengan email dan password.");
      await signOut(auth);
      return;
    }

    // Lanjut simpan ke Firestore jika belum ada
    const userDocRef = doc(db, "users", user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      // Buat user baru di Firestore
      await setDoc(userDocRef, {
        user_id: user.uid,
        username: user.displayName || "User",
        join_date: serverTimestamp(),
        location: "Indonesia",
        preferred_categories: [], // default kosong
      })

      return router.push("/category-selection")
    }

    const userData = userDocSnap.data()
    const categories = userData?.preferred_categories

    if (!categories || categories.length === 0) {
      router.push("/category-selection")
    } else {
      router.push("/dashboard")
    }
    } catch {
      toast.error("Login gagal!");
    } finally {
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="contoh@gmail.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-primary"
                  >
                    Lupa password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </Form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Atau masuk dengan
          </span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading}
        className="w-full"
      >
        {isGoogleLoading ? (
          "Memproses..."
        ) : (
          <div className="flex items-center justify-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              className="h-5 w-5"
            >
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Masuk dengan Google
          </div>
        )}
      </Button>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={async () => {
            if (auth.currentUser && !auth.currentUser.emailVerified) {
              await sendEmailVerification(auth.currentUser);
              toast.success("Email verifikasi dikirim ulang.");
            } else {
              toast.error("Login dulu atau email sudah diverifikasi.");
            }
          }}
        >
          Kirim Ulang Verifikasi Email
        </Button>
      </div>
    </div>
  );
}
