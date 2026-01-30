"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SubmitCompletePage() {
  const router = useRouter();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ตรวจสอบสิทธิ์
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      setIsLoading(false);
    }
  }, [status, router]);

  if (isLoading || status === "loading") {
    return (
      <div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
        <p className="text-black text-xl font-bold">Loading...</p>
      </div>
    );
  }

  if (status !== "authenticated") {
    return (
      <div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
        <p className="text-black text-xl font-bold">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFB133] p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white p-6 md:p-8 rounded-lg shadow-md text-center">
        
        {/* Success Icon */}
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          ยื่นคำขอสำเร็จ!
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-4">
          ขอบคุณที่ยื่นคำขอจัดซื้อหนังสือ
        </p>

        {/* Details */}
        <div className="bg-blue-50 p-4 rounded-lg mb-8 text-left">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">สถานะ:</span> รอดำเนินการ
          </p>
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">เราจะ:</span> ตรวจสอบคำขอของคุณและติดต่อกลับในเร็วๆ นี้
          </p>
          <p className="text-gray-600 text-sm">
            คุณสามารถติดตามสถานะคำขอของคุณได้ที่หน้า "ดูคำขอของฉัน"
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/book-request">
            <Button variant="outline" className="w-full sm:w-auto">
              ยื่นคำขออื่น
            </Button>
          </Link>
          <Link href="/my-requests">
            <Button className="w-full sm:w-auto">
              ดูคำขอของฉัน
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
