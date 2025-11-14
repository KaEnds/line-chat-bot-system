"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams, notFound } from "next/navigation";
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

// --- ข้อมูลจำลอง (Mock Data) ---
// ในอนาคต เราจะยิง API ไปที่ Backend Python เพื่อดึงข้อมูลนี้
const fetchMockBookData = async (id: string): Promise<BookData | null> => {
console.log("Fetching data for book ID:", id);
// จำลองการดีเลย์ของ API
await new Promise(resolve => setTimeout(resolve, 500));

if (id === "123") {
return {
id: "123",
title: "The Silent Patient",
author: "Alex Michaelides",
isbn: "978-1-250-30169-7",
coverImage: "https://m.media-amazon.com/images/I/81JJPDNlxSL.jpg",
description: "A shocking psychological thriller of a woman's act of violence against her husband—and of the therapist obsessed with uncovering her motive."
};
}
return null; // ถ้าหา ID ไม่เจอ
};
// --- สิ้นสุดข้อมูลจำลอง ---

export default function BookDetailsPage() {
const router = useRouter();
const params = useParams(); // Hook สำหรับดึง [id] จาก URL
const { status } = useSession(); // ตรวจสอบสิทธิ์

const [book, setBook] = useState<BookData | null>(null);
const [isLoading, setIsLoading] = useState(true);

const bookId = Array.isArray(params.id) ? params.id[0] : params.id;

useEffect(() => {
// 1. ตรวจสอบสิทธิ์ (เหมือนเดิม)
if (status === "loading") return; // รอก่อน
if (status === "unauthenticated") {
router.push("/login"); // ยังไม่ Login เด้งไปหน้า Login
return;
}

// 2. ถ้า Login แล้ว ให้ดึงข้อมูลหนังสือ
if (status === "authenticated" && bookId) {
  fetchMockBookData(bookId)
    .then(data => {
      if (data) {
        setBook(data);
      } else {
        notFound(); // ถ้า ID ไม่มีในข้อมูลจำลอง ให้ 404
      }
    })
    .finally(() => {
      setIsLoading(false);
    });
}


}, [status, bookId, router]);

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
          <Input id="isbn" value={book.isbn} readOnly className="bg-gray-100"/>
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