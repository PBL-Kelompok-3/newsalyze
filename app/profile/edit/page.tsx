"use client"

import { useState, useRef, type ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EditProfilePage() {
  const router = useRouter()
  const [name, setName] = useState("User Name")
  const [profileImage, setProfileImage] = useState<string>(
    "https://i.pinimg.com/736x/d2/e3/69/d2e369e5c82b185a2feffcd9da115234.jpg",
  )
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const imageUrl = URL.createObjectURL(file)
      setProfileImage(imageUrl)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      router.push("/dashboard")
    } catch (error) {
      console.error("Failed to save profile changes", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card className="overflow-hidden shadow-md">
          <CardHeader className="border-b bg-white pb-6 pt-6 text-center">
            <CardTitle className="text-xl font-semibold text-gray-900">Edit Profil</CardTitle>
          </CardHeader>

          <CardContent className="bg-white p-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Profile Photo */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile" />
                  <AvatarFallback className="bg-blue-100 text-blue-800">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-blue-600 shadow-md hover:bg-blue-700"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {/* Name */}
              <div className="w-full space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Save Button */}
              <Button
                className="mt-6 w-full bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
