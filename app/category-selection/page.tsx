"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

// Daftar kategori berita
const newsCategories = [
  { id: "hotnews", name: "Hot Topik", icon: "🔥" },
  { id: "showbiz", name: "Showbiz", icon: "🎤" },
  { id: "olahraga", name: "Olahraga", icon: "⚽" },
  { id: "teknologi", name: "Teknologi", icon: "💻" },
  { id: "hiburan", name: "Hiburan", icon: "🎬" },
  { id: "inspirasi", name: "Inspirasi", icon: "💡" },
  { id: "pendidikan", name: "Pendidikan", icon: "🎓" },
  { id: "internasional", name: "Internasional", icon: "🌍" },
];

export default function CategorySelectionPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const MAX_SELECTIONS = 3;
  const router = useRouter();
  const { toast } = useToast();

  // Fungsi untuk menangani pemilihan kategori
  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      // Jika kategori sudah dipilih, hapus dari pilihan
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      }

      // Jika belum mencapai batas maksimal, tambahkan ke pilihan
      if (prev.length < MAX_SELECTIONS) {
        return [...prev, categoryId];
      }

      // Jika sudah mencapai batas maksimal, tampilkan pesan
      toast({
        title: "Batas Maksimal",
        description: `Anda hanya dapat memilih maksimal ${MAX_SELECTIONS} kategori`,
        variant: "destructive",
      });
      return prev;
    });
  };

  // Fungsi untuk melanjutkan ke dashboard
  const handleContinue = () => {
    if (selectedCategories.length === 0) {
      toast({
        title: "Pilih Kategori",
        description: "Silakan pilih minimal 1 kategori berita",
        variant: "destructive",
      });
      return;
    }

    // Simpan kategori yang dipilih (bisa disimpan ke localStorage atau API)
    localStorage.setItem(
      "selectedNewsCategories",
      JSON.stringify(selectedCategories)
    );

    // Redirect ke dashboard
    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Pilih Kategori Berita
          </h1>
          <p className="mt-2 text-gray-600">
            Pilih maksimal {MAX_SELECTIONS} kategori berita yang ingin Anda
            ikuti
          </p>
          <p className="mt-1 text-sm text-blue-600">
            Dipilih: {selectedCategories.length}/{MAX_SELECTIONS}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {newsCategories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <Card
                key={category.id}
                className={`relative cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? "border-2 border-gray-700 bg-blue-50"
                    : "border border-gray-200 bg-white"
                }`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-6">
                  {isSelected && (
                    <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className="mb-2 text-3xl">{category.icon}</div>
                  <h3 className="text-center font-medium">{category.name}</h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleContinue}
            className="w-full max-w-md bg-black py-6 text-lg font-medium hover:bg-gray-700 sm:py-5"
            disabled={selectedCategories.length === 0}
          >
            Lanjutkan
          </Button>
        </div>
      </div>
    </div>
  );
}
