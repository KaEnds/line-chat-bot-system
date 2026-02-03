"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter, useParams, useSearchParams, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// Interface สำหรับข้อมูลหนังสือ (จำลอง)
interface BookData {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverImage: string;
  description: string;
}

export default function BookDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status } = useSession();
  
  const [book, setBook] = useState<BookData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bookId = Array.isArray(params.id) ? params.id[0] : params.id;
  const callbackUrl = `/book-details/${bookId}?title=${searchParams.get('title')}&author=${searchParams.get('author')}&isbn=${searchParams.get('isbn')}&coverImage=${searchParams.get('coverImage')}&description=${searchParams.get('description')}`

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (status === "authenticated") {
      // ตรวจสอบว่าได้รับข้อมูลจาก URL หรือไม่
      const titleFromUrl = searchParams.get('title');
      const authorFromUrl = searchParams.get('author');
      const isbnFromUrl = searchParams.get('isbn');
      const coverImageFromUrl = searchParams.get('coverImage');
      const descriptionFromUrl = searchParams.get('description');

      if (titleFromUrl) {
        // ถ้าได้รับข้อมูลจาก URL ให้ใช้ข้อมูลนั้น
        const urlData: BookData = {
          id: bookId || "url-book",
          title: titleFromUrl,
          author: authorFromUrl || "",
          isbn: isbnFromUrl || "",
          coverImage: coverImageFromUrl || "https://placehold.co/400x600/gray/white?text=No+Cover",
          description: descriptionFromUrl || "No description available",
        };
        setBook(urlData);
        setIsLoading(false);
      } else {
        notFound();
      }
    }


  }, [status, bookId, router, searchParams]);

  // Handler สำหรับปุ่ม "ยื่นคำขอ"
  const handleRequestClick = () => {
    if (!book) return;

    // เราจะสร้าง URL Query String เพื่อ "ส่ง" ข้อมูลไป Autofill
    const queryParams = new URLSearchParams({
      title: book.title,
      author: book.author,
      isbn: book.isbn
    });

    // ส่งผู้ใช้ไปหน้าฟอร์ม พร้อมข้อมูล
    router.push(`/book-request?${queryParams.toString()}`);


  };

  // --- หน้า Loading... ---
  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
        <p className="text-black text-xl font-bold">Loading Book Details...</p>
      </div>
    );
  }

  // --- หน้าแสดงผล (เมื่อโหลดเสร็จ) ---
  if (!book) {
    return notFound(); // กรณีไม่เจอหนังสือ
  }

  return (
    <div className="min-h-screen bg-[#FFB133] p-4 md:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 md:p-8 rounded-lg shadow-md">

        {/* ส่วนแสดงข้อมูล */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* 1. รูปปก (จำลอง) */}
          <div className="md:col-span-1">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-auto rounded-lg shadow-md aspect-[2/3]"
              onError={(e) => (e.currentTarget.src = "https://placehold.co/400x600/gray/white?text=Error")}
            />
          </div>

          {/* 2. รายละเอียด */}
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
            <p className="text-xl text-gray-700">by {book.author}</p>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN/ISSN</Label>
              <Input id="isbn" value={book.isbn} readOnly className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border">
                {book.description}
              </p>
            </div>

            {/* 3. ปุ่มยื่นคำขอ */}
            <Button
              onClick={handleRequestClick}
              className="w-full text-lg py-6"
            >
              ยื่นคำขอซื้อหนังสือเล่มนี้
            </Button>


          </div>
        </div>
      </div>
    </div>


  );
}