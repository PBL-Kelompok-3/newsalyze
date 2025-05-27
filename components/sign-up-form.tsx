"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from 'react-hot-toast'
import { sendEmailVerification, fetchSignInMethodsForEmail } from "firebase/auth"
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore"

const db = getFirestore()

const formSchema = z
  .object({
    name: z.string().min(2, {
      message: "Nama minimal 2 karakter",
    }),
    email: z.string().email({
      message: "Email tidak valid",
    }),
    password: z.string().min(6, {
      message: "Password minimal 6 karakter",
    }),
    confirmPassword: z.string().min(6, {
      message: "Konfirmasi password minimal 6 karakter",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  })

export function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

async function onSubmit(values: z.infer<typeof formSchema>) {
  setIsLoading(true)

  try {
  const signInMethods = await fetchSignInMethodsForEmail(auth, values.email);

  if (signInMethods.includes("google.com")) {
    toast.error("Email ini sudah digunakan untuk akun Google. Silakan login dengan Google.");
    return;
  }
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    )

    await updateProfile(userCredential.user, {
      displayName: values.name,
    })

    // Simpan data tambahan ke Firestore
    await setDoc(doc(db, "users", userCredential.user.uid), {
      user_id: userCredential.user.uid,
      username: values.name,
      join_date: serverTimestamp(),
      location: "Indonesia",
      preferred_categories: []
    })

    await sendEmailVerification(userCredential.user)

    toast.success("Silahkan cek email anda untuk proses verifikasi.")

    await new Promise((resolve) => setTimeout(resolve, 1500))

    router.push("/sign-in")
  } catch (error: any) {
    let errorMessage = "Terjadi kesalahan saat mendaftar."

    if (error.code === "auth/email-already-in-use") {
      errorMessage = "Email sudah terdaftar. Silakan gunakan email lain."
      form.setError("email", {
        type: "manual",
        message: errorMessage,
      })
    } else if (error.code === "auth/invalid-email") {
      errorMessage = "Format email tidak valid."
      form.setError("email", {
        type: "manual",
        message: errorMessage,
      })
    } else if (error.code === "auth/weak-password") {
      errorMessage = "Password terlalu lemah."
      form.setError("password", {
        type: "manual",
        message: errorMessage,
      })
    }

    toast.error(errorMessage)
  } finally {
    setIsLoading(false)
  }
}  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama</FormLabel>
              <FormControl>
                <Input placeholder="Nama Lengkap" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="nama@gmail.com" {...field} />
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
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konfirmasi Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Memproses..." : "Daftar"}
        </Button>
      </form>
    </Form>
  )
}
