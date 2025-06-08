"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, User, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("User Name");
  const [profileImage, setProfileImage] = useState<string>(
    "https://i.pinimg.com/736x/d2/e3/69/d2e369e5c82b185a2feffcd9da115234.jpg"
  );
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { label: "Hot Topik", icon: "🔥" },
    { label: "Showbiz", icon: "🎤" },
    { label: "Olahraga", icon: "⚽" },
    { label: "Teknologi", icon: "💻" },
    { label: "Hiburan", icon: "🎬" },
    { label: "Inspirasi", icon: "💡" },
  ];

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.username || ""); // bisa juga displayName
        setSelectedCategories(data.preferred_categories || []);
        if (data.photoURL) {
          setProfileImage(data.photoURL);
        }
      }
    };

    fetchUserData();
  }, []);


  const handleCategoryClick = (label: string) => {
    const labelLower = label.toLowerCase();

    if (selectedCategories.includes(labelLower)) {
      setSelectedCategories(selectedCategories.filter((cat) => cat !== labelLower));
    } else if (selectedCategories.length < 3) {
      setSelectedCategories([...selectedCategories, labelLower]);
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan!");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran gambar maksimal 2MB!");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/upload-gcs", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfileImage(data.url);
    } catch (err) {
      console.error("Upload ke GCS gagal:", err);
    }
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.error("User not logged in");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Update profile di Firebase Auth
      await updateProfile(user, {
        displayName: name,
        photoURL: profileImage,
      });

      // 2. Simpan preferensi kategori di Firestore
      await setDoc(
          doc(db, "users", user.uid),
          {
            username: name,
            photoURL: profileImage,
            preferred_categories: selectedCategories,
            updated_at: serverTimestamp(),
          },
          { merge: true }
      );

      router.push("/dashboard");
    } catch (error) {
      console.error("Gagal menyimpan perubahan:", error);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-xl">
        <Card className="overflow-hidden shadow-md">
          <CardHeader className="border-b bg-white pb-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="w-16 flex justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-black hover:text-gray-900"
                  onClick={() => router.back()}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="flex-1 text-center text-xl font-semibold text-gray-900">
                Edit Profil
              </CardTitle>
              <div className="w-16" />
            </div>
          </CardHeader>

          <CardContent className="bg-white p-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Profile Photo */}
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile"
                  />
                  <AvatarFallback className="bg-gray-100 text-black">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>

                <Button
                  size="icon"
                  className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-black shadow-md hover:bg-gray-700"
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
                <Label htmlFor="name" className="text-sm font-semibold">
                  Nama
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                  className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                />
              </div>

              {/* Category Selection */}
              <div className="w-full">
                <div className="mb-4 text-left">
                  <h2 className="text-sm font-semibold">
                    Pilih kategori berita yang ingin Anda ubah
                  </h2>
                  <p className="text-sm text-indigo-600 mt-1">
                    Dipilih: {selectedCategories.length}/3
                  </p>
                </div>

                <div className="flex flex-col space-y-3">
                  {categories.map((category) => {
                    const isSelected = selectedCategories.includes(category.label.toLowerCase());
                    return (
                      <div
                        key={category.label}
                        onClick={() => handleCategoryClick(category.label)}
                        className={`flex cursor-pointer items-center space-x-3 rounded-lg border p-3 shadow-sm transition-all hover:shadow-md ${
                          isSelected
                            ? "border-black bg-blue-50 shadow-md"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div className="text-2xl">{category.icon}</div>
                        <span className="flex-1 text-sm font-medium text-gray-700">
                          {category.label}
                        </span>
                        {isSelected && (
                          <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-600 text-white">
                            <Check className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <Button
                className="mt-6 w-full bg-black py-2 text-white transition-colors hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}