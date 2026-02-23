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
  title: string | null;
  author: string | null;
  isbn: string | null;
  yearOfPublication: string | null;
  subject: string | null;
  coverImage: string | null;
  description: string | null;
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
  const isInLibrary = searchParams.get('isInLibrary') === 'true';
  const callbackUrl = `/book-details/${bookId}?isInLibrary=${searchParams.get('isInLibrary')}&title=${searchParams.get('title')}&author=${searchParams.get('author')}&isbn=${searchParams.get('isbn')}&coverImage=${searchParams.get('coverImage')}&description=${searchParams.get('description')}`

  console.log('isInLibrary:', searchParams.get('isInLibrary'));
  console.log('bookId', bookId);

  useEffect(() => {
    if (status === "loading") {
      return;
    }
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (status === "authenticated") {
      const isInLibrary = searchParams.get('isInLibrary');
      const titleFromUrl = searchParams.get('title');
      const authorFromUrl = searchParams.get('author');
      const isbnFromUrl = searchParams.get('isbn');
      const yearOfPublicationFromUrl = searchParams.get('year_of_publication');
      const subjectFromUrl = searchParams.get('subject');
      const coverImageFromUrl = searchParams.get('coverImage');
      const descriptionFromUrl = searchParams.get('description');

      const fetchBookDetails = async () => {
        try {
          const response = await fetch('/api/get-book-details', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookId: bookId, isInLibrary })
          });
          const data = await response.json();
          const bookFromApi = data?.bookDetails;

          console.log('Book details from API:', data);

          const mappedBook: BookData = {
            id: bookId || "url-book",
            title: bookFromApi?.title ?? titleFromUrl ?? null,
            author: bookFromApi?.author ?? bookFromApi?.authors ?? authorFromUrl ?? null,
            isbn: bookFromApi?.isbn_issn ?? bookFromApi?.isbn ?? bookFromApi?.issn ?? isbnFromUrl ?? null,
            yearOfPublication: bookFromApi?.year_of_publication ?? yearOfPublicationFromUrl ?? null,
            subject: bookFromApi?.subject ?? subjectFromUrl ?? null,
            coverImage:
              bookFromApi?.thumb_nail ??
              bookFromApi?.small_thumb_nail ??
              coverImageFromUrl ??
              "https://placehold.co/400x600/gray/white?text=No+Cover",
            description: bookFromApi?.description ?? descriptionFromUrl ?? null,
          };

          setBook(mappedBook);
        } catch (err) {
          console.error('Error fetching book details:', err);
          setBook({
            id: bookId || "url-book",
            title: titleFromUrl ?? null,
            author: authorFromUrl ?? null,
            isbn: isbnFromUrl ?? null,
            yearOfPublication: yearOfPublicationFromUrl ?? null,
            subject: subjectFromUrl ?? null,
            coverImage: coverImageFromUrl || "https://placehold.co/400x600/gray/white?text=No+Cover",
            description: descriptionFromUrl ?? null,
          });
        } finally {
          setIsLoading(false);
        }
      };

      if (titleFromUrl) {
        fetchBookDetails();
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
      title: book.title ?? "",
      author: book.author ?? "",
      isbn: book.isbn ?? ""
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
              src={book.coverImage ?? "https://placehold.co/400x600/gray/white?text=No+Cover"}
              alt={book.title ?? "Book cover"}
              className="w-full h-auto rounded-lg shadow-md aspect-[2/3]"
              onError={(e) => (e.currentTarget.src = "https://placehold.co/400x600/gray/white?text=Error")}
            />
          </div>

          {/* 2. รายละเอียด */}
          <div className="md:col-span-2 space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{book.title ?? null}</h1>
            <p className="text-xl text-gray-700">by {book.author ?? null}</p>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN/ISSN</Label>
              <Input id="isbn" value={book.isbn ?? ""} readOnly className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year-of-publication">Year of Publication</Label>
              <Input id="year-of-publication" value={book.yearOfPublication ?? ""} readOnly className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={book.subject ?? ""} readOnly className="bg-gray-100" />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-md border max-h-56 overflow-y-auto whitespace-pre-wrap">
                {book.description ?? null}
              </p>
            </div>

            {isInLibrary && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full h-12 text-base font-semibold rounded-lg"
              >
                <Link
                  href={`https://opac.lib.kmutt.ac.th/vufind/Record/${encodeURIComponent(book.id)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  เปิดดูรายการในระบบ OPAC
                </Link>
              </Button>
            )}

            {/* 3. ปุ่มยื่นคำขอ */}
            <Button
              onClick={handleRequestClick}
              size="lg"
              className="w-full h-12 text-base font-semibold rounded-lg"
            >
              ยื่นคำขอจัดซื้อหนังสือเล่มนี้
            </Button>


          </div>
        </div>
      </div>
    </div>


  );
}