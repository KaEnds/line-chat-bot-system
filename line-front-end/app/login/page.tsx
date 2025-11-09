"use client";

// เราต้อง import 2 อย่างนี้เพื่อจัดการการ Login
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";



export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // 1. ตรวจสอบว่า Login หรือยัง?
  useEffect(() => {
    // ถ้า Login สำเร็จ (authenticated)
    if (status === "authenticated") {
      // ให้เด้งไปหน้าฟอร์ม (หรือหน้าหลัก)
      router.push("/book-request"); 
    }
  }, [status, router]);

  // ถ้ากำลังโหลด หรือ Login แล้ว ให้โชว์หน้าขาวๆ ไปก่อน
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen bg-[#FFB133] text-white text-xl font-bold flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // 2. ถ้ายังไม่ Login ให้โชว์หน้า Login
  return (
    <div className="min-h-screen bg-[#FFB133] flex flex-col items-center justify-start pt-16 md:justify-center md:pt-0">
      <h1 className="text-white text-5xl font-bold mb-8">
        LibrAIry
      </h1>

      <div className="bg-white w-[90%] max-w-md p-8 rounded-2xl shadow-lg text-center">
        
        <h2 className="text-2xl font-semibold mb-2 text-gray-800">Welcome</h2>
        <p className="text-gray-500 mb-8">Please sign in to continue</p>

        <button
          onClick={() => signIn("azure-ad")} // สั่งให้ Login ด้วย Azure
          className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-900 transition-colors"
        >
          Sign in with KMUTT Account
        </button>
      </div>
    </div>
  );
}

